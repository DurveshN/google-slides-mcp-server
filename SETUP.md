# Setup Instructions

## 1. Copy your credentials
Copy these files from your old location to this folder:
- `credentials.json` - Your Google OAuth2 credentials
- `token.json` - Your OAuth token (if you want to reuse it)

## 2. Configure environment
```bash
cp .env.example .env
# Edit .env if needed
```

## 3. Start the server
```bash
npm start
```

## 4. Update OpenCode config
Update your `opencode.json` or `oh-my-openagent.json` to point to the new location:

```json
{
  "mcpServers": {
    "google-slides": {
      "command": "node",
      "args": ["E:\\mcp_server\\google_slide\\dist\\index.js"],
      "env": {
        "GOOGLE_CREDENTIALS": "E:\\mcp_server\\google_slide\\credentials.json"
      }
    }
  }
}
```