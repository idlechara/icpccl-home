// Public URL of the site, used by canonical links and share previews.
// Set SITE_URL to build for another host (e.g. staging).
//
// - `production`: a build for the production URL. Anything else (staging, the dev
//   server) is marked noindex so search engines skip it.
// - `dev`: the dev server (npm start). Placeholder content (links and registration
//   marked `dev`, files in dev/, sponsors until they're public) only shows here, so
//   staging looks exactly like production.

const PRODUCTION_URL = "https://icpc.cl";

export default function () {
  const url = (process.env.SITE_URL || PRODUCTION_URL).replace(/\/+$/, "");
  const dev = ["serve", "watch"].includes(process.env.ELEVENTY_RUN_MODE);
  return {
    url,
    dev,
    production: url === PRODUCTION_URL && !dev,
    name: "ICPC Chile",
    instagram: "icpc_chile",
    // Footer credit, shown only when `show` is true. `url` is optional: without it,
    // the name is plain text.
    maintainer: { show: false, name: "@idlechara", url: "https://idlechara.net" },
    // Footer links to the public repository; `show: false` hides them
    repository: { show: true, url: "https://github.com/idlechara/icpccl-home" },
  };
}
