import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true });

categorySchema.index({ slug: 1 });

export default mongoose.model('Category', categorySchema);
