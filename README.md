# QR Generator

A fully client-side QR code generator with modern styling, built with Vite, React, TypeScript, and Tailwind CSS. Deployable for free on GitHub Pages, or any static host.

**Live demo:** https://kyzalasstavros.github.io/qr/

---

## Features

- **7 content types** — URL, plain text, email, phone, SMS, Wi-Fi, vCard/contact
- **Full style control** — dot style, corner style, colours, gradients (linear/radial), size, margin, error correction, logo upload
- **Export** — Download PNG, download SVG, copy PNG to clipboard
- **Presets** — Save, load, rename, delete, import and export named settings as JSON
- **Static QR mode** — Encodes content directly in the QR code; no server needed
- **Dynamic QR mode** — Generates a redirect URL hosted on your static site; change the destination by editing a JSON file and redeploying
- **Live preview** — QR updates instantly as you change any setting
- **Scan warnings** — Contrast ratio check, logo/error correction mismatch warning, dense data warning
- **Dark mode** — Follows system preference, with a manual toggle (light/dark/auto)
- **Fully client-side** — No analytics, no trackers, no server

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for production

```bash
npm run build
npm run preview    # serve the dist/ folder locally
```

---

## Deployment to GitHub Pages

### 1. Enable GitHub Pages

Go to your repo → **Settings** → **Pages** → Source: **GitHub Actions**.

### 2. Push to `main`

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main` and deploys the built site automatically.

The workflow builds with `VITE_BASE_PATH=/qr/` (matching the repo name). The deployed URL will be:

```
https://kyzalasstavros.github.io/qr/
```

### 3. Custom domain

To use a custom domain (e.g. `https://qr.example.com`):

1. In GitHub Pages settings, add your custom domain.
2. Add a `CNAME` file to `public/` containing your domain: `qr.example.com`
3. In `.github/workflows/deploy.yml`, change the env var to:
   ```yaml
   VITE_BASE_PATH: /
   ```
4. In `public/404.html`, change `pathSegmentsToKeep` to `0`:
   ```js
   var pathSegmentsToKeep = 0;
   ```
5. Push and redeploy.

---

## How static QR mode works

In **Static** mode, content is encoded directly inside the QR code. When someone scans it, their phone reads the content with no network request.

Use this for:
- Contact cards (vCard)
- Wi-Fi credentials
- Text you want always accessible
- URLs where you own the destination and it won't move

**Limitation:** Once printed, you can't change where the QR code points. If the URL moves or the domain expires, the QR code becomes useless.

---

## How dynamic QR mode works

In **Dynamic** mode, the QR code encodes a redirect URL on *your own site*, e.g.:

```
https://kyzalasstavros.github.io/qr/go/my-slug
```

When scanned, that page reads `/data/redirects.json`, finds the slug, validates the destination, and redirects. Changing the destination requires editing `public/data/redirects.json` and redeploying.

### Workflow

1. Open the app in **Dynamic** mode.
2. Create a slug (e.g. `menu-2026`) and paste the destination URL (e.g. `https://yoursite.com/menu`).
3. Click **Generate QR** — the app sets the QR to point to `/go/menu-2026`.
4. Download or print the QR code.
5. Copy the JSON snippet shown in the admin helper.
6. Paste it into `public/data/redirects.json`:
   ```json
   {
     "menu-2026": "https://yoursite.com/menu"
   }
   ```
7. Commit and push. GitHub Actions redeploys the site.
8. The QR code now redirects to the new destination.

To **update** the destination later, just change the URL in `redirects.json` and push again.

### Limitations of static hosting

| Feature | GitHub Pages (static) |
|---|---|
| Change destination instantly | ❌ Requires redeploy (~1 min) |
| Track scan counts | ❌ Not possible client-side |
| Per-scan analytics | ❌ Not possible |
| Cost | Free |
| Privacy | ✅ No data sent to third parties |

If you need instant updates or analytics, use a paid dynamic QR service or add a serverless backend.

---

## SPA routing on GitHub Pages

GitHub Pages serves `404.html` for any unmatched path. `public/404.html` uses a script (based on [rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages)) to encode the path as a query string and redirect to `index.html`. The app then decodes it and shows the correct route. This makes `/go/:slug` URLs work on GitHub Pages without a server.

---

## QR code lifespan

A QR code is only as reliable as what it points to:

- **Static QR** → lasts as long as the encoded content is still valid (URL still resolves, Wi-Fi password hasn't changed, etc.)
- **Dynamic QR** → lasts as long as your domain and hosting remain active and the slug exists in `redirects.json`

If you stop paying for a domain, disable GitHub Pages, or delete the repo, all dynamic QR codes pointing to that site will break. Print URLs you own and intend to maintain long-term.

---

## Security

| Risk | How it's handled |
|---|---|
| `javascript:`/`data:` URL injection | Explicit protocol allowlist; blocked at input and at redirect time |
| Open redirect in `/go/:slug` | By design — you control `redirects.json`. Destination is re-validated at runtime before redirect. |
| XSS via preset names | React JSX escapes all output; no `innerHTML` or `dangerouslySetInnerHTML` anywhere |
| Filename path traversal | Sanitise strips all chars except `[a-zA-Z0-9\-_]`, truncates to 64 chars |
| Logo upload abuse | Client-side file type filter + 5 MB size limit; nothing is uploaded to a server |
| SVG with embedded scripts | `qr-code-styling` generates SVG from geometry only; logo embedded as base64 blob |
| Third-party tracking | None — no analytics, no CDN-hosted scripts, everything bundled by Vite |

---

## Tech stack

| Tool | Version | Purpose |
|---|---|---|
| Vite | 6 | Build tool |
| React | 19 | UI framework |
| TypeScript | 5.8 | Type safety |
| Tailwind CSS | 4 | Styling |
| qr-code-styling | 1.9 | QR rendering |
| react-router-dom | 7 | Client-side routing |
| lucide-react | latest | Icons |

---

## Project structure

```
src/
├── components/
│   ├── AdminHelper.tsx      # Dynamic mode slug creator + JSON exporter
│   ├── ContentForm.tsx      # 7 content type forms
│   ├── ExportPanel.tsx      # PNG/SVG download, clipboard copy
│   ├── ModeToggle.tsx       # Static ↔ Dynamic toggle
│   ├── PresetManager.tsx    # Save/load/rename/delete/import/export presets
│   ├── QRPreview.tsx        # Live preview + scan warnings
│   ├── SiteUrlSetting.tsx   # Configurable base URL for dynamic redirects
│   └── StylePanel.tsx       # Colour, gradient, dot/corner style controls
├── hooks/
│   └── useQRCode.ts         # qr-code-styling instance management
├── pages/
│   ├── ErrorPage.tsx        # 404 fallback
│   ├── HomePage.tsx         # Main generator layout
│   └── RedirectPage.tsx     # /go/:slug — fetch JSON, validate, redirect
├── types/
│   └── index.ts             # Shared TypeScript types
└── utils/
    ├── buildQROptions.ts    # Convert app settings → qr-code-styling Options
    ├── contentFormatters.ts # Build QR data strings per content type
    ├── defaults.ts          # Default QR settings
    ├── presets.ts           # localStorage preset CRUD
    ├── redirects.ts         # Fetch + validate redirects.json
    ├── sanitize.ts          # Filename / slug / label sanitisation
    ├── scanQuality.ts       # Contrast check + scan reliability warnings
    └── urlValidator.ts      # Protocol allowlist/blocklist

public/
├── 404.html                 # SPA routing fallback for GitHub Pages
└── data/
    └── redirects.json       # slug → URL mapping for dynamic mode
```
