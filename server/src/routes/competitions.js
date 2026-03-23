import { Router } from 'express';
import { z } from 'zod';
import Competition from '../models/Competition.js';
import Category from '../models/Category.js';
import Registration from '../models/Registration.js';
import { authOptional, authAccess, attachUser, requireNotBlocked } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const sortMap = {
  registrations: { registrationsCount: -1 },
  trending: { trendingScore: -1, createdAt: -1 },
  new: { createdAt: -1 },
};

router.get('/', authOptional, attachUser, async (req, res, next) => {
  try {
    const { sort = 'new', categoryId, startAfter, endBefore, q } = req.query;
    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (startAfter) filter['deadlines.start'] = { $gte: new Date(startAfter) };
    if (endBefore) filter['deadlines.end'] = { $lte: new Date(endBefore) };
    if (q) filter.$or = [
      { title: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
    ];
    const sortKey = sortMap[sort] || sortMap.new;
    const list = await Competition.find(filter)
      .populate('categoryId', 'name slug')
      .sort(sortKey)
      .limit(50)
      .lean();
    res.json({ competitions: list });
  } catch (e) {
    next(e);
  }
});

router.get('/trending', async (req, res, next) => {
  try {
    const list = await Competition.find({})
      .sort({ trendingScore: -1 })
      .limit(5)
      .populate('categoryId', 'name slug')
      .lean();
    res.json({ competitions: list });
  } catch (e) {
    next(e);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const list = await Category.find({}).sort({ name: 1 }).lean();
    res.json({ categories: list });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', authOptional, attachUser, async (req, res, next) => {
  try {
    const comp = await Competition.findById(req.params.id).populate('categoryId', 'name slug').lean();
    if (!comp) return res.status(404).json({ error: 'Competition not found' });
    res.json(comp);
  } catch (e) {
    next(e);
  }
});

const registerSchema = z.object({});
router.post('/:id/register', authAccess, requireNotBlocked, requireRole('USER', 'SUPPORT', 'ADMIN'), validate(registerSchema), async (req, res, next) => {
  try {
    const comp = await Competition.findById(req.params.id);
    if (!comp) return res.status(404).json({ error: 'Competition not found' });
    const existing = await Registration.findOne({ userId: req.userId, competitionId: comp._id });
    if (existing) return res.status(400).json({ error: 'Already registered' });
    await Registration.create({ userId: req.userId, competitionId: comp._id, status: 'pending' });
    await Competition.updateOne({ _id: comp._id }, { $inc: { registrationsCount: 1, trendingScore: 1 } });
    res.status(201).json({ message: 'Registered', status: 'pending' });
  } catch (e) {
    next(e);
  }
});

router.get('/:id/registration', authAccess, async (req, res, next) => {
  try {
    const reg = await Registration.findOne({ userId: req.userId, competitionId: req.params.id }).lean();
    if (!reg) return res.status(404).json({ registration: null });
    res.json({ registration: reg });
  } catch (e) {
    next(e);
  }
});

export default router;
