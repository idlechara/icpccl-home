// Sponsors shown on the homepage and the competition pages. Until PUBLIC is true, the
// section only shows on the dev server (npm start); staging and production hide it.
//
// Logos: drop an image into src/img/sponsors/ named after the sponsor's `id`
// (e.g. acme.png, .svg, .webp or .jpg) or set `logo` to its file name. Without one,
// the card shows the sponsor's name. `url` is optional.
//
// Layout: `row` sets the line each sponsor appears on (1 = top). Sponsors in the same
// row share it, centered, and their cards stretch to fill it. Without `row`, row 1.
//
// `in` lists the competitions a sponsor supports ("tcp", "icpc"); it decides which
// competition page shows it. Without `in`, it appears on both. The homepage shows all.

import { existsSync } from "node:fs";

const PUBLIC = false;
const LOGO_DIR = "img/sponsors";
const LOGO_EXTENSIONS = ["svg", "png", "webp", "jpg", "jpeg"];
const COMPETITIONS = ["tcp", "icpc"];

// Placeholders: replace with the real sponsors
const sponsors = [
  { id: "auspiciador-1", name: "Auspiciador 1", row: 1 },
  { id: "auspiciador-2", name: "Auspiciador 2", row: 1 },
  { id: "auspiciador-3", name: "Auspiciador 3", row: 2 },
  { id: "auspiciador-4", name: "Auspiciador 4", row: 2 },
  { id: "auspiciador-5", name: "Auspiciador 5", row: 2 },
];

function findLogo(sponsor) {
  const candidates = sponsor.logo ? [sponsor.logo] : LOGO_EXTENSIONS.map((ext) => `${sponsor.id}.${ext}`);
  const file = candidates.find((name) => existsSync(`src/${LOGO_DIR}/${name}`));
  if (sponsor.logo && !file) console.warn(`[sponsors] No existe src/${LOGO_DIR}/${sponsor.logo} (${sponsor.name})`);
  return file ? `${LOGO_DIR}/${file}` : null;
}

export default function () {
  const list = sponsors.map((sponsor) => {
    const competitions = sponsor.in ?? COMPETITIONS;
    for (const key of competitions) {
      if (!COMPETITIONS.includes(key)) throw new Error(`[sponsors] ${sponsor.name}: competencia desconocida "${key}" (usa ${COMPETITIONS.join(" o ")})`);
    }
    return { ...sponsor, competitions, logo: findLogo(sponsor) };
  });
  const toRows = (items) => {
    const rows = new Map();
    for (const sponsor of items) {
      const row = Number(sponsor.row ?? 1);
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row).push(sponsor);
    }
    return [...rows.entries()].sort(([a], [b]) => a - b).map(([row, items]) => ({ row, list: items }));
  };
  return {
    public: PUBLIC,
    rows: toRows(list),
    byCompetition: Object.fromEntries(COMPETITIONS.map((key) => [key, toRows(list.filter((s) => s.competitions.includes(key)))])),
  };
}
