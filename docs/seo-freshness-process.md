# Content freshness and SEO

## Sitemap dates

`src/lib/content-freshness.ts` supplies an explicit `lastModified` date for each German canonical sitemap path; the English counterpart shares that date. Accommodation detail paths are derived from the accommodation data. `src/routes/sitemap.xml/+server.ts` validates entries when generating the sitemap.

- Update the matching date when substantive content changes: prices, amenities, policies, activities, guest-card benefits, contact details or legal text. Keep both languages consistent.
- Do not change dates for deployment, documentation-only work, formatting or refactoring without a content change.
- When adding or retiring a route, review locale mapping, canonical links, sitemap entries and redirects together. Follow the existing prerendered redirect pattern and verify its generated behavior on static hosting.

## Content review

- Before summer or winter, review the homepage and matching experience pages, guest-card benefits and external references.
- Before promoting events, verify dates and details. Use season-dependent wording when dates are unconfirmed.
- Use the existing review groups in the freshness metadata to organize the work; do not maintain a duplicate schedule here.

Start with `src/lib/data/experience.ts`, `src/lib/data/accommodations.ts`, `src/lib/i18n.ts` and the affected pages. Check facts and translations before recording a new date.

## Release checks

After content or route changes, update the relevant freshness entries, run `npm run check` and `npm run build`, then inspect `build/sitemap.xml` for expected URLs, language alternates and dates. Keep preview and production indexing settings distinct.
