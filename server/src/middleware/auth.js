import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/User.js';

export function authAccess(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function authOptional(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    next();
  }
}

export async function attachUser(req, res, next) {
  if (!req.userId) return next();
  try {
    const user = await User.findById(req.userId).select('name email role isBlocked avatarUrl');
    if (!user) return res.status(401).json({ error: 'User not found' });
  if (user.isBlocked) return res.status(403).json({ error: 'Account is blocked' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireNotBlocked(req, res, next) {
  if (req.user?.isBlocked) return res.status(403).json({ error: 'Account is blocked' });
  next();
}
