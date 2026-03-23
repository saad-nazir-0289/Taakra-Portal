import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/User.js';

export function signAccessToken(userId, role) {
  return jwt.sign(
    { userId, role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );
}

export function signRefreshToken(userId, role) {
  return jwt.sign(
    { userId, role },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

export async function addRefreshToken(userId, token) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await User.updateOne(
    { _id: userId },
    { $push: { refreshTokens: { token, expiresAt } } }
  );
}

export async function removeRefreshToken(userId, token) {
  await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { token } } }
  );
}

export async function invalidateAllRefreshTokens(userId) {
  await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
}
