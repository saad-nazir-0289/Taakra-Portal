import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread', required: true },
  senderRole: { type: String, enum: ['USER', 'SUPPORT', 'ADMIN'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  readByUser: { type: Boolean, default: false },
  readBySupport: { type: Boolean, default: false },
}, { timestamps: true });

chatMessageSchema.index({ threadId: 1, createdAt: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
