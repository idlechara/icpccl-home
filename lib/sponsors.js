// Sponsors of an edition: the `sponsors` list in its competencia.md, with logos in the
// edition folder. Whether they're shown at all is decided by src/_data/sponsors.js.

import { existsSync } from "node:fs";

const LOGO_EXTENSIONS = ["svg", "png", "webp", "jpg", "jpeg"];

// `row` sets the line each sponsor appears on (1 = top)
export function toRows(items) {
  const rows = new Map();
  for (const item of items) {
    const row = Number(item.row ?? 1);
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row).push(item);
  }
  return [...rows.entries()].sort(([a], [b]) => a - b).map(([row, list]) => ({ row, list }));
}

// Logo: `logo` (a file in the edition folder), or a file named after the sponsor's `id`
export function loadSponsors(list, edition) {
  return (list ?? []).map((sponsor) => {
    if (!sponsor.name) throw new Error(`[ediciones] ${edition.dir}: un auspiciador no tiene "name"`);
    const candidates = sponsor.logo ? [sponsor.logo] : LOGO_EXTENSIONS.map((ext) => `${sponsor.id}.${ext}`);
    const file = candidates.find((name) => existsSync(`${edition.path}/${name}`));
    if (sponsor.logo && !file) console.warn(`[ediciones] ${edition.dir}: no existe ${sponsor.logo} (logo de ${sponsor.name})`);
    return { ...sponsor, logo: file ? `${edition.url}${file}` : null };
  });
}
