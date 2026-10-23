// Loads one contest edition per folder in ediciones/ (repo root, see lib/editions.js).
// The front matter of its competencia.md holds the structured data (see
// ediciones/README.md); the body is the description, optionally followed by FAQ
// questions for that edition (same **Pregunta** format as the main FAQ).
//
// "Upcoming" is decided at build time: a contest stops being upcoming on the first
// build after its `end`. Every edition also gets its own permanent page, /<kind>/<year>/.

import { existsSync, readFileSync } from "node:fs";
import matter from "gray-matter";
import { md, isQuestion, parseQuestions } from "../../lib/content.js";
import { CONTEST_FILE, KINDS, listEditionDirs } from "../../lib/editions.js";
import { loadSponsors, toRows } from "../../lib/sponsors.js";
import loadSite from "./site.js";

const TIME_ZONE = "America/Santiago";
const REGISTRATION_STATUSES = ["open", "soon", "closed"];
const DEFAULT_DURATION_MS = 5 * 60 * 60 * 1000;

const dayFormat = new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE });
const timeFormat = new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TIME_ZONE });
const yearMonthFormat = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: TIME_ZONE });

function toDate(value, dir, field) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`[ediciones] ${dir}: "${field}" no es una fecha válida (usa por ejemplo 2026-11-07T14:00:00-03:00)`);
  }
  return date;
}

// A relative URL ("mapa.pdf") points to a file in the edition folder, published at
// /<kind>/<year>/mapa.pdf. Absolute paths, full URLs and anchors are left as they are.
function resolveUrl(url, edition) {
  if (!url || /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url)) return url;
  if (!existsSync(`${edition.path}/${url}`)) console.warn(`[ediciones] ${edition.dir}: no existe el archivo ${url}`);
  return `${edition.url}${url}`;
}

function loadContest(edition) {
  const { dir } = edition;
  const file = `${edition.path}/${CONTEST_FILE}`;
  if (!existsSync(file)) throw new Error(`[ediciones] ${dir}: falta ${CONTEST_FILE}`);
  const raw = readFileSync(file, "utf8");
  // Unfilled template values (comments don't count)
  const uncommented = raw.replace(/<!--[\s\S]*?-->/g, "").replace(/(^|\s)#.*$/gm, "");
  const pending = [...new Set(uncommented.match(/__[A-ZÁÉÍÓÚÑ_]+__/g) ?? [])];
  if (pending.length) {
    throw new Error(`[ediciones] ${dir}: faltan valores por completar de la plantilla: ${pending.join(", ")}`);
  }
  const { data, content } = matter(raw);
  const kind = KINDS[edition.kind];

  if (!data.name) throw new Error(`[ediciones] ${dir}: falta "name"`);
  const start = toDate(data.start, dir, "start");
  const end = data.end ? toDate(data.end, dir, "end") : new Date(start.getTime() + DEFAULT_DURATION_MS);
  // The folder name must match the date, so a copied folder can't keep last year's name
  const [startYear, startMonth] = yearMonthFormat.format(start).split("-").map(Number);
  if (startYear !== edition.year || startMonth !== edition.month) {
    throw new Error(`[ediciones] ${dir}: la carpeta no coincide con "start" (${startYear}-${String(startMonth).padStart(2, "0")})`);
  }

  // registration.dev overrides the registration on the dev server only
  // (e.g. a placeholder link to preview how the page looks with registration open)
  const { dev: devRegistration, ...baseRegistration } = data.registration ?? {};
  const registration = { ...baseRegistration, ...(loadSite().dev && devRegistration) };
  registration.status ??= registration.url ? "open" : "soon";
  if (!REGISTRATION_STATUSES.includes(registration.status)) {
    throw new Error(`[ediciones] ${dir}: registration.status debe ser ${REGISTRATION_STATUSES.join(", ")}`);
  }
  // The note accepts inline markdown (e.g. a link to the payment details)
  if (registration.note) registration.note = md.renderInline(String(registration.note));
  if (registration.status === "open" && !registration.url) {
    throw new Error(`[ediciones] ${dir}: la inscripción está abierta pero falta registration.url`);
  }

  // Body: description up to the first question, FAQ questions after it
  const lines = content.replace(/<!--[\s\S]*?-->/g, "").split("\n");
  const firstQuestion = lines.findIndex(isQuestion);
  const descriptionLines = firstQuestion === -1 ? lines : lines.slice(0, firstQuestion);
  const questions = firstQuestion === -1 ? [] : parseQuestions(lines.slice(firstQuestion));

  const startDay = dayFormat.format(start).replace(",", "");
  const slug = `${edition.kind}-${edition.year}`;
  const sponsors = loadSponsors(data.sponsors, edition);

  return {
    slug,
    dir,
    year: edition.year,
    name: data.name,
    kind: edition.kind,
    kindLabel: kind.label,
    kindName: kind.name,
    pageUrl: `/${edition.kind}/`,
    editionUrl: edition.url,
    eyebrow: data.eyebrow ?? "ICPC Chile",
    summary: data.summary ?? "",
    place: data.place ?? "",
    mapUrl: data.mapUrl ?? "",
    placeLogo: resolveUrl(data.placeLogo, edition) ?? "",
    // White logos go bare on the dark hero; others get a white background
    placeLogoWhite: data.placeLogoWhite === true,
    start,
    end,
    startIso: start.toISOString(),
    startDay,
    startTime: timeFormat.format(start),
    dates: data.dates ?? startDay,
    registration,
    facts: (data.facts ?? []).map((fact) => ({ ...fact, html: md.renderInline(fact.text ?? "") })),
    agenda: (data.agenda ?? []).map((day) => ({
      title: day.title,
      items: (day.items ?? []).map(([time, text, flag]) => ({ time, html: md.renderInline(text ?? ""), main: flag === "main" })),
    })),
    sites: data.sites ?? [],
    links: (data.links ?? []).map((link) => ({ ...link, url: resolveUrl(link.url, edition) })),
    results: (data.results ?? []).map((link) => ({ ...link, url: resolveUrl(link.url, edition) })),
    sponsors,
    sponsorRows: toRows(sponsors),
    descriptionHtml: md.render(descriptionLines.join("\n").trim()),
    faqTitle: data.faqTitle ?? data.name,
    faqId: `faq-${slug}`,
    questions,
  };
}

export default function () {
  const now = new Date();
  const all = listEditionDirs().map(loadContest).sort((a, b) => a.start - b.start);
  const urls = new Map();
  for (const contest of all) {
    if (urls.has(contest.editionUrl)) {
      throw new Error(`[ediciones] ${urls.get(contest.editionUrl)} y ${contest.dir} tendrían la misma página (${contest.editionUrl})`);
    }
    urls.set(contest.editionUrl, contest.dir);
    contest.finished = contest.end < now;
  }
  const upcoming = all.filter((contest) => !contest.finished);
  const past = all.filter((contest) => contest.finished).reverse();
  // Each kind's page shows its upcoming editions or, if there are none, the most recent
  // one; its other past editions are listed below it
  const byKind = {};
  const archiveByKind = {};
  for (const kind of Object.keys(KINDS)) {
    const next = upcoming.filter((c) => c.kind === kind);
    const last = past.find((c) => c.kind === kind);
    byKind[kind] = next.length ? next : last ? [last] : [];
    archiveByKind[kind] = past.filter((c) => c.kind === kind && !byKind[kind].includes(c));
  }
  const next = upcoming[0] ?? null;
  // The current season: the year of the next contest or, between seasons, the latest one
  const currentYear = (next ?? past[0])?.year ?? now.getFullYear();
  // Homepage sponsors: those of the upcoming editions, once each
  const seen = new Set();
  const currentSponsors = upcoming.flatMap((c) => c.sponsors).filter((s) => !seen.has(s.id ?? s.name) && seen.add(s.id ?? s.name));
  return { all, upcoming, past, byKind, archiveByKind, next, currentYear, currentSponsorRows: toRows(currentSponsors) };
}
