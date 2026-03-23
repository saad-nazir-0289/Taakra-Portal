import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const refreshTokenSchema = new mongoose.Schema({
  token: String,
  expiresAt: Date,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, default: null },
  role: { type: String, enum: ['USER', 'SUPPORT', 'ADMIN'], default: 'USER' },
  isBlocked: { type: Boolean, default: false },
  avatarUrl: { type: String, default: '' },
  oauthProviders: [{ provider: String, providerId: String }],
  refreshTokens: [refreshTokenSchema],
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ 'oauthProviders.providerId': 1 });

export default mongoose.model('User', userSchema);

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
