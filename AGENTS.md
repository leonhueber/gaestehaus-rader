# Working on Gästehaus Rader

SvelteKit 5, TypeScript, Tailwind and `lucide-svelte`; statically built for GitHub Pages. See [README.md](README.md) for setup and the project map.

## Implementation

- Follow [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md): clean, modern and welcoming. Improve existing components before adding variants; simplify dated patterns instead of copying them.
- Reuse buttons and cards from `src/lib/components/ui/`; keep shared appearance in `ui/styles.ts`. See the design guidelines for component options and semantic usage.
- Use Svelte 5 runes, event attributes such as `onclick`, and `page` from `$app/state`. Use tabs for indentation.
- Keep routes prerender friendly. Access browser globals only in browser lifecycle code and clean up listeners, timers and external widgets on unmount.
- Use `$lib/routing` helpers for localized links and language switches; they handle translated routes and the deployment base. Use `resolve()` from `$app/paths` for fixed routes and `asset()` for static files. Do not add page-local `withBase()` helpers or manually concatenate locale prefixes.
- Keep German and English content consistent. Reuse `src/lib/i18n.ts` and `src/lib/data/` rather than duplicating facts. Allow long translations to wrap without clipping.
- Keep Deskline lifecycle logic in `src/lib/deskline.ts`. For booking changes, verify DE → EN → DE and leaving/returning to booking in a real browser; distinguish loader success from a usable form.
- Keep WebMCP tools aligned with visible site data, validate inputs, and clearly distinguish base prices and prepared inquiries from live availability or completed bookings.

## Verification

- Run `npm run check` for code changes and relevant tests with `node --test tests/*.test.cjs` for changed logic.
- Run `npm run build` when routes, assets, prerendering or deployment behavior change. Check generated output without committing incidental build artifacts.
- For UI changes, inspect mobile and desktop layouts, both languages, keyboard focus and loading/error states. Report any unverified behavior.
- For content changes, follow [docs/seo-freshness-process.md](docs/seo-freshness-process.md). For documentation-only edits, check accuracy and links; no application build is needed.
