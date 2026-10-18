// Markdown helpers shared by the data files in src/_data/.

import markdownIt from "markdown-it";

export const md = markdownIt({ html: false, linkify: true, typographer: true });

// Open external links in a new tab
const defaultLinkOpen =
  md.renderer.rules.link_open ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet("href") ?? "";
  if (/^https?:\/\//.test(href)) {
    tokens[idx].attrSet("target", "_blank");
    tokens[idx].attrSet("rel", "noreferrer");
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

// Inline code that is a hex color (`#D0021B`) gets a color swatch
const defaultCodeInline = md.renderer.rules.code_inline;
md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
  const content = tokens[idx].content;
  if (/^#[0-9a-f]{6}$/i.test(content)) {
    return `<code class="swatch"><span class="swatch__chip" style="background:${content}" aria-hidden="true"></span>${content}</code>`;
  }
  return defaultCodeInline(tokens, idx, options, env, self);
};

// ```mermaid blocks are drawn in the browser (see src/_includes/faq-list.liquid)
const defaultFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  if (token.info.trim() === "mermaid") return `<pre class="mermaid">${md.utils.escapeHtml(token.content)}</pre>\n`;
  return defaultFence(tokens, idx, options, env, self);
};

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ñ/g, "ni") // "año" → "anio", not "ano"
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const QUESTION = /^\*\*(.+)\*\*\s*$/;

export function isQuestion(line) {
  return QUESTION.test(line);
}

// Section intro: lines before its first question
export function parseSection(lines) {
  const first = lines.findIndex(isQuestion);
  const intro = (first === -1 ? lines : lines.slice(0, first)).filter((l) => !/^-{3,}\s*$/.test(l));
  return {
    introHtml: md.render(intro.join("\n").trim()),
    questions: first === -1 ? [] : parseQuestions(lines.slice(first)),
  };
}

// FAQ markdown file:
//   # Group            (the first H1 is the document title; "# Contacto" and
//                       everything after it is skipped: contacts live in the page)
//   ## Section
//   Intro text...      (optional, shown before the questions)
//   **Question?**      (a line that is entirely bold)
//   Answer markdown... (everything until the next question or heading)
export function parseFaqFile(source) {
  source = source.replace(/<!--[\s\S]*?-->/g, "");
  const groups = [];
  let group = null;
  let section = null;
  let seenTitle = false;

  for (const line of source.split("\n")) {
    const h1 = line.match(/^# (.+)$/);
    const h2 = line.match(/^## (.+)$/);

    if (h1) {
      if (!seenTitle) {
        seenTitle = true;
        continue;
      }
      if (slugify(h1[1]) === "contacto") break;
      group = { title: h1[1].trim(), sections: [] };
      section = null;
      groups.push(group);
    } else if (h2 && group) {
      section = { title: h2[1].trim(), lines: [] };
      group.sections.push(section);
    } else if (section) {
      section.lines.push(line);
    }
  }

  for (const g of groups) {
    for (const s of g.sections) {
      Object.assign(s, parseSection(s.lines));
      delete s.lines;
    }
  }
  return groups;
}

// Assigns unique ids (skipping `reservedIds`) and builds the FAQPage JSON-LD
export function buildFaq(groups, reservedIds = []) {
  const usedIds = new Set(reservedIds);
  const uniqueId = (text) => {
    let id = slugify(text);
    for (let n = 2; usedIds.has(id); n++) id = `${slugify(text)}-${n}`;
    usedIds.add(id);
    return id;
  };
  for (const group of groups) {
    group.id = uniqueId(group.title);
    for (const section of group.sections) {
      section.id ??= uniqueId(section.title);
      section.introHtml ??= "";
      for (const q of section.questions) q.id = uniqueId(q.text);
    }
  }

  const all = groups.flatMap((g) => g.sections.flatMap((s) => s.questions));
  const todos = all.filter((q) => /\[TODO/i.test(q.answerMarkdown));
  for (const q of todos) console.warn(`[faq] Pregunta con [TODO] pendiente: "${q.text}"`);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: all
      .filter((q) => !todos.includes(q))
      .map((q) => ({
        "@type": "Question",
        name: q.text,
        acceptedAnswer: { "@type": "Answer", text: q.html.trim() },
      })),
  }).replace(/</g, "\\u003c");

  const hasMermaid = all.some((q) => q.html.includes('class="mermaid"'));

  return { groups, jsonLd, hasMermaid };
}

// Questions are lines that are entirely bold; the answer is every line after it
// until the next question. Lines before the first question and "---" separators are ignored.
export function parseQuestions(lines) {
  const questions = [];
  let current = null;
  for (const line of lines) {
    const q = line.match(QUESTION);
    if (q) {
      current = { text: q[1].trim(), answer: [] };
      questions.push(current);
    } else if (current && !/^-{3,}\s*$/.test(line)) {
      current.answer.push(line);
    }
  }
  return questions.map(({ text, answer }) => {
    const answerMarkdown = answer.join("\n").trim();
    return { text, question: md.renderInline(text), answerMarkdown, html: md.render(answerMarkdown) };
  });
}
