# 🎨 Google Slides MCP Server

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)

**A powerful Model Context Protocol (MCP) server for programmatic Google Slides creation and manipulation**

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples)

</div>

---

## 🌟 Overview

The **Google Slides MCP Server** enables AI assistants and automation tools to create, edit, and manage Google Slides presentations programmatically through the Model Context Protocol. Build complete slide decks, add rich content, apply styling, and manage presentations—all through simple tool calls.

Perfect for:
- 🤖 **AI-powered presentation generation** - Let AI create entire decks from prompts
- 📊 **Automated reporting** - Generate slides from data and analytics
- 🎓 **Educational content** - Create course materials and training decks
- 💼 **Business automation** - Build sales decks, pitch presentations, and reports
- 🔄 **Template-based workflows** - Programmatically populate slide templates

---

## ✨ Features

### 📑 Presentation Management
- ✅ Create, copy, and delete presentations
- ✅ List presentations from Google Drive
- ✅ Export presentations to PDF
- ✅ Manage sharing permissions

### 🎯 Slide Operations
- ✅ Add, delete, and reorder slides
- ✅ Apply predefined layouts (title, blank, section header, etc.)
- ✅ Update slide backgrounds and properties

### 🎨 Rich Content Elements
- ✅ **Text boxes** with custom styling (font, size, color, alignment)
- ✅ **Shapes** (rectangles, circles, arrows, and more)
- ✅ **Images** from URLs with positioning and sizing
- ✅ **Tables** with customizable rows, columns, and cell content
- ✅ **Bullet lists** with multiple preset styles

### ✏️ Text Editing & Styling
- ✅ Insert, delete, and replace text
- ✅ Apply text formatting (bold, italic, underline, font family)
- ✅ Paragraph styling (alignment, line spacing)
- ✅ Create and customize bullet points

### 🔧 Advanced Features
- ✅ **Batch operations** - Execute multiple updates atomically
- ✅ **Transform elements** - Position, resize, and rotate objects
- ✅ **Rate limiting** - Built-in Google API quota management
- ✅ **Error handling** - Comprehensive retry logic and error normalization
- ✅ **Type safety** - Full TypeScript implementation with Zod validation

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18 or higher
- **Google Cloud Project** with Slides API and Drive API enabled
- **OAuth 2.0 credentials** (Desktop app type)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/google-slides-mcp.git
cd google-slides-mcp
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build the Project

```bash
npm run build
```

---

## 🔐 Google Cloud Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** and name it (e.g., `mcp-slides-server`)
3. Select the project from the dropdown

### 2. Enable Required APIs

Navigate to **APIs & Services > Library** and enable:
- ✅ **Google Slides API**
- ✅ **Google Drive API**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** (or Internal if using Google Workspace)
3. Fill in required fields:
   - App name: `Google Slides MCP Server`
   - User support email: Your email
   - Developer contact: Your email
4. Add your email as a **test user** (if using External)
5. Click **Save and Continue**

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Application type: **Desktop app**
4. Name: `MCP Server Client`
5. Click **Create**
6. Download the JSON file and save it as `credentials.json` in the project root

---

## ⚡ Quick Start

### 1. Authenticate

Run the server for the first time to authenticate:

```bash
npm start
```

The server will:
1. Display an authentication URL
2. Open it in your browser
3. Ask you to grant permissions
4. Save the token to `token.json` automatically

### 2. Configure Your MCP Client

Add the server to your MCP client configuration (e.g., Claude Desktop, Cline, or other MCP-compatible tools):

#### For Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-slides": {
      "command": "node",
      "args": ["/absolute/path/to/google-slides-mcp/dist/index.js"],
      "env": {
        "GOOGLE_CREDENTIALS": "/absolute/path/to/google-slides-mcp/credentials.json"
      }
    }
  }
}
```

#### For Cline (VS Code Extension):

```json
{
  "mcpServers": {
    "google-slides": {
      "command": "node",
      "args": ["C:\\path\\to\\google-slides-mcp\\dist\\index.js"],
      "env": {
        "GOOGLE_CREDENTIALS": "C:\\path\\to\\google-slides-mcp\\credentials.json"
      }
    }
  }
}
```

### 3. Start Creating!

Once configured, you can use natural language prompts with your AI assistant:

```
"Create a new presentation titled 'Q4 Sales Report'"
"Add a title slide with 'Welcome to Our Product Launch'"
"Add a slide with bullet points about our key features"
"Insert an image from https://example.com/logo.png on slide 2"
"Export the presentation as PDF"
```

---

## 📚 Documentation

### Available Tools

<details>
<summary><b>Presentation Management (4 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `create_presentation` | Create a new presentation with a title |
| `get_presentation` | Retrieve presentation details by ID |
| `copy_presentation` | Duplicate an existing presentation |
| `delete_presentation` | Permanently delete a presentation |

</details>

<details>
<summary><b>Slide Operations (3 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `create_slide` | Add a new slide with optional layout |
| `delete_slide` | Remove a slide from the presentation |
| `reorder_slides` | Change slide position in the deck |

</details>

<details>
<summary><b>Content Elements (4 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `add_text_box` | Add a text box with custom styling |
| `add_shape` | Insert shapes (rectangles, circles, arrows, etc.) |
| `add_image` | Add images from URLs |
| `add_table` | Create tables with rows and columns |

</details>

<details>
<summary><b>Text Editing (6 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `insert_text` | Insert text into an element |
| `delete_text` | Remove text from an element |
| `replace_all_text` | Find and replace text globally |
| `update_text_style` | Apply font, size, color, and formatting |
| `update_paragraph_style` | Set alignment and line spacing |
| `create_bullets` | Add bullet points with preset styles |

</details>

<details>
<summary><b>Properties & Transforms (2 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `update_page_properties` | Change slide background color |
| `update_element_transform` | Move, resize, or rotate elements |

</details>

<details>
<summary><b>Drive Operations (4 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `list_presentations` | List presentations from Google Drive |
| `export_presentation` | Export presentation as PDF |
| `update_permissions` | Share presentation with users |
| `delete_presentation` | Delete presentation from Drive |

</details>

<details>
<summary><b>Batch Operations (1 tool)</b></summary>

| Tool | Description |
|------|-------------|
| `batch_update` | Execute multiple operations atomically |

</details>

### Full API Reference

For detailed parameter documentation and examples, see [API_REFERENCE.md](./docs/API_REFERENCE.md)

---

## 💡 Examples

### Example 1: Create a Simple Presentation

```typescript
// Create presentation
const presentation = await create_presentation({ title: "My First Deck" });

// Add title slide
const slide1 = await create_slide({
  presentationId: presentation.presentationId,
  layout: "TITLE_SLIDE"
});

// Add title text
await add_text_box({
  presentationId: presentation.presentationId,
  slideId: slide1.slideId,
  text: "Welcome to My Presentation",
  x: 1,
  y: 2,
  width: 8,
  height: 1,
  fontSize: 36,
  bold: true
});
```

### Example 2: Create a Data Slide with Table

```typescript
// Add blank slide
const slide = await create_slide({
  presentationId: presentationId,
  layout: "BLANK"
});

// Add table
const table = await add_table({
  presentationId: presentationId,
  slideId: slide.slideId,
  rows: 4,
  columns: 3,
  x: 1,
  y: 1.5,
  width: 8,
  height: 3
});

// Populate table cells (using batch_update for efficiency)
await batch_update({
  presentationId: presentationId,
  requests: [
    {
      insertText: {
        objectId: table.elementId,
        cellLocation: { rowIndex: 0, columnIndex: 0 },
        text: "Product"
      }
    },
    {
      insertText: {
        objectId: table.elementId,
        cellLocation: { rowIndex: 0, columnIndex: 1 },
        text: "Revenue"
      }
    }
    // ... more cells
  ]
});
```

### Example 3: Add Image and Style It

```typescript
// Add image
const image = await add_image({
  presentationId: presentationId,
  slideId: slideId,
  imageUrl: "https://example.com/chart.png",
  x: 2,
  y: 2,
  width: 6,
  height: 3
});

// Reposition if needed
await update_element_transform({
  presentationId: presentationId,
  elementId: image.elementId,
  x: 2.5,
  y: 2.5,
  width: 5,
  height: 2.5
});
```

### Example 4: Batch Operations for Complex Slides

```typescript
// Create multiple elements atomically
await batch_update({
  presentationId: presentationId,
  requests: [
    {
      createShape: {
        objectId: "title-box",
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          transform: { translateX: 914400, translateY: 914400, scaleX: 7315200, scaleY: 914400, unit: "EMU" }
        }
      }
    },
    {
      insertText: {
        objectId: "title-box",
        text: "Key Metrics",
        insertionIndex: 0
      }
    },
    {
      updateTextStyle: {
        objectId: "title-box",
        textRange: { type: "ALL" },
        style: { fontSize: { magnitude: 28, unit: "PT" }, bold: true },
        fields: "fontSize,bold"
      }
    }
  ]
});
```

---

## 🛠️ Development

### Project Structure

```
google-slides-mcp/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── auth.ts               # OAuth authentication
│   ├── google-client.ts      # Google API client setup
│   ├── mcp/
│   │   ├── router.ts         # MCP request routing
│   │   └── types.ts          # MCP type definitions
│   ├── tools/
│   │   ├── presentations.ts  # Presentation management tools
│   │   ├── slides.ts         # Slide operations
│   │   ├── elements.ts       # Content elements (text, shapes, images, tables)
│   │   ├── text.ts           # Text editing and styling
│   │   ├── properties.ts     # Page properties and transforms
│   │   ├── batch.ts          # Batch operations
│   │   └── drive.ts          # Google Drive operations
│   └── utils/
│       ├── validators.ts     # Input validation
│       ├── errors.ts         # Error handling
│       ├── retry.ts          # Retry logic
│       ├── rate-limiter.ts   # API rate limiting
│       └── debug-logger.ts   # Debug logging
├── dist/                     # Compiled JavaScript
├── credentials.json          # OAuth credentials (not in repo)
├── token.json               # OAuth token (not in repo)
└── package.json
```

### Scripts

```bash
npm run build    # Compile TypeScript to JavaScript
npm run dev      # Run in development mode with tsx
npm start        # Run the compiled server
```

### Environment Variables

Create a `.env` file for optional configuration:

```env
GOOGLE_CREDENTIALS=./credentials.json
CALLMISSED=true  # Enable debug logging
```

---

## 🔒 Security

### Important Security Notes

- ✅ **Never commit** `credentials.json` or `token.json` to version control
- ✅ Both files are in `.gitignore` by default
- ✅ `credentials.json` contains OAuth client secrets
- ✅ `token.json` contains access and refresh tokens
- ✅ Keep these files secure and private

### Token Management

- Tokens are automatically refreshed when expired
- If authentication fails, delete `token.json` and re-authenticate:
  ```bash
  rm token.json
  npm start
  ```

---

## 📊 Rate Limits

The server includes built-in rate limiting to respect Google API quotas:

| API | Limit | Handling |
|-----|-------|----------|
| Google Slides API | 60 requests/minute | Automatic retry with exponential backoff |
| Google Drive API | 100 requests/minute | Automatic retry with exponential backoff |

The server automatically handles rate limit errors and retries failed requests.

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><b>Authentication Errors</b></summary>

**Problem:** `Authentication required: no valid token found`

**Solution:**
1. Ensure `credentials.json` exists in the project root
2. Delete `token.json` and re-authenticate:
   ```bash
   rm token.json
   npm start
   ```
3. Verify your email is added as a test user in OAuth consent screen

</details>

<details>
<summary><b>API Not Enabled</b></summary>

**Problem:** `Google Slides API has not been used in project...`

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Slides API** and **Google Drive API**
3. Wait a few minutes for changes to propagate

</details>

<details>
<summary><b>Quota Exceeded</b></summary>

**Problem:** `Quota exceeded for quota metric...`

**Solution:**
- The server automatically retries with exponential backoff
- Reduce request frequency if hitting limits consistently
- Check quota usage in Google Cloud Console
- Consider requesting quota increases for production use

</details>

<details>
<summary><b>MCP Client Not Detecting Server</b></summary>

**Problem:** Server not appearing in MCP client

**Solution:**
1. Verify absolute paths in configuration (no relative paths)
2. Ensure `dist/index.js` exists (run `npm run build`)
3. Restart your MCP client after configuration changes
4. Check client logs for connection errors

</details>

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and TypeScript conventions
- Add tests for new features
- Update documentation for API changes
- Ensure all tools have proper error handling
- Use Zod for input validation

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with the [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by [Google Slides API](https://developers.google.com/slides)
- Uses [Google Drive API](https://developers.google.com/drive) for file management

---

## 📞 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/yourusername/google-slides-mcp/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/yourusername/google-slides-mcp/discussions)
- 📧 **Email:** your.email@example.com

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

<div align="center">

**Made with ❤️ for the MCP community**

[⬆ Back to Top](#-google-slides-mcp-server)

</div>
