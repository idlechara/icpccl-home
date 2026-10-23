// Main FAQ (/faq/): general questions from faq-tcp-icpc.md (repo root) plus the
// questions of each upcoming edition (ediciones/*/competencia.md). Format: see lib/content.js.

import { readFileSync } from "node:fs";
import { parseFaqFile, buildFaq } from "../../lib/content.js";
import loadContests from "./contests.js";

const FAQ_PATH = "faq-tcp-icpc.md";
const CONTESTS_GROUP_TITLE = "Próximas competencias";

export default function () {
  const groups = parseFaqFile(readFileSync(FAQ_PATH, "utf8"));

  const { upcoming } = loadContests();
  const contestSections = upcoming
    .filter((contest) => contest.questions.length)
    .map((contest) => ({ title: contest.faqTitle, id: contest.faqId, questions: contest.questions }));
  if (contestSections.length) groups.push({ title: CONTESTS_GROUP_TITLE, sections: contestSections });

  // Contest sections already use their own ids
  return buildFaq(groups, upcoming.map((contest) => contest.faqId));
}
