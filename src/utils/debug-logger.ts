import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..', '..');

const LOG_FILE = path.join(PROJECT_ROOT, 'mcp-debug.log');

export function debugLog(message: string, data?: unknown): void {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
  fs.appendFileSync(LOG_FILE, logLine);
}

export function clearDebugLog(): void {
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
  }
}
