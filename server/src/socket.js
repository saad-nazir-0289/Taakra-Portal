import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from './config.js';
import ChatThread from './models/ChatThread.js';
import ChatMessage from './models/ChatMessage.js';
import User from './models/User.js';

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: config.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret);
      socket.userId = payload.userId;
      socket.userRole = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('chat:message', async ({ threadId, text }) => {
      try {
        const thread = await ChatThread.findById(threadId);
        if (!thread) return socket.emit('error', { message: 'Thread not found' });
        const isSupport = ['SUPPORT', 'ADMIN'].includes(socket.userRole);
        if (!isSupport && thread.userId.toString() !== socket.userId) return socket.emit('error', { message: 'Forbidden' });
        const msg = await ChatMessage.create({
          threadId,
          senderRole: socket.userRole,
          senderId: socket.userId,
          text,
          readByUser: socket.userRole === 'USER',
          readBySupport: socket.userRole !== 'USER',
        });
        await ChatThread.updateOne(
          { _id: threadId },
          { lastMessageAt: new Date(), lastMessagePreview: text.slice(0, 80), ...(isSupport ? { assignedTo: socket.userId } : {}) }
        );
        const populated = await ChatMessage.findById(msg._id).populate('senderId', 'name').lean();
        io.to(`user:${thread.userId}`).emit('chat:message', populated);
        if (thread.assignedTo) io.to(`user:${thread.assignedTo}`).emit('chat:message', populated);
        socket.emit('chat:message', populated);
      } catch (e) {
        socket.emit('error', { message: e.message });
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
}
