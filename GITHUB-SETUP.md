# Put Florida Nature Prints on GitHub + your domain

This guide uses **GitHub Pages** (free hosting for websites) and keeps your domain at **GoDaddy**.

When someone visits **floridanatureprints.com**, GitHub will show your site.

---

## Why GitHub?

- Free hosting for this kind of website
- Your code lives in a **repository** (folder with history) — how most coding projects work
- Later you can edit code, track changes, and build other projects the same way
- Owned by **Microsoft** (U.S. company); the product is **GitHub**

---

## Part A — One-time Mac setup (for coding later)

Git needs Apple’s tools. In Terminal, run:

```bash
xcode-select --install
```

Click **Install** and wait until it finishes (can take a while).

Then check:

```bash
git --version
```

You should see a version number (not an error).

---

## Part B — Create a GitHub account

1. Go to [https://github.com](https://github.com) and sign up (free).
2. Pick a username you’ll be okay seeing in URLs (example: `yourname`).
3. Verify your email if GitHub asks.

---

## Part C — Create a repository (online)

1. Log in to GitHub.
2. Click the **+** (top right) → **New repository**.
3. Settings:
   - **Repository name:** `florida-nature-prints` (or `floridanatureprints.com`)
   - **Public** (required for free GitHub Pages on a normal account)
   - **Do not** check “Add a README” (you already have files)
4. Click **Create repository**.
5. Leave that page open — you’ll need the repo URL, like:  
   `https://github.com/YOURUSERNAME/florida-nature-prints.git`

---

## Part D — Upload your site with Git (Terminal)

Open **Terminal** and paste these commands **one block at a time**.  
Replace `YOURUSERNAME` with your real GitHub username.

```bash
cd /Users/maricooks/florida-nature-prints

git init
git add .
git commit -m "First version of Florida Nature Prints website"

git branch -M main
git remote add origin https://github.com/YOURUSERNAME/florida-nature-prints.git
git push -u origin main
```

When it asks you to sign in:

- Prefer **browser / GitHub login**, or a **Personal Access Token** as the password  
  (GitHub no longer accepts your normal password for `git push`)
- Token: GitHub → profile picture → **Settings** → **Developer settings** → **Personal access tokens**

If `git push` works, your files are on GitHub. Open the repo page in the browser to confirm.

---

## Part E — Turn on GitHub Pages (hosting)

1. On GitHub, open your repo.
2. Click **Settings** (repo settings, not your profile).
3. Left sidebar: **Pages**.
4. Under **Build and deployment**:
   - **Source:** Deploy from a branch  
   - **Branch:** `main`  
   - **Folder:** `/ (root)`  
5. Click **Save**.
6. Wait 1–2 minutes, then refresh. You should see a URL like:  
   `https://YOURUSERNAME.github.io/florida-nature-prints/`

Open that link — the site should load (styles/images work because we used relative paths).

---

## Part F — Connect floridanatureprints.com

A file named **`CNAME`** is already in your project with:

```text
floridanatureprints.com
```

After your first push, if you added CNAME later, push again:

```bash
cd /Users/maricooks/florida-nature-prints
git add CNAME
git commit -m "Add custom domain"
git push
```

### On GitHub

1. Repo → **Settings** → **Pages**
2. Under **Custom domain**, type: `floridanatureprints.com`
3. Click **Save**
4. Check **Enforce HTTPS** once it becomes available (may take a little while)

GitHub may show DNS instructions — follow those if they differ slightly from below.

### On GoDaddy (DNS)

1. GoDaddy → **My Products** → **floridanatureprints.com** → **DNS** / **Manage DNS**
2. Set these records (edit existing ones if they already exist):

**For the main domain (no www):**  
Add **four A records** (GitHub uses all of them):

| Type | Name | Value | TTL |
|------|------|--------|-----|
| A | `@` | `185.199.108.153` | 1 hour (or default) |
| A | `@` | `185.199.109.153` | 1 hour |
| A | `@` | `185.199.110.153` | 1 hour |
| A | `@` | `185.199.111.153` | 1 hour |

**For www:**

| Type | Name | Value | TTL |
|------|------|--------|-----|
| CNAME | `www` | `YOURUSERNAME.github.io` | 1 hour |

Replace `YOURUSERNAME` with your GitHub username.  
Do **not** put `https://` — only `yourname.github.io`.

3. **Remove** any old A record for `@` that pointed to GoDaddy parking or something else.  
4. Save.

DNS can take **minutes to a few hours**. Then:

- https://floridanatureprints.com  
- https://www.floridanatureprints.com  

should show your site. HTTPS may enable a bit after DNS is correct.

---

## How you update the site later (coding workflow)

Whenever you change photos, text, or code:

```bash
cd /Users/maricooks/florida-nature-prints

git add .
git commit -m "Describe what you changed"
git push
```

GitHub Pages rebuilds automatically in a minute or two. That is the basic “code and publish” loop you’ll use forever.

---

## Optional: easier GitHub login from Terminal

After Xcode tools are installed, you can install GitHub’s helper:

```bash
brew install gh
gh auth login
```

(Only if you use Homebrew. Not required if browser login works.)

---

## Checklist

- [ ] `xcode-select --install` finished  
- [ ] GitHub account created  
- [ ] New public repo created  
- [ ] `git push` succeeded  
- [ ] Pages enabled on `main` / root  
- [ ] Temporary `github.io` URL works  
- [ ] Custom domain set on GitHub  
- [ ] GoDaddy A records + www CNAME set  
- [ ] Live domain works + HTTPS on  

---

## Still separate (not done by GitHub)

| Task | Where |
|------|--------|
| Order/contact emails | Formspree in `js/config.js` |
| Pay button | Stripe link in `js/config.js` |
| Your name/email on the site | `js/config.js` |

---

## Stuck?

Common issues:

- **CSS/images missing on github.io** — hard refresh; confirm you pushed the `css/`, `js/`, and `images/` folders  
- **Domain not working** — wait; check all 4 A records; CNAME for `www` must be `username.github.io`  
- **git push rejected** — sign in with a Personal Access Token, not your GitHub password  
- **Pages 404** — Settings → Pages → source branch is `main` and folder is `/ (root)`  
