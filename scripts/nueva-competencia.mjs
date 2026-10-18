#!/usr/bin/env node
// Asistente para crear una competencia nueva: pregunta los datos básicos, escribe
// contests/<tipo>-<año>.md a partir de contests/_plantilla.md y prueba que el sitio
// se construya. Uso: npm run nueva-competencia

import { createInterface } from "node:readline";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { stdin, stdout } from "node:process";

const TEMPLATE = "contests/_plantilla.md";
const TIME_ZONE = "America/Santiago";
// Answers come from a line queue, so piped input (several lines at once) also works
const rl = createInterface({ input: stdin, terminal: false });
const lines = [];
let waiting = null;
let closed = false;
rl.on("line", (line) => (waiting ? (waiting(line), (waiting = null)) : lines.push(line)));
rl.on("close", () => {
  closed = true;
  waiting?.(null);
});
const nextLine = () => (lines.length ? Promise.resolve(lines.shift()) : closed ? Promise.resolve(null) : new Promise((r) => (waiting = r)));

async function ask(question, { fallback = "", validate } = {}) {
  for (;;) {
    const hint = fallback ? ` [${fallback}]` : "";
    stdout.write(`${question}${hint}: `);
    const line = await nextLine();
    if (line === null) {
      console.log("\n✗ Entrada terminada antes de completar los datos.");
      process.exit(1);
    }
    const answer = line.trim() || fallback;
    const error = validate?.(answer);
    if (!error) return answer;
    console.log(`  ✗ ${error}`);
  }
}

// "2027-11-06 14:00" (hora de Chile) → "2027-11-06T14:00:00-03:00"
function chileTimestamp(text) {
  const m = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const guess = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi));
  const offset = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" })
    .formatToParts(guess)
    .find((p) => p.type === "timeZoneName")
    .value.replace("GMT", "") || "+00:00";
  return `${y}-${mo}-${d}T${h}:${mi}:00${offset}`;
}

const dayFormat = new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE });
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const quote = (s) => (/[:#\[\]{}*&!|>'"%@`]/.test(s) || /^\s|\s$/.test(s) ? JSON.stringify(s) : s);

console.log("\nNueva competencia. Presiona Enter para aceptar el valor entre corchetes.\n");

const kind = await ask("Tipo (tcp o regional)", {
  validate: (v) => (["tcp", "regional"].includes(v) ? null : 'Escribe "tcp" o "regional".'),
});
const year = await ask("Año", {
  fallback: String(new Date().getFullYear()),
  validate: (v) => (/^\d{4}$/.test(v) ? null : "Escribe el año con 4 dígitos."),
});
const file = `contests/${kind}-${year}.md`;
if (existsSync(file)) {
  console.log(`\n✗ Ya existe ${file}. Edítalo directamente o bórralo antes de usar el asistente.`);
  process.exit(1);
}

const defaults = kind === "tcp"
  ? { name: `TCP ${year}`, label: "TCP", place: "Varias sedes en todo Chile" }
  : { name: `ICPC South America/South Finals ${year}`, label: "Regional", place: "" };

const name = await ask("Nombre", { fallback: defaults.name });
const place = await ask("Lugar (institución y ciudad)", { fallback: defaults.place, validate: (v) => (v ? null : "Falta el lugar.") });
const startText = await ask("Inicio de la competencia, hora de Chile (AAAA-MM-DD HH:MM)", {
  validate: (v) => (chileTimestamp(v) ? null : "Usa el formato 2027-11-06 14:00."),
});
const start = chileTimestamp(startText);
const durationHours = await ask("Duración en horas", { fallback: "5", validate: (v) => (+v > 0 ? null : "Escribe un número de horas.") });
const end = new Date(new Date(start).getTime() + +durationHours * 3600_000);
const endText = chileTimestamp(
  new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(end),
);
const startDay = capitalize(dayFormat.format(new Date(start)).replace(",", ""));
const dates = await ask("Fechas, como se muestran en el sitio", { fallback: `${startDay} de ${year}` });
const deadline = await ask("Plazo de inscripción, en texto (p. ej. 20 de octubre)", { validate: (v) => (v ? null : "Falta el plazo.") });
const summary = await ask("Resumen de una o dos frases para la portada", { validate: (v) => (v ? null : "Falta el resumen.") });
rl.close();

const values = {
  __NOMBRE__: quote(name),
  __TIPO__: kind,
  __ETIQUETA__: defaults.label,
  __RESUMEN__: quote(summary),
  __LUGAR__: quote(place),
  __FECHAS__: quote(dates),
  __INICIO__: start,
  __TERMINO__: endText,
  __PLAZO__: quote(deadline),
  __DIA__: quote(startDay),
  __HORA__: startText.slice(11),
  __DESCRIPCION__: summary,
};
let text = readFileSync(TEMPLATE, "utf8");
// Drop the template's instructions header; keep the per-field comments
text = text.replace(/^---\n# ─+[\s\S]*?# ─+\n\n/, "---\n");
for (const [token, value] of Object.entries(values)) text = text.replaceAll(token, value);
// Values change line lengths: keep one consistent gap before inline comments
text = text.replace(/^(?![ \t]*#)([^\n]*?\S)[ \t]{2,}(# [^\n]*)$/gm, "$1  $2");
// Inside the FAQ example comment, keep the plain name
text = text.replaceAll(`**¿Cuándo es el ${quote(name)}?**`, `**¿Cuándo es el ${name}?**`);
writeFileSync(file, text);

console.log(`\nCreado ${file}. Probando que el sitio se construya...`);
const build = spawnSync("npx", ["@11ty/eleventy", "--dryrun", "--quiet"], { encoding: "utf8" });
if (build.status !== 0) {
  const message = (build.stderr || build.stdout).split("\n").find((l) => l.includes("[contests]")) ?? build.stderr;
  console.log(`\n✗ El sitio no se pudo construir:\n${message}\n\nSe eliminó ${file} para no dejar un archivo roto.`);
  unlinkSync(file);
  process.exit(1);
}
console.log(`✓ Listo. Revisa ${file} para agregar el resto (tarjetas, agenda, sedes, enlaces) y prueba con npm start.\n`);
