# 🔒 Security Checklist - Before Committing to GitHub

## ⚠️ CRITICAL: Files That Must NEVER Be Committed

### 🚨 Immediate Check Before `git push`

Run this command to verify no sensitive files are staged:

```bash
git status
```

**Look for these patterns and REMOVE them immediately:**

### ❌ NEVER COMMIT THESE FILES:

#### 1. Environment Variables
- ❌ `.env`
- ❌ `.env.local`
- ❌ `.env.production`
- ❌ `.env.development`
- ❌ Any file ending in `.env`

#### 2. Firebase Credentials
- ❌ `serviceAccountKey.json`
- ❌ `firebase-adminsdk-*.json`
- ❌ Any file with "firebase" + "key" in the name

#### 3. Google Cloud Credentials
- ❌ `gcloud-service-key.json`
- ❌ `google-credentials.json`
- ❌ Any `.pem`, `.p12`, `.key` files

#### 4. API Keys & Secrets
- ❌ Files containing actual API keys (starts with `AIzaSy...`)
- ❌ Files containing private keys (`-----BEGIN PRIVATE KEY-----`)
- ❌ Files in `secrets/` or `credentials/` folders

#### 5. Database Files
- ❌ `.sql` files (may contain production data)
- ❌ `.dump` files
- ❌ `.backup` files

---

## ✅ Safe to Commit

### ✅ These files are SAFE and SHOULD be committed:

1. **`.env.example`** - Template with empty values
2. **Source code** - `.ts`, `.tsx`, `.js`, `.jsx` files
3. **Configuration** - `package.json`, `tsconfig.json`, `next.config.js`
4. **Documentation** - `.md` files
5. **Migrations** - `supabase/migrations/*.sql` (schema only, no data)
6. **Public assets** - Images, icons in `public/` folder

---

## 🔍 Pre-Commit Security Scan

### Step 1: Check for hardcoded secrets

```bash
# Search for potential API keys
grep -r "AIzaSy" . --exclude-dir=node_modules --exclude-dir=.git

# Search for Firebase keys
grep -r "firebase-adminsdk" . --exclude-dir=node_modules --exclude-dir=.git

# Search for private keys
grep -r "BEGIN PRIVATE KEY" . --exclude-dir=node_modules --exclude-dir=.git

# Search for hardcoded passwords
grep -r "password.*=.*['\"]" . --exclude-dir=node_modules --exclude-dir=.git
```

**Expected result:** No matches (all should use `process.env`)

### Step 2: Verify .gitignore is working

```bash
# Check what files Git is tracking
git ls-files

# Verify .env files are NOT in the list
git ls-files | grep ".env"
```

**Expected result:** Empty (no .env files should be tracked)

### Step 3: Check staged files

```bash
# See what you're about to commit
git diff --cached --name-only

# Review the actual changes
git diff --cached
```

**Look for:**
- ❌ Any `.env` files
- ❌ Any files with "key" or "secret" in the name
- ❌ Any hardcoded API keys or tokens

---

## 🛡️ Environment Variable Security

### ✅ CORRECT: Using environment variables

```typescript
// ✅ GOOD - Uses environment variables
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
```

### ❌ WRONG: Hardcoded secrets

```typescript
// ❌ BAD - Hardcoded API key (NEVER DO THIS!)
const apiKey = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// ❌ BAD - Hardcoded private key (NEVER DO THIS!)
const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIE...";
```

---

## 🚨 What to Do If You Accidentally Committed Secrets

### If you haven't pushed yet:

```bash
# Remove the file from staging
git reset HEAD <file>

# Remove from last commit
git reset --soft HEAD~1

# Or amend the commit
git commit --amend
```

### If you already pushed to GitHub:

**🚨 CRITICAL: The secret is now compromised!**

1. **Immediately rotate/revoke the secret:**
   - Firebase: Generate new service account key
   - Google Maps: Regenerate API key
   - Supabase: Rotate service role key

2. **Remove from Git history:**
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo
   git filter-repo --path <file> --invert-paths
   
   # Force push (dangerous!)
   git push origin --force --all
   ```

3. **Report to your team**

4. **Check GitHub's secret scanning alerts**

---

## 🔐 Vercel Environment Variables

### ✅ How to set secrets in Vercel (SAFE):

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add variables there (NOT in code)

### Variables to add in Vercel:

```
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

## 📋 Pre-Push Checklist

Before running `git push`, verify:

- [ ] No `.env` files in `git status`
- [ ] No files with "key" or "secret" in name
- [ ] No hardcoded API keys in code (grep check)
- [ ] No Firebase service account JSON files
- [ ] No database dumps or backups
- [ ] `.env.example` has NO actual values (only placeholders)
- [ ] All secrets use `process.env.VARIABLE_NAME`
- [ ] `.gitignore` is up to date
- [ ] Reviewed `git diff --cached` for sensitive data

---

## 🔍 Files Currently in Your Project

### ✅ Safe files (should be committed):

```
✅ .env.example (template only)
✅ package.json
✅ next.config.js
✅ supabase/migrations/*.sql (schema only)
✅ All .ts, .tsx, .js, .jsx files (if no hardcoded secrets)
✅ README.md, SECURITY_FIXES.md, etc.
✅ .gitignore
```

### ⚠️ Verify these are NOT committed:

```
❌ .env
❌ .env.local
❌ .env.production
❌ serviceAccountKey.json
❌ firebase-adminsdk-*.json
❌ Any .pem, .key, .p12 files
❌ node_modules/
❌ .next/
❌ dist/
```

---

## 🛠️ Automated Security Tools (Optional)

### Install git-secrets (prevents committing secrets):

```bash
# macOS
brew install git-secrets

# Configure for your repo
cd your-repo
git secrets --install
git secrets --register-aws
```

### Install pre-commit hooks:

```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
# (prevents committing secrets automatically)
```

---

## 📊 Current Status

**Last checked:** Before initial commit

**Status:** ✅ SECURE

**Findings:**
- ✅ No `.env` files found in repository
- ✅ No Firebase service account keys found
- ✅ No hardcoded API keys in code (all use `process.env`)
- ✅ `.gitignore` properly configured
- ✅ `.env.example` contains only placeholders

---

## 🚀 Safe to Push

If all checklist items are ✅, you can safely run:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

---

## 📞 Emergency Contact

If you accidentally commit secrets:

1. **Stop immediately** - Don't push if you haven't
2. **Revoke the secret** - Regenerate API keys/tokens
3. **Clean Git history** - Use git-filter-repo
4. **Notify team** - If applicable
5. **Monitor for abuse** - Check API usage logs

---

## 📚 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Git Secrets Tool](https://github.com/awslabs/git-secrets)
- [Removing Sensitive Data from Git](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Remember: Once pushed to GitHub, consider the secret compromised forever!**

Even if you remove it from history, it may exist in:
- GitHub's cache
- Forks of your repository
- Local clones
- GitHub's secret scanning alerts
- Search engine caches

**Prevention is the only real solution!** 🔒
