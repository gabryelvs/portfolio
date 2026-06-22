# Security Policy

## Reporting a vulnerability

If you discover a security issue in this project, please report it privately
rather than opening a public issue.

- **Email:** gabryelverissimo12@gmail.com
- Please include steps to reproduce, affected URL/route, and impact.
- I aim to acknowledge reports within **5 working days** and to provide a
  remediation timeline after triage.

Please act in good faith: avoid privacy violations, data destruction, and
service degradation while testing. Coordinated disclosure is appreciated —
allow a reasonable window to fix an issue before any public disclosure.

## Supported versions

This is a continuously deployed site; only the latest version on the `main`
branch (live at <https://portfolio-gabryelverissimo.vercel.app/>) is supported.

## Hardening in place

- HTTP security headers on every response: Content-Security-Policy, HSTS,
  `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors 'none'`,
  `Referrer-Policy`, `Permissions-Policy` (see `next.config.ts`).
- Static analysis via **CodeQL** (`security-and-quality` query suite) on every
  push and weekly.
- Dependency and GitHub Actions updates via **Dependabot**.
- No secrets, user accounts, or databases in this project; the GitHub API is
  queried server-side at build time only.
