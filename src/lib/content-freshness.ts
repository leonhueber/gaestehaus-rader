import type { Accommodation } from '$lib/data/accommodations';
import { todayInAustria } from '$lib/booking-search';

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
		lastModified: '2026-11-23',
		reviewGroup: 'core',
		notes: 'Published seasonal offer details for each apartment.',
	},
	'/unterkuenfte-preise': {
		lastModified: '2026-11-22',
		reviewGroup: 'accommodations',
		notes: 'Clarified that cancellation terms depend on the selected offer.',
	},
	'/erlebnisse': {
		lastModified: '2026-11-23',
		reviewGroup: 'activities',
		notes: 'Shortened the introduction and clarified the seasonal presentation.',
	},
	'/erlebnisse/sommer': {
		lastModified: '2026-11-23',
		reviewGroup: 'summer',
		notes: 'Reisskofel location and provider link corrected; unsupported fixed tour metrics removed and summit difficulty clarified.',
	},
	'/erlebnisse/winter': {
		lastModified: '2026-11-23',
		reviewGroup: 'winter',
		notes: 'Snowshoe experience located at Nassfeld with matching access point and provider link.',
	},
	'/faq': {
		lastModified: '2026-11-23',
		reviewGroup: 'guestcard',
		notes: 'Added a direct link to the guesthouse facts.',
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
		lastModified: '2026-11-23',
		reviewGroup: 'core',
		notes: 'Added a permanent contact link for direct enquiries.',
	},
	'/fakten': {
		lastModified: '2026-11-23',
		reviewGroup: 'trust',
		notes: 'Revised the introduction for guests.',
	},
	'/impressum': {
		lastModified: '2026-11-22',
		reviewGroup: 'legal',
		notes: 'Identified Astrid Hueber as the responsible operator.',
	},
	'/datenschutz': {
		lastModified: '2026-11-23',
		reviewGroup: 'legal',
		notes: 'Added the full English translation of the privacy policy.',
	},
	'/agb': {
		lastModified: '2026-11-23',
		reviewGroup: 'legal',
		notes: 'Added the full English translation of the terms.',
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
		lastModified: '2026-11-23',
		reviewGroup: 'accommodations',
		notes: 'Published seasonal offer details matching the visible pricing table.',
	}),
});

export const validateSitemapFreshnessEntries = (
	paths: string[],
	entries: Record<string, ContentFreshnessEntry>
) => {
	const errors: string[] = [];
	const today = todayInAustria();

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
