import mongoose from 'mongoose';

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  rules: { type: String, default: '' },
  prizes: { type: String, default: '' },
  deadlines: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  registrationsCount: { type: Number, default: 0 },
  trendingScore: { type: Number, default: 0 },
}, { timestamps: true });

competitionSchema.index({ categoryId: 1 });
competitionSchema.index({ 'deadlines.end': 1 });
competitionSchema.index({ registrationsCount: -1 });
competitionSchema.index({ trendingScore: -1 });
competitionSchema.index({ createdAt: -1 });

export default mongoose.model('Competition', competitionSchema);
