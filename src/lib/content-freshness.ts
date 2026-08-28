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
		lastModified: '2026-04-25',
		reviewGroup: 'core',
		notes: 'Homepage hero, season teasers, trust elements, and Guest Card teaser reviewed.',
	},
	'/unterkuenfte-preise': {
		lastModified: '2026-04-25',
		reviewGroup: 'accommodations',
		notes: 'Accommodation overview and pricing presentation updated with current room content.',
	},
	'/erlebnisse': {
		lastModified: '2026-04-25',
		reviewGroup: 'activities',
		notes: 'Seasonal activities hub aligned with summer, winter, events, and Guest Card review.',
	},
	'/erlebnisse/sommer': {
		lastModified: '2026-04-25',
		reviewGroup: 'summer',
		notes: 'Summer activities and seasonal positioning reviewed.',
	},
	'/erlebnisse/winter': {
		lastModified: '2026-04-25',
		reviewGroup: 'winter',
		notes: 'Winter activities and seasonal positioning reviewed.',
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
		lastModified: '2026-03-25',
		reviewGroup: 'trust',
		notes: 'Contact and inquiry handoff content.',
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
		lastModified: '2026-02-20',
		reviewGroup: 'legal',
		notes: 'Privacy policy content.',
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
		lastModified: '2026-02-20',
		reviewGroup: 'legal',
		notes: 'Image credits.',
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
		lastModified: '2026-04-16',
		reviewGroup: 'accommodations',
		notes: 'Accommodation detail copy, galleries, and booking-specific room content reviewed.',
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
