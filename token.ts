// Run once locally to obtain GOOGLE_REFRESH_TOKEN; uses the same .env as the app.
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { google } from 'googleapis';
import * as readline from 'readline';

function loadRootEnv(): void {
  const envPath = resolve(__dirname, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadRootEnv();

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri =
  process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback';

if (!clientId || !clientSecret) {
  console.error(
    'Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Set them in .env (same keys as the Nest app).',
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent', // forces refresh_token to be returned
  scope: ['https://www.googleapis.com/auth/meetings.space.created'],
});

console.log('Visit this URL:', url);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Paste the code from the callback URL: ', async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log('REFRESH TOKEN:', tokens.refresh_token); // copy to .env as GOOGLE_REFRESH_TOKEN
  rl.close();
});
