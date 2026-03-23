import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import config from './config.js';
import { connectDb } from './db.js';
import { setupSocket } from './socket.js';
import { runSeed } from './seed.js';
import passport from './lib/passport.js';

import authRoutes from './routes/auth.js';
import oauthRoutes from './routes/oauth.js';
import competitionRoutes from './routes/competitions.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import chatbotRoutes from './routes/chatbot.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

async function start() {
  await connectDb();
  await runSeed();

  setupSocket(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`[server] http://localhost:${config.port}`);
    console.log(`[server] Client URL: ${config.clientUrl}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
