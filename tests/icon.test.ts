import { existsSync, readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";

const iconPath = new NodeURL("../app/icon.svg", import.meta.url);
const faviconPath = new NodeURL("../app/favicon.ico", import.meta.url);

describe("app icon", () => {
  it("replaces the default create-next-app favicon.ico with an SVG mark", () => {
    expect(existsSync(faviconPath)).toBe(false);
    expect(existsSync(iconPath)).toBe(true);
  });

  it("is a 32x32 rounded square, radius 7, filled #08090a", () => {
    const svg = readFileSync(iconPath, "utf8");
    expect(svg).toMatch(/<svg[^>]*\bwidth="32"/);
    expect(svg).toMatch(/<svg[^>]*\bheight="32"/);
    expect(svg).toMatch(/\brx="7"/);
    expect(svg).toMatch(/\bfill="#08090a"/);
  });

  it("shows 'gv' centred in white, in the mono font at weight 600", () => {
    const svg = readFileSync(iconPath, "utf8");
    expect(svg).toMatch(/>gv</);
    expect(svg).toMatch(/\bfill="#(fff|ffffff)"/i);
    expect(svg).toMatch(/font-family="ui-monospace, monospace"/);
    expect(svg).toMatch(/font-weight="600"/);
    expect(svg).toMatch(/text-anchor="middle"/);
  });
});
