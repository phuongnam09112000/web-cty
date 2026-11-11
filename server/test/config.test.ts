import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

const valid = {
  DATABASE_URL: "mysql://u:p@127.0.0.1:3307/db",
  ADMIN_ORIGIN: "http://localhost:5173",
  ADMIN_GATEWAY_SECRET: "x".repeat(32),
  MEDIA_DIR: "/tmp/media",
};

describe("loadConfig", () => {
  it("applies defaults for port and cookieSecure", () => {
    const config = loadConfig(valid);
    expect(config.port).toBe(4000);
    expect(config.cookieSecure).toBe(false);
    expect(config.nodeEnv).toBe("development");
  });

  it("enables cookieSecure only for the string true", () => {
    expect(loadConfig({ ...valid, COOKIE_SECURE: "true" }).cookieSecure).toBe(true);
    expect(loadConfig({ ...valid, COOKIE_SECURE: "1" }).cookieSecure).toBe(false);
  });

  it("lists every missing variable", () => {
    expect(() => loadConfig({ ADMIN_ORIGIN: valid.ADMIN_ORIGIN })).toThrow(
      /DATABASE_URL[\s\S]*ADMIN_GATEWAY_SECRET|ADMIN_GATEWAY_SECRET[\s\S]*DATABASE_URL/,
    );
  });

  it("rejects a gateway secret shorter than 32 characters", () => {
    expect(() => loadConfig({ ...valid, ADMIN_GATEWAY_SECRET: "short" })).toThrow(
      /ADMIN_GATEWAY_SECRET/,
    );
  });

  it("rejects an admin origin that is not an http(s) URL", () => {
    expect(() => loadConfig({ ...valid, ADMIN_ORIGIN: "ftp://example.com" })).toThrow(
      /ADMIN_ORIGIN/,
    );
    expect(() => loadConfig({ ...valid, ADMIN_ORIGIN: "not a url" })).toThrow(/ADMIN_ORIGIN/);
  });
});
