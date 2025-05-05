// kafka/producer.js
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'task-tracker',
  brokers: ['localhost:9092']  
});

const producer = kafka.producer();

export const initProducer = async () => {
  await producer.connect();
  console.log('Kafka producer connected');
};

export const produceEvent = async (topic, message) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }]
  });
  console.log(`Produced event to ${topic}`);
};
