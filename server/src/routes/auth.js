import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, addRefreshToken, removeRefreshToken, invalidateAllRefreshTokens } from '../lib/tokens.js';
import { authAccess } from '../middleware/auth.js';
import config from '../config.js';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

function setTokenCookies(res, accessToken, refreshToken) {
  const isDev = config.nodeEnv === 'development';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role: 'USER' });
    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id, user.role);
    await addRefreshToken(user._id, refreshToken);
    setTokenCookies(res, accessToken, refreshToken);
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      accessToken,
      refreshToken,
      expiresIn: 900,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (user.isBlocked) return res.status(403).json({ error: 'Account is blocked' });
    if (!user.passwordHash) return res.status(401).json({ error: 'Use OAuth to sign in' });
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id, user.role);
    await addRefreshToken(user._id, refreshToken);
    setTokenCookies(res, accessToken, refreshToken);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      accessToken,
      refreshToken,
      expiresIn: 900,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token required' });
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ error: 'Account is blocked' });
    const stored = user.refreshTokens?.find(t => t.token === token);
    if (!stored || new Date(stored.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    await removeRefreshToken(user._id, token);
    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id, user.role);
    await addRefreshToken(user._id, refreshToken);
    setTokenCookies(res, accessToken, refreshToken);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      accessToken,
      refreshToken,
      expiresIn: 900,
    });
  } catch (e) {
    next(e);
  }
});

router.post('/logout', authAccess, async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (token) await removeRefreshToken(req.userId, token);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get('/me', authAccess, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('name email role avatarUrl isBlocked');
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ error: 'Account is blocked' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } });
  } catch (e) {
    next(e);
  }
});

router.get('/oauth-config', (req, res) => {
  res.json({
    google: !!config.oauth.google.clientId,
    github: !!config.oauth.github.clientId,
  });
});

export default router;
