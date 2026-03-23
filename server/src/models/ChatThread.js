import mongoose from 'mongoose';

const chatThreadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lastMessageAt: { type: Date, default: Date.now },
  lastMessagePreview: { type: String, default: '' },
}, { timestamps: true });

chatThreadSchema.index({ assignedTo: 1 });
chatThreadSchema.index({ userId: 1 });

export default mongoose.model('ChatThread', chatThreadSchema);
