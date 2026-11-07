# Deploying NEXUS to GitHub Pages (Blank Screen Fixed)

## Why Did the Blank Screen Happen?
When deploying a Vite app to GitHub Pages, the site is hosted in a repository subfolder:  
`https://<username>.github.io/<repository-name>/`

By default, Vite tries to load assets from the root domain:  
`https://<username>.github.io/assets/index.js` ❌ (Returns 404 Not Found → Browser gets blank white screen).

---

## What We Fixed in the Codebase

1. **Relative Base Path in `vite.config.ts`**:
   - Added `base: './'` so all JavaScript, CSS, and font chunks load relative to the repository path (`./assets/...`).
2. **Relative Assets in `index.html`**:
   - Changed `/icon.svg` and `/icon-192.png` to `./icon.svg` and `./icon-192.png`.
3. **PWA Scope & Manifest**:
   - Updated `manifest.id`, `start_url`, and `scope` to `'./'` so service workers work seamlessly inside subpaths.
4. **Added `public/.nojekyll`**:
   - Prevents GitHub Pages from running Jekyll, ensuring all generated asset directories are preserved without 404 errors.
5. **Added `public/404.html`**:
   - Redirects any direct URL hits or reloads back to the root application automatically.
6. **Added Automated GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   - Automatically builds and deploys your application every time you push code to `main`.

---

## 2 Ways to Deploy to GitHub Pages

### Method 1: Automatic Deployment via GitHub Actions (Recommended)
1. Push your code to your GitHub repository on `main` or `master`.
2. In your GitHub repository, click **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. GitHub will automatically trigger the `.github/workflows/deploy.yml` workflow.
5. In 1–2 minutes, your live site URL will appear at the top:  
   `https://<username>.github.io/<repo-name>/`

---

### Method 2: Direct Branch Deploy using the `/docs` Folder (Zero Setup)
NEXUS automatically copies the production build into the `/docs` folder during `npm run build`.
1. Run `npm run build`
2. Push your code to GitHub.
3. In your GitHub repository **Settings** → **Pages**:
   - Under **Build and deployment** → **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` (or `master`) and change the folder from `/ (root)` to **`/docs`**.
   - Click **Save**.
4. In under 60 seconds, your site is live!

---

### Method 3: Deploy via `gh-pages` Branch
If you prefer deploying from an isolated `gh-pages` branch:
1. Run `npm run build`
2. Push the contents of the `/dist` directory to your `gh-pages` branch.
3. Under **Settings** → **Pages**, select `gh-pages` branch and `/ (root)`.
