# AGENTS.md

Reference for coding agents (and humans who want the details) working on the ICPC Chile site. The short version for people is in `README.md`.

## Project

Static site for ICPC Chile: the Torneo Chileno de Programación (TCP) and the ICPC South America/South Finals (Regional ICPC). Built with Eleventy 3 and Liquid, hosted on Cloudflare R2. Site content is in Spanish; code comments and docs are in English.

```sh
npm start                  # dev server at http://localhost:8080 (reads .env)
npm run build              # production build into _site/
npm run nueva-competencia  # interactive assistant that creates a contest file
```

## Layout

| Path | What it holds |
|---|---|
| `src/` | Eleventy input. Pages: `index.html` (home), `icpc.html`, `tcp.html`, `faq.html`, `faq-tecnica.html`, `equipo.html`, `bonus.html` (hidden page), `robots.liquid`. |
| `src/_includes/` | `base.liquid` (all CSS, nav, footer, shared scripts), `contest-section.liquid`, `faq-list.liquid`, `sponsors.liquid`. |
| `src/_data/` | Data files: `contests.js`, `faq.js`, `faqTecnica.js`, `team.js`, `sponsors.js`, `site.js`, `bonus.js`. |
| `lib/` | Shared helpers: `content.js` (markdown, FAQ parsing, slugs), `bonus.js` (hidden page hashing). |
| `contests/` | One contest per markdown file. Field reference in `contests/README.md`; template in `_plantilla.md`. |
| `faq-tcp-icpc.md`, `faq-tecnico.md` | General FAQ and technical FAQ for host sites. |
| `scripts/` | `deploy.sh` (build and sync to R2), `nueva-competencia.mjs` (contest assistant). |
| `bonus/` | Hidden page photo and text. Not in git (see below). |
| `dev/` | Placeholder files served only by the dev server. May not exist. |
| `.archive/` | Old versions. Ignored by git, not published. |

## Content model

### Contests (`contests/*.md`)

Front matter holds the structured data; the body is the description, optionally followed by FAQ questions for that edition. `kind: regional` renders on `/icpc/`, `kind: tcp` on `/tcp/`. Files starting with `_` are ignored, and the build fails if a template value like `__NOMBRE__` is left unfilled.

- The homepage features the next contest that hasn't ended (by `start`); "upcoming" and "past" are decided at build time, so a rebuild is needed after a contest ends.
- A competition page shows its upcoming edition or, if there's none, the most recent one, marked as finished with its `results` links.
- Upcoming contests' questions are merged into `/faq/` under "Próximas competencias". Finished ones drop out of the FAQ.
- `registration.status` is `open`, `soon` or `closed`. `open` requires `registration.url`; `note` accepts inline markdown.
- Links: `dev: true` shows only on the dev server; `countdown: true` shows only on the homepage, below the countdown, with an icon; `home: false` keeps a link off the homepage.

### FAQs

Format shared by `faq-tcp-icpc.md`, `faq-tecnico.md` and contest bodies:

```
# Group            (the first H1 is the document title; "# Contacto" and everything after it is skipped)
## Section
Intro text         (optional, shown before the questions)
**Question?**      (a line that is entirely bold)
Answer markdown    (until the next question or heading)
```

- Anchors come from `slugify` in `lib/content.js`. "ñ" becomes "ni" ("año" → `anio`). Renaming a question changes its anchor, so update links to it.
- A `` `#RRGGBB` `` code renders with a color swatch; ` ```mermaid ` blocks render as diagrams in the browser.
- A question containing `[TODO` triggers a build warning and is left out of the FAQ structured data.
- `<!-- ... -->` comments are not published; use them to hide drafts.

### Team and sponsors

- `src/_data/team.js`: `row` sets the line each person appears on. Roles are strings or `{ title, in: ["tcp", "icpc"] }`, which adds competition badges and drives the TCP/ICPC filter. `hidden: true` keeps a person or a role off the page. Tooltips are off (`SHOW_TOOLTIPS`). Photos go in `src/img/equipo/`, named after the `id` or set with `photo`.
- `src/_data/sponsors.js`: `row`, optional `url`, `in` per competition, logos in `src/img/sponsors/`. The section only shows on the dev server until `PUBLIC = true`.

## Environments

`src/_data/site.js` exposes two flags:

- `site.dev`: the dev server (`npm start`). Placeholder content only shows here: links with `dev: true`, `registration.dev` overrides, files in `dev/`, and sponsors while not public.
- `site.production`: a build for `https://icpc.cl`. Anything else, staging or dev, gets `noindex` and a `robots.txt` that blocks crawlers.

Staging renders exactly like production except for its URL and `noindex`.

## Hidden page

Typing `EASTER_EGG_KEYS` on any page opens it. The page lives at a path derived from a hash of the sequence; the published JavaScript only contains a second, unrelated hash, so neither the code nor the repo reveals the path or the sequence. Details in `lib/bonus.js`.

`bonus/photo.jpg` and `bonus/content.json` (title, heading, caption, alt text) are not in git. They live in the R2 bucket next to the page. The build copies them only when they exist locally, and `deploy.sh` never deletes `*/photo.jpg` or `*/content.json`, so CI deploys keep the copies in the bucket. Never add these files, the sequence or the derived path to tracked files.

## Deployment

`scripts/deploy.sh [prod|staging] [--dry-run]` builds the site and syncs `_site/` to R2 in three passes: new or changed assets (cached 7 days), then HTML (cached 5 minutes) while deleting removed pages, then deletion of unused assets. Because assets are cached 7 days, replace an image under a new file name.

| Environment | URL | Bucket |
|---|---|---|
| Production | https://icpc.cl | `R2_BUCKET` |
| Staging | https://staging.icpc.cl | `R2_BUCKET` of the staging environment (`.env.staging` locally) |

**GitHub Actions** (`.github/workflows/deploy.yml`): the branch decides the environment. A push to `main` deploys production and a push to `staging` deploys staging; *Run workflow* redeploys the branch chosen in "Use workflow from". Other branches don't deploy. Runs are named after their target and tied to a GitHub Environment (`production` or `staging`), which selects the secrets; each environment only accepts its own branch (Deployment branches: `main` for production, `staging` for staging).

Each environment has its own R2 token, scoped to its bucket, so a staging run can't write to production. Environment secrets (in both `production` and `staging`): `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. Repository secrets: `R2_ACCOUNT_ID` and optionally `EASTER_EGG_KEYS`. 

**Manual**: `.env` (from `.env.example`) holds production's bucket and keys; `.env.staging` holds staging's `R2_BUCKET`, `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` and overrides `.env` for staging deploys. A staging deploy refuses to run without its own `R2_BUCKET`. Commands: `npm run deploy`, `npm run deploy:dry`, `npm run deploy:staging`, `npm run deploy:staging:dry`.

### Cloudflare (once per environment)

Each bucket is connected as a custom domain (R2 → bucket → Settings → Custom Domains). Both hosts are in the `icpc.cl` zone; prefix each rule condition with `http.host in {"icpc.cl" "staging.icpc.cl"} and`.

- Transform Rule (Rewrite URL), to serve `index.html` for directories. When: `ends_with(http.request.uri.path, "/")`. Rewrite path (dynamic): `concat(http.request.uri.path, "index.html")`.
- Redirect Rule, so `/faq` goes to `/faq/`. When: `not ends_with(http.request.uri.path, "/") and not http.request.uri.path contains "."`. Target (dynamic): `concat("https://", http.host, http.request.uri.path, "/")`, 301, keep the query string.
- Optional: a Redirect Rule from `www.icpc.cl` to `https://icpc.cl` (dynamic: `concat("https://icpc.cl", http.request.uri.path)`), placed first.

## Conventions and gotchas

- **TCP vs Regional ICPC.** Every FAQ answer and site text must say whether it applies to the TCP, the Regional ICPC or both. Don't assume a TCP rule also applies to the Regional.
- **Spanish copy.** Plain, neutral tone; no inflated or promotional wording. Fee and participation texts were worded carefully (for example the women's team measure); keep their framing when editing.
- **Titles.** Team titles stay in English ("ICPC Chile Systems Group Manager", "ICPC Chile Site Director"). In the technical FAQ the systems lead is "Systems Group Manager"; the Technical Group is part of the Systems Group.
- **Liquid `and`/`or`.** Liquid has no operator precedence and groups everything after the first `and`. Split mixed conditions into separate `{% if %}` blocks.
- **Escaping.** Team names, roles and tooltips are escaped in `equipo.html`; keep `| escape` on user-provided text.
- **Hidden attribute.** `[hidden] { display: none !important }` in `base.liquid` makes `hidden` win over component `display` rules. Rely on it for JS toggles.
- **Card text length.** Fact cards in a row share their height; keep card text short and put explanations in the FAQ, linked from the card.
- **Checking work.** After content changes, run `npm run build` and check that in-page anchors resolve (a quick script that compares `href="#…"` with element ids catches broken links after question renames).
- **Secrets.** `.env*` (except `.env.example`), `bonus/` and `.archive` are ignored. Never print `.env` contents or commit credentials.
