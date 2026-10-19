import type { Accommodation } from '$lib/data/accommodations';

export type ReviewGroup =
	| 'core'
	| 'accommodations'
	| 'summer'
	| 'winter'
	| 'guestcard'
	| 'activities'
	| 'events'
	| 'trust'
	| 'legal';

export type ContentFreshnessEntry = {
	lastModified: string;
	reviewGroup: ReviewGroup;
	notes: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const staticFreshnessEntries: Record<string, ContentFreshnessEntry> = {
	'/': {
		lastModified: '2026-10-19',
		reviewGroup: 'core',
		notes: 'Nearby map section hidden, gallery introduction made season-neutral, and apartment cards reduced to names, key facts and base prices in both languages.',
	},
	'/unterkuenfte-preise': {
		lastModified: '2026-10-19',
		reviewGroup: 'accommodations',
		notes: 'Local tax aligned to EUR 4.50 per person aged 17 and over per night in both languages.',
	},
	'/erlebnisse': {
		lastModified: '2026-10-10',
		reviewGroup: 'activities',
		notes: 'Reisskofel and Nassfeld snowshoe access points, links and approach estimates aligned with the homepage map.',
	},
	'/erlebnisse/sommer': {
		lastModified: '2026-10-10',
		reviewGroup: 'summer',
		notes: 'Reisskofel location and provider link corrected; unsupported fixed tour metrics removed and summit difficulty clarified.',
	},
	'/erlebnisse/winter': {
		lastModified: '2026-10-10',
		reviewGroup: 'winter',
		notes: 'Snowshoe experience located at Nassfeld with matching access point and provider link.',
	},
	'/faq': {
		lastModified: '2026-04-25',
		reviewGroup: 'guestcard',
		notes: 'Guest Card FAQ and stay-related guidance reviewed.',
	},
	'/ueber-uns': {
		lastModified: '2026-02-21',
		reviewGroup: 'trust',
		notes: 'About page and host positioning.',
	},
	'/kontakt': {
		lastModified: '2026-10-10',
		reviewGroup: 'trust',
		notes: 'Google Maps activation now requires an explicit consent action after a localized privacy notice.',
	},
	'/buchen': {
		lastModified: '2026-01-22',
		reviewGroup: 'core',
		notes: 'Deskline booking handoff page.',
	},
	'/fakten': {
		lastModified: '2026-04-25',
		reviewGroup: 'trust',
		notes: 'Facts layer and machine-readable entity information reviewed.',
	},
	'/impressum': {
		lastModified: '2026-02-21',
		reviewGroup: 'legal',
		notes: 'Legal notice content.',
	},
	'/datenschutz': {
		lastModified: '2026-10-10',
		reviewGroup: 'legal',
		notes: 'Google Maps consent flow, OpenStreetMap and stored FOSSGIS routes documented in German and English.',
	},
	'/agb': {
		lastModified: '2026-01-22',
		reviewGroup: 'legal',
		notes: 'Terms and booking conditions.',
	},
	'/barrierefreiheit': {
		lastModified: '2026-01-22',
		reviewGroup: 'legal',
		notes: 'Accessibility statement.',
	},
	'/bildnachweise': {
		lastModified: '2026-10-10',
		reviewGroup: 'legal',
		notes: 'Image and map credits, including OpenStreetMap, FOSSGIS and Leaflet license.',
	},
};

const buildAccommodationEntries = (
	rooms: Accommodation[],
	entry: ContentFreshnessEntry
): Record<string, ContentFreshnessEntry> =>
	Object.fromEntries(
		rooms.map((room) => [`/unterkuenfte-preise/${room.slug}`, entry])
	);

export const getSitemapFreshnessEntries = (rooms: Accommodation[]): Record<string, ContentFreshnessEntry> => ({
	...staticFreshnessEntries,
	...buildAccommodationEntries(rooms, {
		lastModified: '2026-10-19',
		reviewGroup: 'accommodations',
		notes: 'Local tax aligned to EUR 4.50 per person aged 17 and over per night in both languages.',
	}),
});

export const validateSitemapFreshnessEntries = (
	paths: string[],
	entries: Record<string, ContentFreshnessEntry>
) => {
	const errors: string[] = [];
	const today = new Date().toISOString().slice(0, 10);

	for (const path of paths) {
		const entry = entries[path];
		if (!entry) {
			errors.push(`Missing freshness entry for ${path}`);
			continue;
		}

		if (!DATE_RE.test(entry.lastModified)) {
			errors.push(`Invalid lastModified format for ${path}: ${entry.lastModified}`);
		}

		if (entry.lastModified > today) {
			errors.push(`Future lastModified for ${path}: ${entry.lastModified}`);
		}
	}

	for (const path of Object.keys(entries)) {
		if (!paths.includes(path)) {
			errors.push(`Freshness entry exists for non-sitemap path ${path}`);
		}
	}

	if (errors.length > 0) {
		throw new Error(`Sitemap freshness validation failed:\n${errors.join('\n')}`);
	}
};
