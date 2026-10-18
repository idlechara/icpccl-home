# icpccl-home

Website of ICPC Chile (Torneo Chileno de Programación and the ICPC South America/South Finals), built with [Eleventy](https://www.11ty.dev/) and hosted on Cloudflare R2. The site content is in Spanish.

## Development

Open the project in the devcontainer (it installs dependencies automatically), then:

```sh
npm start        # local server at http://localhost:8080
npm run build    # builds _site/
```

- `src/`: site content (Eleventy input). Pages: `index.html` (home), `icpc.html` (`/icpc/`), `tcp.html` (`/tcp/`), `faq.html` (`/faq/`), `faq-tecnica.html` (`/faq/tecnica/`) and `equipo.html` (`/equipo/`).
- `src/_includes/`: shared layout (`base.liquid`: styles, navigation, footer) and the per-contest section.
- `contests/`: one contest per markdown file (dates, registration, schedule and its FAQ questions). `kind: regional` shows on `/icpc/` and `kind: tcp` on `/tcp/`. To create one, run `npm run nueva-competencia` or copy `contests/_plantilla.md`. See `contests/README.md`.
- `faq-tcp-icpc.md`: general FAQ (`# Group`, `## Section`, `**Question**` on its own line with the answer below it; text before a section's first question is shown as its introduction).
- `faq-tecnico.md`: technical FAQ for host sites (requirements, MaratonaLinux, site registration, balloons, references), same format. A color code written as `` `#RRGGBB` `` is shown with a color swatch.
- `src/_data/team.js`: team page (`/equipo/`). To add a photo, put a square image (ideally 600×600 px or larger) in `src/img/equipo/`, named after the person's `id` (e.g. `erik-regla.jpg`); until then an empty placeholder is shown.
- `src/_data/sponsors.js`: sponsors, with logos in `src/img/sponsors/`.
- `lib/` and `src/_data/`: read those files and build the data for the pages.
- `bonus/` and `src/bonus.html`: hidden page. It opens when a secret key sequence (`EASTER_EGG_KEYS`) is typed on any page; its URL is derived from that sequence, so neither the published code nor the repo contains it. See `lib/bonus.js`. `npm start` reads `.env`, so the key set there also works locally. Its photo and text (`bonus/photo.jpg` and `bonus/content.json`: title, heading, caption and alt text) are not in git: they live only in the bucket, next to the page, and deploys never delete them. To change them, upload the new files to that folder by hand.
- `.archive/`: old versions and unused assets, not published.

### Dev-only content

Placeholder content only appears on the dev server (`npm start`). Staging builds render exactly like production (only the URL differs, and staging is marked `noindex`), so staging shows what production will look like.

- Contest links marked `dev: true` (e.g. the placeholder "Cómo llegar" button), files in `dev/` (placeholder PDFs) and `registration.dev` overrides.
- The sponsors section, until `PUBLIC` is set to `true` in `src/_data/sponsors.js`.

## Deployment

The site is static: `scripts/deploy.sh` builds it (`npm run build` → `_site/`) and uploads it to an R2 bucket. Both ways of publishing use the same script.

| Environment | URL | Bucket | How |
|---|---|---|---|
| Production | https://icpc.cl | `R2_BUCKET` | push to `main`, Actions with target `prod`, or `npm run deploy` |
| Staging (beta) | https://icpc-cl-staging.idlechara.net | `R2_STAGING_BUCKET` | Actions with target `staging`, or `npm run deploy:staging` |

The URL is set at build time with `SITE_URL` (empty means production) and is used for canonical links and share previews. Any URL other than production gets `noindex` and a `robots.txt` that blocks crawlers, so staging doesn't compete with `icpc.cl` in search results.

**Automatic (GitHub Actions).** Every push to `main` builds and publishes (`.github/workflows/deploy.yml`). It can also be started by hand from the Actions tab (*Run workflow*), choosing `prod` or `staging`. Required repository secrets: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_STAGING_BUCKET` (staging only), and optionally `EASTER_EGG_KEYS` (hidden page).

**Manual (from this machine).** Copy `.env.example` to `.env` and fill in the credentials and both buckets (`R2_BUCKET` for production, `R2_STAGING_BUCKET` for staging). If staging needs different credentials, put them in `.env.staging`, which overrides `.env` only when deploying to staging. `.env*` files are never committed. Then:

```sh
npm run deploy:staging:dry   # staging: build and show what would change, without uploading
npm run deploy:staging       # staging: build and publish
npm run deploy:dry           # production, without uploading
npm run deploy               # production
```

These are shortcuts for `bash scripts/deploy.sh [prod|staging] [--dry-run]` (default `prod`).

What the script does: it first uploads new or changed files (images and PDFs, cached for 7 days), then the HTML (cached for 5 minutes) while deleting pages that no longer exist, and finally deletes files that are no longer used. Because images stay cached for 7 days, use a new file name when replacing a photo.

### Cloudflare setup (once per environment)

Each environment uses its own R2 bucket, connected as a custom domain (R2 → bucket → Settings → Custom Domains): `icpc.cl` for production and `icpc-cl-staging.idlechara.net` for staging. Rules are created in each domain's zone (`icpc.cl` or `idlechara.net`). In `idlechara.net`, limit them to the staging host by adding `http.host eq "icpc-cl-staging.idlechara.net" and` at the start of each condition.

- **Transform Rule (Rewrite URL)** to serve `index.html` for directories:
  - When: `ends_with(http.request.uri.path, "/")`
  - Rewrite path (dynamic): `concat(http.request.uri.path, "index.html")`
- **Redirect Rule** so that `/faq` (without a trailing `/`) goes to `/faq/`:
  - When: `not ends_with(http.request.uri.path, "/") and not http.request.uri.path contains "."`
  - Target URL (dynamic): `concat("https://", http.host, http.request.uri.path, "/")`, status 301, preserving the query string.
- **Optional (production):** another Redirect Rule from `www.icpc.cl` to `icpc.cl`.
