import { accommodations, accommodationBySlug } from '$lib/data/accommodations';
import {
	activityFilters,
	experienceEvents,
	experienceFestivalSection,
	type ActivityFilterKey,
	type Difficulty,
	type SeasonKey,
} from '$lib/data/experience';
import { guesthouseFacts } from '$lib/data/facts';
import type { Lang } from '$lib/i18n';
import { getLocaleFromPathname, localizePath } from '$lib/routing';

type JsonSchema = Record<string, unknown>;

type SiteTool = {
	name: string;
	description: string;
	inputSchema: JsonSchema;
	annotations?: {
		readOnlyHint?: boolean;
	};
	execute: (input?: unknown) => unknown | Promise<unknown>;
};

type ModelContext = {
	registerTool: (tool: SiteTool) => void | Promise<void>;
};

type WebMcpDocument = Document & {
	modelContext?: ModelContext;
};

type InputRecord = Record<string, unknown>;

const VALID_SEASONS = ['summer', 'winter'] as const satisfies readonly SeasonKey[];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const satisfies readonly Difficulty[];
const VALID_ACTIVITIES = activityFilters.map((filter) => filter.id);
const VALID_AMENITIES = [
	'balcony',
	'tv',
	'kitchen',
	'sofa_bed',
	'wifi',
	'bathroom',
] as const;
type AmenityKey = (typeof VALID_AMENITIES)[number];
const amenityContentIds: Record<AmenityKey, string> = {
	balcony: 'balkon',
	tv: 'fernseher',
	kitchen: 'kueche',
	sofa_bed: 'ausziehcouch',
	wifi: 'wifi',
	bathroom: 'badezimmer',
};
const VALID_APARTMENT_SLUGS = accommodations.map((accommodation) => accommodation.slug);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const amenityLabels: Record<string, Record<Lang, string>> = {
	balkon: { de: 'Balkon', en: 'Balcony' },
	fernseher: { de: 'Fernseher', en: 'TV' },
	kueche: { de: 'Küche', en: 'Kitchen' },
	ausziehcouch: { de: 'Ausziehcouch', en: 'Sofa bed' },
	wifi: { de: 'WLAN', en: 'Wi-Fi' },
	badezimmer: { de: 'Badezimmer', en: 'Bathroom' },
};

const difficultyLabels: Record<Difficulty, Record<Lang, string>> = {
	easy: { de: 'Leicht', en: 'Easy' },
	medium: { de: 'Mittel', en: 'Moderate' },
	hard: { de: 'Schwer', en: 'Hard' },
};

const experiencePaths: Record<SeasonKey, string> = {
	summer: '/erlebnisse/sommer',
	winter: '/erlebnisse/winter',
};

let registrationPromise: Promise<boolean> | null = null;

const currentLanguage = (): Lang => getLocaleFromPathname(window.location.pathname);

const localizedUrl = (path: string) =>
	new URL(localizePath(path, window.location.pathname), window.location.origin).toString();

const asInputRecord = (input: unknown): InputRecord | null => {
	if (input === undefined) return {};
	if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
	return input as InputRecord;
};

const invalidInput = (message: string) => ({
	ok: false,
	error: 'invalid_input',
	message,
});

const isIntegerInRange = (value: unknown, minimum: number, maximum: number): value is number =>
	typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum;

const isValidDate = (value: unknown): value is string => {
	if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const maximumGuests = (guestsLabel: string) => {
	const values = guestsLabel.match(/\d+/g)?.map(Number) ?? [];
	return values.length > 0 ? Math.max(...values) : 0;
};

const getGuesthouseFacts = () => {
	const language = currentLanguage();

	return {
		ok: true,
		language,
		guesthouse: {
			name: guesthouseFacts.name,
			address: guesthouseFacts.address.formatted[language],
			coordinates: guesthouseFacts.geo,
			phoneNumbers: guesthouseFacts.phones,
			email: guesthouseFacts.email,
			apartmentCount: guesthouseFacts.apartmentCount,
			checkIn: language === 'de' ? guesthouseFacts.checkIn : guesthouseFacts.checkInEn,
			checkOut: language === 'de' ? guesthouseFacts.checkOut : guesthouseFacts.checkOutEn,
			parking:
				language === 'de'
					? 'Kostenfreie Parkplätze direkt vor dem Gästehaus'
					: 'Free parking directly in front of the guesthouse',
			wifi:
				language === 'de'
					? 'Kostenloses Highspeed-WLAN in allen Appartements'
					: 'Free high-speed Wi-Fi in all apartments',
			petsAllowed: false,
		},
		links: {
			booking: localizedUrl(guesthouseFacts.bookingUrl),
			contact: localizedUrl(guesthouseFacts.contactUrl),
			facts: localizedUrl('/fakten'),
			map: guesthouseFacts.mapUrl,
		},
		frequentlyAskedQuestions: guesthouseFacts.faq.map((item) => ({
			question: item.question[language],
			answer: item.answer[language],
		})),
	};
};

const recommendApartments = (input?: unknown) => {
	const values = asInputRecord(input);
	if (!values) return invalidInput('Input must be an object.');
	const guestCount = values.guests;
	if (!isIntegerInRange(guestCount, 1, 10)) {
		return invalidInput('guests must be an integer between 1 and 10.');
	}

	const requestedAmenities = values.amenities ?? [];
	if (
		!Array.isArray(requestedAmenities) ||
		!requestedAmenities.every((amenity) => typeof amenity === 'string')
	) {
		return invalidInput('amenities must be an array of supported amenity identifiers.');
	}

	const unknownAmenities = requestedAmenities.filter(
		(amenity) => !VALID_AMENITIES.includes(amenity as AmenityKey)
	);
	if (unknownAmenities.length > 0) {
		return invalidInput(`Unsupported amenities: ${unknownAmenities.join(', ')}.`);
	}

	const language = currentLanguage();
	const matches = accommodations
		.filter((accommodation) => maximumGuests(accommodation.attributes.guests.de) >= guestCount)
		.filter((accommodation) =>
			requestedAmenities.every((amenity) =>
				accommodation.amenities.includes(amenityContentIds[amenity as AmenityKey])
			)
		)
		.sort((left, right) => left.pricePerNightBase - right.pricePerNightBase)
		.map((accommodation) => ({
			id: accommodation.slug,
			title: accommodation.title,
			summary: accommodation.subtitle[language],
			maximumGuests: maximumGuests(accommodation.attributes.guests.de),
			size: accommodation.attributes.size,
			view: accommodation.attributes.view[language],
			fromPricePerNightEur: accommodation.pricePerNightBase,
			amenities: accommodation.amenities.map((amenity) => {
				const id = Object.entries(amenityContentIds).find(
					([, contentId]) => contentId === amenity
				)?.[0];
				return {
					id: id ?? amenity,
					label: amenityLabels[amenity]?.[language] ?? amenity,
				};
			}),
			detailsUrl: localizedUrl(`/unterkuenfte-preise/${accommodation.slug}`),
		}));

	return {
		ok: true,
		language,
		criteria: {
			guests: guestCount,
			amenities: requestedAmenities,
		},
		matches,
		availabilityChecked: false,
		priceNotice:
			language === 'de'
				? 'Die Preise sind Basispreise. Live-Verfügbarkeit und Endpreis werden beim Buchungspartner geprüft.'
				: 'Prices are base rates. Live availability and the final price are checked by the booking partner.',
		bookingUrl: localizedUrl('/buchen'),
		contactUrl: localizedUrl('/kontakt'),
	};
};

const findExperiences = (input?: unknown) => {
	const values = asInputRecord(input);
	if (!values) return invalidInput('Input must be an object.');

	if (values.season !== undefined && !VALID_SEASONS.includes(values.season as SeasonKey)) {
		return invalidInput('season must be summer or winter.');
	}
	if (
		values.activity !== undefined &&
		!VALID_ACTIVITIES.includes(values.activity as ActivityFilterKey)
	) {
		return invalidInput(`activity must be one of: ${VALID_ACTIVITIES.join(', ')}.`);
	}
	if (
		values.difficulty !== undefined &&
		!VALID_DIFFICULTIES.includes(values.difficulty as Difficulty)
	) {
		return invalidInput('difficulty must be easy, medium, or hard.');
	}
	if (
		values.maxDriveMinutes !== undefined &&
		!isIntegerInRange(values.maxDriveMinutes, 0, 180)
	) {
		return invalidInput('maxDriveMinutes must be an integer between 0 and 180.');
	}
	if (values.indoor !== undefined && typeof values.indoor !== 'boolean') {
		return invalidInput('indoor must be a boolean.');
	}
	if (values.includeFestivals !== undefined && typeof values.includeFestivals !== 'boolean') {
		return invalidInput('includeFestivals must be a boolean.');
	}

	const language = currentLanguage();
	const season = values.season as SeasonKey | undefined;
	const activity = values.activity as ActivityFilterKey | undefined;
	const difficulty = values.difficulty as Difficulty | undefined;
	const maxDriveMinutes = values.maxDriveMinutes as number | undefined;
	const indoor = values.indoor as boolean | undefined;

	const matches = experienceEvents
		.filter((experience) => !season || experience.season === season)
		.filter((experience) => !activity || experience.activities.includes(activity))
		.filter((experience) => !difficulty || experience.difficulty === difficulty)
		.filter(
			(experience) =>
				maxDriveMinutes === undefined ||
				(experience.driveMinutes !== undefined && experience.driveMinutes <= maxDriveMinutes)
		)
		.filter((experience) => indoor === undefined || experience.indoor === indoor)
		.map((experience) => ({
			id: experience.id,
			season: experience.season,
			activities: experience.activities,
			title: experience.title[language],
			category: experience.kicker[language],
			description: experience.description?.[language] ?? null,
			location: experience.location?.[language] ?? null,
			driveMinutes: experience.driveMinutes ?? null,
			distanceKm: experience.distanceKm ?? null,
			durationHours: experience.durationHours ?? null,
			difficulty: experience.difficulty
				? {
						id: experience.difficulty,
						label: difficultyLabels[experience.difficulty][language],
					}
				: null,
			elevationGainM: experience.elevationGainM ?? null,
			seasonMonths: experience.seasonMonths ?? null,
			indoor: experience.indoor ?? null,
			sourceUrls: experience.links?.map((link) => link.url) ?? [],
			detailsPageUrl: localizedUrl(experiencePaths[experience.season]),
		}));

	const shouldIncludeFestivals =
		values.includeFestivals !== false &&
		(!season || season === 'summer') &&
		(!activity || activity === 'culture');

	const festivals = shouldIncludeFestivals
		? [
				{
					id: experienceFestivalSection.feature.id,
					title: experienceFestivalSection.feature.title[language],
					description: experienceFestivalSection.feature.body[language],
					season: experienceFestivalSection.feature.seasonBadge[language],
					location:
						language === 'de' ? 'Weißbriach und St. Lorenzen' : 'Weissbriach and St. Lorenzen',
					sourceUrl: experienceFestivalSection.eventInfoUrl,
				},
				...experienceFestivalSection.localEvents.map((festival) => ({
					id: festival.id,
					title: festival.title[language],
					description: festival.body[language],
					season: festival.seasonBadge[language],
					location: language === 'de' ? 'Gitschtal' : 'Gitschtal valley',
					sourceUrl: festival.url ?? experienceFestivalSection.eventInfoUrl,
				})),
				...experienceFestivalSection.regionalEvents.map((festival) => ({
					id: festival.id,
					title: festival.title[language],
					description: null,
					season: festival.seasonBadge[language],
					location: festival.location[language],
					sourceUrl: festival.url,
				})),
			]
		: [];

	return {
		ok: true,
		language,
		criteria: {
			season: season ?? null,
			activity: activity ?? null,
			difficulty: difficulty ?? null,
			maxDriveMinutes: maxDriveMinutes ?? null,
			indoor: indoor ?? null,
		},
		matches,
		festivals,
		eventsNotice:
			language === 'de'
				? 'Festtermine und Programme können sich jährlich ändern. Bitte vor dem Besuch beim Veranstalter prüfen.'
				: 'Festival dates and programmes can change each year. Check with the organiser before visiting.',
	};
};

const prepareBookingInquiry = (input?: unknown) => {
	const values = asInputRecord(input);
	if (!values) return invalidInput('Input must be an object.');
	if (!isValidDate(values.checkIn) || !isValidDate(values.checkOut)) {
		return invalidInput('checkIn and checkOut must be valid ISO dates in YYYY-MM-DD format.');
	}
	if (values.checkOut <= values.checkIn) {
		return invalidInput('checkOut must be after checkIn.');
	}
	if (!isIntegerInRange(values.adults, 1, 10)) {
		return invalidInput('adults must be an integer between 1 and 10.');
	}
	if (values.children !== undefined && !isIntegerInRange(values.children, 0, 10)) {
		return invalidInput('children must be an integer between 0 and 10.');
	}
	if (
		values.apartmentSlug !== undefined &&
		!VALID_APARTMENT_SLUGS.includes(values.apartmentSlug as string)
	) {
		return invalidInput(`apartmentSlug must be one of: ${VALID_APARTMENT_SLUGS.join(', ')}.`);
	}
	if (values.note !== undefined && (typeof values.note !== 'string' || values.note.length > 500)) {
		return invalidInput('note must be a string with at most 500 characters.');
	}

	const language = currentLanguage();
	const children = (values.children as number | undefined) ?? 0;
	const apartment =
		typeof values.apartmentSlug === 'string' ? accommodationBySlug(values.apartmentSlug) : undefined;
	const note = typeof values.note === 'string' ? values.note.trim() : '';
	const subject =
		language === 'de' ? 'Buchungsanfrage Gästehaus Rader' : 'Booking inquiry – Guesthouse Rader';

	const lines =
		language === 'de'
			? [
					'Guten Tag Familie Herold-Hueber,',
					'',
					'ich interessiere mich für einen Aufenthalt im Gästehaus Rader.',
					`Anreise: ${values.checkIn}`,
					`Abreise: ${values.checkOut}`,
					`Erwachsene: ${values.adults}`,
					`Kinder: ${children}`,
					...(apartment ? [`Wunsch-Appartement: ${apartment.title}`] : []),
					...(note ? ['', `Zusätzliche Nachricht: ${note}`] : []),
					'',
					'Könnten Sie mir bitte Verfügbarkeit und Preis mitteilen?',
				]
			: [
					'Hello Herold-Hueber family,',
					'',
					'I am interested in staying at Guesthouse Rader.',
					`Check-in: ${values.checkIn}`,
					`Check-out: ${values.checkOut}`,
					`Adults: ${values.adults}`,
					`Children: ${children}`,
					...(apartment ? [`Preferred apartment: ${apartment.title}`] : []),
					...(note ? ['', `Additional message: ${note}`] : []),
					'',
					'Could you please confirm availability and the price?',
				];

	const body = lines.join('\n');

	return {
		ok: true,
		language,
		subject,
		body,
		emailUrl: `mailto:${guesthouseFacts.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
		whatsappUrl: `https://wa.me/436766246826?text=${encodeURIComponent(body)}`,
		bookingUrl: localizedUrl('/buchen'),
		note:
			language === 'de'
				? 'Die Anfrage wurde nur vorbereitet und noch nicht versendet.'
				: 'The inquiry has only been prepared and has not been sent.',
	};
};

const openBooking = () => {
	const language = currentLanguage();
	const url = localizedUrl('/buchen');

	window.setTimeout(() => window.location.assign(url), 50);

	return {
		ok: true,
		status: 'opening',
		url,
		note:
			language === 'de'
				? 'Die Live-Verfügbarkeit und die endgültige Buchung erfolgen im eingebetteten Deskline-Buchungswidget.'
				: 'Live availability and final booking are completed in the embedded Deskline booking widget.',
	};
};

const siteTools: SiteTool[] = [
	{
		name: 'get_guesthouse_facts',
		description:
			'Return verified facts, contact details, stay policies, FAQs, and localized links for Guesthouse Rader.',
		inputSchema: {
			type: 'object',
			properties: {},
			additionalProperties: false,
		},
		annotations: { readOnlyHint: true },
		execute: getGuesthouseFacts,
	},
	{
		name: 'recommend_apartments',
		description:
			'Recommend Guesthouse Rader apartments by guest count and required amenities. Returns base prices only, not live availability.',
		inputSchema: {
			type: 'object',
			properties: {
				guests: {
					type: 'integer',
					minimum: 1,
					maximum: 10,
					description: 'Total number of guests, including adults and children.',
				},
				amenities: {
					type: 'array',
					items: { type: 'string', enum: VALID_AMENITIES },
					uniqueItems: true,
					description: 'Amenities that every returned apartment must provide.',
				},
			},
			required: ['guests'],
			additionalProperties: false,
		},
		annotations: { readOnlyHint: true },
		execute: recommendApartments,
	},
	{
		name: 'find_experiences',
		description:
			'Find activities, excursions, and optional local festivals around Guesthouse Rader using season, interest, difficulty, drive time, and indoor preferences.',
		inputSchema: {
			type: 'object',
			properties: {
				season: { type: 'string', enum: VALID_SEASONS },
				activity: { type: 'string', enum: VALID_ACTIVITIES },
				difficulty: { type: 'string', enum: VALID_DIFFICULTIES },
				maxDriveMinutes: { type: 'integer', minimum: 0, maximum: 180 },
				indoor: { type: 'boolean' },
				includeFestivals: {
					type: 'boolean',
					description: 'Include seasonal local and regional festivals where relevant. Defaults to true.',
				},
			},
			additionalProperties: false,
		},
		annotations: { readOnlyHint: true },
		execute: findExperiences,
	},
	{
		name: 'prepare_booking_inquiry',
		description:
			'Prepare localized email and WhatsApp links for a booking inquiry. This tool never sends the message.',
		inputSchema: {
			type: 'object',
			properties: {
				checkIn: { type: 'string', format: 'date', description: 'Arrival date in YYYY-MM-DD format.' },
				checkOut: { type: 'string', format: 'date', description: 'Departure date in YYYY-MM-DD format.' },
				adults: { type: 'integer', minimum: 1, maximum: 10 },
				children: { type: 'integer', minimum: 0, maximum: 10 },
				apartmentSlug: { type: 'string', enum: VALID_APARTMENT_SLUGS },
				note: { type: 'string', maxLength: 500 },
			},
			required: ['checkIn', 'checkOut', 'adults'],
			additionalProperties: false,
		},
		annotations: { readOnlyHint: true },
		execute: prepareBookingInquiry,
	},
	{
		name: 'open_booking',
		description:
			'Navigate the current top-level page to the localized live booking page. The guest completes availability checks and booking in the visible Deskline widget.',
		inputSchema: {
			type: 'object',
			properties: {},
			additionalProperties: false,
		},
		annotations: { readOnlyHint: false },
		execute: openBooking,
	},
];

const registerTools = async () => {
	if (typeof document === 'undefined') return false;

	const modelContext = (document as WebMcpDocument).modelContext;
	if (typeof modelContext?.registerTool !== 'function') return false;

	try {
		for (const tool of siteTools) {
			await modelContext.registerTool(tool);
		}
		return true;
	} catch {
		return false;
	}
};

export const registerSiteTools = () => {
	registrationPromise ??= registerTools();
	return registrationPromise;
};
