import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import { authAccess, attachUser, requireNotBlocked } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { hashPassword, comparePassword } from '../models/User.js';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100),
});

router.get('/me', authAccess, attachUser, requireNotBlocked, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('name email role avatarUrl').lean();
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

router.patch('/me', authAccess, attachUser, requireNotBlocked, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const update = {};
    if (req.body.name !== undefined) update.name = req.body.name;
    if (req.body.avatarUrl !== undefined) update.avatarUrl = req.body.avatarUrl;
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('name email role avatarUrl').lean();
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

router.post('/me/change-password', authAccess, attachUser, requireNotBlocked, validate(changePasswordSchema), async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.passwordHash) return res.status(400).json({ error: 'Set password first or use OAuth' });
    const ok = await comparePassword(req.body.currentPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Current password incorrect' });
    user.passwordHash = await hashPassword(req.body.newPassword);
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get('/me/registrations', authAccess, requireNotBlocked, async (req, res, next) => {
  try {
    const list = await Registration.find({ userId: req.userId })
      .populate('competitionId')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ registrations: list });
  } catch (e) {
    next(e);
  }
});

router.get('/me/calendar', authAccess, requireNotBlocked, async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = month && year ? new Date(Number(year), Number(month) - 1, 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const regs = await Registration.find({ userId: req.userId, status: 'approved' })
      .populate('competitionId')
      .lean();
    const compIds = regs.map(r => r.competitionId?._id).filter(Boolean);
    const { default: Competition } = await import('../models/Competition.js');
    const deadlines = await Competition.find({
      _id: { $in: compIds },
      'deadlines.end': { $gte: start, $lt: end },
    }).select('title deadlines').lean();
    const events = deadlines.map(c => ({
      id: c._id,
      title: c.title,
      start: c.deadlines.start,
      end: c.deadlines.end,
    }));
    res.json({ events });
  } catch (e) {
    next(e);
  }
});

export default router;
