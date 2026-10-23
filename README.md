# icpccl-home

Website of ICPC Chile, for the Torneo Chileno de Programación (TCP) and the ICPC South America/South Finals. Built with [Eleventy](https://www.11ty.dev/) and hosted on Cloudflare R2.

## Run it

Open the project in the devcontainer, then:

```sh
npm start        # http://localhost:8080
```

## Common edits

- **Contest dates, registration, schedule:** `ediciones/<año>_<mes>_<tipo>/competencia.md` (e.g. `ediciones/2026_11_icpc/`), with that edition's PDFs and logos in the same folder. To add a new one, run `npm run nueva-competencia`.
- **FAQ:** `faq-tcp-icpc.md` (general) and `faq-tecnico.md` (for host sites).
- **Team:** `src/_data/team.js`, with photos in `src/img/equipo/`. Each role lists the years it was held.
- **Sponsors:** in each edition's `competencia.md`. They only show on `npm start` until you set `PUBLIC = true` in `src/_data/sponsors.js`.

## Publish

A push to `main` deploys to https://icpc.cl, and a push to the `staging` branch deploys to https://staging.icpc.cl. Try changes on `staging` first, then merge them into `main`. You can also deploy from your machine with `npm run deploy` or `npm run deploy:staging` after filling in `.env` from `.env.example`.

Everything else (content model, environments, hidden page, secrets, Cloudflare setup, gotchas) is in [AGENTS.md](AGENTS.md).

Want to suggest or fix something? See [CONTRIBUTING.md](CONTRIBUTING.md) (in Spanish).
