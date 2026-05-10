import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

const SCOPES = [
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/drive.file'
];

const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS || path.join(PROJECT_ROOT, 'credentials.json');
const TOKEN_PATH = path.join(path.dirname(CREDENTIALS_PATH), 'token.json');

function loadCredentials(): any {
  const envCredentialsPath = process.env.GOOGLE_CREDENTIALS;
  
  if (envCredentialsPath && fs.existsSync(envCredentialsPath)) {
    const content = fs.readFileSync(envCredentialsPath, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed.installed || parsed;
  }

  if (fs.existsSync(CREDENTIALS_PATH)) {
    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed.installed || parsed;
  }
  
  const envPath = path.join(PROJECT_ROOT, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const clientId = envContent.match(/GOOGLE_CLIENT_ID=(.+)/)?.[1]?.trim();
    const clientSecret = envContent.match(/GOOGLE_CLIENT_SECRET=(.+)/)?.[1]?.trim();
    
    if (clientId && clientSecret) {
      return { client_id: clientId, client_secret: clientSecret };
    }
  }
  
  throw new Error('No credentials found. Please create credentials.json or .env file.');
}

/**
 * Get OAuth2 client instance
 */
function getOAuth2Client(): OAuth2Client {
  const credentials = loadCredentials();

  if (!credentials.client_id || !credentials.client_secret) {
    throw new Error('Missing client_id or client_secret in credentials.json');
  }

  const client = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
    'http://localhost'
  );

  return client;
}

export function getAuthUrl(): string {
  const client = getOAuth2Client();
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  return authUrl;
}

export async function authenticate(code: string): Promise<void> {
  const client = getOAuth2Client();

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

    console.error('Authentication successful! Tokens saved to token.json');
  } catch (error) {
    console.error('Error exchanging authorization code for tokens:', error);
    throw error;
  }
}

export async function getAuthenticatedClient(): Promise<OAuth2Client> {
  const client = getOAuth2Client();

  try {
    if (!fs.existsSync(TOKEN_PATH)) {
      throw new Error('No token file found. Please run getAuthUrl() and authenticate() first.');
    }

    const tokenContent = fs.readFileSync(TOKEN_PATH);
    const tokens = JSON.parse(tokenContent.toString());

    client.setCredentials(tokens);

    if (client.credentials.expiry_date && client.credentials.expiry_date < Date.now()) {
      console.error('Access token expired. Refreshing...');
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
    }

    return client;
  } catch (error) {
    console.error('Error getting authenticated client:', error);
    throw error;
  }
}

export function hasValidCredentials(): boolean {
  try {
    if (!fs.existsSync(TOKEN_PATH)) {
      return false;
    }

    const tokenContent = fs.readFileSync(TOKEN_PATH);
    const tokens = JSON.parse(tokenContent.toString());

    return !!(tokens.refresh_token);
  } catch (error) {
    console.error('Error checking credentials:', error);
    return false;
  }
}

export async function revokeAuth(): Promise<void> {
  const client = getOAuth2Client();

  try {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
    }

    if (client.credentials.refresh_token) {
      await client.revokeCredentials();
      console.error('Authentication revoked successfully');
    }
  } catch (error) {
    console.error('Error revoking authentication:', error);
    throw error;
  }
}