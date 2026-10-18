import * as pagefind from "pagefind";
import { existsSync } from "node:fs";
import { loadBonus } from "./lib/bonus.js";
import loadSite from "./src/_data/site.js";

export default function (eleventyConfig) {
  // Static files served as-is (PDFs, images, etc.)
  eleventyConfig.addPassthroughCopy("src/**/*.pdf");
  eleventyConfig.addPassthroughCopy("src/**/*.{png,jpg,jpeg,svg,webp,ico}");

  // Files in dev/ (placeholders) are only served by the dev server, never published
  if (loadSite().dev) eleventyConfig.addPassthroughCopy({ dev: "/" });

  // Hidden page photo and text (content.json), copied next to the page at its secret path
  // (see lib/bonus.js). They're not in git: CI builds skip them and the copies already
  // in the bucket are kept.
  const bonus = loadBonus();
  for (const file of ["photo.jpg", "content.json"]) {
    if (bonus.enabled && existsSync(`bonus/${file}`)) {
      eleventyConfig.addPassthroughCopy({ [`bonus/${file}`]: `${bonus.slug}/${file}` });
    }
  }

  // Content read by src/_data/faq.js and src/_data/contests.js
  eleventyConfig.addWatchTarget("faq-tcp-icpc.md");
  eleventyConfig.addWatchTarget("faq-tecnico.md");
  eleventyConfig.addWatchTarget("contests/");

  // Index for the search box in the nav, written to _site/pagefind/ after every build
  // (also with --serve). Only pages with data-pagefind-body (those using base.liquid) are
  // indexed, so the hidden page stays out of the results.
  eleventyConfig.on("eleventy.after", async ({ dir }) => {
    const { index, errors } = await pagefind.createIndex();
    if (!index) throw new Error(`Pagefind: ${errors.join(", ")}`);
    await index.addDirectory({ path: dir.output });
    await index.writeFiles({ outputPath: `${dir.output}/pagefind` });
    await pagefind.close();
  });
}

export const config = {
  dir: {
    input: "src",
    output: "_site",
  },
};
