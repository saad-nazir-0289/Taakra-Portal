import { cpSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dest = join(__dirname, 'dist');
if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
cpSync(join(__dirname, 'src'), dest, { recursive: true });
console.log('Server build (copy) done.');
