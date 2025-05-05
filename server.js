import http from 'http';
import app from './app.js';
import setupSocket from './socket.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { initProducer } from './kafka/producer.js';
import { startTaskNotificationConsumer } from './kafka/consumers/taskNotificationConsumer.js';

const server = http.createServer(app);
const io = setupSocket(server);
app.set('io', io);

await initProducer();

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log('MongoDB connected');

    startTaskNotificationConsumer(io).catch((err) =>
      console.error('Kafka consumer failed to start:', err.message)
    );

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server + WebSocket running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

