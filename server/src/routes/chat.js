import { Router } from 'express';
import { z } from 'zod';
import ChatThread from '../models/ChatThread.js';
import ChatMessage from '../models/ChatMessage.js';
import { authAccess, attachUser, requireNotBlocked } from '../middleware/auth.js';
import { requireSupport } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/threads', authAccess, attachUser, requireNotBlocked, async (req, res, next) => {
  try {
    const isSupport = ['SUPPORT', 'ADMIN'].includes(req.userRole);
    const query = isSupport ? {} : { userId: req.userId };
    const threads = await ChatThread.find(query)
      .populate('userId', 'name email')
      .sort({ lastMessageAt: -1 })
      .lean();
    const withUnread = await Promise.all(threads.map(async (t) => {
      const unread = await ChatMessage.countDocuments({
        threadId: t._id,
        senderRole: { $ne: req.userRole },
        ...(req.userRole === 'USER' ? { readByUser: false } : { readBySupport: false }),
      });
      return { ...t, unread };
    }));
    res.json({ threads: withUnread });
  } catch (e) {
    next(e);
  }
});

router.get('/threads/my', authAccess, attachUser, requireNotBlocked, async (req, res, next) => {
  try {
    const thread = await ChatThread.findOne({ userId: req.userId })
      .populate('userId', 'name email')
      .lean();
    if (!thread) return res.json({ thread: null });
    const unread = await ChatMessage.countDocuments({ threadId: thread._id, readByUser: false, senderRole: { $ne: 'USER' } });
    res.json({ thread: { ...thread, unread } });
  } catch (e) {
    next(e);
  }
});

router.post('/threads', authAccess, attachUser, requireNotBlocked, async (req, res, next) => {
  try {
    let thread = await ChatThread.findOne({ userId: req.userId });
    if (!thread) {
      thread = await ChatThread.create({ userId: req.userId });
    }
    res.status(201).json({ thread });
  } catch (e) {
    next(e);
  }
});

router.get('/threads/:id/messages', authAccess, attachUser, requireNotBlocked, async (req, res, next) => {
  try {
    const thread = await ChatThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    const isSupport = ['SUPPORT', 'ADMIN'].includes(req.userRole);
    if (!isSupport && thread.userId.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    const messages = await ChatMessage.find({ threadId: thread._id }).sort({ createdAt: 1 }).lean();
    res.json({ messages });
  } catch (e) {
    next(e);
  }
});

const sendSchema = z.object({ text: z.string().min(1).max(2000) });
router.post('/threads/:id/messages', authAccess, attachUser, requireNotBlocked, validate(sendSchema), async (req, res, next) => {
  try {
    const thread = await ChatThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    const isSupport = ['SUPPORT', 'ADMIN'].includes(req.userRole);
    if (!isSupport && thread.userId.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    const senderRole = req.userRole;
    const msg = await ChatMessage.create({
      threadId: thread._id,
      senderRole,
      senderId: req.userId,
      text: req.body.text,
      readByUser: senderRole === 'USER',
      readBySupport: senderRole !== 'USER',
    });
    await ChatThread.updateOne(
      { _id: thread._id },
      { lastMessageAt: new Date(), lastMessagePreview: req.body.text.slice(0, 80), ...(isSupport ? { assignedTo: req.userId } : {}) }
    );
    res.status(201).json({ message: msg });
  } catch (e) {
    next(e);
  }
});

router.post('/threads/:id/read', authAccess, attachUser, async (req, res, next) => {
  try {
    const thread = await ChatThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    const isSupport = ['SUPPORT', 'ADMIN'].includes(req.userRole);
    if (!isSupport && thread.userId.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    await ChatMessage.updateMany(
      { threadId: thread._id },
      isSupport ? { readBySupport: true } : { readByUser: true }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
