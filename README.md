<div align="center">

# 🎨 Google Slides MCP Server

### AI-Powered Presentation Automation

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-5B47ED?style=for-the-badge)](https://modelcontextprotocol.io/)
[![Google Slides](https://img.shields.io/badge/Google_Slides-API-FBBC04?style=for-the-badge&logo=google-slides&logoColor=white)](https://developers.google.com/slides)

*Programmatically create, edit, and manage Google Slides presentations through the Model Context Protocol. Build complete slide decks with AI assistants using natural language commands.*

[Features](#-features) • [Architecture](#️-architecture) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples)

</div>

---

## 🌟 Overview

<div align="center">

**Transform ideas into professional slide decks instantly with AI-powered automation**

</div>

The **Google Slides MCP Server** bridges AI assistants with Google Slides, enabling automated presentation generation through natural language. Build complete presentations, add rich content, and manage slides—all through simple conversational commands.

<table>
<tr>
<td width="50%">

### 🎯 **Perfect For**

- 🤖 **AI-Powered Generation**  
  Let AI create entire decks from prompts
  
- 📊 **Automated Reporting**  
  Generate slides from data and analytics
  
- 🎓 **Educational Content**  
  Create course materials and training decks

</td>
<td width="50%">

### 💼 **Use Cases**

- 💼 **Business Automation**  
  Build sales decks and pitch presentations
  
- 🔄 **Template Workflows**  
  Programmatically populate slide templates
  
- 📈 **Dynamic Dashboards**  
  Real-time presentation updates

</td>
</tr>
</table>

---

<div align="center">

## 🏗️ Architecture

</div>

```mermaid
graph TB
    subgraph "AI Layer"
        A[AI Assistant<br/>Claude/GPT/etc]
    end
    
    subgraph "MCP Layer"
        B[MCP Protocol]
        C[Tool Router]
    end
    
    subgraph "Server Layer"
        D[Presentations<br/>4 tools]
        E[Slides<br/>3 tools]
        F[Elements<br/>4 tools]
        G[Text Editing<br/>6 tools]
        H[Properties<br/>2 tools]
        I[Drive Ops<br/>4 tools]
        J[Batch<br/>1 tool]
    end
    
    subgraph "Google Cloud"
        K[Google Slides API]
        L[Google Drive API]
        M[OAuth 2.0]
    end
    
    A -->|Natural Language| B
    B --> C
    C --> D & E & F & G & H & I & J
    D & E & F & G & H --> K
    I --> L
    K & L --> M
    
    style A fill:#5B47ED,stroke:#fff,stroke-width:2px,color:#fff
    style B fill:#4285F4,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#34A853,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#FBBC04,stroke:#333,stroke-width:2px
    style E fill:#FBBC04,stroke:#333,stroke-width:2px
    style F fill:#FBBC04,stroke:#333,stroke-width:2px
    style G fill:#FBBC04,stroke:#333,stroke-width:2px
    style H fill:#FBBC04,stroke:#333,stroke-width:2px
    style I fill:#FBBC04,stroke:#333,stroke-width:2px
    style J fill:#FBBC04,stroke:#333,stroke-width:2px
    style K fill:#EA4335,stroke:#fff,stroke-width:2px,color:#fff
    style L fill:#EA4335,stroke:#fff,stroke-width:2px,color:#fff
    style M fill:#EA4335,stroke:#fff,stroke-width:2px,color:#fff
```

<br>

### **🔄 Request Flow**

```ascii
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│              │      │              │      │              │      │              │
│  AI Prompt   │─────▶│  MCP Tools   │─────▶│  API Client  │─────▶│ Google APIs  │
│              │      │              │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
       │                     │                     │                     │
       │                     │                     │                     │
       │              ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
       │              │  Validation │       │Rate Limiting│       │   OAuth     │
       │              │  (Zod)      │       │  & Retry    │       │   Token     │
       │              └─────────────┘       └─────────────┘       └─────────────┘
       │                                                                  │
       └──────────────────────────────────────────────────────────────────┘
                              ◀── Presentation Created ◀──
```

---

## ✨ Features

<div align="center">

### **📊 24+ Tools Across 7 Categories**

</div>

<table>
<tr>
<td width="33%" align="center">

### 📑 Presentations

✅ Create & Copy  
✅ Delete & List  
✅ Export to PDF  
✅ Share & Permissions

</td>
<td width="33%" align="center">

### 🎯 Slides

✅ Add & Delete  
✅ Reorder Slides  
✅ Apply Layouts  
✅ Update Backgrounds

</td>
<td width="33%" align="center">

### 🎨 Content

✅ Text Boxes  
✅ Shapes & Images  
✅ Tables & Charts  
✅ Bullet Lists

</td>
</tr>
<tr>
<td width="33%" align="center">

### ✏️ Text Editing

✅ Insert & Delete  
✅ Find & Replace  
✅ Style Formatting  
✅ Paragraph Alignment

</td>
<td width="33%" align="center">

### 🔧 Advanced

✅ Batch Operations  
✅ Element Transforms  
✅ Rate Limiting  
✅ Error Handling

</td>
<td width="33%" align="center">

### 🛡️ Reliability

✅ Type Safety (TS)  
✅ Zod Validation  
✅ Auto Retry Logic  
✅ Quota Management

</td>
</tr>
</table>

---

## 🚀 Installation

<div align="center">

### Prerequisites

</div>

<div align="center">

<table>
<tr>
<td align="center" width="25%">

**Node.js 18+**

</td>
<td align="center" width="25%">

**GCP Project**

</td>
<td align="center" width="25%">

**Slides API**

</td>
<td align="center" width="25%">

**OAuth 2.0**

</td>
</tr>
</table>

</div>

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/google-slides-mcp.git
cd google-slides-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Authenticate (first time only)
npm start
```

---

## 🔐 Google Cloud Setup

<div align="center">

<table>
<tr>
<td width="25%" align="center">

**1. Create Project**

[Google Cloud Console](https://console.cloud.google.com/)

</td>
<td width="25%" align="center">

**2. Enable APIs**

Slides API + Drive API

</td>
<td width="25%" align="center">

**3. OAuth Consent**

Configure & Add Users

</td>
<td width="25%" align="center">

**4. Get Credentials**

Download `credentials.json`

</td>
</tr>
</table>

</div>

<details>
<summary><b>📖 Detailed Setup Instructions</b></summary>

<br>

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

</details>

---

## ⚡ Quick Start

### 1. Authenticate

Run the server for the first time to authenticate:

```bash
npm start
```

The server will display an authentication URL, open it in your browser, grant permissions, and save the token automatically.

### 2. Configure Your MCP Client

<table>
<tr>
<td width="50%">

**Claude Desktop** (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "google-slides": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "GOOGLE_CREDENTIALS": "/path/to/credentials.json"
      }
    }
  }
}
```

</td>
<td width="50%">

**Cline (VS Code)** (MCP settings)

```json
{
  "mcpServers": {
    "google-slides": {
      "command": "node",
      "args": ["C:\\path\\to\\dist\\index.js"],
      "env": {
        "GOOGLE_CREDENTIALS": "C:\\path\\to\\credentials.json"
      }
    }
  }
}
```

</td>
</tr>
</table>

### 3. Start Creating!

Use natural language prompts with your AI assistant:

- *"Create a new presentation titled 'Q4 Sales Report'"*
- *"Add a title slide with 'Welcome to Our Product Launch'"*
- *"Add a slide with bullet points about our key features"*
- *"Insert an image from https://example.com/logo.png"*

---

## 📚 Documentation

### Available Tools

<details open>
<summary><b>📑 Presentation Management (4 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `create_presentation` | Create a new presentation with a title |
| `get_presentation` | Retrieve presentation details by ID |
| `copy_presentation` | Duplicate an existing presentation |
| `delete_presentation` | Permanently delete a presentation |

</details>

<details>
<summary><b>🎯 Slide Operations (3 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `create_slide` | Add a new slide with optional layout |
| `delete_slide` | Remove a slide from the presentation |
| `reorder_slides` | Change slide position in the deck |

</details>

<details>
<summary><b>🎨 Content Elements (4 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `add_text_box` | Add a text box with custom styling |
| `add_shape` | Insert shapes (rectangles, circles, arrows, etc.) |
| `add_image` | Add images from URLs |
| `add_table` | Create tables with rows and columns |

</details>

<details>
<summary><b>✏️ Text Editing (6 tools)</b></summary>

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
<summary><b>🔧 Properties & Transforms (2 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `update_page_properties` | Change slide background color |
| `update_element_transform` | Move, resize, or rotate elements |

</details>

<details>
<summary><b>💾 Drive Operations (4 tools)</b></summary>

| Tool | Description |
|------|-------------|
| `list_presentations` | List presentations from Google Drive |
| `export_presentation` | Export presentation as PDF |
| `update_permissions` | Share presentation with users |
| `delete_presentation` | Delete presentation from Drive |

</details>

<details>
<summary><b>⚡ Batch Operations (1 tool)</b></summary>

| Tool | Description |
|------|-------------|
| `batch_update` | Execute multiple operations atomically |

</details>

<div align="center">

**📖 [Full API Reference](./docs/API_REFERENCE.md)**

</div>

---

## 💡 Examples

### Example 1: Create a Simple Presentation

```typescript
// Create presentation
const presentation = await create_presentation({ 
  title: "My First Deck" 
});

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
  x: 1, y: 2, width: 8, height: 1,
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
  rows: 4, columns: 3,
  x: 1, y: 1.5, width: 8, height: 3
});

// Populate table cells
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
    // ... more cells
  ]
});
```

### Example 3: Batch Operations

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
          transform: { 
            translateX: 914400, translateY: 914400, 
            scaleX: 7315200, scaleY: 914400, 
            unit: "EMU" 
          }
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
        style: { 
          fontSize: { magnitude: 28, unit: "PT" }, 
          bold: true 
        },
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
│   │   ├── presentations.ts  # Presentation management
│   │   ├── slides.ts         # Slide operations
│   │   ├── elements.ts       # Content elements
│   │   ├── text.ts           # Text editing
│   │   ├── properties.ts     # Properties & transforms
│   │   ├── batch.ts          # Batch operations
│   │   └── drive.ts          # Drive operations
│   └── utils/
│       ├── validators.ts     # Input validation
│       ├── errors.ts         # Error handling
│       ├── retry.ts          # Retry logic
│       ├── rate-limiter.ts   # Rate limiting
│       └── debug-logger.ts   # Debug logging
├── dist/                     # Compiled JavaScript
└── docs/                     # Documentation
```

### Scripts

```bash
npm run build    # Compile TypeScript
npm run dev      # Development mode
npm start        # Run server
```

### Environment Variables

```env
GOOGLE_CREDENTIALS=./credentials.json
CALLMISSED=true  # Enable debug logging
```

---

## 🔒 Security

<table>
<tr>
<td width="50%">

### Important Notes

✅ Never commit `credentials.json` or `token.json`  
✅ Both files are in `.gitignore` by default  
✅ `credentials.json` contains OAuth secrets  
✅ `token.json` contains access tokens  
✅ Keep these files secure and private

</td>
<td width="50%">

### Token Management

Tokens are automatically refreshed when expired.

If authentication fails:

```bash
rm token.json
npm start
```

</td>
</tr>
</table>

---

## 📊 Rate Limits

<div align="center">

The server includes built-in rate limiting to respect Google API quotas

</div>

| API | Limit | Handling |
|-----|-------|----------|
| **Google Slides API** | 60 requests/minute | Automatic retry with exponential backoff |
| **Google Drive API** | 100 requests/minute | Automatic retry with exponential backoff |

---

<div align="center">

## 🐛 Troubleshooting

</div>

<details>
<summary><b>❌ Authentication Errors</b></summary>

<br>

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
<summary><b>❌ API Not Enabled</b></summary>

<br>

**Problem:** `Google Slides API has not been used in project...`

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Slides API** and **Google Drive API**
3. Wait a few minutes for changes to propagate

</details>

<details>
<summary><b>❌ Quota Exceeded</b></summary>

<br>

**Problem:** `Quota exceeded for quota metric...`

**Solution:**
- The server automatically retries with exponential backoff
- Reduce request frequency if hitting limits consistently
- Check quota usage in Google Cloud Console
- Consider requesting quota increases for production use

</details>

<details>
<summary><b>❌ MCP Client Not Detecting Server</b></summary>

<br>

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

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and TypeScript conventions
- Add tests for new features
- Update documentation for API changes
- Ensure all tools have proper error handling
- Use Zod for input validation

---

## 🙏 Acknowledgments

<div align="center">

<table>
<tr>
<td align="center" width="33%">

**Built with**

[Model Context Protocol](https://modelcontextprotocol.io/)

</td>
<td align="center" width="33%">

**Powered by**

[Google Slides API](https://developers.google.com/slides)

</td>
<td align="center" width="33%">

**Uses**

[Google Drive API](https://developers.google.com/drive)

</td>
</tr>
</table>

</div>

---

## 📞 Support

<div align="center">

<table>
<tr>
<td align="center" width="50%">

### 🐛 Issues

[Report a Bug](https://github.com/yourusername/google-slides-mcp/issues)

</td>
<td align="center" width="50%">

### ⭐ Star Us

If you find this useful!

</td>
</tr>
</table>

</div>

---

<div align="center">

**Made with ❤️ for the MCP community**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/google-slides-mcp?style=social)](https://github.com/yourusername/google-slides-mcp/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/google-slides-mcp?style=social)](https://github.com/yourusername/google-slides-mcp/network/members)

[⬆ Back to Top](#-google-slides-mcp-server)

</div>
