import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

registrationSchema.index({ userId: 1, competitionId: 1 }, { unique: true });
registrationSchema.index({ competitionId: 1 });
registrationSchema.index({ userId: 1 });

export default mongoose.model('Registration', registrationSchema);
