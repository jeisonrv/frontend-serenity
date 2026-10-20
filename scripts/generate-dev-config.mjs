import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const envFile = resolve(projectRoot, '.env');
const envFromFile = {};

if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }
    envFromFile[match[1]] = value;
  }
}

const getValue = (name, fallback = '') => process.env[name] ?? envFromFile[name] ?? fallback;
const runtimeConfig = {
  apiUrl: getValue('API_URL', 'http://localhost:8081/api'),
  wsUrl: getValue('WS_URL', 'ws://localhost:8081/ws'),
  googleClientId: getValue('GOOGLE_CLIENT_ID')
};

const assetsDirectory = resolve(projectRoot, 'src/assets');
mkdirSync(assetsDirectory, { recursive: true });
writeFileSync(resolve(assetsDirectory, 'config.dev.json'), `${JSON.stringify(runtimeConfig, null, 2)}\n`, 'utf8');
