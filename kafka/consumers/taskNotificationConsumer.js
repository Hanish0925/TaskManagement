import { Kafka } from 'kafkajs';
import mongoose from 'mongoose';
import Notification from '../../models/Notification.js';
import dotenv from 'dotenv';
dotenv.config();

const kafka = new Kafka({
  clientId: 'task-tracker',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

const handleEvent = async (event, io) => {
  const log = (msg) => console.log(`[Kafka: ${event.type}] ${msg}`);

  switch (event.type) {
    case 'TASK_CREATED':
      log(`Assigned task "${event.title}" to user ${event.assignedTo}`);
      io?.to(`user:${event.assignedTo}`).emit('taskCreated', event);

      await Notification.create({
        user: event.assignedTo,
        type: 'TASK_CREATED',
        content: `You were assigned a new task: "${event.title}"`,
        metadata: event
      });
      break;

    case 'TASK_UPDATED':
      log(`Task ${event.taskId} was updated`);
      io?.to(`project:${event.projectId}`).emit('taskUpdated', event);

      await Notification.create({
        user: event.updatedBy,
        type: 'TASK_UPDATED',
        content: `Task "${event.taskId}" was updated.`,
        metadata: event
      });
      break;

    case 'TASK_DELETED':
      log(`Task ${event.taskId} was deleted`);
      io?.to(`project:${event.projectId}`).emit('taskDeleted', { taskId: event.taskId });

      await Notification.create({
        user: event.deletedBy,
        type: 'TASK_DELETED',
        content: `Task "${event.taskId}" was deleted.`,
        metadata: event
      });
      break;

    case 'ATTACHMENT_ADDED':
      log(`Attachment "${event.fileName}" added to task ${event.taskId}`);
      io?.to(`task:${event.taskId}`).emit('newAttachment', event);

      await Notification.create({
        user: event.taskOwnerId,
        type: 'ATTACHMENT_ADDED',
        content: `${event.uploadedByName} uploaded "${event.fileName}" to your task.`,
        metadata: event
      });
      break;

    case 'COMMENT_ADDED':
      log(`Comment added by ${event.author.name} on task ${event.taskId}`);
      io?.to(`task:${event.taskId}`).emit('newComment', event);

      await Notification.create({
        user: event.taskOwnerId,
        type: 'COMMENT_ADDED',
        content: `${event.author.name} commented on your task.`,
        metadata: event
      });
      break;

    default:
      console.warn(`[Kafka] ⚠ Unrecognized event type: ${event.type}`);
  }
};

export const startTaskNotificationConsumer = async (io = null) => {
  try {
    console.log('taskNotificationConsumer.js is running...');
    console.log('Connecting Kafka consumer...');

    await consumer.connect();
    await consumer.subscribe({ topic: 'task-events', fromBeginning: false });

    console.log('Kafka consumer connected. Listening for task-events...');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          if (!event?.type) {
            console.warn('Received event without type:', event);
            return;
          }
          await handleEvent(event, io);
        } catch (err) {
          console.error('Failed to process Kafka message:', err.message);
        }
      },
    });
  } catch (err) {
    console.error('Kafka consumer initialization failed:', err.message);
  }
};

if (process.argv[1] === new URL(import.meta.url).pathname) {
  startTaskNotificationConsumer().catch(err => {
    console.error('Error running consumer:', err.message);
  });
}
