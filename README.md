# Gabryel Veríssimo — Portfolio

A bold, dark-mode personal portfolio showcasing fintech backend projects, built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **Framer Motion** for smooth animations and modern design.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel (zero-config)

## How the Auto-Repos Engine Works

The portfolio automatically fetches and displays projects from your GitHub profile:

1. **Fetch**: On each build/revalidation, the app queries the GitHub API (`https://api.github.com/users/gabryelvs/repos`) for your repositories.
2. **Filter & Curate**: Only repositories tagged with the **`showcase`** topic are included (the `showcase` topic itself is stripped from the display).
3. **Sort**: Projects are ranked by stars (descending), then by last update date.
4. **Daily Refresh**: Next.js ISR (Incremental Static Regeneration) with `revalidate: 86400` automatically refreshes the page once daily.
5. **Fallback**: If the GitHub API is unavailable or returns an error, the app gracefully falls back to `data/projects.fallback.json`, ensuring the site stays live.
6. **Rate Limit**: Set the optional `GITHUB_TOKEN` environment variable to raise the GitHub API rate limit from 60 to 5000 requests/hour.

## Getting Started

### Install & Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test

```bash
npm test
```

### Build

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**: Ensure your portfolio repo is on GitHub.
2. **Import into Vercel**: Go to [vercel.com](https://vercel.com), click "Add New" > "Project", and select your repo. Vercel auto-detects Next.js and requires zero configuration.
3. **(Optional) Set `GITHUB_TOKEN`**: 
   - Generate a personal access token at [github.com/settings/tokens](https://github.com/settings/tokens) (public repo access is sufficient).
   - Add it to your Vercel project's **Environment Variables** as `GITHUB_TOKEN`.
4. **Deploy**: Your site is live. Vercel automatically redeploys on every push to the main branch.

**Live URL**: https://portfolio-liard-six-82.vercel.app/

## Curating Your Showcase

To include projects in your portfolio:

1. Go to each repository on GitHub.
2. Under **Settings** > **Topics**, add the tag `showcase`.
3. The portfolio will automatically fetch and display that project on the next build/ISR refresh (within 24 hours).

### Featured Projects

This portfolio currently showcases:

- **[payledger](https://github.com/gabryelvs/payledger)** — Double-entry payments & ledger API (FastAPI, PostgreSQL)
- **[fx-service](https://github.com/gabryelvs/fx-service)** — Async currency-exchange API with stale-fallback (FastAPI, Redis)
- **[webhook-dispatcher](https://github.com/gabryelvs/webhook-dispatcher)** — Reliable webhook delivery with queue, retries, and dead-letter handling (FastAPI, Redis)

## License

MIT
