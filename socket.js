import { Server } from 'socket.io';

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinRoom', ({ type, id }) => {
      const room = `${type}:${id}`;
      socket.join(room);
      console.log(`${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
