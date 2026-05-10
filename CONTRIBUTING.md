# 🤝 Contributing to Google Slides MCP Server

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows a Code of Conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Git
- Google Cloud account (for testing)
- Basic understanding of TypeScript
- Familiarity with Google Slides API (helpful but not required)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/google-slides-mcp.git
   cd google-slides-mcp
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/google-slides-mcp.git
   ```

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Google Credentials

Follow the [Google Cloud Setup](./README.md#-google-cloud-setup) instructions in the main README to:
- Create a Google Cloud project
- Enable required APIs
- Create OAuth credentials
- Download `credentials.json`

### 3. Build the Project

```bash
npm run build
```

### 4. Run in Development Mode

```bash
npm run dev
```

### 5. Test Your Changes

Create a test presentation to verify your changes work:

```bash
# Run the server
npm start

# In another terminal, test with your MCP client
```

---

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes** - Fix issues in existing code
- ✨ **New features** - Add new tools or capabilities
- 📝 **Documentation** - Improve docs, add examples
- 🎨 **Code quality** - Refactoring, optimization
- 🧪 **Tests** - Add or improve test coverage
- 🌐 **Translations** - Translate documentation

### Finding Issues to Work On

- Check the [Issues](https://github.com/yourusername/google-slides-mcp/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Comment on an issue to let others know you're working on it

### Creating a New Issue

Before creating an issue:
1. Search existing issues to avoid duplicates
2. Use the appropriate issue template
3. Provide clear, detailed information
4. Include reproduction steps for bugs

---

## Coding Standards

### TypeScript Style

- Use TypeScript for all new code
- Enable strict type checking
- Avoid `any` types when possible
- Use interfaces for object shapes
- Document complex types

### Code Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Keep lines under 100 characters when possible

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `rate-limiter.ts`)
- **Functions**: `camelCase` (e.g., `createPresentation`)
- **Classes**: `PascalCase` (e.g., `RateLimiter`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `EMU_PER_INCH`)
- **Interfaces**: `PascalCase` with `I` prefix optional (e.g., `ToolDefinition`)

### File Organization

```
src/
├── tools/           # MCP tool implementations
│   ├── presentations.ts
│   ├── slides.ts
│   └── ...
├── utils/           # Utility functions
│   ├── validators.ts
│   ├── errors.ts
│   └── ...
├── mcp/             # MCP protocol handling
│   ├── router.ts
│   └── types.ts
└── index.ts         # Main entry point
```

### Error Handling

All tools must include proper error handling:

```typescript
export async function myTool(args: Record<string, unknown>) {
  // 1. Validate inputs
  if (!args.requiredParam) {
    throw new Error('requiredParam is required');
  }

  // 2. Validate types
  if (typeof args.requiredParam !== 'string') {
    throw new Error('requiredParam must be a string');
  }

  // 3. Use validators for common checks
  validatePresentationId(args.presentationId);

  // 4. Wrap API calls with retry logic
  try {
    const result = await retry.execute(
      () => apiCall(),
      'myTool'
    );
    return result;
  } catch (error) {
    throw normalizeError(error);
  }
}
```

### Input Validation

Use Zod schemas or manual validation:

```typescript
import { validatePresentationId, validateObjectId } from '../utils/validators.js';

// Validate IDs
validatePresentationId(presentationId);
validateObjectId(slideId);

// Validate ranges
if (width <= 0 || height <= 0) {
  throw new Error('Width and height must be positive');
}

// Validate enums
const validLayouts = ['TITLE_SLIDE', 'BLANK', 'TITLE_AND_BODY'];
if (!validLayouts.includes(layout)) {
  throw new Error(`Invalid layout. Must be one of: ${validLayouts.join(', ')}`);
}
```

---

## Testing

### Manual Testing

1. Build the project: `npm run build`
2. Run the server: `npm start`
3. Test with an MCP client (Claude Desktop, Cline, etc.)
4. Verify your changes work as expected

### Testing Checklist

Before submitting a PR, verify:

- ✅ Code compiles without errors (`npm run build`)
- ✅ Tool works with valid inputs
- ✅ Tool handles invalid inputs gracefully
- ✅ Error messages are clear and helpful
- ✅ Documentation is updated
- ✅ No breaking changes (or clearly documented)

### Test Cases to Consider

- **Valid inputs** - Tool works correctly
- **Invalid inputs** - Proper error messages
- **Edge cases** - Empty strings, zero values, max limits
- **API errors** - Handles Google API errors gracefully
- **Rate limiting** - Respects API quotas

---

## Pull Request Process

### Before Submitting

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Make your changes**:
   - Write clear, focused commits
   - Follow coding standards
   - Update documentation

4. **Test thoroughly**:
   - Build the project
   - Test your changes
   - Verify no regressions

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add feature: description of changes"
   ```

### Commit Message Guidelines

Use clear, descriptive commit messages:

```
Add feature: create_slide tool with layout support

- Implement create_slide tool
- Add support for predefined layouts
- Update documentation with examples
- Add input validation for layout parameter
```

**Format**:
- First line: Brief summary (50 chars or less)
- Blank line
- Detailed description (wrap at 72 chars)
- List specific changes

**Prefixes**:
- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Changes to existing features
- `Refactor:` - Code improvements
- `Docs:` - Documentation only
- `Test:` - Test additions or changes

### Submitting the PR

1. **Push to your fork**:
   ```bash
   git push origin feature/my-new-feature
   ```

2. **Create Pull Request**:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

3. **PR Description Should Include**:
   - What changes were made
   - Why the changes were needed
   - How to test the changes
   - Screenshots (if applicable)
   - Related issues (use `Fixes #123`)

### PR Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

### After Your PR is Merged

1. Delete your feature branch:
   ```bash
   git branch -d feature/my-new-feature
   git push origin --delete feature/my-new-feature
   ```

2. Update your fork:
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

---

## Reporting Bugs

### Before Reporting

- Search existing issues to avoid duplicates
- Test with the latest version
- Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Call tool '...'
2. With parameters '...'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Error messages**
```
Paste error messages here
```

**Environment**
- OS: [e.g., Windows 11, macOS 14]
- Node.js version: [e.g., 18.17.0]
- MCP Client: [e.g., Claude Desktop 1.0.0]

**Additional context**
Any other relevant information.
```

---

## Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Use cases**
How would this feature be used?

**Additional context**
Mockups, examples, or other relevant information.
```

---

## Development Tips

### Debugging

Enable debug logging:

```bash
# Set environment variable
export CALLMISSED=true

# Run the server
npm start
```

Debug logs are written to `.sisyphus/evidence/tool-test-report.md`.

### Working with Google APIs

- Use the [Google Slides API Reference](https://developers.google.com/slides/api/reference/rest)
- Test API calls in the [API Explorer](https://developers.google.com/slides/api/reference/rest/v1/presentations/create)
- Check quota limits in Google Cloud Console

### Common Issues

**Authentication errors**:
- Delete `token.json` and re-authenticate
- Verify OAuth consent screen configuration

**Build errors**:
- Clear `dist/` folder: `rm -rf dist`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Type errors**:
- Check TypeScript version: `npx tsc --version`
- Update types: `npm update @types/node`

---

## Questions?

- 💬 [GitHub Discussions](https://github.com/yourusername/google-slides-mcp/discussions)
- 📧 Email: your.email@example.com
- 🐛 [Report Issues](https://github.com/yourusername/google-slides-mcp/issues)

---

## Recognition

Contributors will be:
- Listed in the project README
- Credited in release notes
- Mentioned in the CONTRIBUTORS file

Thank you for contributing! 🎉
