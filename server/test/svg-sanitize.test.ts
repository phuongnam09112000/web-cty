import { describe, expect, it } from "vitest";
import { sanitizeSvg } from "../src/modules/media/svg-sanitize.js";

const wrap = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 10 10">${inner}</svg>`;

describe("sanitizeSvg", () => {
  it("removes script elements", () => {
    const out = sanitizeSvg(wrap('<script>alert(1)</script><path d="M0 0L10 10"/>'));
    expect(out).not.toContain("script");
    expect(out).not.toContain("alert");
    expect(out).toContain("<path");
  });

  it("removes event handler attributes", () => {
    const out = sanitizeSvg(wrap('<path onload="alert(1)" onclick="x()" d="M0 0L10 10"/>'));
    expect(out).not.toMatch(/onload|onclick/);
    expect(out).toContain('d="M0 0L10 10"');
  });

  it("removes foreignObject", () => {
    const out = sanitizeSvg(wrap('<foreignObject><div>hi</div></foreignObject><path d="M0 0"/>'));
    expect(out.toLowerCase()).not.toContain("foreignobject");
    expect(out).toContain("<path");
  });

  it("removes javascript hrefs", () => {
    const out = sanitizeSvg(wrap('<a href="javascript:alert(1)"><path d="M0 0"/></a>'));
    expect(out).not.toContain("javascript");
    expect(out).toContain("<path");
  });

  it("removes external hrefs", () => {
    const out = sanitizeSvg(wrap('<image href="https://x/a.png"/><use xlink:href="https://x/b.svg#a"/><path d="M0 0"/>'));
    expect(out).not.toContain("https://x");
    expect(out).toContain("<path");
  });

  it("keeps internal fragment references", () => {
    const out = sanitizeSvg(wrap('<defs><path id="a" d="M0 0"/></defs><use href="#a"/>'));
    expect(out).toContain('href="#a"');
  });

  it("keeps path geometry intact", () => {
    const out = sanitizeSvg(wrap('<path fill="#fff" d="M1 2L3 4Z"/>'));
    expect(out).toContain('d="M1 2L3 4Z"');
    expect(out).toContain('fill="#fff"');
    expect(out).toContain('viewBox="0 0 10 10"');
  });
});
