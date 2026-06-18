/**
 * Socket.IO notification handler
 * Attach to the Express HTTP server after creating it.
 *
 * Usage in server.js:
 *   const { initSocket } = require('./sockets/notifications');
 *   initSocket(httpServer);
 */

let io;

const initSocket = (httpServer) => {
  const { Server } = require('socket.io');
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client joins their own user room so we can target them
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`  └─ User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Emit a notification to a specific user room
const notifyUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

// Broadcast to all connected clients (e.g. admin dashboard update)
const broadcast = (event, payload) => {
  if (!io) return;
  io.emit(event, payload);
};

module.exports = { initSocket, notifyUser, broadcast };
