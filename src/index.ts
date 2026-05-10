import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";
import { MCPRouter } from "./mcp/router.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { OAuth2Client } from "google-auth-library";
import { debugLog, clearDebugLog } from "./utils/debug-logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");

import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: path.join(PROJECT_ROOT, ".env") });

const router = new MCPRouter();
let activeRequests = 0;
let shouldExit = false;

debugLog("=== MCP Server Starting ===");
debugLog("CALLMISSED set:", !!process.env.CALLMISSED);
debugLog("GOOGLE_CREDENTIALS set:", !!process.env.GOOGLE_CREDENTIALS);

process.on("unhandledRejection", (err) => {
  debugLog("Unhandled rejection:", err);
  console.error("Unhandled rejection:", err);
});

process.on("uncaughtException", (err) => {
  debugLog("Uncaught exception:", err);
  console.error("Uncaught exception:", err);
});

async function handleRequest(request: unknown): Promise<unknown> {
  debugLog("handleRequest called", request);
  if (!request || typeof request !== "object") {
    throw new Error("Invalid request: expected JSON object");
  }

  const jsonrpcRequest = request as {
    jsonrpc: "2.0";
    method: string;
    id?: string | number | null;
    params?: unknown;
  };

  if (jsonrpcRequest.jsonrpc !== "2.0") {
    throw new Error("Invalid JSON-RPC version");
  }

  return await router.routeRequest(jsonrpcRequest);
}

async function checkAuth(): Promise<void> {
  const credentialsPath = process.env.GOOGLE_CREDENTIALS || path.join(PROJECT_ROOT, "credentials.json");
  const tokenPath = path.join(path.dirname(credentialsPath), "token.json");

  let needsAuth = false;
  if (!fs.existsSync(tokenPath)) {
    needsAuth = true;
  } else {
    try {
      const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
      if (!tokens.refresh_token) {
        needsAuth = true;
      }
    } catch {
      needsAuth = true;
    }
  }

  if (!needsAuth) {
    return;
  }

  if (!stdin.isTTY) {
    console.error("No valid token found. Please authenticate by running: node dist/index.js");
    throw new Error("Authentication required: no valid token found");
  }

  console.error("No valid token found. Starting authentication...\n");

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`credentials.json not found at ${credentialsPath}`);
  }

  const creds = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
  const installed = creds.installed || creds;

  const client = new OAuth2Client(
    installed.client_id,
    installed.client_secret,
    "http://localhost"
  );

  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/presentations",
      "https://www.googleapis.com/auth/drive.file",
    ],
    prompt: "consent",
  });

  console.error("Open this URL in your browser and grant permissions:");
  console.error(authUrl);
  console.error("\nPaste the authorization code here:");

  const rl = createInterface({ input: stdin, output: stdout });
  const code = await new Promise<string>((resolve) => {
    rl.question("", (answer) => resolve(answer.trim()));
  });
  rl.close();

  const { tokens } = await client.getToken(code);
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
  console.error("\nAuthentication successful! Token saved to token.json\n");
}

async function main(): Promise<void> {
  await checkAuth();

  const rl = createInterface({ input: stdin });

  rl.on("line", async (line: string) => {
    let requestId: string | number | null = null;

    try {
      const request = JSON.parse(line);
      requestId = request?.id ?? null;
      debugLog(`[REQUEST ${requestId}]`, { method: request?.method, params: request?.params });
      activeRequests++;

      const response = await handleRequest(request);
      const responseStr = JSON.stringify(response);
      debugLog(`[RESPONSE ${requestId}]`, { responseLength: responseStr.length });
      stdout.write(responseStr + "\n");
    } catch (err) {
      debugLog(`[ERROR ${requestId}]`, { error: err instanceof Error ? err.message : String(err) });
      const response: {
        jsonrpc: string;
        id: string | number | null;
        error: {
          code: number;
          message: string;
          data?: unknown;
        };
      } = {
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: -32700,
          message: err instanceof Error ? err.message : String(err),
        },
      };

      stdout.write(JSON.stringify(response) + "\n");
    } finally {
      activeRequests--;
      if (shouldExit && activeRequests === 0) {
        debugLog("All requests complete, exiting now");
        process.exit(0);
      }
    }
  });

  rl.on("close", () => {
    debugLog("stdin closed", { activeRequests });
    if (activeRequests === 0) {
      process.exit(0);
    } else {
      shouldExit = true;
      debugLog("Waiting for active requests to complete before exit...");
      setTimeout(() => {
        debugLog("Force exit after 30s timeout");
        process.exit(0);
      }, 30000);
    }
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
