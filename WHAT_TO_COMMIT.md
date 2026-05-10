# 📋 What to Commit to GitHub

Guide for what files should and shouldn't be committed to your public GitHub repository.

## ✅ MUST COMMIT (Essential Files)

### Source Code
- ✅ `src/**/*.ts` - All TypeScript source files
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `package.json` - Package metadata and dependencies

### Documentation
- ✅ `README.md` - Main documentation
- ✅ `LICENSE` - License file
- ✅ `CONTRIBUTING.md` - Contribution guidelines
- ✅ `CHANGELOG.md` - Version history
- ✅ `PUBLISH_CHECKLIST.md` - Publishing guide
- ✅ `docs/**/*.md` - All documentation files

### GitHub Configuration
- ✅ `.github/**/*` - Issue templates, PR templates
- ✅ `.gitignore` - Git ignore rules

### Optional but Recommended
- ✅ `assets/**/*` - Visual assets (logo, banner, screenshots)
- ✅ `.sisyphus/docs/**/*` - API documentation (helpful for users)
- ✅ `skills/**/*` - Presentation design skills (useful examples)

---

## ❌ NEVER COMMIT (Security Risk!)

### Credentials & Secrets
- ❌ `credentials.json` - **CRITICAL: Contains OAuth client secrets**
- ❌ `token.json` - **CRITICAL: Contains access tokens**
- ❌ `.env` - Environment variables with secrets
- ❌ Any file with API keys, passwords, or tokens

### Why These Are Dangerous
If you commit these files:
- 🚨 Anyone can access your Google account
- 🚨 They can read/modify/delete your presentations
- 🚨 They can impersonate your application
- 🚨 You'll need to revoke and regenerate credentials

---

## 🤔 OPTIONAL (Your Choice)

### Build Output
- ⚠️ `dist/**/*` - Compiled JavaScript files
  - **Don't commit**: Users will build from source
  - **Commit if**: You want to provide pre-built version
  - **Recommendation**: Don't commit (users run `npm run build`)

### Lock Files
- ⚠️ `package-lock.json` - npm lock file
  - **Don't commit**: Already in .gitignore
  - **Commit if**: You want exact dependency versions
  - **Recommendation**: Don't commit for libraries, commit for applications

### Working Directories
- ⚠️ `.sisyphus/evidence/` - Test reports and logs
- ⚠️ `.sisyphus/drafts/` - Draft files
- ⚠️ `.sisyphus/notepads/` - Working notes
- ⚠️ `.sisyphus/run-continuation/` - Runtime state
- ⚠️ `.sisyphus/slide-plans/` - Generated slide plans
  - **Recommendation**: Don't commit (personal working files)
  - **Alternative**: Commit as examples if they're useful

### IDE Configuration
- ⚠️ `.vscode/` - VS Code settings
- ⚠️ `.idea/` - IntelliJ IDEA settings
  - **Don't commit**: Personal preferences
  - **Commit if**: Team wants shared settings
  - **Recommendation**: Don't commit (already in .gitignore)

---

## 📁 Recommended File Structure for GitHub

```
google-slides-mcp-server/
├── .github/                    ✅ Commit
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── assets/                     ✅ Commit (if you create them)
│   ├── logo/
│   ├── banner/
│   └── screenshots/
├── docs/                       ✅ Commit
│   ├── API_REFERENCE.md
│   ├── EXAMPLES.md
│   └── ...
├── src/                        ✅ Commit
│   ├── tools/
│   ├── utils/
│   └── index.ts
├── skills/                     ✅ Commit (useful examples)
│   └── presentation-design/
├── .gitignore                  ✅ Commit
├── CHANGELOG.md                ✅ Commit
├── CONTRIBUTING.md             ✅ Commit
├── LICENSE                     ✅ Commit
├── package.json                ✅ Commit
├── PUBLISH_CHECKLIST.md        ✅ Commit
├── README.md                   ✅ Commit
├── SETUP.md                    ✅ Commit
├── tsconfig.json               ✅ Commit
├── WHAT_TO_COMMIT.md           ✅ Commit (this file)
│
├── .env                        ❌ NEVER commit
├── credentials.json            ❌ NEVER commit
├── token.json                  ❌ NEVER commit
├── node_modules/               ❌ Don't commit
├── dist/                       ⚠️ Optional (don't recommend)
└── .sisyphus/                  ⚠️ Optional (see below)
```

---

## 🗂️ .sisyphus Directory Decision

The `.sisyphus/` directory contains working files. Here's what to do:

### Option 1: Don't Commit (Recommended)
**Best for**: Keeping repo clean and focused

Add to `.gitignore`:
```gitignore
# Sisyphus working directories
.sisyphus/drafts/
.sisyphus/evidence/
.sisyphus/notepads/
.sisyphus/run-continuation/
.sisyphus/slide-plans/
```

Keep only:
- `.sisyphus/docs/` - API documentation (useful for users)

### Option 2: Commit as Examples
**Best for**: Showing users how the tool works

Keep these as examples:
- `.sisyphus/docs/` - API documentation
- `.sisyphus/plans/` - Example plans
- `.sisyphus/slide-plans/` - Example slide plans

Remove personal working files:
- `.sisyphus/evidence/` - Test reports
- `.sisyphus/notepads/` - Personal notes
- `.sisyphus/drafts/` - Draft files

### Option 3: Commit Everything
**Best for**: Full transparency

Commit all `.sisyphus/` files to show your complete workflow.

**My Recommendation**: Option 1 or 2 - Keep docs, remove working files.

---

## 🔍 Before First Commit - Security Check

Run these checks before pushing to GitHub:

### 1. Check for Credentials
```bash
# Search for potential secrets
grep -r "client_secret" .
grep -r "access_token" .
grep -r "refresh_token" .
grep -r "private_key" .
```

### 2. Verify .gitignore
```bash
# Check what will be committed
git status

# Check what's ignored
git status --ignored
```

### 3. Test .gitignore
```bash
# This should show credentials.json and token.json as ignored
git check-ignore credentials.json token.json
```

### 4. Review Files to Commit
```bash
# See exactly what will be committed
git add .
git status
```

---

## 🚨 If You Accidentally Commit Secrets

### Immediate Actions

1. **Revoke credentials immediately**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Delete OAuth client ID
   - Create new credentials

2. **Remove from Git history**:
   ```bash
   # Remove file from Git history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch credentials.json" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (WARNING: Rewrites history)
   git push origin --force --all
   ```

3. **Alternative: Use BFG Repo-Cleaner**:
   ```bash
   # Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
   java -jar bfg.jar --delete-files credentials.json
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push origin --force --all
   ```

4. **Consider repository as compromised**:
   - If credentials were public for any time, assume they're compromised
   - Revoke all tokens
   - Generate new credentials
   - Consider deleting and recreating the repository

---

## ✅ Safe Commit Checklist

Before running `git push`:

- [ ] No `credentials.json` in commit
- [ ] No `token.json` in commit
- [ ] No `.env` files in commit
- [ ] No API keys or secrets in code
- [ ] `.gitignore` is properly configured
- [ ] Ran `git status` to verify
- [ ] Checked `git diff` for sensitive data
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation is up to date

---

## 📝 Example: Safe First Commit

```bash
# 1. Verify .gitignore is working
git status --ignored

# Should show:
# Ignored files:
#   credentials.json
#   token.json
#   .env
#   node_modules/
#   dist/

# 2. Add files
git add .

# 3. Check what will be committed
git status

# Should NOT show:
#   credentials.json
#   token.json
#   .env

# 4. Review changes
git diff --cached

# 5. Commit
git commit -m "Initial commit: Google Slides MCP Server v1.0.0"

# 6. Push
git push origin main
```

---

## 🎯 Quick Reference

### Always Safe to Commit
- Source code (`.ts` files)
- Documentation (`.md` files)
- Configuration (`.json` files except credentials)
- Assets (images, diagrams)
- Templates (GitHub templates)

### Never Commit
- `credentials.json`
- `token.json`
- `.env` files
- API keys
- Passwords
- Access tokens

### Check Before Committing
- Build output (`dist/`)
- Lock files (`package-lock.json`)
- Working directories (`.sisyphus/`)
- IDE settings (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)

---

## 🔐 Security Best Practices

1. **Use .gitignore**: Always configure before first commit
2. **Review before push**: Check `git status` and `git diff`
3. **Use environment variables**: Never hardcode secrets
4. **Rotate credentials**: If exposed, revoke immediately
5. **Use .env.example**: Provide template without actual values
6. **Scan for secrets**: Use tools like `git-secrets` or `trufflehog`

---

## 📚 Additional Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Git: gitignore documentation](https://git-scm.com/docs/gitignore)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-secrets tool](https://github.com/awslabs/git-secrets)

---

## ✅ You're Ready!

Once you've verified:
- ✅ `.gitignore` is configured
- ✅ No credentials in commit
- ✅ All documentation is included
- ✅ Build succeeds

You're ready to push to GitHub safely! 🚀
