// Loads one contest per markdown file in contests/ (repo root). The front matter holds
// the structured data (see contests/README.md); the body is the description, optionally
// followed by FAQ questions for that edition (same **Pregunta** format as the main FAQ).
//
// "Upcoming" is decided at build time: a contest disappears from the page on the first
// build after its `end`.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import matter from "gray-matter";
import { md, isQuestion, parseQuestions } from "../../lib/content.js";
import loadSite from "./site.js";

const CONTESTS_DIR = "contests";
const TIME_ZONE = "America/Santiago";
const REGISTRATION_STATUSES = ["open", "soon", "closed"];
// Each kind of contest has its own page
const KINDS = {
  regional: { label: "ICPC South America/South Finals", pageUrl: "/icpc/" },
  tcp: { label: "Torneo Chileno de Programación", pageUrl: "/tcp/" },
};
const DEFAULT_DURATION_MS = 5 * 60 * 60 * 1000;

const dayFormat = new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE });
const timeFormat = new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TIME_ZONE });

function toDate(value, file, field) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`[contests] ${file}: "${field}" no es una fecha válida (usa por ejemplo 2026-11-07T14:00:00-03:00)`);
  }
  return date;
}

// Venue logo: a file in src/img/sedes/, named in the contest's `placeLogo`
const PLACE_LOGO_DIR = "img/sedes";
function findPlaceLogo(name, file) {
  if (!name) return "";
  if (!existsSync(`src/${PLACE_LOGO_DIR}/${name}`)) {
    console.warn(`[contests] ${file}: no existe src/${PLACE_LOGO_DIR}/${name} (placeLogo)`);
    return "";
  }
  return `/${PLACE_LOGO_DIR}/${name}`;
}

function loadContest(file) {
  const raw = readFileSync(`${CONTESTS_DIR}/${file}`, "utf8");
  // Unfilled template values (comments don't count)
  const uncommented = raw.replace(/<!--[\s\S]*?-->/g, "").replace(/(^|\s)#.*$/gm, "");
  const pending = [...new Set(uncommented.match(/__[A-ZÁÉÍÓÚÑ_]+__/g) ?? [])];
  if (pending.length) {
    throw new Error(`[contests] ${file}: faltan valores por completar de la plantilla: ${pending.join(", ")}`);
  }
  const { data, content } = matter(raw);
  const slug = data.id ?? file.replace(/\.md$/, "");

  if (!data.name) throw new Error(`[contests] ${file}: falta "name"`);
  const kind = KINDS[data.kind];
  if (!kind) throw new Error(`[contests] ${file}: "kind" debe ser ${Object.keys(KINDS).join(" o ")}`);
  const start = toDate(data.start, file, "start");
  const end = data.end ? toDate(data.end, file, "end") : new Date(start.getTime() + DEFAULT_DURATION_MS);

  // registration.dev overrides the registration on the dev server only
  // (e.g. a placeholder link to preview how the page looks with registration open)
  const { dev: devRegistration, ...baseRegistration } = data.registration ?? {};
  const registration = { ...baseRegistration, ...(loadSite().dev && devRegistration) };
  registration.status ??= registration.url ? "open" : "soon";
  if (!REGISTRATION_STATUSES.includes(registration.status)) {
    throw new Error(`[contests] ${file}: registration.status debe ser ${REGISTRATION_STATUSES.join(", ")}`);
  }
  // The note accepts inline markdown (e.g. a link to the payment details)
  if (registration.note) registration.note = md.renderInline(String(registration.note));
  if (registration.status === "open" && !registration.url) {
    throw new Error(`[contests] ${file}: la inscripción está abierta pero falta registration.url`);
  }

  // Body: description up to the first question, FAQ questions after it
  const lines = content.replace(/<!--[\s\S]*?-->/g, "").split("\n");
  const firstQuestion = lines.findIndex(isQuestion);
  const descriptionLines = firstQuestion === -1 ? lines : lines.slice(0, firstQuestion);
  const questions = firstQuestion === -1 ? [] : parseQuestions(lines.slice(firstQuestion));

  const startDay = dayFormat.format(start).replace(",", "");

  return {
    slug,
    file,
    name: data.name,
    kind: data.kind,
    kindLabel: kind.label,
    pageUrl: kind.pageUrl,
    navLabel: data.navLabel ?? data.name,
    eyebrow: data.eyebrow ?? "ICPC Chile",
    summary: data.summary ?? "",
    place: data.place ?? "",
    mapUrl: data.mapUrl ?? "",
    placeLogo: findPlaceLogo(data.placeLogo, file),
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
    links: data.links ?? [],
    results: data.results ?? [],
    descriptionHtml: md.render(descriptionLines.join("\n").trim()),
    faqTitle: data.faqTitle ?? data.name,
    faqId: `faq-${slug}`,
    questions,
  };
}

export default function () {
  const now = new Date();
  const all = readdirSync(CONTESTS_DIR)
    // README.md and files starting with "_" (such as _plantilla.md) are not contests
    .filter((file) => file.endsWith(".md") && file !== "README.md" && !file.startsWith("_"))
    .map(loadContest)
    .sort((a, b) => a.start - b.start);
  for (const contest of all) contest.finished = contest.end < now;
  const upcoming = all.filter((contest) => !contest.finished);
  const past = all.filter((contest) => contest.finished).reverse();
  // Each kind's page shows its upcoming editions or, if there are none, the most recent one
  const byKind = Object.fromEntries(
    Object.keys(KINDS).map((kind) => {
      const next = upcoming.filter((c) => c.kind === kind);
      const last = past.find((c) => c.kind === kind);
      return [kind, next.length ? next : last ? [last] : []];
    }),
  );
  return { all, upcoming, past, byKind, next: upcoming[0] ?? null };
}
