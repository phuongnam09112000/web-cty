import { JSDOM } from "jsdom";
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

  it("removes external urls from style elements", () => {
    const out = sanitizeSvg(wrap('<style>@import url(https://evil.test/a.css); path{fill:url(https://evil.test/x#a)}</style><path d="M0 0"/>'));
    expect(out).not.toContain("evil.test");
    expect(out).not.toContain("@import");
  });

  it("removes external urls from CDATA style elements", () => {
    const out = sanitizeSvg(wrap('<style><![CDATA[@import "https://e.test/x.css";]]></style><path d="M0 0"/>'));
    expect(out).not.toContain("e.test");
    expect(out).not.toContain("@import");
  });

  it("removes external urls from style attributes", () => {
    const out = sanitizeSvg(wrap('<path d="M0 0" style="fill:url(https://evil.test/a);background:url(//evil.test/b)"/>'));
    expect(out).not.toContain("evil.test");
    expect(out).toContain("<path");
  });

  it.each(["fill", "mask", "filter", "stroke", "clip-path"])("removes external urls from the %s attribute", (name) => {
    const out = sanitizeSvg(wrap(`<path d="M0 0" ${name}="url(http://evil.test/x)"/>`));
    expect(out).not.toContain("evil.test");
    expect(out).toContain("<path");
  });

  it("keeps local url references", () => {
    const out = sanitizeSvg(wrap('<defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><style>path{fill:url(#g)}</style><path d="M0 0" fill="url(#g)"/>'));
    expect(out).toContain('fill="url(#g)"');
    expect(out).toContain("fill:url(#g)");
  });

  it("removes css escapes that could hide urls", () => {
    const out = sanitizeSvg(wrap('<style>path{fill:\\75rl(https://evil.test/x)}</style><path d="M0 0"/>'));
    expect(out).not.toContain("evil.test");
  });

  it("produces well-formed xml for non-breaking spaces and entities", () => {
    const out = sanitizeSvg(wrap("<text>a\u00a0b &amp; c</text>"));
    expect(out).not.toContain("&nbsp;");
    const doc = new JSDOM(out, { contentType: "image/svg+xml" }).window.document;
    expect(doc.getElementsByTagName("parsererror").length).toBe(0);
    expect(doc.querySelector("text")?.textContent).toBe("a\u00a0b & c");
  });

  it("accepts an xml declaration", () => {
    const out = sanitizeSvg('<?xml version="1.0" encoding="UTF-8"?>' + wrap('<path d="M0 0"/>'));
    expect(out).toContain("<path");
  });

  it.each([
    ['<style>path{fill:url("https://x.test/a)b")}</style>'],
    ['<style>path{fill:url("https://x.test/it\'s")}</style>'],
    ['<style>@font-face{font-family:f;src:url("https://x.test/f(1).woff")}</style>'],
    ["<style>path{fill:URL( 'https://x.test/a' )}</style>"],
    ["<style>path{fill:u/**/rl(https://x.test/a)}</style>"],
  ])("fails closed on quoted url() in style element %s", (style) => {
    const out = sanitizeSvg(wrap(`${style}<path d="M0 0"/>`));
    expect(out).not.toContain("x.test");
    expect(out).toContain("<path");
  });

  it.each([
    ["fill", `url("https://x.test/a)b")`],
    ["style", `fill:url("https://x.test/it's")`],
    ["style", `fill:url(&quot;https://x.test/a&quot;)`],
  ])("fails closed on quoted url() in %s attribute", (name, value) => {
    const escaped = value.replace(/&(?!quot;)/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    const out = sanitizeSvg(wrap(`<path d="M0 0" ${name}="${escaped}"/>`));
    expect(out).not.toContain("x.test");
    expect(out).toContain("<path");
  });

  it("keeps quoted local url references", () => {
    const out = sanitizeSvg(wrap('<style>path{fill:url("#g")}</style><path d="M0 0" fill="url( \'#g\' )"/>'));
    expect(out).toContain('url("#g")');
  });

  it.each([
    ['<style>text{font-family:"/*"}path{fill:url(https://x.test/a)}text{font-family:"*/"}</style>'],
    ['<style>@font-face{font-family:"/*";src:url(https://x.test/f.woff)}text{font-family:"*/"}</style>'],
  ])("is not fooled by comment markers inside strings in style element %s", (style) => {
    const out = sanitizeSvg(wrap(`${style}<path d="M0 0"/>`));
    expect(out).not.toContain("x.test");
    expect(out).toContain("<path");
  });

  it("is not fooled by comment markers inside strings in style attribute", () => {
    const out = sanitizeSvg(wrap('<path d="M0 0" style=\'font-family:"/*";fill:url(https://x.test/a);font-family:"*/"\'/>'));
    expect(out).not.toContain("x.test");
    expect(out).toContain("<path");
  });
});
