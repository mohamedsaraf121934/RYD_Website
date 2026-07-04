# RYD Travels & Tours — Website

Static multi-page website for **RYD Travels & Tours** (Sri Lanka) — *Ride your Destination*.
Built to deploy on **GitHub + Cloudflare Pages**.

## 📁 Project structure

```
Saraf web/                 ← repository root (upload EVERYTHING inside this)
├── index.html             Home — both services, gallery & contact
├── tourist-guide.html     Tourist Guidance page + contact
├── vehicle-rent.html      Vehicle Rental page + contact
├── css/
│   └── styles.css         All styling
├── js/
│   └── main.js            Nav, animations, country selector & EmailJS
├── Images/                All site images (local — fast loading)
│   ├── Nine_Arch_Bridge_Sri_Lanka.jpg   (home hero)
│   ├── Safari_Jeep.png                  (tourist card, vehicle card, gallery)
│   ├── Van.jpg  Bus.png                 (vehicle fleet)
│   ├── Sigiriya_front_view.jpg  Sigiriya_top_view.avif  sigiriya_lake_view.jpg
│   ├── Beach.jpg  Waterfall.jpg  tea_plantations.jpg
│   ├── Train_tea_plantations_view.jpg  elephant_view.jpg
├── Ryd_Logo_New.png       Logo / favicon
├── sitemap.xml            For Google Search Console
├── robots.txt             Crawl rules
├── _headers               Cloudflare Pages security headers
├── .htaccess              Apache hosts only (Cloudflare ignores this)
├── .gitignore
└── README.md
```

> ⚠️ **Case matters on GitHub/Cloudflare.** The folder is `Images` (capital **I**)
> and filenames are exact. Don't rename them or the images will 404 online.

---

## ⚙️ STEP 1 — Configure the contact form (IMPORTANT)

Open **`js/main.js`** and edit the top block:

```js
const EMAILJS_CONFIG = {
  PUBLIC_KEY:  "YOUR_PUBLIC_KEY",   // EmailJS → Account → General → Public Key
  SERVICE_ID:  "service_aarxapn",   // already set
  TEMPLATE_ID: "YOUR_TEMPLATE_ID"   // EmailJS → "Contact Us" template → its ID
};
```

Emails go to **hello@rydtravels.com**, sender is your no-reply address, Reply-To is the
customer — matching your EmailJS setup.

---

## 🚀 STEP 2 — Put it on GitHub

1. Create a new repository on GitHub (e.g. `ryd-travels`), **public or private**.
2. Upload the **contents** of the `Saraf web` folder to the repo root — so that
   `index.html` sits at the top level of the repository (not inside a sub-folder).
   - Easiest: on the repo page click **Add file → Upload files**, drag in everything
     (including the `css`, `js`, and `Images` folders), and commit.
   - Or with Git:
     ```bash
     cd "Saraf web"
     git init
     git add .
     git commit -m "Initial RYD Travels website"
     git branch -M main
     git remote add origin https://github.com/<you>/ryd-travels.git
     git push -u origin main
     ```

---

## ☁️ STEP 3 — Connect Cloudflare Pages

1. In the **Cloudflare dashboard** → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
2. Select your `ryd-travels` repository.
3. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`  (the site is plain static files at the root)
4. **Save and Deploy.** Cloudflare gives you a `*.pages.dev` URL immediately.
5. **Custom domain:** in the Pages project → **Custom domains** → add
   `www.rydtravels.com` (and `rydtravels.com`) and follow the DNS prompts.
   Cloudflare provisions HTTPS automatically.

The `_headers` file applies the security headers (CSP, HSTS, etc.) on Cloudflare.
Every push to `main` auto-deploys.

---

## 🔎 STEP 4 — Google indexing

1. Add `https://www.rydtravels.com` to **Google Search Console**, verify ownership.
2. Submit the sitemap: `sitemap.xml`.
3. Use **URL Inspection → Request Indexing** for each page.

SEO, Open Graph/Twitter cards, JSON-LD structured data, canonical URLs, `robots.txt`
and `sitemap.xml` are already included.

---

## 🖼️ Image note (performance)
All images are now **local** in `Images/` — no external servers, so they load and cache
fast. Two files are large originals:
- `Nine_Arch_Bridge_Sri_Lanka.jpg` (~4.3 MB)
- `Sigiriya_front_view.jpg` (~3.7 MB)

They'll work fine, but compressing them (to ~300–500 KB) would make first load noticeably
faster. Happy to optimise them for you on request.

---

© RYD Travels & Tours — Ride your Destination 🇱🇰
