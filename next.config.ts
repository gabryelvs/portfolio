import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * Content-Security-Policy.
 *
 * `script-src`/`style-src` include `'unsafe-inline'` because the Next.js App
 * Router emits inline bootstrap/streaming scripts (and React sets inline style
 * attributes, e.g. the hero's animation-delay custom properties) that have no
 * stable hash across ISR revalidations, and a nonce-based policy would force
 * every page to render dynamically — defeating the static/ISR caching this site
 * relies on. Everything else is locked to `'self'`.
 * This is a deliberate, documented trade-off (see README "Security").
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // Cross-origin isolation: prevent other origins from sharing this site's
  // browsing context or embedding its resources (mitigates XS-Leaks / hotlinking).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

/**
 * Hosts that must redirect to the custom domain. Exact names only, so Vercel
 * preview deployments (portfolio-git-<branch>-….vercel.app) keep working.
 * The old vercel.app address is on CVs already sent, so it redirects rather
 * than disappearing.
 */
const REDIRECT_HOSTS = ["www.gabryelverissimo.dev", "portfolio-gabryelverissimo.vercel.app"];

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return REDIRECT_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://gabryelverissimo.dev/:path*",
      permanent: true,
    }));
  },
};

export default createMDX({})(nextConfig);
