import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purifier = DOMPurify(window);

const COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
const URL_OPEN_PATTERN = /url\(/gi;
const RISKY_PATTERN = /\\|@import|image-set\s*\(|(?<![\w-])src\s*\(/i;

function hasExternalUrl(value: string): boolean {
  const text = value.replace(COMMENT_PATTERN, "");
  if (RISKY_PATTERN.test(text)) return true;
  for (const match of text.matchAll(URL_OPEN_PATTERN)) {
    const rest = text.slice(match.index + match[0].length);
    const target = rest.replace(/^[\s'"]+/, "");
    if (!target.startsWith("#")) return true;
  }
  return false;
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
    if (hasExternalUrl(style.textContent ?? "")) style.remove();
  }
  return new window.XMLSerializer().serializeToString(root);
}
