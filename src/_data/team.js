// Everyone who has been part of ICPC Chile, one entry per person. Each role says the
// years it was held, so this one list builds /equipo/: the current season's team
// (cards with photo) and, below it, everyone who has been part of it, with their roles
// and years.
//
// Roles: { title, in, years }. `years` lists the years the role was held (e.g.
// [2025, 2026]); `in` lists the competitions it applies to ("tcp", "icpc"), shown as
// badges and used by the TCP / ICPC filter. Without `in`, it applies to both.
// When someone takes a new role, add it with its own years; keep the old one.
//
// Photos: drop a square image into src/img/equipo/, named after the person's `id`
// (e.g. erik-regla.jpg) or set `photo` to its file name. Non-square photos are cropped
// to a square, keeping the top. Until one exists, the card shows a placeholder.
//
// Layout: `row` sets the line each person appears on in the current team (1 = top).
// People with the same row share a centered line, in the order listed here.
//
// `hidden: true` on a person or on a single role keeps it in this file but off the site.
//
// Optional `tooltip`: short text shown over the photo on hover (or tap / keyboard focus).

import { existsSync } from "node:fs";
import loadContests from "./contests.js";

const PHOTO_DIR = "img/equipo";
const PHOTO_EXTENSIONS = ["webp", "jpg", "jpeg", "png"];

// Set to true to show the tooltips again (the text stays in each person's `tooltip`)
const SHOW_TOOLTIPS = false;

const COMPETITIONS = {
  tcp: { label: "TCP", name: "Torneo Chileno de Programación" },
  icpc: { label: "ICPC", name: "ICPC South America/South Finals (Regional ICPC)" },
};

const team = [
  {
    id: "cristian-ruz",
    name: "Cristian Ruz",
    row: 1,
    photo: "cruz.jpg",
    tooltip: ["ICPC Chile Site Director", "RCD South America / South"],
    roles: [{ title: "ICPC Chile Site Director", in: ["tcp", "icpc"], years: [2026] }],
    // topics: "Fechas, inscripciones y cupos.",
    email: "cristian.ruz@gmail.com",
  },
  {
    id: "carla-gallardo",
    name: "Carla Gallardo",
    row: 1,
    photo: "cgallardo.jpg",
    roles: [{ title: "ICPC Chile Head of Logistics", in: ["tcp", "icpc"], years: [2026] }],
    tooltip: ["ICPC Chile Logistics Director"],
    // topics: "Logística de sedes.",
    email: "carla.gestrada@gmail.com",
  },
  {
    id: "erik-regla",
    name: "Erik Regla",
    row: 1,
    photo: "reglae.jpg",
    roles: [{ title: "ICPC Chile Head of Systems", in: ["tcp", "icpc"], years: [2026] }],
    tooltip: ["ICPC Chile Systems Group Manager", "Observeitor Dev"],
    // topics: "Temas técnicos: MaratonaLinux, computadores y red.",
    email: "erik.regla@gmail.com",
    // telegram: "idlechara",
  },
  {
    id: "eric-ross",
    name: "Eric Ross",
    row: 2,
    photo: "erosss.jpg",
    roles: [{ title: "Technical Group Lead", in: ["icpc"], years: [2026] }],
    email: "eross@ucn.cl",
  },
  {
    id: "gabriel-carmona",
    name: "Gabriel Carmona",
    row: 2,
    roles: [
      { title: "Chief Judge", in: ["tcp"], years: [2026] },
      { title: "Problem setter", in: ["tcp"], years: [2026] },
    ],
  },
  {
    id: "camilo-castro",
    name: "Camilo Castro",
    row: 2,
    roles: [{ title: "Problem setter", in: ["tcp"], years: [2026] }],
  },
  {
    id: "javier-oliva",
    name: "Javier Oliva",
    row: 2,
    roles: [{ title: "Problem setter", in: ["tcp"], years: [2026] }],
  },
  {
    id: "marcelo-lemus",
    name: "Marcelo Lemus",
    row: 2,
    roles: [{ title: "Problem setter", in: ["tcp"], years: [2026] }],
  },
  {
    id: "vicente-villarroel",
    name: "Vicente Villarroel",
    row: 2,
    roles: [{ title: "Problem setter", in: ["tcp"], years: [2026] }],
  },
  {
    id: "mr-alcerson",
    name: "Mr. Alcerson",
    row: 3,
    photo: "alcerson.jpg",
    roles: [{ title: "Mascota", years: [2026] }],
    instagram: "mr_alcerson",
  },
];

function findPhoto(person) {
  const candidates = person.photo ? [person.photo] : PHOTO_EXTENSIONS.map((ext) => `${person.id}.${ext}`);
  const file = candidates.find((name) => existsSync(`src/${PHOTO_DIR}/${name}`));
  if (person.photo && !file) console.warn(`[team] No existe src/${PHOTO_DIR}/${person.photo} (${person.name})`);
  return file ? `${PHOTO_DIR}/${file}` : null;
}

// [2022, 2024, 2025, 2026] → "2022, 2024–2026"
function formatYears(years) {
  const ranges = [];
  for (const year of [...years].sort((a, b) => a - b)) {
    const last = ranges.at(-1);
    if (last && year === last[1] + 1) last[1] = year;
    else ranges.push([year, year]);
  }
  return ranges.map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(", ");
}

function loadRole(role, person) {
  const { title, in: keys = Object.keys(COMPETITIONS), years } = role;
  for (const key of keys) {
    if (!COMPETITIONS[key]) throw new Error(`[team] ${person.name}: competencia desconocida "${key}" (usa ${Object.keys(COMPETITIONS).join(" o ")})`);
  }
  const list = [years ?? []].flat().map(Number);
  if (!list.length || list.some((y) => !Number.isInteger(y))) {
    throw new Error(`[team] ${person.name}, "${title}": falta "years" con los años del rol (p. ej. years: [2026])`);
  }
  // Roles for both competitions show no badge, as before
  const badges = keys.length === Object.keys(COMPETITIONS).length && !role.in ? [] : keys;
  return {
    title,
    keys,
    years: list,
    yearsText: formatYears(list),
    competitions: badges.map((key) => ({ key, ...COMPETITIONS[key] })),
  };
}

export default function () {
  const { currentYear } = loadContests();
  const people = team
    .filter((person) => !person.hidden)
    .map((person) => {
      const roles = (person.roles ?? []).filter((role) => !role.hidden).map((role) => loadRole(role, person));
      const tooltip = SHOW_TOOLTIPS ? [person.tooltip ?? []].flat().map(String).filter((line) => line.trim()) : [];
      return { ...person, photo: findPhoto(person), tooltip, roles };
    })
    .filter((person) => person.roles.length);

  // Current team: people with a role this season, showing only those roles
  const rows = new Map();
  for (const person of people) {
    const roles = person.roles.filter((role) => role.years.includes(currentYear));
    if (!roles.length) continue;
    const row = Number(person.row ?? 1);
    if (!rows.has(row)) rows.set(row, []);
    const competitions = [...new Set(roles.flatMap((role) => role.keys))];
    rows.get(row).push({ ...person, roles, competitions });
  }

  // Everyone who has been part of it, most recent first
  const lastYear = (person) => Math.max(...person.roles.flatMap((role) => role.years));
  const history = [...people]
    .sort((a, b) => lastYear(b) - lastYear(a))
    .map((person) => ({ ...person, competitions: [...new Set(person.roles.flatMap((role) => role.keys))] }));
  // Only worth showing once it adds something to the current team
  const hasHistory = people.some((person) => person.roles.some((role) => role.years.some((y) => y !== currentYear)));

  return {
    year: currentYear,
    competitions: Object.entries(COMPETITIONS).map(([key, c]) => ({ key, ...c })),
    rows: [...rows.entries()].sort(([a], [b]) => a - b).map(([row, members]) => ({ row, members })),
    history,
    hasHistory,
  };
}
