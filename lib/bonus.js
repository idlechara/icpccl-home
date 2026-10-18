// Hidden page, reached by typing a secret key sequence on any page.
//
// The sequence comes from EASTER_EGG_KEYS (key names separated by spaces, as in
// KeyboardEvent.key: "ArrowLeft x 7 Space ..."). Neither the sequence nor the
// page URL is published: the page JS only gets a hash to recognize the sequence, and
// the browser derives the URL from the typed keys with a second, unrelated hash.
// Without EASTER_EGG_KEYS the page isn't built.

import { createHash } from "node:crypto";

// Passed to the browser code in src/_includes/base.liquid
export const CHECK_PREFIX = "icpccl:1:";
export const PATH_PREFIX = "icpccl:2:";
export const PATH_LENGTH = 16;
export const MIN_KEYS = 6;
export const MAX_KEYS = 24;

// Same normalization as the browser: letters lowercase, the space bar as "Space"
export function normalizeKey(key) {
  if (key === " ") return "Space";
  return key.length === 1 ? key.toLowerCase() : key;
}

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

export function loadBonus() {
  const raw = (process.env.EASTER_EGG_KEYS ?? "").trim();
  if (!raw) return { enabled: false };

  const keys = raw.split(/[\s,]+/).map(normalizeKey);
  if (keys.length < MIN_KEYS || keys.length > MAX_KEYS) {
    throw new Error(`[bonus] EASTER_EGG_KEYS debe tener entre ${MIN_KEYS} y ${MAX_KEYS} teclas (tiene ${keys.length})`);
  }
  const sequence = keys.join(" ");
  return {
    enabled: true,
    check: sha256(CHECK_PREFIX + sequence),
    slug: sha256(PATH_PREFIX + sequence).slice(0, PATH_LENGTH),
    checkPrefix: CHECK_PREFIX,
    pathPrefix: PATH_PREFIX,
    pathLength: PATH_LENGTH,
    minKeys: MIN_KEYS,
    maxKeys: MAX_KEYS,
  };
}
