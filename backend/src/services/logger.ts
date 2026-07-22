import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, 'app.log');

export function log(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
  const entry = { ts: new Date().toISOString(), level, message, meta };
  try {
    fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
  } catch (err) {
    // ignore logging failures
  }
  // also console
  console[level === 'error' ? 'error' : 'log'](message, meta || '');
}
