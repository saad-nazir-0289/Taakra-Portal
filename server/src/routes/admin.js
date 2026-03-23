import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Competition from '../models/Competition.js';
import Registration from '../models/Registration.js';
import { authAccess, attachUser } from '../middleware/auth.js';
import { requireAdmin, requireSupport } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authAccess, attachUser);

const categorySchema = z.object({ name: z.string().min(1), slug: z.string().min(1) });
const competitionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  rules: z.string().optional(),
  prizes: z.string().optional(),
  categoryId: z.string(),
  deadlineStart: z.string().datetime().or(z.string()),
  deadlineEnd: z.string().datetime().or(z.string()),
});

router.get('/analytics', requireAdmin, async (req, res, next) => {
  try {
    const [userCount, competitionCount, registrationCount, topCompetitions] = await Promise.all([
      User.countDocuments(),
      Competition.countDocuments(),
      Registration.countDocuments(),
      Competition.find({}).sort({ registrationsCount: -1 }).limit(5).populate('categoryId', 'name').lean(),
    ]);
    res.json({ userCount, competitionCount, registrationCount, topCompetitions });
  } catch (e) {
    next(e);
  }
});

router.get('/categories', requireAdmin, async (req, res, next) => {
  const list = await Category.find({}).sort({ name: 1 }).lean();
  res.json({ categories: list });
});

router.post('/categories', requireAdmin, validate(categorySchema), async (req, res, next) => {
  const slug = req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-');
  const cat = await Category.create({ name: req.body.name, slug });
  res.status(201).json(cat);
});

router.patch('/categories/:id', requireAdmin, validate(z.object({ name: z.string().optional(), slug: z.string().optional() })), async (req, res, next) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) return res.status(404).json({ error: 'Not found' });
  res.json(cat);
});

router.delete('/categories/:id', requireAdmin, async (req, res, next) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

router.get('/competitions', requireAdmin, async (req, res, next) => {
  const list = await Competition.find({}).populate('categoryId', 'name slug').sort({ createdAt: -1 }).lean();
  res.json({ competitions: list });
});

router.post('/competitions', requireAdmin, validate(competitionSchema), async (req, res, next) => {
  const comp = await Competition.create({
    title: req.body.title,
    description: req.body.description || '',
    rules: req.body.rules || '',
    prizes: req.body.prizes || '',
    categoryId: req.body.categoryId,
    deadlines: { start: new Date(req.body.deadlineStart), end: new Date(req.body.deadlineEnd) },
  });
  res.status(201).json(comp);
});

router.patch('/competitions/:id', requireAdmin, validate(competitionSchema.partial()), async (req, res, next) => {
  const update = { ...req.body };
  if (update.deadlineStart) update['deadlines.start'] = new Date(update.deadlineStart);
  if (update.deadlineEnd) update['deadlines.end'] = new Date(update.deadlineEnd);
  delete update.deadlineStart;
  delete update.deadlineEnd;
  const comp = await Competition.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!comp) return res.status(404).json({ error: 'Not found' });
  res.json(comp);
});

router.delete('/competitions/:id', requireAdmin, async (req, res, next) => {
  await Registration.deleteMany({ competitionId: req.params.id });
  await Competition.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

router.get('/registrations', requireSupport, async (req, res, next) => {
  const list = await Registration.find({})
    .populate('userId', 'name email')
    .populate('competitionId', 'title')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ registrations: list });
});

router.patch('/registrations/:id', requireSupport, validate(z.object({ status: z.enum(['pending', 'approved', 'rejected']) })), async (req, res, next) => {
  const reg = await Registration.findById(req.params.id);
  if (!reg) return res.status(404).json({ error: 'Not found' });
  reg.status = req.body.status;
  await reg.save();
  res.json(reg);
});

router.get('/users', requireAdmin, async (req, res, next) => {
  const list = await User.find({}).select('name email role isBlocked createdAt').sort({ createdAt: -1 }).lean();
  res.json({ users: list });
});

router.patch('/users/:id/block', requireAdmin, validate(z.object({ isBlocked: z.boolean() })), async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (user.role === 'ADMIN') return res.status(403).json({ error: 'Cannot block admin' });
  user.isBlocked = req.body.isBlocked;
  await user.save();
  if (req.body.isBlocked) {
    const { invalidateAllRefreshTokens } = await import('../lib/tokens.js');
    await invalidateAllRefreshTokens(user._id);
  }
  res.json(user);
});

router.patch('/users/:id/role', requireAdmin, validate(z.object({ role: z.enum(['USER', 'SUPPORT', 'ADMIN']) })), async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const me = await User.findById(req.userId);
  if (me.role !== 'ADMIN') return res.status(403).json({ error: 'Only admin can change roles' });
  user.role = req.body.role;
  await user.save();
  res.json(user);
});

export default router;
