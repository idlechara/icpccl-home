// Contest editions: one folder per edition in ediciones/ (repo root), named
// YYYY_MM_kind (e.g. 2026_11_icpc). The folder holds competencia.md and the edition's
// files (PDFs, logos), which are published at /<kind>/<year>/ (see eleventy.config.js).
// Folders starting with "_" or "." are ignored.

import { readdirSync, statSync } from "node:fs";

export const EDITIONS_DIR = "ediciones";
export const CONTEST_FILE = "competencia.md";
// Files of an edition folder that are published next to its page
export const EDITION_FILE_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "svg", "webp"];

// Each kind of contest has its own page (/<kind>/) and archive (/<kind>/<year>/)
export const KINDS = {
  icpc: { label: "ICPC South America/South Finals", name: "Regional ICPC" },
  tcp: { label: "Torneo Chileno de Programación", name: "TCP" },
};

const DIR_PATTERN = /^(\d{4})_(\d{2})_([a-z]+)$/;

// Edition folders, parsed and sorted by name (that is, by date)
export function listEditionDirs() {
  return readdirSync(EDITIONS_DIR)
    .filter((dir) => !dir.startsWith("_") && !dir.startsWith(".") && statSync(`${EDITIONS_DIR}/${dir}`).isDirectory())
    .sort()
    .map((dir) => {
      const m = dir.match(DIR_PATTERN);
      if (!m) throw new Error(`[ediciones] ${dir}: el nombre de la carpeta debe ser AAAA_MM_tipo (p. ej. 2026_11_icpc)`);
      const [, year, month, kind] = m;
      if (!KINDS[kind]) throw new Error(`[ediciones] ${dir}: tipo desconocido "${kind}" (usa ${Object.keys(KINDS).join(" o ")})`);
      if (+month < 1 || +month > 12) throw new Error(`[ediciones] ${dir}: mes inválido "${month}"`);
      return { dir, path: `${EDITIONS_DIR}/${dir}`, year: +year, month: +month, kind, url: `/${kind}/${year}/` };
    });
}
