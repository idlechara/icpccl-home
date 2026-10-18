# icpccl-home

Website of ICPC Chile, for the Torneo Chileno de Programación (TCP) and the ICPC South America/South Finals. Built with [Eleventy](https://www.11ty.dev/) and hosted on Cloudflare R2.

## Run it

Open the project in the devcontainer, then:

```sh
npm start        # http://localhost:8080
```

## Common edits

- **Contest dates, registration, schedule:** `contests/<tipo>-<año>.md`. To add a new one, run `npm run nueva-competencia`.
- **FAQ:** `faq-tcp-icpc.md` (general) and `faq-tecnico.md` (for host sites).
- **Team page:** `src/_data/team.js`, with photos in `src/img/equipo/`.
- **Sponsors:** `src/_data/sponsors.js`. They only show on `npm start` until you set `PUBLIC = true`.

## Publish

A push to `main` deploys to https://icpc.cl. To deploy staging (https://staging.icpc.cl), use *Run workflow* in the Actions tab and pick `staging`. You can also deploy from your machine with `npm run deploy` or `npm run deploy:staging` after filling in `.env` from `.env.example`.

Everything else (content model, environments, hidden page, secrets, Cloudflare setup, gotchas) is in [AGENTS.md](AGENTS.md).
