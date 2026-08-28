import type { RequestHandler } from './$types';
import { accommodations } from '$lib/data/accommodations';
import { getSitemapFreshnessEntries, validateSitemapFreshnessEntries } from '$lib/content-freshness';
import { SITE_ORIGIN } from '$lib/seo';
import { translatePathname } from '$lib/routing';

export const prerender = true;

const staticGermanPaths = [
	'/',
	'/unterkuenfte-preise',
	'/erlebnisse',
	'/erlebnisse/sommer',
	'/erlebnisse/winter',
	'/faq',
	'/ueber-uns',
	'/kontakt',
	'/buchen',
	'/fakten',
	'/impressum',
	'/datenschutz',
	'/agb',
	'/barrierefreiheit',
	'/bildnachweise',
] as const;

const dynamicGermanPaths = accommodations.map(
	(accommodation) => `/unterkuenfte-preise/${accommodation.slug}`
);

const allGermanPaths = [...staticGermanPaths, ...dynamicGermanPaths];
const freshnessEntries = getSitemapFreshnessEntries(accommodations);

validateSitemapFreshnessEntries(allGermanPaths, freshnessEntries);

const toAbsoluteUrl = (pathname: string) => new URL(translatePathname(pathname, 'de'), SITE_ORIGIN).toString();
const toEnglishUrl = (pathname: string) => new URL(translatePathname(pathname, 'en'), SITE_ORIGIN).toString();

export const GET: RequestHandler = async () => {
	const urls = allGermanPaths.flatMap((pathname) => {
		const lastmod = freshnessEntries[pathname]?.lastModified;
		if (!lastmod) {
			throw new Error(`Missing lastmod for sitemap path ${pathname}`);
		}

		return [
			{
				loc: toAbsoluteUrl(pathname),
				lastmod,
				alternates: [
					{ hreflang: 'de-AT', href: toAbsoluteUrl(pathname) },
					{ hreflang: 'en', href: toEnglishUrl(pathname) },
					{ hreflang: 'x-default', href: toAbsoluteUrl(pathname) },
				],
			},
			{
				loc: toEnglishUrl(pathname),
				lastmod,
				alternates: [
					{ hreflang: 'de-AT', href: toAbsoluteUrl(pathname) },
					{ hreflang: 'en', href: toEnglishUrl(pathname) },
					{ hreflang: 'x-default', href: toAbsoluteUrl(pathname) },
				],
			},
		];
	});

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
	.map(
		({ loc, lastmod, alternates }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
${alternates.map((alternate) => `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`).join('\n')}
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
		},
	});
};
