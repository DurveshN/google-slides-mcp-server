# 🎨 Visual Assets Guide

This guide helps you create professional visual assets for the Google Slides MCP Server repository to increase visibility and engagement on GitHub.

## 📊 Recommended Assets

### 1. Repository Banner / Hero Image

**Dimensions**: 1280 x 640 pixels (2:1 ratio)

**Content Suggestions**:
- Project logo or icon
- Project name: "Google Slides MCP Server"
- Tagline: "Automate presentations with AI"
- Visual elements: Slide thumbnails, code snippets, or workflow diagrams
- Color scheme: Google Slides brand colors (blue, yellow, red, green) or professional tech colors

**Tools**:
- [Canva](https://www.canva.com/) - Free templates
- [Figma](https://www.figma.com/) - Professional design
- [Photopea](https://www.photopea.com/) - Free Photoshop alternative

**Example Layout**:
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Icon]  Google Slides MCP Server                  │
│          Automate presentations with AI            │
│                                                     │
│  [Code snippet]    →    [Slide preview]            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2. Logo / Icon

**Dimensions**: 512 x 512 pixels (square)

**Design Ideas**:
- Combine Google Slides icon with MCP/AI elements
- Use a stylized "S" for Slides
- Incorporate presentation/slide imagery
- Keep it simple and recognizable at small sizes

**Color Palette**:
- Primary: `#1a73e8` (Google Blue)
- Secondary: `#fbbc04` (Google Yellow)
- Accent: `#34a853` (Google Green)
- Dark: `#202124`
- Light: `#f8f9fa`

---

### 3. Architecture Diagram

**Purpose**: Show how the MCP server connects AI assistants to Google Slides

**Components**:
```
┌──────────────┐
│  AI Assistant│
│ (Claude, etc)│
└──────┬───────┘
       │ MCP Protocol
       ▼
┌──────────────┐
│  MCP Server  │
│ (This Project)│
└──────┬───────┘
       │ Google APIs
       ▼
┌──────────────┐
│ Google Slides│
│      API     │
└──────────────┘
```

**Tools**:
- [Excalidraw](https://excalidraw.com/) - Hand-drawn style diagrams
- [Draw.io](https://app.diagrams.net/) - Professional diagrams
- [Mermaid](https://mermaid.js.org/) - Code-based diagrams

---

### 4. Demo GIF / Video

**Content**: Show the tool in action

**Suggested Demos**:
1. Creating a presentation from a prompt
2. Adding slides with content
3. Formatting and styling
4. Final presentation preview

**Tools**:
- [ScreenToGif](https://www.screentogif.com/) - Windows
- [Kap](https://getkap.co/) - macOS
- [Peek](https://github.com/phw/peek) - Linux
- [LICEcap](https://www.cockos.com/licecap/) - Cross-platform

**Specifications**:
- Format: GIF or MP4
- Duration: 10-30 seconds
- Resolution: 1280 x 720 or higher
- File size: < 10 MB for GIF, < 50 MB for video

---

### 5. Feature Showcase Images

**Purpose**: Highlight key features visually

**Suggested Images**:

1. **Before/After Comparison**
   - Left: Text prompt
   - Right: Generated presentation

2. **Tool Categories**
   - Grid showing different tool types
   - Icons for each category

3. **Use Case Examples**
   - Sales deck
   - Educational content
   - Data visualization
   - Business reports

**Dimensions**: 1200 x 800 pixels

---

### 6. Social Media Cards

**Twitter/X Card**
- Dimensions: 1200 x 628 pixels
- Include: Logo, project name, key benefit

**LinkedIn Card**
- Dimensions: 1200 x 627 pixels
- Professional design with use cases

**Dev.to / Hashnode**
- Dimensions: 1000 x 420 pixels
- Technical focus with code snippets

---

## 🎨 Design Guidelines

### Color Scheme

**Primary Colors** (Google Slides inspired):
```css
--primary-blue: #1a73e8;
--primary-yellow: #fbbc04;
--primary-red: #ea4335;
--primary-green: #34a853;
```

**Neutral Colors**:
```css
--dark: #202124;
--medium: #5f6368;
--light: #e8eaed;
--background: #f8f9fa;
--white: #ffffff;
```

### Typography

**Recommended Fonts**:
- **Headings**: Google Sans, Inter, or Poppins
- **Body**: Roboto, Open Sans, or System UI
- **Code**: Fira Code, JetBrains Mono, or Consolas

### Visual Style

- **Modern & Clean**: Minimal design with plenty of white space
- **Professional**: Business-appropriate colors and layouts
- **Tech-Forward**: Include code snippets and terminal windows
- **Accessible**: High contrast, readable fonts

---

## 📁 File Organization

Organize visual assets in your repository:

```
assets/
├── logo/
│   ├── logo.svg
│   ├── logo.png
│   ├── logo-dark.svg
│   └── logo-light.svg
├── banner/
│   ├── github-banner.png
│   └── social-banner.png
├── screenshots/
│   ├── demo.gif
│   ├── feature-1.png
│   ├── feature-2.png
│   └── architecture.png
└── social/
    ├── twitter-card.png
    ├── linkedin-card.png
    └── dev-card.png
```

---

## 🖼️ Using Assets in README

### Banner Image

```markdown
<div align="center">
  <img src="./assets/banner/github-banner.png" alt="Google Slides MCP Server" />
</div>
```

### Logo

```markdown
<p align="center">
  <img src="./assets/logo/logo.png" width="200" alt="Logo" />
</p>
```

### Demo GIF

```markdown
## 🎬 Demo

<div align="center">
  <img src="./assets/screenshots/demo.gif" alt="Demo" width="800" />
</div>
```

### Feature Screenshots

```markdown
## ✨ Features

<table>
  <tr>
    <td width="50%">
      <img src="./assets/screenshots/feature-1.png" alt="Feature 1" />
      <p align="center"><b>Create Presentations</b></p>
    </td>
    <td width="50%">
      <img src="./assets/screenshots/feature-2.png" alt="Feature 2" />
      <p align="center"><b>Add Rich Content</b></p>
    </td>
  </tr>
</table>
```

### Architecture Diagram

```markdown
## 🏗️ Architecture

<div align="center">
  <img src="./assets/screenshots/architecture.png" alt="Architecture" width="600" />
</div>
```

---

## 🎯 Quick Asset Creation Checklist

- [ ] Create project logo (512x512 PNG)
- [ ] Design GitHub banner (1280x640 PNG)
- [ ] Record demo GIF (< 10 MB)
- [ ] Create architecture diagram
- [ ] Take feature screenshots
- [ ] Design social media cards
- [ ] Add assets to repository
- [ ] Update README with images
- [ ] Set repository social preview image

---

## 🔧 Tools & Resources

### Design Tools

- **Canva** - Easy templates and drag-and-drop
- **Figma** - Professional design tool
- **Photopea** - Free Photoshop alternative
- **GIMP** - Open-source image editor

### Icon Resources

- **Google Fonts Icons** - https://fonts.google.com/icons
- **Heroicons** - https://heroicons.com/
- **Lucide** - https://lucide.dev/
- **Feather Icons** - https://feathericons.com/

### Color Tools

- **Coolors** - https://coolors.co/ (palette generator)
- **Adobe Color** - https://color.adobe.com/
- **Material Design Colors** - https://materialui.co/colors

### Screenshot Tools

- **Flameshot** - Linux screenshot tool
- **Greenshot** - Windows screenshot tool
- **Shottr** - macOS screenshot tool
- **Carbon** - https://carbon.now.sh/ (code screenshots)

---

## 📈 GitHub Repository Settings

### Social Preview Image

1. Go to repository **Settings**
2. Scroll to **Social preview**
3. Upload your banner image (1280x640)
4. This appears when sharing on social media

### Repository Topics

Add relevant topics to increase discoverability:
- `mcp`
- `model-context-protocol`
- `google-slides`
- `slides-api`
- `automation`
- `ai`
- `typescript`
- `presentation`
- `claude`
- `anthropic`

### About Section

Update the repository description:
```
A powerful MCP server for programmatic Google Slides creation and manipulation. 
Build complete slide decks, add rich content, and automate presentations through AI.
```

Add website: Link to documentation or demo site

---

## 💡 Pro Tips

1. **Consistency**: Use the same color scheme across all assets
2. **Branding**: Include your logo on all visual assets
3. **Quality**: Use high-resolution images (2x for retina displays)
4. **Optimization**: Compress images to reduce file size
5. **Accessibility**: Include alt text for all images
6. **Updates**: Keep screenshots current with latest features
7. **Licensing**: Use properly licensed images and fonts

---

## 🎨 Example Asset Requests

If you need help creating assets, you can use AI image generators:

### DALL-E / Midjourney Prompts

**Logo**:
```
Modern minimalist logo for a Google Slides automation tool, 
combining a presentation slide icon with AI/tech elements, 
blue and yellow color scheme, clean vector style, white background
```

**Banner**:
```
Professional GitHub repository banner for a presentation automation tool,
showing code transforming into beautiful slides, modern tech aesthetic,
Google Slides colors (blue, yellow, red, green), 1280x640 pixels
```

**Architecture Diagram**:
```
Clean technical architecture diagram showing AI assistant connecting 
to Google Slides API through an MCP server, modern flat design style,
professional color scheme, clear arrows and labels
```

---

## 📞 Need Help?

- Check out existing MCP server repositories for inspiration
- Ask in GitHub Discussions for design feedback
- Share your designs with the community

---

**Remember**: Good visual assets can significantly increase your repository's visibility and engagement on GitHub!
