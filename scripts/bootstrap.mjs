#!/usr/bin/env node
import { spawn } from 'child_process';
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const serverDir = join(root, 'server');
const clientDir = join(root, 'client');

const SERVER_ENV = `# Taakra Server - auto-generated defaults
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:4000
MONGODB_URI=mongodb://localhost:27017/taakra
USE_MEMORY_DB=0
JWT_ACCESS_SECRET=taakra-dev-access-secret-change-in-prod
JWT_REFRESH_SECRET=taakra-dev-refresh-secret-change-in-prod
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OPENAI_API_KEY=
`;

const CLIENT_ENV = `# Taakra Client - auto-generated
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
VITE_GOOGLE_CLIENT_ID=
VITE_GITHUB_CLIENT_ID=
`;

function ensureEnv() {
  const serverEnv = join(serverDir, '.env');
  const clientEnv = join(clientDir, '.env');
  if (!existsSync(serverEnv)) {
    writeFileSync(serverEnv, SERVER_ENV, 'utf8');
    console.log('[bootstrap] Created server/.env with defaults');
  }
  if (!existsSync(clientEnv)) {
    writeFileSync(clientEnv, CLIENT_ENV, 'utf8');
    console.log('[bootstrap] Created client/.env with defaults');
  }
}

async function ensureDeps() {
  const serverModules = join(serverDir, 'node_modules');
  const clientModules = join(clientDir, 'node_modules');
  if (!existsSync(serverModules)) {
    console.log('[bootstrap] Installing server dependencies...');
    await run('npm', ['install'], serverDir);
  }
  if (!existsSync(clientModules)) {
    console.log('[bootstrap] Installing client dependencies...');
    await run('npm', ['install'], clientDir);
  }
}

function run(cmd, args, cwd = root) {
  const p = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });
  return new Promise((resolve) => p.on('close', (code) => resolve(code)));
}

async function dockerAvailable() {
  try {
    const { execSync } = await import('child_process');
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function tryStartMongo() {
  const dockerOk = await dockerAvailable();
  if (dockerOk) {
    console.log('[bootstrap] Starting MongoDB with Docker...');
    const code = await run('docker', ['compose', 'up', '-d'], root);
    if (code !== 0) {
      const code2 = await run('docker-compose', ['up', '-d'], root);
      if (code2 !== 0) {
        console.log('[bootstrap] Docker compose failed, will use in-memory DB');
        setMemoryDb();
        return;
      }
    }
    await new Promise((r) => setTimeout(r, 3000));
  } else {
    console.log('[bootstrap] Docker not found. Using in-memory MongoDB for this session.');
    setMemoryDb();
  }
}

function ensureHeroVideo() {
  const heroPathPublic = join(clientDir, 'public', 'hero.mp4');
  const heroPathAssets = join(clientDir, 'src', 'assets', 'hero.mp4');
  if (existsSync(heroPathPublic) || existsSync(heroPathAssets)) return Promise.resolve();
  mkdirSync(join(clientDir, 'public'), { recursive: true });
  mkdirSync(join(clientDir, 'src', 'assets'), { recursive: true });
  return new Promise((resolve) => {
    const url = 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4';
    console.log('[bootstrap] Downloading hero video sample...');
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          const buf = Buffer.concat(chunks);
          writeFileSync(heroPathPublic, buf);
          writeFileSync(heroPathAssets, buf);
          console.log('[bootstrap] Hero video saved to client/public/hero.mp4 and client/src/assets/hero.mp4');
        } catch (e) {
          console.warn('[bootstrap] Could not save hero video:', e.message);
        }
        resolve();
      });
    }).on('error', () => resolve());
  });
}

function setMemoryDb() {
  const serverEnv = join(serverDir, '.env');
  let content = existsSync(serverEnv) ? readFileSync(serverEnv, 'utf8') : SERVER_ENV;
  if (!content.includes('USE_MEMORY_DB=1')) {
    content = content.replace(/USE_MEMORY_DB=.*/m, 'USE_MEMORY_DB=1');
    if (!content.includes('USE_MEMORY_DB=')) content += '\nUSE_MEMORY_DB=1\n';
    writeFileSync(serverEnv, content, 'utf8');
  }
}

async function main() {
  ensureEnv();
  await ensureHeroVideo();
  await ensureDeps();
  await tryStartMongo();
  (() => {
    console.log('[bootstrap] Starting server and client...');
    console.log('[bootstrap] Client: http://localhost:5173');
    console.log('[bootstrap] API:    http://localhost:4000');
    console.log('');
    const server = spawn('npm', ['run', 'dev'], { cwd: serverDir, stdio: 'inherit', shell: true });
    const client = spawn('npm', ['run', 'dev'], { cwd: clientDir, stdio: 'inherit', shell: true });
    const exit = (code) => {
      server.kill();
      client.kill();
      process.exit(code ?? 0);
    };
    process.on('SIGINT', () => exit(0));
    process.on('SIGTERM', () => exit(0));
    server.on('error', (err) => { console.error(err); exit(1); });
    client.on('error', (err) => { console.error(err); exit(1); });
  })();
}

main();
