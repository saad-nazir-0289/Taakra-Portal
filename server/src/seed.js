import User from './models/User.js';
import Category from './models/Category.js';
import Competition from './models/Competition.js';
import Registration from './models/Registration.js';
import { hashPassword } from './models/User.js';

export async function runSeed() {
  const adminEmail = 'admin@taakra.dev';
  if (await User.findOne({ email: adminEmail })) {
    console.log('[seed] Already seeded, skip.');
    return;
  }

  const [admin, support, user] = await Promise.all([
    User.create({ name: 'Admin', email: adminEmail, passwordHash: await hashPassword('Admin@12345'), role: 'ADMIN' }),
    User.create({ name: 'Support', email: 'support@taakra.dev', passwordHash: await hashPassword('Support@12345'), role: 'SUPPORT' }),
    User.create({ name: 'Demo User', email: 'user@taakra.dev', passwordHash: await hashPassword('User@12345'), role: 'USER' }),
  ]);

  const cat1 = await Category.create({ name: 'Design', slug: 'design' });
  const cat2 = await Category.create({ name: 'Tech', slug: 'tech' });
  const cat3 = await Category.create({ name: 'Music', slug: 'music' });

  const comp1 = await Competition.create({
    title: 'Logo Design Challenge',
    description: 'Design a modern logo for Taakra.',
    rules: 'Original work only.',
    prizes: '1st: $500',
    categoryId: cat1._id,
    deadlines: { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    registrationsCount: 2,
    trendingScore: 2,
  });
  const comp2 = await Competition.create({
    title: 'Hackathon 2025',
    description: 'Build something cool in 48 hours.',
    rules: 'No pre-built code.',
    prizes: '1st: $1000',
    categoryId: cat2._id,
    deadlines: { start: new Date(), end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    registrationsCount: 1,
    trendingScore: 1,
  });

  await Registration.create([{ userId: user._id, competitionId: comp1._id, status: 'approved' }, { userId: user._id, competitionId: comp2._id, status: 'pending' }]);

  console.log('[seed] Done. Demo credentials:');
  console.log('  admin:   admin@taakra.dev / Admin@12345');
  console.log('  support: support@taakra.dev / Support@12345');
  console.log('  user:    user@taakra.dev / User@12345');
}
