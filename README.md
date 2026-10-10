# Gästehaus Rader

Bilingual German/English website for the guesthouse in Weißbriach: apartments, local experiences, guest information and booking through an embedded Deskline widget. Built with SvelteKit 5, TypeScript, Vite, Tailwind and Lucide.

## Local development

Use Node.js 22, matching CI, and npm:

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open the URL printed by Vite (normally `http://127.0.0.1:5173/`). `npm run check` runs Svelte/type diagnostics; `node --test tests/*.test.cjs` runs the focused logic tests. Use `npm run build` for the static build and `npm run preview` to inspect it.

## Project map

- `src/routes/`: pages, shared layout and localized English routes under `en/`
- `src/lib/i18n.ts`, `src/lib/data/`: translations and shared content
- `src/lib/routing.ts`: locale mapping and base-aware links
- `src/lib/deskline.ts`, `src/lib/webmcp.ts`: booking integration and browser agent tools
- `src/app.css`, `tailwind.config.js`, `static/images/`: shared styling and images
- `src/lib/content-freshness.ts`: sitemap freshness metadata

## Deployment

The static adapter writes to `build/`. `.github/workflows/deploy.yml` builds and deploys GitHub Pages on pushes to `main` or manual dispatch. It configures the deployment base and site origin and currently marks Pages builds as previews. Check that workflow before changing deployment or indexing behavior; local development uses an empty base by default.

## Project documentation

- [AGENTS.md](AGENTS.md): implementation conventions and verification
- [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md): clean, modern visual direction
- [WEBSITE_USAGE.md](WEBSITE_USAGE.md): booking boundaries and unresolved operational questions
- [SEO freshness process](docs/seo-freshness-process.md): content review and sitemap dates

Keep each rule in its relevant document and link to it instead of duplicating it.
