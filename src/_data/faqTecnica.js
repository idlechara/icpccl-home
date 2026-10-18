// Technical FAQ (/faq/tecnica/) from faq-tecnico.md (repo root). Format: see lib/content.js.

import { readFileSync } from "node:fs";
import { parseFaqFile, buildFaq } from "../../lib/content.js";

export default function () {
  return buildFaq(parseFaqFile(readFileSync("faq-tecnico.md", "utf8")));
}
