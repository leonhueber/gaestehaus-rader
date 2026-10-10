import type { Lang } from '$lib/i18n';

type Localized<T> = Record<Lang, T>;

export type AccommodationImageCategory =
	| 'living'
	| 'sleeping'
	| 'kitchen'
	| 'dining'
	| 'balcony'
	| 'view'
	| 'bathroom'
	| 'wc'
	| 'shower'
	| 'sink'
	| 'wellness'
	| 'other';

export type AccommodationGalleryImage = {
	src: string;
	category: AccommodationImageCategory;
	alt: Localized<string>;
};

export type Accommodation = {
	key: number;
	slug: string;
	title: string;
	subtitle: Localized<string>;
	seoTitle: Localized<string>;
	seoDescription: Localized<string>;
	detailHeading: Localized<string>;
	detailIntro: Localized<string>;
	description: Localized<string[]>;
	images: {
		main: string;
		gallery: AccommodationGalleryImage[];
	};
	attributes: {
		size: string;
		floor: string;
		view: Localized<string>;
		guests: Localized<string>;
	};
	amenities: string[];
	floorplanImage?: string;
	pricePerNightBase: number;
	priceMatrix: Array<{
		season: Localized<string>;
		period: Localized<string>;
		pricePerNight: string;
		minStay: Localized<string>;
		extraPerson: Localized<string>;
	}>;
	reviews: Array<{ name: string; rating: number; text: string; date?: string }>;
	cardMeta: Localized<string>;
	badgeLabel?: string | null;
	typeLabel: Localized<string>;
	detailMeta: Localized<string>;
	detailBody: Localized<string>;
};

const galleryCategorySortOrder: Record<AccommodationImageCategory, number> = {
	living: 10,
	sleeping: 20,
	kitchen: 30,
	dining: 40,
	balcony: 50,
	view: 60,
	bathroom: 70,
	wc: 71,
	shower: 72,
	sink: 73,
	wellness: 74,
	other: 90,
};

export const getSortedAccommodationGallery = (accommodation: Accommodation) =>
	(accommodation.images.gallery ?? []).slice().sort((left, right) => {
		const categoryOrder =
			galleryCategorySortOrder[left.category] - galleryCategorySortOrder[right.category];
		if (categoryOrder !== 0) return categoryOrder;
		return left.src.localeCompare(right.src);
	});

export const getAccommodationGallerySources = (accommodation: Accommodation) =>
	getSortedAccommodationGallery(accommodation).map((image) => image.src);

export const accommodations: Accommodation[] = [
	{
		key: 3,
		slug: 'nr-1',
		title: 'Nr. 1',
		subtitle: {
			de: 'Helle Ferienwohnung mit Balkon und Morgensonne',
			en: 'Bright apartment with balcony and morning sun',
		},
		seoTitle: {
			de: 'Ferienwohnung in Weißbriach für 1–3 Gäste mit Balkon | Gästehaus Rader',
			en: 'Apartment in Weissbriach for 1–3 guests with balcony | Guesthouse Rader',
		},
		seoDescription: {
			de: 'Ruhige Ferienwohnung in Weißbriach im Gitschtal für 1–3 Gäste mit Balkon, Morgensonne und Küche. Ideal für Urlaub nahe Weissensee und Nassfeld – jetzt Aufenthalt anfragen.',
			en: 'Quiet apartment in Weissbriach in the Gitschtal for 1–3 guests with balcony, morning sun and kitchen. A great base near Lake Weissensee and Nassfeld – enquire now.',
		},
		detailHeading: {
			de: 'Ferienwohnung in Weißbriach für 1–3 Gäste mit Balkon',
			en: 'Apartment in Weissbriach for 1–3 guests with balcony',
		},
		detailIntro: {
			de: 'Appartement Nr. 1 ist eine ruhige Ferienwohnung im Gästehaus Rader in Weißbriach im Gitschtal – ideal für Paare oder kleine Familien, die nahe Weissensee und Nassfeld wohnen und direkt buchen möchten.',
			en: 'Apartment No. 1 is a quiet holiday apartment at Guesthouse Rader in Weissbriach in the Gitschtal – ideal for couples or small families who want to stay near Lake Weissensee and Nassfeld and book directly.',
		},
		description: {
			de: [
				'Die helle Ferienwohnung kombiniert ruhige Lage, Morgensonne und einen privaten Balkon für entspannte Urlaubstage in Weißbriach.',
				'Sie eignet sich für 1–3 Gäste, die das Gitschtal als entspannte Basis für Ausflüge zum Weissensee, nach Nassfeld oder in die umliegende Bergwelt nutzen möchten.',
				'Zur Ausstattung gehören eine praktische Küche mit Sitzecke, ein Badezimmer mit Dusche und WC sowie ein Ostbalkon mit freundlichem Ausblick.',
			],
			en: [
				'This bright apartment combines a quiet setting, morning sun and a private balcony for relaxing holidays in Weissbriach.',
				'It suits 1–3 guests looking for a calm base in the Gitschtal with easy access to Lake Weissensee, Nassfeld and the surrounding mountains.',
				'Inside you will find a practical kitchen with dining nook, a bathroom with shower and toilet, and an east-facing balcony with a pleasant view.',
			],
		},
		images: {
			main: '/images/Nr1/main.jpg',
			gallery: [
				{
					src: '/images/Nr1/living-room.jpg',
					category: 'living',
					alt: {
						de: 'Wohnbereich im Appartement Nr. 1',
						en: 'Living area in Apartment Nr. 1',
					},
				},
				{
					src: '/images/Nr1/dining-room.jpg',
					category: 'dining',
					alt: {
						de: 'Essbereich im Appartement Nr. 1',
						en: 'Dining area in Apartment Nr. 1',
					},
				},
				{
					src: '/images/Nr1/balcony.jpg',
					category: 'balcony',
					alt: {
						de: 'Balkon im Appartement Nr. 1',
						en: 'Balcony in Apartment Nr. 1',
					},
				},
				{
					src: '/images/Nr1/balcony-seating.jpg',
					category: 'balcony',
					alt: {
						de: 'Sitzplatz am Balkon im Appartement Nr. 1',
						en: 'Balcony seating in Apartment Nr. 1',
					},
				},
				{
					src: '/images/Nr1/nr1-wc.png',
					category: 'wc',
					alt: {
						de: 'WC im Appartement Nr. 1',
						en: 'Toilet in Apartment Nr. 1',
					},
				},
			],
		},
		attributes: {
			size: '35 m²',
			floor: '1',
			view: {
				de: 'Osten',
				en: 'East',
			},
			guests: {
				de: '1-3 Personen',
				en: '1-3 guests',
			},
		},
		amenities: ['balkon', 'fernseher', 'kueche', 'ausziehcouch', 'wifi', 'badezimmer'],
		floorplanImage: '/images/Nr1/floorplan.png',
		pricePerNightBase: 75,
		priceMatrix: [
			{
				season: {
					de: 'Sommer',
					en: 'Summer',
				},
				period: {
					de: '01. Apr - 30. Sep',
					en: 'Apr 01 - Sep 30',
				},
				pricePerNight: '€ 75,-',
				minStay: {
					de: '3 Nächte',
					en: '3 nights',
				},
				extraPerson: {
					de: '€ 15,- pro Nacht',
					en: '€ 15,- per night',
				},
			},
			{
				season: {
					de: 'Winter',
					en: 'Winter',
				},
				period: {
					de: '20. Dez - 06. Jan',
					en: 'Dec 20 - Jan 06',
				},
				pricePerNight: '€ 85,-',
				minStay: {
					de: '3 Nächte',
					en: '3 nights',
				},
				extraPerson: {
					de: '€ 15,- pro Nacht',
					en: '€ 15,- per night',
				},
			},
		],
		reviews: [
			{
				name: 'Lenka',
				rating: 5,
				date: '2023-08-15',
				text:
					'Sehr gute Unterkunft in einem ruhigen Dorf. Die Besitzer sind tolle Leute, nett und hilfsbereit. Jedes Zimmer hatte eine Küche, was wir sehr zu schätzen wussten. Das Gästehaus Rader ist eine sehr gute Wahl für Familien mit Kindern. Das Haus war sauber und gut ausgestattet. Das Parken war völlig problemlos direkt neben dem Gästehaus.',
			},
		],
		cardMeta: {
			de: '35 m² · 1-3 Personen · Osten',
			en: '35 m² · 1-3 guests · East',
		},
		badgeLabel: null,
		typeLabel: {
			de: 'Appartement',
			en: 'Apartment',
		},
		detailMeta: {
			de: '35 m² · 1-3 Personen · Osten',
			en: '35 m² · 1-3 guests · East',
		},
		detailBody: {
			de: 'Ruhige Ferienwohnung in Weißbriach im Gitschtal mit Balkon und Morgensonne, Küche mit Sitzecke sowie Bad mit Dusche und WC – ideal für 1–3 Gäste nahe Weissensee und Nassfeld.',
			en: 'Quiet apartment in Weissbriach in the Gitschtal with balcony, morning sun, kitchen with dining nook and bathroom with shower and toilet – ideal for 1–3 guests near Lake Weissensee and Nassfeld.',
		},
	},
	{
		key: 2,
		slug: 'nr-2',
		title: 'Nr. 2',
		subtitle: {
			de: 'Charmante Dachgeschosswohnung mit Balkon',
			en: 'Charming top-floor apartment with balcony',
		},
		seoTitle: {
			de: 'Dachgeschoss-Appartement in Weißbriach mit Balkon für 1–3 Gäste | Gästehaus Rader',
			en: 'Top-floor apartment in Weissbriach with balcony for 1–3 guests | Guesthouse Rader',
		},
		seoDescription: {
			de: 'Gemütliches Dachgeschoss-Appartement in Weißbriach im Gitschtal für 1–3 Gäste mit Balkon, ruhiger Lage und Ost-West-Ausblick. Perfekt für Urlaub nahe Weissensee und Nassfeld.',
			en: 'Cozy top-floor apartment in Weissbriach in the Gitschtal for 1–3 guests with balcony, quiet setting and east-west views. Perfect for stays near Lake Weissensee and Nassfeld.',
		},
		detailHeading: {
			de: 'Dachgeschoss-Appartement in Weißbriach mit Balkon für 1–3 Gäste',
			en: 'Top-floor apartment in Weissbriach with balcony for 1–3 guests',
		},
		detailIntro: {
			de: 'Appartement Nr. 2 ist ein ruhiges Dachgeschoss-Appartement im Gästehaus Rader in Weißbriach – ideal für Gäste, die zwischen Gitschtal, Weissensee und Nassfeld komfortabel wohnen und direkt anfragen möchten.',
			en: 'Apartment No. 2 is a quiet top-floor apartment at Guesthouse Rader in Weissbriach – ideal for guests who want a comfortable base between the Gitschtal, Lake Weissensee and Nassfeld and prefer to book direct.',
		},
		description: {
			de: [
				'Das Dachgeschoss-Appartement verbindet alpine Gemütlichkeit mit lichtdurchfluteten Räumen und einem Balkon für entspannte Tage in ruhiger Lage.',
				'Dank Ausrichtung nach Osten und Westen genießen 1–3 Gäste Sonne zu verschiedenen Tageszeiten und einen angenehmen Ausgangspunkt für Urlaub im Gitschtal nahe Weissensee und Nassfeld.',
				'Zur Wohnung gehören eine praktische Küche mit Sitzecke, ein Badezimmer mit Dusche und WC sowie zwei gemütliche Schlafbereiche.',
			],
			en: [
				'This top-floor apartment combines alpine comfort with light-filled rooms and a balcony for relaxed days in a quiet setting.',
				'With east and west exposure, 1–3 guests enjoy sun at different times of day and an easy-going base in the Gitschtal close to Lake Weissensee and Nassfeld.',
				'The apartment includes a practical kitchen with dining nook, a bathroom with shower and toilet, and two cosy sleeping areas.',
			],
		},
		images: {
			main: '/images/Nr2/nr2-bedroom-double-bright.jpg',
			gallery: [
				{
					src: '/images/Nr2/nr2-living-room.jpg',
					category: 'living',
					alt: {
						de: 'Wohnbereich im Appartement Nr. 2',
						en: 'Living area in Apartment Nr. 2',
					},
				},
				{
					src: '/images/Nr2/nr2-bedroom-overview-bright.jpg',
					category: 'sleeping',
					alt: {
						de: 'Schlafbereich im Appartement Nr. 2',
						en: 'Sleeping area in Apartment Nr. 2',
					},
				},
				{
					src: '/images/Nr2/nr2-kitchen-living.jpg',
					category: 'kitchen',
					alt: {
						de: 'Küchenbereich im Appartement Nr. 2',
						en: 'Kitchen area in Apartment Nr. 2',
					},
				},
				{
					src: '/images/Nr2/nr2-living-dining-bright.jpg',
					category: 'dining',
					alt: {
						de: 'Wohn- und Essbereich im Appartement Nr. 2',
						en: 'Living and dining area in Apartment Nr. 2',
					},
				},
				{
					src: '/images/Nr2/nr2-balcony-seating.jpg',
					category: 'balcony',
					alt: {
						de: 'Balkon mit Sitzplatz im Appartement Nr. 2',
						en: 'Balcony seating in Apartment Nr. 2',
					},
				},
				{
					src: '/images/Haus/weissbriach-dorfblick-winter.jpg',
					category: 'view',
					alt: {
						de: 'Winterlicher Ausblick bei Appartement Nr. 2',
						en: 'Winter view near Apartment Nr. 2',
					},
				},
				{
					src: '/images/Nr2/nr2-bathroom.jpg',
					category: 'bathroom',
					alt: {
						de: 'Badezimmer im Appartement Nr. 2',
						en: 'Bathroom in Apartment Nr. 2',
					},
				},
			],
		},
		attributes: {
			size: '35 m²',
			floor: '1',
			view: {
				de: 'Osten/Westen',
				en: 'East/West',
			},
			guests: {
				de: '1-3 Personen',
				en: '1-3 guests',
			},
		},
		amenities: ['balkon', 'fernseher', 'kueche', 'wifi', 'badezimmer'],
		floorplanImage: '/images/Nr2/floorplan.png',
		pricePerNightBase: 75,
		priceMatrix: [
			{
				season: {
					de: 'Sommer',
					en: 'Summer',
				},
				period: {
					de: '01. Apr - 30. Sep',
					en: 'Apr 01 - Sep 30',
				},
				pricePerNight: '€ 75,-',
				minStay: {
					de: '3 Nächte',
					en: '3 nights',
				},
				extraPerson: {
					de: '€ 15,- pro Nacht',
					en: '€ 15,- per night',
				},
			},
			{
				season: {
					de: 'Winter',
					en: 'Winter',
				},
				period: {
					de: '20. Dez - 06. Jan',
					en: 'Dec 20 - Jan 06',
				},
				pricePerNight: '€ 85,-',
				minStay: {
					de: '3 Nächte',
					en: '3 nights',
				},
				extraPerson: {
					de: '€ 15,- pro Nacht',
					en: '€ 15,- per night',
				},
			},
		],
		reviews: [
			{
				name: 'Lenka',
				rating: 5,
				date: '2023-08-15',
				text:
					'Sehr gute Unterkunft in einem ruhigen Dorf. Die Besitzer sind tolle Leute, nett und hilfsbereit. Das Haus war sauber und gut ausgestattet. Parken problemlos direkt neben dem Gästehaus.',
			},
		],
		cardMeta: {
			de: '35 m² · 1-3 Personen · Osten/Westen',
			en: '35 m² · 1-3 guests · East/West',
		},
		badgeLabel: null,
		typeLabel: {
			de: 'Appartement',
			en: 'Apartment',
		},
		detailMeta: {
			de: '35 m² · 1-3 Personen · Osten/Westen',
			en: '35 m² · 1-3 guests · East/West',
		},
		detailBody: {
			de: 'Gemütliches Dachgeschoss-Appartement in Weißbriach im Gitschtal mit Balkon, Ost-West-Ausblick, Küche mit Sitzecke und Bad mit Dusche und WC – ideal für 1–3 Gäste nahe Weissensee und Nassfeld.',
			en: 'Cozy top-floor apartment in Weissbriach in the Gitschtal with balcony, east-west views, kitchen with dining nook and bathroom with shower and toilet – ideal for 1–3 guests near Lake Weissensee and Nassfeld.',
		},
	},
	{
		key: 1,
		slug: 'nr-3',
		title: 'Nr. 3',
		subtitle: {
			de: 'Sonnige Ferienwohnung mit Südbalkon und Gartenblick',
			en: 'Sunny apartment with south-facing balcony and garden view',
		},
		seoTitle: {
			de: 'Ferienwohnung in Weißbriach für 1–2 Gäste mit Südbalkon | Gästehaus Rader',
			en: 'Apartment in Weissbriach for 1–2 guests with south-facing balcony | Guesthouse Rader',
		},
		seoDescription: {
			de: 'Sonnige Ferienwohnung in Weißbriach im Gitschtal für 1–2 Gäste mit Südbalkon, Gartenblick und ruhiger Lage. Ideal für Paarurlaub nahe Weissensee und Nassfeld.',
			en: 'Sunny apartment in Weissbriach in the Gitschtal for 1–2 guests with south-facing balcony, garden view and quiet setting. Ideal for couples near Lake Weissensee and Nassfeld.',
		},
		detailHeading: {
			de: 'Ferienwohnung in Weißbriach für 1–2 Gäste mit Südbalkon',
			en: 'Apartment in Weissbriach for 1–2 guests with south-facing balcony',
		},
		detailIntro: {
			de: 'Appartement Nr. 3 ist eine sonnige Ferienwohnung im Gästehaus Rader in Weißbriach – perfekt für Paare oder zwei Gäste, die ruhig wohnen und Ausflüge zum Weissensee oder nach Nassfeld flexibel planen möchten.',
			en: 'Apartment No. 3 is a sunny holiday apartment at Guesthouse Rader in Weissbriach – perfect for couples or two guests who want a quiet stay with easy trips to Lake Weissensee or Nassfeld.',
		},
		description: {
			de: [
				'Diese Ferienwohnung ist ideal für 1–2 Gäste, die in Weißbriach ruhig wohnen und dennoch schnell in der Region unterwegs sein möchten.',
				'Der Südbalkon bringt viel Sonne, der Gartenblick sorgt für entspannte Stimmung und das Gitschtal bietet einen angenehmen Ausgangspunkt für Urlaub nahe Weissensee und Nassfeld.',
				'Mit praktischer Küche, gemütlicher Sitzecke und Bad mit Dusche/WC ist das Appartement besonders für Paarurlaub oder einen kompakten Alpenaufenthalt geeignet.',
			],
			en: [
				'This apartment is ideal for 1–2 guests who want a quiet stay in Weissbriach while remaining well connected to the region.',
				'The south-facing balcony brings in plenty of sun, the garden view adds a relaxed feel, and the Gitschtal is a pleasant base near Lake Weissensee and Nassfeld.',
				'With a practical kitchen, cosy dining nook and bathroom with shower/toilet, the apartment works especially well for couples or a compact alpine getaway.',
			],
		},
		images: {
			main: '/images/Nr3/main.jpg',
			gallery: [
				{
					src: '/images/Nr3/sofa.jpeg',
					category: 'living',
					alt: {
						de: 'Wohnbereich im Appartement Nr. 3',
						en: 'Living area in Apartment Nr. 3',
					},
				},
				{
					src: '/images/Nr3/bed.jpeg',
					category: 'sleeping',
					alt: {
						de: 'Schlafbereich im Appartement Nr. 3',
						en: 'Sleeping area in Apartment Nr. 3',
					},
				},
				{
					src: '/images/Nr3/kitchen-tools.jpeg',
					category: 'kitchen',
					alt: {
						de: 'Küchenbereich im Appartement Nr. 3',
						en: 'Kitchen area in Apartment Nr. 3',
					},
				},
				{
					src: '/images/Nr3/view.jpeg',
					category: 'view',
					alt: {
						de: 'Ausblick vom Appartement Nr. 3',
						en: 'View from Apartment Nr. 3',
					},
				},
				{
					src: '/images/Nr3/shoe-rack.jpeg',
					category: 'other',
					alt: {
						de: 'Eingangsbereich im Appartement Nr. 3',
						en: 'Entry area in Apartment Nr. 3',
					},
				},
				{
					src: '/images/Nr3/bathroom.jpeg',
					category: 'bathroom',
					alt: {
						de: 'Badezimmer im Appartement Nr. 3',
						en: 'Bathroom in Apartment Nr. 3',
					},
				},
			],
		},
		attributes: {
			size: '28 m²',
			floor: '1',
			view: {
				de: 'Süden',
				en: 'South',
			},
			guests: {
				de: '1-2 Personen',
				en: '1-2 guests',
			},
		},
		amenities: ['balkon', 'fernseher', 'kueche', 'wifi', 'badezimmer'],
		floorplanImage: '/images/Nr3/floorplan.png',
		pricePerNightBase: 65,
		priceMatrix: [
			{
				season: {
					de: 'Sommer',
					en: 'Summer',
				},
				period: {
					de: '01. Apr - 30. Sep',
					en: 'Apr 01 - Sep 30',
				},
				pricePerNight: '€ 65,-',
				minStay: {
					de: '3 Nächte',
					en: '3 nights',
				},
				extraPerson: {
					de: '/',
					en: '/',
				},
			},
			{
				season: {
					de: 'Winter',
					en: 'Winter',
				},
				period: {
					de: '20. Dez - 06. Jan',
					en: 'Dec 20 - Jan 06',
				},
				pricePerNight: '€ 75,-',
				minStay: {
					de: '3 Nächte',
					en: '3 nights',
				},
				extraPerson: {
					de: '/',
					en: '/',
				},
			},
		],
		reviews: [
			{
				name: 'Milena',
				rating: 5,
				date: '2024-01-01',
				text:
					'Die Gastgeber-Familie war super freundlich und sehr zuvorkommend. Sehr persönlicher Umgang. Die Lage war perfekt. Man konnte alles gut sowohl mit dem Auto als auch zu Fuß oder mit dem Fahrrad erreichen. Alles in allem war es ein toller Urlaub im schönen Österreich den wir gerne im Gästehaus Rader wiederholen möchten!',
			},
		],
		cardMeta: {
			de: '28 m² · 1-2 Personen · Süden',
			en: '28 m² · 1-2 guests · South',
		},
		badgeLabel: null,
		typeLabel: {
			de: 'Appartement',
			en: 'Apartment',
		},
		detailMeta: {
			de: '28 m² · 1-2 Personen · Süden',
			en: '28 m² · 1-2 guests · South',
		},
		detailBody: {
			de: 'Sonnige Ferienwohnung in Weißbriach im Gitschtal mit Südbalkon, Gartenblick, Küche mit Sitzecke und Bad mit Dusche/WC – ideal für 1–2 Gäste in ruhiger Lage nahe Weissensee und Nassfeld.',
			en: 'Sunny apartment in Weissbriach in the Gitschtal with south-facing balcony, garden view, kitchen with dining nook and bathroom with shower/toilet – ideal for 1–2 guests in a quiet setting near Lake Weissensee and Nassfeld.',
		},
	},
];

export const accommodationBySlug = (slug: string) =>
	accommodations.find((accommodation) => accommodation.slug === slug);
