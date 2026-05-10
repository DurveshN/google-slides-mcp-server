# Changelog

All notable changes to the Google Slides MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-XX

### 🎉 Initial Release

The first stable release of Google Slides MCP Server with comprehensive presentation automation capabilities.

### ✨ Features

#### Presentation Management
- Create new presentations with custom titles
- Retrieve complete presentation details
- Copy existing presentations
- Delete presentations from Google Drive
- List presentations with filtering

#### Slide Operations
- Create slides with predefined layouts (TITLE_SLIDE, BLANK, TITLE_AND_BODY, etc.)
- Delete slides from presentations
- Reorder slides within presentations
- Support for 8+ predefined slide layouts

#### Content Elements
- Add text boxes with custom styling (font, size, color, alignment)
- Insert shapes (rectangles, circles, arrows, stars, and 15+ more)
- Add images from URLs with positioning and sizing
- Create tables with customizable rows and columns

#### Text Editing & Styling
- Insert text into existing elements
- Delete text ranges
- Find and replace text globally
- Apply text formatting (bold, italic, underline, font family, color)
- Set paragraph styles (alignment, line spacing)
- Create bullet lists with 12+ preset styles

#### Properties & Transforms
- Update slide background colors
- Move, resize, and rotate page elements
- Absolute positioning with inch-based coordinates
- Support for element transformations

#### Drive Integration
- List presentations from Google Drive
- Export presentations to PDF
- Manage sharing permissions (reader, writer, commenter)
- Delete presentations from Drive

#### Batch Operations
- Execute multiple API requests atomically
- Reduce network overhead with batch updates
- Support for complex multi-element operations

### 🔧 Technical Features

- **TypeScript** - Full type safety with TypeScript 5.6
- **Error Handling** - Comprehensive error normalization and retry logic
- **Rate Limiting** - Built-in Google API quota management
- **Input Validation** - Zod-based schema validation
- **OAuth 2.0** - Secure authentication with automatic token refresh
- **MCP Protocol** - Full Model Context Protocol compatibility
- **Debug Logging** - Optional debug output for troubleshooting

### 📚 Documentation

- Comprehensive README with setup instructions
- Complete API reference with all tool parameters
- Practical examples for common use cases
- Contributing guidelines for developers
- MIT License for open-source use

### 🛠️ Developer Experience

- Simple installation with npm
- Clear authentication flow
- Helpful error messages
- Automatic retry on transient failures
- Support for multiple MCP clients (Claude Desktop, Cline, etc.)

### 🔒 Security

- OAuth 2.0 authentication
- Secure credential storage
- No hardcoded secrets
- Automatic token refresh
- Proper .gitignore for sensitive files

### 📦 Package Information

- **Package Name**: `google-slides-mcp`
- **Version**: 1.0.0
- **License**: MIT
- **Node.js**: >=18.0.0
- **Main Dependencies**:
  - googleapis: ^130.0.0
  - google-auth-library: ^9.14.0
  - zod: ^3.23.0
  - dotenv: ^17.4.2

---

## [Unreleased]

### Planned Features

- [ ] Support for video embedding
- [ ] Advanced chart creation
- [ ] Slide transitions and animations
- [ ] Speaker notes management
- [ ] Presentation themes and master slides
- [ ] Collaborative editing features
- [ ] Presentation templates library
- [ ] Bulk operations for multiple presentations

### Under Consideration

- [ ] Integration with Google Sheets for data import
- [ ] AI-powered slide generation
- [ ] Presentation analytics
- [ ] Version history management
- [ ] Custom shape creation
- [ ] Advanced text formatting (subscript, superscript)

---

## Version History

### Version Numbering

- **Major (X.0.0)** - Breaking changes, major new features
- **Minor (1.X.0)** - New features, backward compatible
- **Patch (1.0.X)** - Bug fixes, minor improvements

### Release Schedule

- **Stable releases** - Tagged and published to npm
- **Development** - Active development on main branch
- **Beta releases** - Pre-release versions for testing

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Reporting bugs
- Suggesting features
- Submitting pull requests
- Development setup

---

## Support

- 🐛 [Report Issues](https://github.com/yourusername/google-slides-mcp/issues)
- 💬 [Discussions](https://github.com/yourusername/google-slides-mcp/discussions)
- 📧 Email: your.email@example.com

---

[1.0.0]: https://github.com/yourusername/google-slides-mcp/releases/tag/v1.0.0
[Unreleased]: https://github.com/yourusername/google-slides-mcp/compare/v1.0.0...HEAD
