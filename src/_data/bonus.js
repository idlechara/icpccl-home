// Hidden page settings (see lib/bonus.js). Exposes only hashes, never the key sequence.
import { loadBonus } from "../../lib/bonus.js";

export default function () {
  const bonus = loadBonus();
  if (!bonus.enabled) console.warn("[bonus] EASTER_EGG_KEYS no está definido: la página oculta no se construye.");
  return bonus;
}
