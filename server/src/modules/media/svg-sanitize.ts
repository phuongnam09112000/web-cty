import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purifier = DOMPurify(window);

const URL_PATTERN = /url\(\s*(['"]?)\s*([^)'"]*?)\s*\1\s*\)/gi;
const IMPORT_PATTERN = /@import[^;{}]*;?/gi;
const RISKY_PATTERN = /\\|image-set\s*\(|(?<![\w-])src\s*\(/i;

function hasExternalUrl(value: string): boolean {
  if (/@import/i.test(value) || RISKY_PATTERN.test(value)) return true;
  for (const match of value.matchAll(URL_PATTERN)) {
    if (!(match[2] ?? "").startsWith("#")) return true;
  }
  return false;
}

function cleanStyleText(text: string): string | null {
  if (RISKY_PATTERN.test(text)) return null;
  return text
    .replace(IMPORT_PATTERN, "")
    .replace(URL_PATTERN, (whole, _quote: string, target: string) => (target.startsWith("#") ? whole : "url(#)"));
}

purifier.addHook("afterSanitizeAttributes", (node) => {
  for (const name of ["href", "xlink:href"]) {
    const value = node.getAttribute(name);
    if (value !== null && !value.trim().startsWith("#")) node.removeAttribute(name);
  }
  for (const attribute of Array.from(node.attributes)) {
    if (hasExternalUrl(attribute.value)) node.removeAttribute(attribute.name);
  }
});

export function sanitizeSvg(input: string): string {
  const body = purifier.sanitize(input, {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ["script", "foreignObject"],
    ADD_TAGS: ["use"],
    ADD_ATTR: ["xmlns:xlink"],
    RETURN_DOM: true,
  }) as unknown as Element;
  const root = body.querySelector("svg");
  if (!root) return "";
  for (const style of Array.from(root.querySelectorAll<Element>("style"))) {
    const cleaned = cleanStyleText(style.textContent ?? "");
    if (cleaned === null) style.remove();
    else style.textContent = cleaned;
  }
  return new window.XMLSerializer().serializeToString(root);
}
