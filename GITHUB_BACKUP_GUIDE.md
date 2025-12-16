# GitHub Backup Guide for MetaBalance

**Repository**: https://github.com/Huskyauto/MetaBalance  
**Owner**: Huskyauto  
**Last Updated**: December 14, 2025

---

## Quick Push Command

When you want to push the latest changes to GitHub, run:

```bash
cd /home/ubuntu/metabalance
git push github main
```

---

## Full Backup Process

### Step 1: Check Current Status
```bash
cd /home/ubuntu/metabalance
git status
git log --oneline -5
```

### Step 2: Stage and Commit Changes (if needed)
```bash
git add -A
git commit -m "Your commit message here"
```

### Step 3: Push to GitHub
```bash
git push github main
```

---

## If Authentication Expires

The sandbox uses GitHub CLI (`gh`) for authentication. If you get a credentials prompt:

### Re-authenticate with GitHub CLI:
```bash
gh auth login -p https -h github.com --web
```

This will display:
1. A one-time code (e.g., `EBB4-AF28`)
2. A URL: https://github.com/login/device

**Steps:**
1. Go to https://github.com/login/device
2. Enter the one-time code
3. Click "Authorize"
4. Return and run the push command again

---

## Verify Authentication Status
```bash
gh auth status
```

Should show:
```
github.com
  ✓ Logged in to github.com account Huskyauto
  - Active account: true
  - Git operations protocol: https
```

---

## Git Remote Configuration

The project has two remotes configured:

| Remote | URL | Purpose |
|--------|-----|---------|
| `origin` | s3://vida-prod-gitrepo/... | Manus internal (checkpoints) |
| `github` | https://github.com/Huskyauto/MetaBalance.git | Your GitHub repo |

Always use `github` remote for pushing to GitHub:
```bash
git push github main
```

---

## Create Local Backup Copy

To create a backup in the github-backup folder:

```bash
# Remove old backup
rm -rf ~/github-backup/metabalance

# Create fresh backup (excludes node_modules, .git, etc.)
mkdir -p ~/github-backup/metabalance
cd /home/ubuntu/metabalance
find . -type f \( ! -path './node_modules/*' ! -path './.git/*' ! -path './dist/*' ! -path './.vite/*' ! -path './coverage/*' \) -exec cp --parents {} ~/github-backup/metabalance/ \;

# Create compressed archive
cd ~/github-backup/metabalance
tar -czf ~/github-backup/metabalance-backup-$(date +%Y%m%d).tar.gz .
```

---

## Troubleshooting

### "Username for 'https://github.com':" prompt
- Authentication expired, run: `gh auth login -p https -h github.com --web`

### "Permission denied" error
- Check auth status: `gh auth status`
- Re-authenticate if needed

### "rejected - non-fast-forward" error
- Someone else pushed changes, pull first: `git pull github main`
- Then push again: `git push github main`

---

## Summary for Manus AI

When user asks to "push to GitHub" or "backup to GitHub":

1. **Check auth**: `gh auth status`
2. **If not logged in**: Run `gh auth login -p https -h github.com --web` and provide the code to user
3. **After auth confirmed**: `cd /home/ubuntu/metabalance && git push github main`
4. **Verify**: `git log github/main --oneline -3`

The GitHub remote is named `github` (not `origin`).
