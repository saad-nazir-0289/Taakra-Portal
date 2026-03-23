import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import config from '../config.js';
import Competition from '../models/Competition.js';
import Registration from '../models/Registration.js';
import { authAccess, attachUser, requireNotBlocked } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const messageSchema = z.object({ message: z.string().min(1).max(2000) });

router.post('/chat', authAccess, attachUser, requireNotBlocked, validate(messageSchema), async (req, res, next) => {
  try {
    const userMessage = req.body.message;
    if (config.openai.apiKey) {
      const openai = new OpenAI({ apiKey: config.openai.apiKey });
      const [trending, upcoming] = await Promise.all([
        Competition.find({}).sort({ trendingScore: -1 }).limit(3).select('title').lean(),
        Competition.find({ 'deadlines.end': { $gte: new Date() } }).sort({ 'deadlines.end': 1 }).limit(5).select('title deadlines').lean(),
      ]);
      const context = `Trending: ${trending.map(c => c.title).join(', ')}. Upcoming deadlines: ${upcoming.map(c => `${c.title} (end: ${c.deadlines.end})`).join('; ')}.`;
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `You are Taakra competition assistant. Context: ${context}. Answer briefly about competitions, registration, deadlines.` },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300,
      });
      const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      return res.json({ reply });
    }
    const reply = await fallbackRulesEngine(userMessage, req.userId);
    res.json({ reply });
  } catch (e) {
    next(e);
  }
});

async function fallbackRulesEngine(message, userId) {
  const lower = message.toLowerCase();
  if (lower.includes('deadline') || lower.includes('upcoming')) {
    const list = await Competition.find({ 'deadlines.end': { $gte: new Date() } })
      .sort({ 'deadlines.end': 1 })
      .limit(10)
      .select('title deadlines')
      .lean();
    if (list.length === 0) return 'There are no upcoming competition deadlines right now.';
    const lines = list.map(c => `• ${c.title}: ends ${new Date(c.deadlines.end).toLocaleDateString()}`);
    return 'Upcoming deadlines:\n' + lines.join('\n');
  }
  if (lower.includes('register') || lower.includes('how to')) {
    return 'To register: go to a competition detail page and click "Register". You can register for each competition once. Your registration will be pending until approved by support.';
  }
  if (lower.includes('trending')) {
    const list = await Competition.find({}).sort({ trendingScore: -1 }).limit(5).select('title registrationsCount').lean();
    if (list.length === 0) return 'No trending competitions yet.';
    const lines = list.map((c, i) => `${i + 1}. ${c.title} (${c.registrationsCount} registrations)`);
    return 'Trending competitions:\n' + lines.join('\n');
  }
  return "I can help with: upcoming deadlines, how to register, and trending competitions. Ask me one of those!";
}

export default router;
