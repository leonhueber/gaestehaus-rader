import { allowsExtraGuest, seasonalRates, type Accommodation } from '$lib/data/accommodations';
import type { Lang } from '$lib/i18n';

const localeToLanguageTag: Record<Lang, string> = {
	de: 'de-AT',
	en: 'en',
};

const defaultVacationImagePaths = [
	'/images/Haus/gaestehaus-sommer.jpg',
	'/images/Haus/balkon-ausblick-winter.jpg',
	'/images/Haus/gaestehaus-balkon-ausblick.jpg',
	'/images/Haus/familie-hueber.jpg',
	'/images/Haus/weissbriach-kirche.jpg',
	'/images/Haus/gaestehaus-pavillon.jpg',
	'/images/Haus/gaestehaus-winter-ansicht.jpg',
	'/images/Haus/gaestehaus-tischtennis.jpg',
	'/images/Haus/gaestehaus-winter.png',
];

const geoCoordinates = {
	'@type': 'GeoCoordinates',
	latitude: 46.688407,
	longitude: 13.2549914,
} as const;

export const BUSINESS_SAME_AS = [
	'https://maps.app.goo.gl/cXgd5iJbYPmSx2ad9',
	'https://www.booking.com/Share-deqca7p',
	'https://www.airbnb.at/users/profile/1470215552721931790',
	'https://nlw.at/de/Unterkunft-finden/Reise-planen/Unterkuenfte/unterkuenfte/KTN/ee29ea3d-3203-4fc3-8e2a-2b996f9f66a1/gaestehaus-rader---fam--herold-hueber',
];

export const BUSINESS_AREA_SERVED = [
	{ '@type': 'Place', name: 'Weißbriach' },
	{ '@type': 'Place', name: 'Gitschtal' },
	{ '@type': 'Place', name: 'Kärnten' },
	{ '@type': 'Place', name: 'Lake Weissensee' },
	{ '@type': 'Place', name: 'Nassfeld' },
] as const;

export const LODGING_BUSINESS_CORE = {
	priceRange: '€€',
	currenciesAccepted: 'EUR',
	paymentAccepted: 'Cash, bank transfer',
	availableLanguage: ['German', 'English'],
	areaServed: BUSINESS_AREA_SERVED,
	checkinTime: '14:00',
	checkoutTime: '10:00',
	petsAllowed: false,
} as const;

type BreadcrumbItem = {
	name: string;
	path: string;
};

type FaqQuestion = {
	question: string;
	answer: string;
};

type VacationRentalSchemaOptions = {
	translate: (key: string) => string;
	accommodation: Accommodation;
	locale: Lang;
	pageUrl: string;
	siteOrigin: string;
	imagePaths: string[];
	amenityLabels: string[];
	description: string;
	mainEntityOfPage?: string;
};

const toAbsoluteUrl = (pathOrUrl: string, siteOrigin: string) => {
	if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
		return pathOrUrl;
	}

	return new URL(pathOrUrl, siteOrigin).toString();
};

const parseGuestCapacity = (guestText: string) => {
	const rangeMatch = guestText.match(/(\d+)\s*-\s*(\d+)/);
	if (rangeMatch) {
		const minValue = Number.parseInt(rangeMatch[1], 10);
		const maxValue = Number.parseInt(rangeMatch[2], 10);
		return {
			minValue,
			maxValue,
			value: maxValue,
		};
	}

	const singleMatch = guestText.match(/(\d+)/);
	if (singleMatch) {
		const value = Number.parseInt(singleMatch[1], 10);
		return { minValue: value, maxValue: value, value };
	}

	return null;
};

const countGalleryCategory = (
	accommodation: Accommodation,
	categories: Array<Accommodation['images']['gallery'][number]['category']>
) =>
	accommodation.images.gallery.filter((image) => categories.includes(image.category)).length;

const buildAmenityFeatures = (amenityLabels: string[]) =>
	amenityLabels.map((name) => ({
		'@type': 'LocationFeatureSpecification',
		name,
		value: true,
	}));

const accommodationName = (accommodation: Accommodation, locale: Lang) =>
	locale === 'de'
		? `${accommodation.title} – ${accommodation.typeLabel[locale]} im Gästehaus Rader`
		: `${accommodation.title} – ${accommodation.typeLabel[locale]} at Guesthouse Rader`;

const buildVacationImages = (paths: string[], siteOrigin: string) => {
	const explicitImages = Array.from(new Set(paths.map((path) => toAbsoluteUrl(path, siteOrigin))));
	const fallbackImages = Array.from(
		new Set(defaultVacationImagePaths.map((path) => toAbsoluteUrl(path, siteOrigin)))
	).filter((path) => !explicitImages.includes(path));
	const absoluteImages = [...explicitImages];
	const minImages = 8;

	for (const fallbackImage of fallbackImages) {
		if (absoluteImages.length >= minImages) break;
		absoluteImages.push(fallbackImage);
	}

	while (absoluteImages.length < minImages && absoluteImages.length > 0) {
		absoluteImages.push(absoluteImages[absoluteImages.length - 1]);
	}

	return absoluteImages;
};

export const buildJsonLdGraph = (nodes: Record<string, unknown>[]) =>
	JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': nodes,
	});

export const buildBreadcrumbListSchema = (items: BreadcrumbItem[], siteOrigin: string) => ({
	'@type': 'BreadcrumbList',
	itemListElement: items.map((item, index) => ({
		'@type': 'ListItem',
		position: index + 1,
		name: item.name,
		item: toAbsoluteUrl(item.path, siteOrigin),
	})),
});

export const buildFaqPageSchema = (pageUrl: string, locale: Lang, questions: FaqQuestion[]) => ({
	'@type': 'FAQPage',
	'@id': `${pageUrl}#faq`,
	url: `${pageUrl}#faq`,
	inLanguage: localeToLanguageTag[locale],
	mainEntity: questions.map((item) => ({
		'@type': 'Question',
		name: item.question,
		acceptedAnswer: {
			'@type': 'Answer',
			text: item.answer,
		},
	})),
});

export const buildVacationRentalSchema = ({
	translate,
	accommodation,
	locale,
	pageUrl,
	siteOrigin,
	imagePaths,
	amenityLabels,
	description,
	mainEntityOfPage,
}: VacationRentalSchemaOptions) => {
	const guestCapacity = parseGuestCapacity(accommodation.attributes.guests[locale]);
	const amenityFeatures = buildAmenityFeatures(amenityLabels);
	const bedrooms = Math.max(1, countGalleryCategory(accommodation, ['sleeping']));
	const bathrooms = Math.max(1, countGalleryCategory(accommodation, ['bathroom', 'wc', 'shower']));
	const beds = guestCapacity?.maxValue ?? 1;
	const accommodationId = `${pageUrl}#accommodation`;
	const vacationRentalId = `${pageUrl}#vacation-rental`;

	const accommodationNode = {
		'@type': 'Accommodation',
		'@id': accommodationId,
		additionalType: 'https://schema.org/Apartment',
		name: accommodationName(accommodation, locale),
		accommodationCategory: accommodation.typeLabel[locale],
		floorLevel: accommodation.attributes.floor,
		bed: {
			'@type': 'BedDetails',
			numberOfBeds: beds,
		},
		numberOfBedrooms: bedrooms,
		numberOfBathroomsTotal: bathrooms,
		...(guestCapacity
			? {
				occupancy: {
					'@type': 'QuantitativeValue',
					value: guestCapacity.value,
					minValue: guestCapacity.minValue,
					maxValue: guestCapacity.maxValue,
				},
			}
			: {}),
		amenityFeature: amenityFeatures,
		floorSize: {
			'@type': 'QuantitativeValue',
			value: Number.parseFloat(accommodation.attributes.size.replace(',', '.')),
			unitCode: 'MTK',
		},
	};

	const rateConditions = [
		translate('room.detail.prices.note'),
		translate('rooms.page.pricing.tax') + ': ' + translate('rooms.page.pricing.tax.price') + '.',
		translate('room.detail.prices.minStay') + ': ' + translate('room.detail.card.facts.minStayValue') + '.',
	];
	if (allowsExtraGuest(accommodation)) {
		rateConditions.push(
			translate('room.detail.prices.extraPerson') + ': ' + translate('rooms.page.pricing.extraPrice') + ' / ' + translate('price.night') + '.',
			translate('rooms.page.pricing.kids')
		);
	}

	const offerNodes = seasonalRates(accommodation).map(({ season, price }) => ({
		'@type': 'Offer',
		'@id': pageUrl + '#offer-' + season,
		url: pageUrl,
		name: translate('experiences.nav.' + season) + ' – ' + translate('room.detail.prices.priceNight'),
		description: rateConditions.join(' '),
		itemOffered: { '@id': vacationRentalId },
		priceCurrency: 'EUR',
		price,
		priceSpecification: {
			'@type': 'UnitPriceSpecification',
			price,
			priceCurrency: 'EUR',
			valueAddedTaxIncluded: true,
			referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY', unitText: translate('price.night') },
		},
	}));

	const vacationRentalNode = {
		'@type': 'VacationRental',
		'@id': vacationRentalId,
		additionalType: 'https://schema.org/Apartment',
		name: accommodationName(accommodation, locale),
		description,
		url: pageUrl,
		...(mainEntityOfPage ? { mainEntityOfPage } : {}),
		identifier: accommodation.slug,
		image: buildVacationImages(imagePaths, siteOrigin),
		geo: geoCoordinates,
		containedInPlace: {
			'@id': `${siteOrigin}/#lodging`,
		},
		containsPlace: {
			'@id': accommodationId,
		},
		amenityFeature: amenityFeatures,
		offers: offerNodes.map((offer) => ({ '@id': offer['@id'] })),
	};

	return {
		vacationRentalId,
		accommodationId,
		vacationRentalNode,
		accommodationNode,
		offerNodes,
	};
};
