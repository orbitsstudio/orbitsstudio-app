# NEXUS — Hostinger Web Hosting Deployment Guide

**Target Environment:** Hostinger Cloud / VPS / Web Hosting (hPanel)  
**System:** NEXUS — Orbit Studio Intelligence  
**Domain Strategy:** Subdomain isolated deployment (e.g., `nexus.orbitsstudio.com` or `app.orbitsstudio.com`) to **never** overwrite or modify Orbit Studio's existing public website.

---

## 1. Subdomain Setup in Hostinger (hPanel)

1. Log in to your **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Go to **Websites** → Select your main domain (`orbitsstudio.com`).
3. In the sidebar, navigate to **Domains** → **Subdomains**.
4. Enter your desired subdomain name (e.g. `nexus` or `app`).
5. Set custom folder for subdomain: `public_html/nexus`.
6. Click **Create**.
7. Go to **Security** → **SSL** and issue a Free Let's Encrypt SSL certificate for `nexus.orbitsstudio.com`. Enable **Force HTTPS**.

---

## 2. Frontend Build (Static / PWA Production Assets)

Run the production build command in your terminal or CI/CD:

```bash
npm run build
```

This compiles optimized static assets into the `/dist` directory:
- `index.html`
- `assets/*.js` and `assets/*.css`
- `manifest.json` and PWA service workers (`sw.js`, `registerSW.js`)
- Icons and logos

### Uploading to Hostinger via File Manager or FTP:
1. Open **hPanel** → **Files** → **File Manager**.
2. Navigate to `public_html/nexus`.
3. Upload all contents from the `/dist` directory into `public_html/nexus/`.
4. Ensure `.htaccess` is present for Single Page Application (SPA) routing (see below).

---

## 3. Hostinger `.htaccess` for SPA Routing & PWA Caching

Create or edit `.htaccess` in `public_html/nexus/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache-Control for PWA Assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType application/manifest+json "access plus 0 seconds"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

---

## 4. Backend & AI API Proxy Options

Hostinger offers two primary hosting setups:

### Option A: Hostinger VPS or Node.js Application (Recommended)
1. In hPanel, go to **Advanced** → **Node.js**.
2. Select Node version `20.x` or higher.
3. Set Application root to `/home/uXXXXX/nexus`.
4. Set Application startup file to `server.ts` (using tsx) or compiled `dist-server/server.js`.
5. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Google AI Studio Gemini API key.
   - `PORT`: 3000
6. Start the service.

### Option B: Serverless / Cloud Run Proxy
If using Hostinger Shared Web Hosting without Node.js support:
1. The frontend static files in `public_html/nexus/` run fully client-side.
2. The Gemini AI proxy and Supabase integrations connect directly via secure HTTPS endpoints or a free Google Cloud Run / Vercel microservice proxy.

---

## 5. Supabase Integration Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase-schema.sql` from this repository.
4. Paste the entire SQL script and click **Run**.
5. Copy your **Project URL** and **Anon Public Key** from **Project Settings** → **API**.
6. In the NEXUS interface, open the **Database & Supabase** module, paste credentials, and click **Connect**.

---

## 6. PWA Installation on Android & iOS

- **Android (Chrome)**: Tap the **Install App** button in the NEXUS header, or tap Chrome menu `⋮` → **Add to Home screen**.
- **iOS (Safari)**: Tap the **Share** button in the Safari toolbar → scroll down and tap **Add to Home Screen**.
