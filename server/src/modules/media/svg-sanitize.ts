import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const purifier = DOMPurify(new JSDOM("").window);

purifier.addHook("afterSanitizeAttributes", (node) => {
  for (const name of ["href", "xlink:href"]) {
    const value = node.getAttribute(name);
    if (value !== null && !value.trim().startsWith("#")) node.removeAttribute(name);
  }
});

export function sanitizeSvg(input: string): string {
  return purifier.sanitize(input, {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ["script", "foreignObject"],
    ADD_TAGS: ["use"],
    ADD_ATTR: ["xmlns:xlink"],
  });
}
