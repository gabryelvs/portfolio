import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";

describe("host redirects", () => {
  it("sends www and the old vercel.app address to the custom domain, permanently, keeping the path", async () => {
    const redirects = await nextConfig.redirects!();
    const byHost = Object.fromEntries(
      redirects.map((r) => [r.has?.find((h) => h.type === "host")?.value, r]),
    );
    for (const host of ["www.gabryelverissimo.dev", "portfolio-gabryelverissimo.vercel.app"]) {
      const r = byHost[host];
      expect(r, host).toBeDefined();
      expect(r.source).toBe("/:path*");
      expect(r.destination).toBe("https://gabryelverissimo.dev/:path*");
      expect(r.permanent).toBe(true);
    }
  });

  it("never redirects preview deployments (only exact production hosts match)", async () => {
    const redirects = await nextConfig.redirects!();
    for (const r of redirects) {
      const host = r.has?.find((h) => h.type === "host")?.value ?? "";
      expect(host).not.toMatch(/[*()|]/);
    }
  });
});
