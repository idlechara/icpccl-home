// Team shown on /equipo/.
//
// Photos: drop a square image into src/img/equipo/, named after the person's `id`
// (e.g. erik-regla.jpg) or set `photo` to its file name. Non-square photos are cropped
// to a square, keeping the top. Until one exists, the card shows a placeholder.
//
// Layout: `row` sets the line each person appears on (1 = top). People with the same
// row share a centered line, in the order listed here. Without `row`, they go in row 1.
//
// Roles: a string, or { title, in } where `in` lists the competitions the role applies
// to ("tcp", "icpc"); they show as badges and drive the TCP / ICPC filter on /equipo/.
//
// `hidden: true` on a person or on a single role keeps it in this file but off the page.
//
// Optional `tooltip`: short text shown over the photo on hover (or tap / keyboard focus).

import { existsSync } from "node:fs";

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
    roles: [{ title: "ICPC Chile Site Director", in: ["tcp", "icpc"] }],
    // topics: "Fechas, inscripciones y cupos.",
    email: "cristian.ruz@gmail.com",
  },
  {
    id: "carla-gallardo",
    name: "Carla Gallardo",
    row: 1,
    photo: "cgallardo.jpg",
    roles: [{ title: "ICPC Chile Head of Logistics", in: ["tcp", "icpc"] }],
    tooltip: ["ICPC Chile Logistics Director"],
    // topics: "Logística de sedes.",
    email: "carla.gestrada@gmail.com",
  },
  {
    id: "erik-regla",
    name: "Erik Regla",
    row: 1,
    photo: "reglae.jpg",
    roles: [{ title: "ICPC Chile Systems Group Manager", in: ["tcp", "icpc"] }],
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
    roles: [{ title: "Technical Group Lead", in: ["icpc"] }],
    email: "eross@ucn.cl",
  },
  {
    id: "gabriel-carmona",
    name: "Gabriel Carmona",
    row: 2,
    roles: [
      { title: "Chief Judge", in: ["tcp"] },
      { title: "Problem setter", in: ["tcp"] },
    ],
  },
  {
    id: "camilo-castro",
    name: "Camilo Castro",
    row: 2,
    roles: [{ title: "Problem setter", in: ["tcp"] }],
  },
  {
    id: "javier-oliva",
    name: "Javier Oliva",
    row: 2,
    roles: [{ title: "Problem setter", in: ["tcp"] }],
  },
  {
    id: "marcelo-lemus",
    name: "Marcelo Lemus",
    row: 2,
    roles: [{ title: "Problem setter", in: ["tcp"] }],
  },
  {
    id: "vicente-villarroel",
    name: "Vicente Villarroel",
    row: 2,
    roles: [{ title: "Problem setter", in: ["tcp"] }],
  },
  {
    id: "mr-alcerson",
    name: "Mr. Alcerson",
    row: 3,
    photo: "alcerson.jpg",
    roles: ["Mascota"],
    instagram: "mr_alcerson",
  },
];

function findPhoto(person) {
  const candidates = person.photo ? [person.photo] : PHOTO_EXTENSIONS.map((ext) => `${person.id}.${ext}`);
  const file = candidates.find((name) => existsSync(`src/${PHOTO_DIR}/${name}`));
  if (person.photo && !file) console.warn(`[team] No existe src/${PHOTO_DIR}/${person.photo} (${person.name})`);
  return file ? `${PHOTO_DIR}/${file}` : null;
}

export default function () {
  const rows = new Map();
  for (const person of team) {
    if (person.hidden) continue;
    const row = Number(person.row ?? 1);
    if (!rows.has(row)) rows.set(row, []);
    const tooltip = SHOW_TOOLTIPS ? [person.tooltip ?? []].flat().map(String).filter((line) => line.trim()) : [];
    const roles = (person.roles ?? [])
      .filter((role) => !role.hidden)
      .map((role) => {
        const { title, in: competitions = [] } = typeof role === "string" ? { title: role } : role;
        for (const key of competitions) {
          if (!COMPETITIONS[key]) throw new Error(`[team] ${person.name}: competencia desconocida "${key}" (usa ${Object.keys(COMPETITIONS).join(" o ")})`);
        }
        return { title, competitions: competitions.map((key) => ({ key, ...COMPETITIONS[key] })) };
      });
    const competitions = [...new Set(roles.flatMap((role) => role.competitions.map((c) => c.key)))];
    rows.get(row).push({ ...person, photo: findPhoto(person), tooltip, roles, competitions });
  }
  return {
    competitions: Object.entries(COMPETITIONS).map(([key, c]) => ({ key, ...c })),
    rows: [...rows.entries()].sort(([a], [b]) => a - b).map(([row, members]) => ({ row, members })),
  };
}
