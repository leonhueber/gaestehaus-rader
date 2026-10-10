<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardButton from '$lib/components/ui/CardButton.svelte';
	import CardLink from '$lib/components/ui/CardLink.svelte';
	/* eslint-disable */
	import { lang, t } from '$lib/i18n';
	import { asset, resolve } from '$app/paths';
	import { browser } from '$app/environment';
import { page } from '$app/state';
	import { accommodations, getAccommodationGallerySources } from '$lib/data/accommodations';
	import { imageAttrs, largestImageUrl } from '$lib/images';
	import { homeTrustReviews } from '$lib/data/reviews';
	import { trackEvent } from '$lib/analytics/plausible';
	import GalleryLightbox, { type GalleryLightboxItem } from '$lib/components/GalleryLightbox.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/seo';
import { localizePath } from '$lib/routing';
	import {
		BUSINESS_SAME_AS,
		LODGING_BUSINESS_CORE,
		buildJsonLdGraph,
		buildOfferSchema,
		buildVacationRentalSchema,
	} from '$lib/structured-data';
	import { onMount } from 'svelte';
	import {
		Mountain,
		HeartHandshake,
		Snowflake,
		Check,
		ArrowRight,
		ChevronLeft,
		ChevronRight,
		Leaf,
		Sun,
		Flame,
		Sparkles,
		BusFront,
		CalendarDays,
		Info,
		BedDouble,
		Bed,
		ShowerHead,
		Microwave,
		Refrigerator,
		CookingPot,
		Coffee,
		CupSoda,
		Utensils,
		Sandwich,
		House,
		Wifi,
		SquareParking,
		Tv,
		Sofa,
		Bath,
		Star,
		BadgeCheck,
		Home,
		Building2,
		Waves,
		Bike,
		MountainSnow,
		Footprints,
	} from 'lucide-svelte';

	const usps = [
		{ key: 1, icon: House },
		{ key: 2, icon: Mountain },
		{ key: 3, icon: HeartHandshake },
		{ key: 4, icon: Snowflake },
	];

	const withAsset = (path: string) => asset(path);
	const localizedHref = (path: string) => localizePath(path, page.url.pathname);
	const currentMonth = new Date().getMonth();
	const isSummerSeason = currentMonth >= 4 && currentMonth <= 8;
	const heroImagePath =
		isSummerSeason
			? '/images/Haus/gaestehaus-sommer.jpg'
			: '/images/Haus/balkon-ausblick-winter.jpg';
	const guestCardVisual = isSummerSeason
		? {
				src: '/images/Umgebung/nassfeld-lift.jpg',
				altKey: 'experiences.guestcard.imageAlt.summer',
			}
		: {
				src: '/images/Umgebung/ski_nassfeld.jpg',
				altKey: 'experiences.guestcard.imageAlt.winter',
			};
	const guestCardCardVisual = {
		src: '/images/Umgebung/nassfeld_gaestecard_basic_summer.png',
	};

	const rooms = accommodations;
	const accommodationsBase = $derived.by(() => localizedHref('/unterkuenfte-preise'));
	const siteUrl = SITE_ORIGIN;
	const lodgingImages = [
		new URL(largestImageUrl('/images/Haus/gaestehaus-sommer.jpg'), siteUrl).toString(),
		new URL(largestImageUrl('/images/Haus/balkon-ausblick-winter.jpg'), siteUrl).toString(),
		new URL(largestImageUrl('/images/Haus/gaestehaus-balkon-ausblick.jpg'), siteUrl).toString(),
		new URL(largestImageUrl('/images/Haus/familie-hueber.jpg'), siteUrl).toString(),
	];
	const amenityFeatures = $derived.by(() => {
		const amenities = Array.from(new Set(rooms.flatMap((room) => room.amenities ?? [])));

		const baseFeatures = amenities.map((amenity) => ({
			'@type': 'LocationFeatureSpecification',
			name: $t(`amenity.${amenity}`),
			value: true,
		}));
		const extraFeatures = [
			{
				'@type': 'LocationFeatureSpecification',
				name: 'High-speed Wi-Fi (fiber)',
				value: true,
			},
			{
				'@type': 'LocationFeatureSpecification',
				name: 'Parking',
				value: true,
			},
			{
				'@type': 'LocationFeatureSpecification',
				name: 'Ski room',
				value: true,
			},
		];

		return [...baseFeatures, ...extraFeatures];
	});
	const geoCoordinates = {
		'@type': 'GeoCoordinates',
		latitude: 46.688407,
		longitude: 13.2549914,
	} as const;
	const lodgingId = `${siteUrl}/#lodging`;
	const hotelId = `${siteUrl}/#hotel`;
	const destinationId = `${siteUrl}/#destination-gitschtal`;
	const businessSameAs = BUSINESS_SAME_AS;
	const roomStructuredData = $derived.by(() =>
		rooms.map((room) => {
			const roomUrl = new URL(`${localizedHref('/unterkuenfte-preise')}${room.slug}/`, siteUrl).toString();
			const amenityLabels = (room.amenities ?? []).map((amenity) => $t(`amenity.${amenity}`));
			return buildVacationRentalSchema({
				accommodation: room,
				locale: $lang,
				pageUrl: roomUrl,
				siteOrigin: siteUrl,
				imagePaths: [room.images.main, ...getAccommodationGallerySources(room)],
				amenityLabels,
				description: room.subtitle[$lang],
			});
		})
	);
	const lodgingOffers = $derived.by(() =>
		rooms.map((room) => {
			const roomUrl = new URL(`${localizedHref('/unterkuenfte-preise')}${room.slug}/`, siteUrl).toString();
			return buildOfferSchema({
				id: `${roomUrl}#lodging-offer`,
				url: roomUrl,
				itemOfferedId: `${roomUrl}#vacation-rental`,
			});
		})
	);
	const homeJsonLd = $derived.by(() =>
		buildJsonLdGraph([
			{
				'@type': 'LodgingBusiness',
				'@id': lodgingId,
				name: 'Gästehaus Rader',
				url: siteUrl,
				additionalType: 'https://schema.org/Hotel',
				...LODGING_BUSINESS_CORE,
				image: lodgingImages,
				description: $t('home.seo.description'),
				address: {
					'@type': 'PostalAddress',
					streetAddress: 'Weißbriach 92',
					postalCode: '9622',
					addressLocality: 'Weißbriach',
					addressRegion: 'Kärnten',
					addressCountry: 'AT',
				},
				geo: geoCoordinates,
				sameAs: businessSameAs,
				hasMap: 'https://maps.app.goo.gl/cXgd5iJbYPmSx2ad9',
				amenityFeature: amenityFeatures,
				containsPlace: roomStructuredData.map((room) => ({
					'@id': room.vacationRentalId,
				})),
				makesOffer: lodgingOffers.map((offer) => ({
					'@id': offer['@id'] as string,
				})),
				telephone: ['+43 676 6246826', '+43 4286 222'],
				email: 'info@rader-gitschtal.at',
			},
			{
				'@type': 'Hotel',
				'@id': hotelId,
				name: 'Gästehaus Rader',
				url: siteUrl,
				description: $t('home.seo.description'),
				...LODGING_BUSINESS_CORE,
				image: lodgingImages,
				parentOrganization: {
					'@id': lodgingId,
				},
				address: {
					'@type': 'PostalAddress',
					streetAddress: 'Weißbriach 92',
					postalCode: '9622',
					addressLocality: 'Weißbriach',
					addressRegion: 'Kärnten',
					addressCountry: 'AT',
				},
				geo: geoCoordinates,
				telephone: ['+43 676 6246826', '+43 4286 222'],
				email: 'info@rader-gitschtal.at',
				sameAs: businessSameAs,
				hasMap: 'https://maps.app.goo.gl/cXgd5iJbYPmSx2ad9',
				amenityFeature: amenityFeatures,
				offers: {
					'@type': 'Offer',
					priceCurrency: 'EUR',
					url: new URL(localizedHref('/unterkuenfte-preise'), siteUrl).toString(),
				},
			},
			{
				'@type': 'TouristDestination',
				'@id': destinationId,
				name: 'Gitschtal',
				containsPlace: {
					'@id': hotelId,
				},
			},
			...roomStructuredData.flatMap((room) => [
				room.vacationRentalNode,
				room.accommodationNode,
				room.offerNode,
			]),
			...lodgingOffers,
		])
	);

	const amenityIcons = {
		wifi: Wifi,
		balcony: Sun,
		balkon: Sun,
		mountain: Mountain,
		coffee: Coffee,
		kitchen: Utensils,
		kueche: Utensils,
		kuehlschrank: Refrigerator,
		mikrowelle: Microwave,
		herd: CookingPot,
		fernseher: Tv,
		ausziehcouch: Sofa,
		badezimmer: Bath,
		parking: SquareParking,
	} as const;
	type AmenityKey = keyof typeof amenityIcons;

	const amenityCards = [
		{
			titleKey: 'home.amenities.basic.title',
			summaryKey: 'home.amenities.basic.summary',
			icon: BedDouble,
			details: [
				{
					titleKey: 'home.amenities.basic.bedding.title',
					bodyKey: 'home.amenities.basic.bedding.body',
					icon: Bed,
				},
				{
					titleKey: 'home.amenities.basic.towels.title',
					bodyKey: 'home.amenities.basic.towels.body',
					icon: ShowerHead,
				},
				{
					titleKey: 'home.amenities.basic.care.title',
					bodyKey: 'home.amenities.basic.care.body',
					icon: Leaf,
				},
			],
		},
		{
			titleKey: 'home.amenities.kitchen.title',
			summaryKey: 'home.amenities.kitchen.summary',
			icon: CookingPot,
			details: [
				{
					titleKey: 'home.amenities.kitchen.kitchenette.title',
					bodyKey: 'home.amenities.kitchen.kitchenette.body',
					icon: Microwave,
				},
				{
					titleKey: 'home.amenities.kitchen.espresso.title',
					bodyKey: 'home.amenities.kitchen.espresso.body',
					icon: Coffee,
				},
				{
					titleKey: 'home.amenities.kitchen.kettle.title',
					bodyKey: 'home.amenities.kitchen.kettle.body',
					icon: CupSoda,
				},
				{
					titleKey: 'home.amenities.kitchen.dishes.title',
					bodyKey: 'home.amenities.kitchen.dishes.body',
					icon: Utensils,
				},
				{
					titleKey: 'home.amenities.kitchen.toaster.title',
					bodyKey: 'home.amenities.kitchen.toaster.body',
					icon: Sandwich,
				},
			],
		},
		{
			titleKey: 'home.amenities.house.title',
			summaryKey: 'home.amenities.house.summary',
			icon: House,
			details: [
				{
					titleKey: 'home.amenities.house.wifi.title',
					bodyKey: 'home.amenities.house.wifi.body',
					icon: Wifi,
				},
				{
					titleKey: 'home.amenities.house.parking.title',
					bodyKey: 'home.amenities.house.parking.body',
					icon: SquareParking,
				},
				{
					titleKey: 'home.amenities.house.ski.title',
					bodyKey: 'home.amenities.house.ski.body',
					icon: Snowflake,
				},
			],
		},
	];

	const seasonPanels = [
		{
			seasonKey: 'summer',
			titleKey: 'seasons.summer.title',
			teaserKey: 'seasons.summer.teaser',
			ctaKey: 'seasons.summer.cta',
			heroImage: { src: '/images/Haus/gaestehaus-sommer.jpg', altKey: 'home.seasons.summer.imageAlt' },
			floatingImages: [
				{ src: '/images/Umgebung/nassfeld-lift.jpg', altKey: 'home.seasons.summer.liftAlt' },
				{ src: '/images/Umgebung/presseggersee.jpg', altKey: 'home.seasons.summer.lakeAlt' },
				{ src: '/images/Umgebung/aussicht-vom-poludnig.jpg', altKey: 'home.seasons.summer.panoramaAlt' },
			],
			href: '/erlebnisse/sommer',
			icon: Sun,
			kickerKey: 'seasons.summer.kicker',
			features: [
				{ labelKey: 'seasons.summer.feature.hiking', icon: Mountain },
				{ labelKey: 'seasons.summer.feature.lakes', icon: Waves },
				{ labelKey: 'seasons.summer.feature.bike', icon: Bike },
			],
			panelClass: 'bg-[#f8f1e5]',
			kickerClass: 'text-brand',
			iconClass: 'bg-brand text-white',
			buttonClass: 'bg-brand text-white hover:bg-brand-dark',
		},
		{
			seasonKey: 'winter',
			titleKey: 'seasons.winter.title',
			teaserKey: 'seasons.winter.teaser',
			ctaKey: 'seasons.winter.cta',
			reverse: true,
			heroImage: { src: '/images/Haus/gaestehaus-winter.png', altKey: 'home.seasons.winter.imageAlt' },
			floatingImages: [
				{ src: '/images/Umgebung/gail-winter.jpg', altKey: 'home.seasons.winter.riverAlt' },
				{ src: '/images/Umgebung/ski_weißbriach.JPG', altKey: 'home.seasons.winter.skiAlt' },
				{ src: '/images/Umgebung/skigebiet-weissbriach-2.jpg', altKey: 'home.seasons.winter.slopeAlt' },
			],
			href: '/erlebnisse/winter',
			icon: Snowflake,
			kickerKey: 'seasons.winter.kicker',
			features: [
				{ labelKey: 'seasons.winter.feature.ski', icon: MountainSnow },
				{ labelKey: 'seasons.winter.feature.crosscountry', icon: Footprints },
				{ labelKey: 'seasons.winter.feature.snow', icon: Snowflake },
			],
			panelClass: 'bg-[#edf4f7]',
			kickerClass: 'text-sky-700',
			iconClass: 'bg-sky-700 text-white',
			buttonClass: 'bg-slate-900 text-white hover:bg-slate-700',
		},
	];

	const seasonGalleryImages = {
		summer: [
			{ src: '/images/Haus/gaestehaus-sommer.jpg', altKey: 'home.seasons.summer.imageAlt' },
			{ src: '/images/Umgebung/nassfeld-lift.jpg', altKey: 'home.seasons.summer.liftAlt' },
			{ src: '/images/Umgebung/presseggersee.jpg', altKey: 'home.seasons.summer.lakeAlt' },
			{ src: '/images/Umgebung/aussicht-vom-poludnig.jpg', altKey: 'home.seasons.summer.panoramaAlt' },
			{ src: '/images/Umgebung/freibad-weissbriach.jpg', altKey: 'home.seasons.summer.poolAlt' },
			{ src: '/images/Umgebung/garnitzenklamm.jpg', altKey: 'home.seasons.summer.gorgeAlt' },
		],
		winter: [
			{ src: '/images/Haus/gaestehaus-winter.png', altKey: 'home.seasons.winter.imageAlt' },
			{ src: '/images/Umgebung/gail-winter.jpg', altKey: 'home.seasons.winter.riverAlt' },
			{ src: '/images/Umgebung/ski_weißbriach.JPG', altKey: 'home.seasons.winter.skiAlt' },
			{ src: '/images/Umgebung/skigebiet-weissbriach-2.jpg', altKey: 'home.seasons.winter.slopeAlt' },
			{ src: '/images/Haus/weissbriach-dorfblick-winter.jpg', altKey: 'home.seasons.winter.villageAlt' },
			{ src: '/images/Umgebung/schnee-wanderung.jpg', altKey: 'home.seasons.winter.walkAlt' },
		],
	};

	const galleryImageSizes = '(min-width: 640px) 360px, 260px';
	const destinationImages = [
		// Starker erster Eindruck vom Haus, dann direkt den Pavillon als Außen-Highlight zeigen
		{ base: 'gaestehaus-sommer', altKey: 'home.gallery.imageAlt.sommer' },
		{ base: 'gaestehaus-pavillon', altKey: 'home.gallery.imageAlt.pavillon' },
		{ base: 'nr2-hero', altKey: 'home.gallery.imageAlt.nr2Hero' },
		{ base: 'nr2-living-room', altKey: 'home.gallery.imageAlt.nr2LivingRoom' },
		{ base: 'nr1-bedroom', altKey: 'home.gallery.imageAlt.nr1Bedroom' },
		{ base: 'nr3-bed', altKey: 'home.gallery.imageAlt.nr3Bed' },

		// Danach weiter mit Hausgefühl und Umgebung zur Einordnung
		{ base: 'gaestehaus-balkon-ausblick', altKey: 'home.gallery.imageAlt.balkon' },
		{ base: 'familie-hueber', altKey: 'home.gallery.imageAlt.view' },
		{ base: 'weissbriach-kirche', altKey: 'home.gallery.imageAlt.kirche' },
		{ base: 'gaestehaus-winter', altKey: 'home.gallery.imageAlt.winter' },
		{ base: 'balkon-ausblick-winter', altKey: 'home.gallery.imageAlt.winterBalkon' },
		{ base: 'gaestehaus-winter-ansicht', altKey: 'home.gallery.imageAlt.sliderWinter' },
		{
			base: 'nassfeld-ski',
			altKey: 'home.gallery.imageAlt.nassfeldSki',
			locationTagKey: 'home.gallery.locationTag.nassfeld',
		},
	];

	const galleryImages = destinationImages;
	let heroHeaderOffset = $state('113px');
	let isGalleryOpen = $state(false);
	let activeGalleryIndex = $state(0);
	let activeSeasonGallery = $state<'summer' | 'winter' | null>(null);
	let activeSeasonGalleryIndex = $state(0);
	const activeSeasonGalleryImages = $derived(
		activeSeasonGallery ? seasonGalleryImages[activeSeasonGallery] : []
	);
	const galleryLightboxItems = $derived.by<GalleryLightboxItem[]>(() =>
		galleryImages.map((image) => ({
			src: `/images/Galerie/${image.base}-1440.jpg`,
			alt: $t(image.altKey),
			title: $t(image.altKey),
		}))
	);
	const activeSeasonGalleryTitle = $derived(
		activeSeasonGallery === 'summer'
			? $t('seasons.summer.title')
			: activeSeasonGallery === 'winter'
				? $t('seasons.winter.title')
				: $t('home.gallery.title')
	);
	const activeSeasonGalleryLightboxItems = $derived.by<GalleryLightboxItem[]>(() =>
		activeSeasonGalleryImages.map((image) => ({
			src: image.src,
			alt: $t(image.altKey),
			title: $t(image.altKey),
		}))
	);

	const getHeroOffsetFallback = () =>
		browser && window.matchMedia('(min-width: 640px)').matches ? 112 : 141;

	const updateHeroHeaderOffset = () => {
		if (!browser) return;
		const header = document.getElementById('site-header');
		const headerHeight = header?.getBoundingClientRect().height ?? getHeroOffsetFallback();
		heroHeaderOffset = `${Math.round(headerHeight)}px`;
	};

	const openGallery = (index: number) => {
		activeGalleryIndex = index;
		isGalleryOpen = true;
	};

	const closeGallery = () => {
		isGalleryOpen = false;
	};

	const openSeasonGallery = (seasonKey: string, index = 0) => {
		if (seasonKey !== 'summer' && seasonKey !== 'winter') return;
		activeSeasonGallery = seasonKey;
		activeSeasonGalleryIndex = index;
	};

	const closeSeasonGallery = () => {
		activeSeasonGallery = null;
	};

	onMount(() => {
		if (!browser) return;
		updateHeroHeaderOffset();

		const header = document.getElementById('site-header');
		const resizeObserver = header ? new ResizeObserver(updateHeroHeaderOffset) : null;
		if (header && resizeObserver) {
			resizeObserver.observe(header);
		}

		window.addEventListener('resize', updateHeroHeaderOffset);

		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener('resize', updateHeroHeaderOffset);
		};
	});

	let galleryTrack: HTMLDivElement | null = null;
	const scrollGallery = (direction: 'prev' | 'next') => {
		if (!galleryTrack) return;
		const amount = galleryTrack.clientWidth * 0.8;
		galleryTrack.scrollBy({
			left: direction === 'prev' ? -amount : amount,
			behavior: 'smooth',
		});
	};

	const trustStars = Array.from({ length: 5 });
	const googleProfileUrl = 'https://maps.app.goo.gl/cXgd5iJbYPmSx2ad9';
	const displayedTrustReviews = homeTrustReviews.filter((review) => [1, 2, 5].includes(review.id));
	const formatReviewAge = (value: string | undefined, currentLang: 'de' | 'en') => {
		if (!value) return '';
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) return '';
		const now = new Date();
		let months =
			(now.getFullYear() - parsed.getFullYear()) * 12 + (now.getMonth() - parsed.getMonth());
		if (now.getDate() < parsed.getDate()) months -= 1;
		if (months <= 1) return currentLang === 'de' ? 'vor einem Monat' : 'one month ago';
		if (months < 12) return currentLang === 'de' ? `vor ${months} Monaten` : `${months} months ago`;
		return currentLang === 'de' ? 'vor einem Jahr' : 'one year ago';
	};

	type RevealOptions = {
		threshold?: number;
		rootMargin?: string;
		distance?: number;
		duration?: number;
		delay?: number;
	};

	const prefersReducedMotion = () =>
		browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	import { reveal } from '$lib/actions/reveal';
</script>

<SeoHead
	titleKey="home.seo.title"
	descriptionKey="home.seo.description"
	image="/images/Haus/gaestehaus-sommer.jpg"
/>

<svelte:head>
	{@html `<script type="application/ld+json">${homeJsonLd}</script>`}
</svelte:head>

<div class="space-y-16 pb-16">
	<section
		class="relative min-h-[calc(100lvh-var(--hero-header-offset,141px))]"
		style={`--hero-header-offset: ${heroHeaderOffset};`}
	>
		<div class="absolute inset-0">
			<img
				src={withAsset(heroImagePath)}
				alt=""
				class="h-full w-full object-cover"
				loading="eager"
				fetchpriority="high"
				decoding="sync"
				aria-hidden="true"
			/>
			<div
				class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-black/10"
				aria-hidden="true"
			></div>
			<div
				class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]"
				aria-hidden="true"
			></div>
		</div>

		<div
			class="relative flex min-h-[calc(100svh-var(--hero-header-offset,141px))] flex-col items-center justify-center px-6 pt-20 text-center text-white sm:px-10"
		>
			<p use:reveal class="opacity-0 translate-y-4 transition-all duration-700 ease-out text-[11px] font-semibold uppercase tracking-[0.4em] text-white/90">
				{$t('hero.kicker')}
			</p>
			<h1 use:reveal class="opacity-0 translate-y-4 transition-all duration-700 ease-out delay-150 mx-auto mt-5 max-w-4xl font-serif text-4xl font-medium leading-[1.05] text-shadow-sm sm:text-6xl sm:leading-[1.1]">
				{$t('hero.title')}
			</h1>
			<div use:reveal class="opacity-0 translate-y-4 transition-all duration-700 ease-out delay-300 mt-6 mx-auto h-[1px] w-16 bg-white/40"></div>
			<p use:reveal class="opacity-0 translate-y-4 transition-all duration-700 ease-out delay-500 mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed text-white/95 sm:text-base">
				{$t('hero.subtitle')}
			</p>

			<div use:reveal class="opacity-0 translate-y-4 transition-all duration-700 ease-out delay-700 mt-10 flex flex-wrap justify-center gap-4 sm:gap-5">
				<ButtonLink variant="primary" size="lg"
					href={localizedHref('/unterkuenfte-preise')}
				>
					{$t('hero.cta.primary')}
				</ButtonLink>
				<ButtonLink variant="overlay" size="lg"
					href={localizedHref('/erlebnisse')}
				>
					{$t('hero.cta.secondary')}
				</ButtonLink>
			</div>
		</div>

		<!-- <div class="absolute inset-x-0 -bottom-10 px-4 sm:px-6">
			<div class="mx-auto max-w-5xl rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200 sm:p-5">
				<div class="grid gap-4 md:grid-cols-[1fr,1fr,1fr,auto] md:items-end">
					<label class="grid gap-2">
						<span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
							{$t('booking.bar.checkin')}
						</span>
						<div class="relative">
							<input
								type="date"
								class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
							/>
							<Calendar
								class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
							/>
						</div>
					</label>

					<label class="grid gap-2">
						<span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
							{$t('booking.bar.checkout')}
						</span>
						<div class="relative">
							<input
								type="date"
								class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
							/>
							<Calendar
								class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
							/>
						</div>
					</label>

					<label class="grid gap-2">
						<span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
							{$t('booking.bar.guests')}
						</span>
						<div class="relative">
							<select
								class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
							>
								<option>2 Erwachsene</option>
								<option>1 Erwachsener</option>
								<option>3 Erwachsene</option>
								<option>4 Erwachsene</option>
							</select>
							<Users
								class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
							/>
						</div>
					</label>

					<button
						type="button"
						class="h-[46px] w-full rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand/30 md:w-auto"
					>
						{$t('booking.bar.cta')}
					</button>
		activeGalleryIndex = (activeGalleryIndex + 1) % galleryImages.length;
	};

	const handleGalleryKeydown = (event: KeyboardEvent) => {
		if (!isGalleryOpen) return;
		if (event.key === 'Escape') {
			closeGallery();
		}
		if (event.key === 'ArrowLeft') {
			showPrevGalleryImage();
		}
		if (event.key === 'ArrowRight') {
			showNextGalleryImage();
		}
	};

	onMount(() => {
		if (!browser) return;
		updateHeroHeaderOffset();

		const header = document.getElementById('site-header');
		const resizeObserver = header ? new ResizeObserver(updateHeroHeaderOffset) : null;
		if (header && resizeObserver) {
			resizeObserver.observe(header);
		}

		window.addEventListener('resize', updateHeroHeaderOffset);
		window.addEventListener('keydown', handleGalleryKeydown);

		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener('resize', updateHeroHeaderOffset);
			window.removeEventListener('keydown', handleGalleryKeydown);
		};
	});

	let galleryTrack: HTMLDivElement | null = null;
	const scrollGallery = (direction: 'prev' | 'next') => {
		if (!galleryTrack) return;
		const amount = galleryTrack.clientWidth * 0.8;
		galleryTrack.scrollBy({
			left: direction === 'prev' ? -amount : amount,
			behavior: 'smooth',
		});
	};

	const trustStars = Array.from({ length: 5 });
	const googleProfileUrl = 'https://maps.app.goo.gl/cXgd5iJbYPmSx2ad9';
	const displayedTrustReviews = homeTrustReviews.filter((review) => [1, 2, 5].includes(review.id));
	const formatReviewAge = (value: string | undefined, currentLang: 'de' | 'en') => {
		if (!value) return '';
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) return '';
		const now = new Date();
		let months =
			(now.getFullYear() - parsed.getFullYear()) * 12 + (now.getMonth() - parsed.getMonth());
		if (now.getDate() < parsed.getDate()) months -= 1;
		if (months <= 1) return currentLang === 'de' ? 'vor einem Monat' : 'one month ago';
		if (months < 12) return currentLang === 'de' ? `vor ${months} Monaten` : `${months} months ago`;
		return currentLang === 'de' ? 'vor einem Jahr' : 'one year ago';
	};

	type RevealOptions = {
		threshold?: number;
		rootMargin?: string;
		distance?: number;
		duration?: number;
		delay?: number;
	};

	const prefersReducedMotion = () =>
		browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	import { reveal } from '$lib/actions/reveal';
</script>

<SeoHead
	titleKey="home.seo.title"
	descriptionKey="home.seo.description"
	image="/images/Haus/gaestehaus-sommer.jpg"
/>

<svelte:head>
	{@html `<script type="application/ld+json">${homeJsonLd}</script>`}
</svelte:head>

<div class="space-y-20 pb-16">
	<section
		class="relative min-h-[calc(100lvh-var(--hero-header-offset,141px))]"
		style={`--hero-header-offset: ${heroHeaderOffset};`}
	>
		<div class="absolute inset-0">
			<img
				src={withAsset(heroImagePath)}
				alt=""
				class="h-full w-full object-cover"
				loading="eager"
				fetchpriority="high"
				decoding="sync"
				aria-hidden="true"
			/>
			<div
				class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-black/10"
				aria-hidden="true"
			></div>
			<div
				class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]"
				aria-hidden="true"
			></div>
		</div>

		<div
			class="relative flex min-h-[calc(100svh-var(--hero-header-offset,141px))] flex-col items-center justify-center px-6 pt-20 text-center text-white sm:px-10"
		>
			<p use:reveal class="opacity-0 translate-y-4 transition-all duration-700 ease-out text-[11px] font-semibold uppercase tracking-[0.4em] text-white/90">
				{$t('hero.kicker')}
			</p>
			<h1 use:reveal class="opacity-0 translate-y-4 transition-all duration-700 ease-out delay-150 mx-auto mt-5 max-w-4xl font-serif text-4xl font-medium leading-[1.05] text-shadow-sm sm:text-6xl sm:leading-[1.1]">
				{$t('hero.title')}
			</h1>
			<div use:reveal class="opacity-0 translate-y-4 transition-all duration-700 ease-out delay-300 mt-6 mx-auto h-[1px] w-16 bg-white/40"></div>
			<p use:reveal class="opacity-0 translate-y-4 transition-all duration-700 ease-out delay-500 mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed text-white/95 sm:text-base">
				{$t('hero.subtitle')}
			</p>

			<div use:reveal class="opacity-0 translate-y-4 transition-all duration-700 ease-out delay-700 mt-10 flex flex-wrap justify-center gap-4 sm:gap-5">
				<a
					href={localizedHref('/unterkuenfte-preise')}
					class="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(206,126,90,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c97451] hover:shadow-[0_12px_24px_rgba(206,126,90,0.3)] focus:outline-none focus:ring-2 focus:ring-brand/60"
				>
					{$t('hero.cta.primary')}
				</a>
				<a
					href={localizedHref('/erlebnisse')}
					class="inline-flex items-center justify-center rounded-full bg-white/15 px-8 py-3.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/25 hover:ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
				>
					{$t('hero.cta.secondary')}
				</a>
			</div>
		</div>

		<!-- <div class="absolute inset-x-0 -bottom-10 px-4 sm:px-6">
			<div class="mx-auto max-w-5xl rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200 sm:p-5">
				<div class="grid gap-4 md:grid-cols-[1fr,1fr,1fr,auto] md:items-end">
					<label class="grid gap-2">
						<span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
							{$t('booking.bar.checkin')}
						</span>
						<div class="relative">
							<input
								type="date"
								class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
							/>
							<Calendar
								class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
							/>
						</div>
					</label>

					<label class="grid gap-2">
						<span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
							{$t('booking.bar.checkout')}
						</span>
						<div class="relative">
							<input
								type="date"
								class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
							/>
							<Calendar
								class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
							/>
						</div>
					</label>

					<label class="grid gap-2">
						<span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
							{$t('booking.bar.guests')}
						</span>
						<div class="relative">
							<select
								class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
							>
								<option>2 Erwachsene</option>
								<option>1 Erwachsener</option>
								<option>3 Erwachsene</option>
								<option>4 Erwachsene</option>
							</select>
							<Users
								class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
							/>
						</div>
					</label>

					<button
						type="button"
						class="h-[46px] w-full rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand/30 md:w-auto"
					>
						{$t('booking.bar.cta')}
					</button>
				</div>
			</div>
		</div> -->
	</section>

	<div class="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-14 lg:px-8">
		<div class="space-y-20">
			<section
				use:reveal class="opacity-0 translate-y-8 transition-all duration-700 ease-out -mx-4 mt-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scroll-pl-4 scroll-pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 sm:scroll-pl-0 sm:scroll-pr-0 lg:grid-cols-4"
			>
				{#each usps as item}
					<div
						class="group w-[84vw] max-w-[320px] shrink-0 snap-start rounded-2xl border border-slate-200/50 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-md sm:w-auto sm:max-w-none sm:p-6"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white"
						>
							<item.icon class="h-5 w-5" aria-hidden="true" strokeWidth={1.25} />
						</div>
						<h3 class="mt-4 text-base font-semibold text-slate-900">
							{$t(`usp.${item.key}.title`)}
						</h3>
						<div class="mt-3 h-[2px] w-8 bg-brand/40 transition-all duration-300 group-hover:w-12"></div>
						<p class="mt-2 text-sm leading-relaxed text-slate-600">
							{$t(`usp.${item.key}.body`)}
						</p>
					</div>
				{/each}
			</section>

			<!-- ROOMS -->
			<section use:reveal class="opacity-0 translate-y-8 transition-all duration-700 ease-out mt-4 pt-2 sm:mt-0 sm:pt-4">
				<div class="flex flex-wrap items-end justify-between gap-3 sm:gap-6">
					<div class="pb-2 sm:pb-10">
						<p class="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
							{$t('rooms.section.kicker')}
						</p>
						<h2 class="mt-3 text-4xl font-serif font-medium leading-[0.95] text-slate-900">
							{$t('rooms.section.title')}
						</h2>
						<div class="mt-4 h-[3px] w-16 rounded-full bg-brand"></div>
					</div>

					<a
						href={localizedHref('/unterkuenfte-preise')}
						class="ml-auto inline-flex w-full items-center justify-end gap-2 pt-0 text-sm font-semibold text-brand/80 transition hover:text-brand sm:w-auto sm:pt-2"
					>
						{$t('rooms.section.cta')}
						<ArrowRight class="h-4 w-4" aria-hidden="true" strokeWidth={1.25} />
					</a>
				</div>

				<div class="mt-8">
					<div
						class="-mx-4 mt-2 flex snap-x snap-mandatory gap-8 overflow-x-auto px-4 pb-7 pt-4 scroll-pl-4 scroll-pr-4 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 sm:mx-0 sm:px-0 sm:pb-5 sm:pt-3 sm:scroll-pl-0 sm:scroll-pr-0"
					>
						{#each rooms as r}
							<CardLink tone="default" padding="none"
								href={`${accommodationsBase}${r.slug}/`}
								class="group relative w-[280px] shrink-0 snap-start overflow-hidden sm:w-[340px]"
								onclick={() => trackEvent('Content: Room Card Click', { source: 'home', room: r.slug })}
							>
								<!-- Image -->
								<div class="relative aspect-[4/3] overflow-hidden">
									<img
										src={withAsset(r.images.main)}
										alt={`${$t('home.rooms.card.imageAltPrefix')} ${r.title}`}
										class="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-105"
										loading="lazy"
										decoding="async"
									/>
									<div
										class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent"
									></div>
									<div
										class="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-slate-950/22 via-slate-900/5 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block"
									></div>
									<div
										class="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-2 rounded-full border border-white/35 bg-white/14 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.25)] ring-1 ring-white/20 backdrop-blur-md opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 sm:inline-flex"
									>
										<!-- <span>{$t('rooms.page.detailsCta')}</span> -->
										<ArrowRight class="h-4 w-4" aria-hidden="true" strokeWidth={1.25} />
									</div>

									<!-- Price pill -->
									<!-- <span
                    class="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm"
                  >
                    {$t("price.from")} €{$t(`rooms.card.${r.key}.price`)} / {$t(
                      "price.night"
                    )}
                  </span> -->
								</div>

								<!-- Content -->
								<div class="px-6 pb-5 pt-5">
									<h3 class="text-base font-semibold tracking-tight text-slate-900">
										{r.title}
									</h3>
									<div class="mt-1 flex items-baseline gap-2">
										<p class="text-sm font-semibold text-slate-500">
											{$t('price.from')} <span class="text-slate-500">{r.pricePerNightBase}</span>
										</p>
										<span class="text-xs text-slate-500">/ {$t('price.night')}</span>
									</div>

									<!-- Meta line (small, muted) -->
									<p class="mt-2 text-xs text-slate-500">
										{r.cardMeta[$lang]}
									</p>

								</div>

								<!-- Hover ring -->
								<div
									class="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent transition"
								></div>
							</CardLink>
						{/each}
					</div>
				</div>
			</section>

			<!-- Gallery -->
			<section class="py-2 lg:py-8">
				<div class="flex items-start gap-4">
					<div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
						<Sun class="h-5 w-5" aria-hidden="true" strokeWidth={1.25} />
					</div>
					<div>
						<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
							{$t('home.gallery.kicker')}
						</p>
						<h2 class="mt-2 text-4xl font-serif font-medium leading-[0.98] text-slate-900">
							{$t('home.gallery.title')}
						</h2>
						<div class="mt-3 h-[3px] w-14 rounded-full bg-brand"></div>
					</div>
				</div>

				<p class="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
					{$t('home.gallery.subtitle')}
				</p>

				<div class="mt-6 flex items-center justify-end gap-2">
					<Button variant="secondary" size="icon"
						type="button"
						onclick={() => scrollGallery('prev')}
						aria-label={$t('room.detail.gallery.prev')}
					>
						<ChevronLeft class="h-5 w-5" strokeWidth={1.25} />
					</Button>
					<Button variant="secondary" size="icon"
						type="button"
						onclick={() => scrollGallery('next')}
						aria-label={$t('room.detail.gallery.next')}
					>
						<ChevronRight class="h-5 w-5" strokeWidth={1.25} />
					</Button>
				</div>

				<div
					class="mt-4 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scroll-pl-4 scroll-pr-4 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 sm:mx-0 sm:px-0 sm:scroll-pl-0 sm:scroll-pr-0 lg:grid lg:auto-cols-[420px] lg:grid-flow-col lg:grid-rows-2"
					bind:this={galleryTrack}
				>
					{#each galleryImages as image, index}
						<CardButton tone="default" padding="none"
							type="button"
							class="group relative aspect-[4/3] w-[300px] shrink-0 snap-start overflow-hidden text-left sm:aspect-[16/10] sm:w-[380px] lg:w-auto"
							onclick={() => openGallery(index)}
							aria-label={`${$t('home.gallery.kicker')}: ${$t(image.altKey)}`}
						>
							<img
								src={withAsset(`/images/Galerie/${image.base}-720.jpg`)}
								srcset={`${withAsset(`/images/Galerie/${image.base}-720.jpg`)} 720w, ${withAsset(`/images/Galerie/${image.base}-1080.jpg`)} 1080w, ${withAsset(`/images/Galerie/${image.base}-1440.jpg`)} 1440w`}
								sizes={galleryImageSizes}
								alt={$t(image.altKey)}
								class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
								loading="lazy"
								decoding="async"
							/>
							<div
								class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
							></div>
							<div class="pointer-events-none absolute bottom-4 left-4 right-4">
								<p class="text-[11px] font-medium uppercase tracking-[0.18em] text-white/85">
									{$t(image.altKey)}
								</p>
							</div>
							<div
								class="pointer-events-none absolute inset-0 ring-1 ring-transparent transition group-hover:ring-brand/20"
							></div>
						</CardButton>
					{/each}
				</div>
			</section>

			<GalleryLightbox
				open={isGalleryOpen}
				items={galleryLightboxItems}
				index={activeGalleryIndex}
				title={$t('home.gallery.title')}
				closeLabel={$t('room.detail.gallery.close')}
				prevLabel={$t('room.detail.gallery.prev')}
				nextLabel={$t('room.detail.gallery.next')}
				onClose={closeGallery}
				onIndexChange={(nextIndex) => (activeGalleryIndex = nextIndex)}
			/>

			<div
				class="mx-auto my-12 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent sm:my-16"
			></div>

			<!-- GUEST CARD -->
			<section class="guestcard-section group/guestcard relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-[#fffdf9] shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_22px_54px_-34px_rgba(15,23,42,0.42)] focus-within:border-brand/25 focus-within:shadow-[0_22px_54px_-34px_rgba(15,23,42,0.42)] motion-reduce:transform-none motion-reduce:transition-none lg:rounded-3xl lg:bg-white">
				<div class="pointer-events-none absolute inset-0 z-20 rounded-[1.6rem] opacity-0 ring-1 ring-brand/20 transition-opacity duration-500 group-hover/guestcard:opacity-100 group-focus-within/guestcard:opacity-100 lg:rounded-3xl"></div>
				<div class="grid lg:grid-cols-[1.08fr,0.92fr]">
					<div class="guestcard-mobile-hero relative min-h-[320px] sm:min-h-[430px] lg:min-h-[670px]">
						<img
							{...imageAttrs(guestCardVisual.src, '(max-width: 1024px) 100vw, 45vw')}
							alt={$t(guestCardVisual.altKey)}
							class="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover/guestcard:scale-[1.025] group-focus-within/guestcard:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
							loading="lazy"
							decoding="async"
						/>
						<div
							class="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.56)_0%,rgba(15,23,42,0.34)_28%,rgba(15,23,42,0.12)_58%,rgba(15,23,42,0.04)_100%)] transition duration-500 group-hover/guestcard:opacity-90 lg:bg-gradient-to-r lg:from-slate-950/20 lg:via-transparent lg:to-transparent lg:group-hover/guestcard:from-slate-950/12"
						></div>
						<div
							class="guestcard-desktop-card pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-[24.5rem] w-[14.65rem] overflow-hidden rounded-[1.7rem] bg-[#fff8ee] shadow-[0_30px_58px_-26px_rgba(28,24,18,0.72)] ring-1 ring-black/5 lg:block"
							aria-hidden="true"
						>
							<img
								src={withAsset(guestCardCardVisual.src)}
								alt=""
								class="guestcard-card-crop absolute z-10 h-auto max-w-none"
								decoding="async"
							/>
						</div>
						<div class="absolute inset-x-0 top-0 z-10 p-5 pt-6 text-white sm:p-8 lg:hidden">
							<p class="sr-only">
								{$t('guestcard.landing.kicker')}
							</p>
							<h2 class="max-w-[9ch] text-[2.45rem] font-serif font-medium leading-[0.92] drop-shadow-sm sm:text-5xl">
								{$t('guestcard.landing.title')}
							</h2>
							<div class="mt-5 h-[3px] w-14 rounded-full bg-brand"></div>
						</div>
					</div>

					<div class="relative z-10 isolate -mt-12 flex flex-col justify-center rounded-t-[2.75rem] bg-[#fffdf9] px-5 pb-5 pt-[12.75rem] sm:px-7 sm:pb-6 sm:pt-[12.75rem] lg:mt-0 lg:rounded-none lg:bg-white lg:px-10 lg:py-10">
						<div
							class="guestcard-mobile-orbit pointer-events-none absolute left-1/2 top-0 z-0 h-[11.8rem] w-[11.8rem] -translate-x-1/2 -translate-y-[8%] rounded-full bg-[#f59b00] lg:hidden"
							aria-hidden="true"
						></div>
						<div
							class="guestcard-mobile-card pointer-events-none absolute left-1/2 top-0 z-10 h-[14.6rem] w-[8.7rem] -translate-x-1/2 -translate-y-[33%] rotate-[8deg] overflow-hidden rounded-[1.25rem] bg-[#fff8ee] shadow-[0_22px_34px_-18px_rgba(48,34,19,0.72)] ring-1 ring-black/5 lg:hidden"
							aria-hidden="true"
						>
							<img
								src={withAsset(guestCardCardVisual.src)}
								alt=""
								class="guestcard-card-crop absolute z-10 h-auto max-w-none"
								decoding="async"
							/>
						</div>
						<div class="hidden lg:block">
							<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
								{$t('guestcard.landing.kicker')}
							</p>
							<h2 class="mt-2 text-3xl font-serif font-medium leading-[0.95] text-slate-900 sm:text-4xl">
								{$t('guestcard.landing.title')}
							</h2>
							<div class="mt-3 h-[3px] w-14 rounded-full bg-brand"></div>
							<p class="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
								{$t('guestcard.landing.body')}
							</p>
						</div>

						<ul class="relative z-20 space-y-0 text-sm text-slate-600 sm:text-base lg:mt-6 lg:space-y-4">
							<li class="flex items-start gap-3 border-b border-slate-200/80 py-4 transition duration-300 group-hover/guestcard:border-brand/35 sm:gap-4 lg:rounded-2xl lg:border lg:border-brand/20 lg:bg-brand/5 lg:p-3 lg:group-hover/guestcard:bg-brand/10">
								<span
									class="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand/35 bg-white text-brand transition duration-300 sm:h-11 sm:w-11 lg:h-12 lg:w-12 lg:border-0 lg:bg-brand/15 lg:group-hover/guestcard:scale-105 lg:group-hover/guestcard:bg-brand lg:group-hover/guestcard:text-white"
								>
									<BusFront class="h-5 w-5" aria-hidden="true" strokeWidth={1.25} />
								</span>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-bold leading-snug text-slate-900">
										{$t('guestcard.landing.item1.title')}
									</p>
									<p class="mt-1 text-[13px] leading-snug text-slate-500 sm:leading-relaxed lg:text-xs">
										{$t('guestcard.landing.item1.body')}
									</p>
								</div>
							</li>
							<li class="flex items-start gap-3 border-b border-slate-200/80 py-4 sm:gap-4 lg:border-t lg:border-b-0 lg:pt-4">
								<span
									class="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand/35 bg-white text-brand transition duration-300 sm:h-11 sm:w-11 lg:h-12 lg:w-12 lg:border-0 lg:bg-brand/10"
								>
									<Sparkles class="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" strokeWidth={1.25} />
								</span>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-bold leading-snug text-slate-900">
										{$t('guestcard.landing.item2.title')}
									</p>
									<p class="mt-1 text-[13px] leading-snug text-slate-500 sm:leading-relaxed lg:text-xs">
										{$t('guestcard.landing.item2.body')}
									</p>
								</div>
							</li>
							<li class="flex items-start gap-3 py-4 sm:gap-4 lg:border-t lg:border-slate-200/80 lg:pt-4">
								<span
									class="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand/35 bg-white text-brand transition duration-300 sm:h-11 sm:w-11 lg:h-12 lg:w-12 lg:border-0 lg:bg-brand/10"
								>
									<CalendarDays class="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" strokeWidth={1.25} />
								</span>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-bold leading-snug text-slate-900">
										{$t('guestcard.landing.item3.title')}
									</p>
									<p class="mt-1 text-[13px] leading-snug text-slate-500 sm:leading-relaxed lg:text-xs">
										{$t('guestcard.landing.item3.body')}
									</p>
								</div>
							</li>
						</ul>

						<div class="relative z-20 mt-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:mt-6">
							<ButtonLink variant="primary" size="lg"
								href="https://www.nassfeld.at/de/Unterkunft-finden/Reise-planen/PREMIUM-Cards/GaesteCard-basic"
								class="w-full sm:w-auto"
								target="_blank"
								rel="noreferrer"
							>
								<Info class="hidden h-4 w-4 lg:block" aria-hidden="true" strokeWidth={1.25} />
								<span class="lg:hidden">{$t('guestcard.cta.moreInfoBasic')}</span>
								<span class="hidden lg:inline">{$t('guestcard.cta.moreInfo')}</span>
								<ArrowRight class="ml-auto h-4 w-4 transition-transform duration-300 group-hover/guestcard:translate-x-1 sm:ml-0" aria-hidden="true" strokeWidth={1.25} />
							</ButtonLink>
						</div>
					</div>
				</div>
			</section>

			<div
				class="mx-auto my-12 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent sm:my-16"
			></div>
		</div>
	</div>

	<div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
		<div class="space-y-16">
				<!-- AUSSTATTUNG -->
				<section class="py-4 sm:py-10">
					<div class="grid gap-8 lg:grid-cols-[0.82fr_2.18fr] lg:items-start">
						<div class="max-w-sm">
							<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
								{$t('home.amenities.kicker')}
							</p>
							<h2 class="mt-3 text-3xl font-serif font-medium leading-[0.98] text-slate-900 sm:text-4xl">
								{$t('home.amenities.title')}
							</h2>
							<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
							<p class="mt-6 text-sm leading-relaxed text-slate-600 sm:text-base lg:max-w-[30ch]">
								{$t('home.amenities.subtitle')}
							</p>
						</div>

							<div class="space-y-10 md:hidden">
								{#each amenityCards as card}
									<details
										class="group mt-7 overflow-visible rounded-[1.35rem] border border-slate-200/80 bg-white shadow-sm transition open:border-brand/30 open:shadow-md"
									>
										<summary class="cursor-pointer list-none outline-none [&::-webkit-details-marker]:hidden">
											<div class="relative px-5 pb-5 pt-9">
												<div
													class="absolute -top-7 left-5 grid h-14 w-14 place-items-center rounded-full border border-slate-200 bg-[#faf9f6] text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition group-open:-translate-y-0.5 group-open:bg-white group-open:text-brand"
												>
													<card.icon class="h-6 w-6" aria-hidden="true" strokeWidth={1.25} />
												</div>
												<span
													class="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition group-open:border-brand/25 group-open:bg-brand/10 group-open:text-brand"
													aria-hidden="true"
												>
													<ChevronRight class="h-4 w-4 transition-transform duration-300 group-open:rotate-90" strokeWidth={1.5} />
												</span>

												<h3 class="pr-12 text-base font-semibold text-slate-900">
													{$t(card.titleKey)}
												</h3>
												<p class="mt-3 pr-8 text-sm leading-relaxed text-slate-600">
													{$t(card.summaryKey)}
												</p>
											</div>
										</summary>

										<div class="px-5 pb-5">
											<ul class="space-y-3 border-t border-slate-200/80 pt-4">
												{#each card.details as detail}
													<li class="flex gap-3">
														<span
															class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"
														>
															<detail.icon class="h-4 w-4" aria-hidden="true" strokeWidth={1.25} />
														</span>
														<span class="min-w-0">
															<span class="block text-sm font-semibold leading-snug text-slate-900">
																{$t(detail.titleKey)}
															</span>
															{#if $t(detail.bodyKey)}
																<span class="mt-1 block text-xs leading-relaxed text-slate-500">
																	{$t(detail.bodyKey)}
																</span>
															{/if}
														</span>
													</li>
												{/each}
											</ul>
										</div>
									</details>
								{/each}
							</div>

							<div class="hidden items-start gap-5 md:grid md:grid-cols-3">
								{#each amenityCards as card}
									<article
										class="group mt-7 flex flex-col overflow-visible rounded-[1.35rem] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_22px_50px_-28px_rgba(15,23,42,0.35)] motion-reduce:transform-none motion-reduce:transition-none"
									>
										<div class="relative flex flex-col px-5 pb-5 pt-9">
											<div
												class="absolute -top-7 left-5 grid h-14 w-14 place-items-center rounded-full border border-slate-200 bg-[#faf9f6] text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition group-hover:-translate-y-1 group-hover:bg-white group-hover:text-brand"
											>
												<card.icon class="h-6 w-6" aria-hidden="true" strokeWidth={1.25} />
											</div>

											<h3 class="text-base font-semibold text-slate-900">
												{$t(card.titleKey)}
											</h3>
											<p class="mt-3 text-sm leading-relaxed text-slate-600">
												{$t(card.summaryKey)}
											</p>

											<ul class="mt-5 space-y-3 border-t border-slate-200/80 pt-4">
												{#each card.details as detail}
													<li class="flex gap-3">
														<span
															class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"
														>
															<detail.icon class="h-4 w-4" aria-hidden="true" strokeWidth={1.25} />
														</span>
														<span class="min-w-0">
															<span class="block text-sm font-semibold leading-snug text-slate-900">
																{$t(detail.titleKey)}
															</span>
															{#if $t(detail.bodyKey)}
																<span class="mt-1 block text-xs leading-relaxed text-slate-500">
																	{$t(detail.bodyKey)}
																</span>
															{/if}
														</span>
													</li>
												{/each}
											</ul>
										</div>
									</article>
								{/each}
							</div>
						</div>
					</section>

			<!-- TRUST -->
			<section use:reveal class="opacity-0 translate-y-8 transition-all duration-700 ease-out py-2 sm:py-4">
				<!-- Header row -->
				<div class="flex flex-wrap items-start justify-between gap-3 sm:gap-6">
					<div class="max-w-2xl">
						<p class="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand">
							{$t('trust.kicker')}
						</p>
						<h2 class="mt-3 text-4xl font-serif font-medium leading-[0.95] text-slate-900">
							{$t('trust.title')}
						</h2>
						<div class="mt-4 h-[3px] w-16 rounded-full bg-brand"></div>
					</div>

					<div class="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500 sm:mt-10">
						<BadgeCheck class="h-4 w-4 text-brand" aria-hidden="true" strokeWidth={1.25} />
						{$t('trust.verified')}
					</div>
				</div>

				<!-- Cards row (4 columns like screenshot) -->
				<div
					class={`mt-6 -mx-4 flex snap-x snap-mandatory items-stretch gap-6 overflow-x-auto px-4 pb-2 scroll-pl-4 scroll-pr-4 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 sm:mt-10 lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0 ${
						displayedTrustReviews.length > 3 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
					}`}
				>
					<!-- Rating card (Google) -->
					<CardLink tone="default" padding="md"
						href={googleProfileUrl}
						target="_blank"
						rel="noreferrer"
						class="group relative flex h-full w-[280px] min-h-[330px] shrink-0 snap-start flex-col lg:min-h-0 lg:w-auto lg:shrink"
					>
						<span
							class="pointer-events-none absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 group-hover:bg-brand/10 group-hover:text-brand"
							aria-hidden="true"
						>
							↗
						</span>
						<div
							class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400"
						>
							<span class="transition group-hover:text-slate-500 group-hover:underline">Google</span>
						</div>

						<div class="mt-5 inline-flex items-end gap-2">
							<span class="text-5xl font-semibold leading-none text-slate-900 group-hover:underline">
								{$t('trust.ratingValue')}
							</span>
							<span class="pb-1 text-sm font-semibold text-slate-400 group-hover:underline">/ 5</span>
						</div>

						<div class="mt-3 flex items-center gap-1 text-amber-500">
							{#each trustStars as _}
								<Star class="h-4 w-4 fill-current" aria-hidden="true" strokeWidth={1.25} />
							{/each}
						</div>

						<p class="mt-6 text-xs font-medium text-slate-400">
							{$t('trust.ratingMeta')}
						</p>

						<!-- Small “platform score” tile (bottom) -->
						<Card tone="default" padding="sm" class="mt-6">
							<div class="flex items-center gap-3">
								<span
									class="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white"
								>
									{$t('trust.booking.scoreCompact')}
								</span>
								<div class="leading-tight">
									<p class="text-xs font-semibold text-slate-900">
										{$t('trust.booking.label')}
									</p>
									<p class="text-[11px] text-slate-400">
										{$t('trust.booking.meta')}
									</p>
								</div>
							</div>
						</Card>
						<div
							class="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent transition group-hover:ring-brand/20"
						></div>
					</CardLink>

					<!-- Review cards -->
					{#each displayedTrustReviews as review}
						<CardLink tone="default" padding="md"
							href={review.url}
							target="_blank"
							rel="noreferrer"
							class="group relative flex h-full w-[280px] min-h-[330px] shrink-0 snap-start flex-col text-left lg:min-h-0 lg:w-auto lg:shrink"
							onclick={() => trackEvent('Trust: Review Click', { source: 'home', index: review.id })}
						>
							<span
								class="pointer-events-none absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 group-hover:bg-brand/10 group-hover:text-brand"
								aria-hidden="true"
							>
								↗
							</span>

							<div class="flex items-center gap-1 text-amber-500">
								{#each trustStars as _}
									<Star class="h-4 w-4 fill-current" aria-hidden="true" strokeWidth={1.25} />
								{/each}
							</div>

							<p
								class="mt-5 text-sm italic leading-relaxed text-slate-600 transition group-hover:text-slate-700"
							>
								"{review.quote[$lang]}"
							</p>

							<div class="mt-auto border-t border-slate-200/70 pt-4">
								<div class="flex items-center gap-3">
									<!-- Avatar -->
									<div
										class="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-100 text-xs font-semibold text-slate-700"
									>
										{review.initials}
									</div>

									<div class="leading-tight">
										<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-900">
											{review.name}
										</p>
										<p class="text-[11px] text-slate-400">
											{review.date ? formatReviewAge(review.date, $lang) : review.meta[$lang]}
										</p>
									</div>
								</div>
							</div>

							<div
								class="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent transition group-hover:ring-brand/20"
							></div>
						</CardLink>
					{/each}
				</div>

				<!-- Bottom platform row (like screenshot) -->
				<div
					class="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400 sm:mt-10 sm:gap-8"
				>
					<ButtonLink variant="ghost" size="md"
						href="https://www.airbnb.at/users/profile/1470215552721931790"
						target="_blank"
						rel="noreferrer"
					>
						<Home
							class="h-4 w-4 text-slate-500 transition-colors group-hover:text-slate-800"
							aria-hidden="true" strokeWidth={1.25}
						/>
						<span
							class="text-slate-500 transition-colors group-hover:text-slate-800 group-hover:underline"
							>Airbnb</span
						>
						<span
							class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 transition-all duration-200 group-hover:bg-brand/10 group-hover:text-brand group-hover:ring-1 group-hover:ring-brand/20"
						>
							{$t('trust.airbnb.score')}
						</span>
						<span
							class="ml-0.5 text-slate-400 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 group-hover:text-slate-600"
							aria-hidden="true"
						>
							↗
						</span>
					</ButtonLink>
					<span class="h-4 w-px bg-slate-200"></span>
					<ButtonLink variant="ghost" size="md"
						href="https://www.booking.com/Share-deqca7p"
						target="_blank"
						rel="noreferrer"
					>
						<Building2
							class="h-4 w-4 text-slate-500 transition-colors group-hover:text-slate-800"
							aria-hidden="true" strokeWidth={1.25}
						/>
						<span
							class="text-slate-500 transition-colors group-hover:text-slate-800 group-hover:underline"
							>Booking.com</span
						>
						<span
							class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 transition-all duration-200 group-hover:bg-brand/10 group-hover:text-brand group-hover:ring-1 group-hover:ring-brand/20"
						>
							{$t('trust.booking.score')}
						</span>
						<span
							class="ml-0.5 text-slate-400 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 group-hover:text-slate-600"
							aria-hidden="true"
						>
							↗
						</span>
					</ButtonLink>
				</div>
			</section>


			<!-- SEASONS -->
			<section id="jahreszeiten" class="relative -mx-4 w-auto max-w-[1380px] px-2 py-10 sm:mx-0 sm:w-full sm:px-6 sm:py-12 lg:left-1/2 lg:w-screen lg:-translate-x-1/2">
				<div class="text-center">
					<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
						{$t('seasons.kicker')}
					</p>
					<h2 class="mt-3 text-3xl font-serif font-semibold leading-[0.95] text-slate-900 sm:text-4xl">
						{$t('seasons.title')}
					</h2>
					<div class="mx-auto mt-3 h-[3px] w-14 rounded-full bg-brand"></div>
					<p class="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
						{$t('seasons.subtitle')}
					</p>
				</div>

				<div class="mt-10 space-y-8 sm:space-y-5 lg:space-y-6">
					{#each seasonPanels as season}
						<article
							class={`season-row ${season.reverse ? 'season-row--reverse' : ''} overflow-visible rounded-[1.5rem] border border-slate-200/80 ${season.panelClass} shadow-sm ring-1 ring-black/5`}
						>
							<div class={`season-stage grid lg:min-h-[455px] lg:items-stretch ${season.reverse ? 'lg:grid-cols-[1.34fr_1fr]' : 'lg:grid-cols-[0.72fr_1.58fr]'}`}>
								<div class={`season-copy relative z-10 flex flex-col justify-center p-5 sm:p-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12 ${season.reverse ? 'lg:order-2' : 'lg:order-1'}`}>
									<div
										class={`season-kicker hidden w-fit items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] sm:inline-flex ${season.kickerClass}`}
									>
										<span class={`grid h-9 w-9 place-items-center rounded-full bg-transparent ${season.kickerClass}`}>
											<season.icon class="h-6 w-6" aria-hidden="true" strokeWidth={1.45} />
										</span>
										{$t(season.kickerKey)}
									</div>
									<div class={`season-divider mt-3 hidden h-[2px] w-7 rounded-full sm:block ${season.reverse ? 'bg-sky-700/55' : 'bg-brand/70'}`}></div>

									<h3 class="mt-4 max-w-[13ch] text-3xl font-serif font-semibold leading-[0.98] text-slate-900 sm:mt-5 sm:text-4xl lg:text-5xl">
										{$t(season.titleKey)}
									</h3>
									<p class="mt-4 max-w-[25ch] text-base leading-relaxed text-slate-600 sm:mt-5">
										{$t(season.teaserKey)}
									</p>

									<a
										href={localizedHref(season.href)}
										class={`group mt-6 inline-flex w-fit items-center gap-3 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition sm:mt-7 ${season.buttonClass}`}
									>
										{$t(season.ctaKey)}
										<ArrowRight
											class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
											aria-hidden="true"
										/>
									</a>

									<ul class="season-features mt-7 grid max-w-[300px] grid-cols-3 gap-0 text-center sm:mt-9">
										{#each season.features as feature}
											<li class={`season-feature ${season.reverse ? 'text-sky-700' : 'text-slate-600'}`}>
												<feature.icon class="mx-auto h-7 w-7" aria-hidden="true" strokeWidth={1.35} />
												<span class="mt-2 block text-[11px] font-semibold text-slate-700">
													{$t(feature.labelKey)}
												</span>
											</li>
										{/each}
									</ul>
								</div>

								<div class={`season-visual relative min-h-[360px] overflow-visible sm:min-h-[500px] lg:min-h-[455px] ${season.reverse ? 'lg:order-1' : 'lg:order-2'}`}>
									<button
										type="button"
										class="season-house-image relative block h-full min-h-[360px] w-full overflow-hidden bg-slate-200 text-left sm:min-h-[500px] lg:min-h-[455px]"
										onclick={() => openSeasonGallery(season.seasonKey, 0)}
										aria-label={`${$t(season.kickerKey)} Galerie öffnen: ${$t(season.heroImage.altKey)}`}
									>
										<img
											{...imageAttrs(season.heroImage.src, '(max-width: 1024px) 100vw, 980px')}
											alt={$t(season.heroImage.altKey)}
											class="h-full w-full object-cover transition duration-700 ease-out motion-reduce:transform-none"
											loading="lazy"
											decoding="async"
										/>
										<div
											class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-white/5"
										></div>
									</button>

									{#each season.floatingImages as image, index}
										<button
											type="button"
											class={`season-floater season-floater-${index} group/image absolute overflow-hidden rounded-xl bg-slate-200 shadow-[0_20px_42px_-22px_rgba(15,23,42,0.72)]`}
											onclick={() => openSeasonGallery(season.seasonKey, index + 1)}
											aria-label={`${$t(season.kickerKey)} Galerie öffnen: ${$t(image.altKey)}`}
										>
											<img
												{...imageAttrs(image.src, '(max-width: 1024px) 56vw, 460px')}
												alt={$t(image.altKey)}
												class="h-full w-full object-cover transition duration-700 ease-out group-hover/image:scale-[1.04] motion-reduce:transform-none"
												loading="lazy"
												decoding="async"
											/>
											<div
												class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-white/5 opacity-75 transition-opacity duration-500 group-hover/image:opacity-40"
											></div>
										</button>
									{/each}
								</div>
							</div>
						</article>
					{/each}
				</div>
			</section>

			<GalleryLightbox
				open={Boolean(activeSeasonGallery)}
				items={activeSeasonGalleryLightboxItems}
				index={activeSeasonGalleryIndex}
				title={activeSeasonGalleryTitle}
				closeLabel={$t('room.detail.gallery.close')}
				prevLabel={$t('room.detail.gallery.prev')}
				nextLabel={$t('room.detail.gallery.next')}
				onClose={closeSeasonGallery}
				onIndexChange={(nextIndex) => (activeSeasonGalleryIndex = nextIndex)}
			/>
		</div>
	</div>

	<!-- SUSTAINABILITY hidden for now
	<div class="w-full bg-[#f1eee7]">
		<section class="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
			<div class="rounded-3xl bg-white/35 p-8 ring-1 ring-black/5 sm:p-10">
				<div class="grid items-center gap-10 lg:grid-cols-2">
					<div class="relative">
						<div class="relative overflow-hidden rounded-3xl">
							<img
								{...imageAttrs('/images/Drohne/solar.png', '(max-width: 1024px) 100vw, 760px')}
								alt={$t('home.sustainability.imageAlt')}
								class="h-[320px] w-full object-cover sm:h-[380px]"
								loading="lazy"
								decoding="async"
							/>
							<div
								class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent"
							></div>
						</div>

						<div class="absolute left-5 top-5">
							<div
								class="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md ring-1 ring-black/5"
							>
								<Sun class="h-6 w-6" aria-hidden="true" />
							</div>
						</div>
					</div>

					<div class="space-y-5">
						<div
							class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"
						>
							<Leaf class="h-4 w-4" aria-hidden="true" />
							{$t('home.sustainability.badge')}
						</div>
						<h2 class="text-3xl font-serif font-semibold leading-[0.95] text-slate-900 sm:text-4xl">
							{$t('home.sustainability.title.line1')}<br />{$t('home.sustainability.title.line2')}
						</h2>

						<p class="text-base font-medium text-slate-700">
							{$t('home.sustainability.lead')}
						</p>

						<ul class="space-y-2 text-sm leading-relaxed text-slate-600">
							<li class="flex items-start gap-2">
								<Check class="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
								<span>{$t('home.sustainability.bullet.solar')}</span>
							</li>
							<li class="flex items-start gap-2">
								<Check class="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
								<span>{$t('home.sustainability.bullet.heating')}</span>
							</li>
						</ul>

						<div class="mt-6 grid gap-4 sm:grid-cols-2">
							<div class="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
								<div class="flex items-start gap-3">
									<div
										class="mt-0.5 grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
									>
										<Sun class="h-5 w-5" aria-hidden="true" />
									</div>
									<div>
										<p class="text-sm font-semibold text-slate-900">
											{$t('home.sustainability.solar.title')}
										</p>
										<p class="mt-1 text-xs text-slate-500">
											{$t('home.sustainability.solar.body')}
										</p>
									</div>
								</div>
							</div>

							<div class="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
								<div class="flex items-start gap-3">
									<div
										class="mt-0.5 grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
									>
										<Flame class="h-5 w-5" aria-hidden="true" />
									</div>
									<div>
										<p class="text-sm font-semibold text-slate-900">
											{$t('home.sustainability.heating.title')}
										</p>
										<p class="mt-1 text-xs text-slate-500">
											{$t('home.sustainability.heating.body')}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
	-->

	<!-- WORKATION hidden for now -->
	<!-- <div class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
		<section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
			<div class="grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
						{$t('home.workation.kicker')}
					</p>
					<h2 class="mt-3 text-2xl font-serif font-semibold leading-[0.95] text-slate-900 sm:text-3xl">
						{$t('home.workation.title')}
					</h2>
					<div class="mt-3 h-[3px] w-14 rounded-full bg-brand"></div>
					<p class="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
						{$t('home.workation.body')}
					</p>

					<ul class="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
						<li class="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
							<Wifi class="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
							<span>{$t('home.workation.bullet.wifi')}</span>
						</li>
						<li class="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
							<Check class="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
							<span>{$t('home.workation.bullet.workspace')}</span>
						</li>
					</ul>

					<div class="mt-5 flex flex-wrap gap-3">
						<a
							href={localizedHref('/workation')}
							class="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-5 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand/15"
						>
							{$t('home.workation.cta.primary')}
							<ArrowRight class="h-4 w-4" aria-hidden="true" />
						</a>
						<a
							href={localizedHref('/kontakt')}
							class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
						>
							{$t('home.workation.cta.secondary')}
						</a>
					</div>
				</div>

				<a
					href={localizedHref('/workation')}
					class="group relative overflow-hidden rounded-2xl border border-slate-200"
				>
					<img
						src={withAsset('/images/Haus/gaestehaus-balkon-ausblick.jpg')}
						alt={$t('home.workation.imageAlt')}
						class="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-64"
						loading="lazy"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent"></div>
					<div class="absolute bottom-3 left-3 right-3">
						<p class="text-xs font-semibold uppercase tracking-wide text-white">
							{$t('home.workation.imageBadge')}
						</p>
						<p class="mt-1 text-xs text-white/85">{$t('home.workation.imageSubline')}</p>
					</div>
				</a>
			</div>
		</section>
	</div> -->

	<section class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
		<div class="rounded-3xl bg-brand px-6 py-10 text-white sm:px-10 sm:py-12">
			<p class="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
				{$t('brand.name')}
			</p>
			<h2 class="mt-3 font-serif text-3xl leading-[0.95] text-white sm:text-4xl">
				{$t('cta.title')}
			</h2>
			<div class="mt-3 h-[3px] w-14 rounded-full bg-white/70"></div>
			<p class="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
				{$t('cta.body')}
			</p>

			<div class="mt-6 flex flex-wrap gap-3">
				<ButtonLink variant="secondary" size="md"
					href={localizedHref('/buchen')}
					onclick={() => trackEvent('Booking: Jetzt buchen', { source: 'home-cta' })}
				>
					{$t('cta.primary')}
				</ButtonLink>
				<ButtonLink variant="overlay" size="md"
					href={localizedHref('/unterkuenfte-preise')}
				>
					{$t('cta.secondary')}
				</ButtonLink>
			</div>

			<div class="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/80">
				<span class="font-semibold text-white/90">{$t('contact.direct.title')}</span>
				<a
					class="hover:text-white"
					href="tel:+436766246826"
					onclick={() => trackEvent('Contact: Phone Click', { source: 'home', line: 'mobile' })}
				>
					+43 676 6246826
				</a>
				<span class="text-white/50">•</span>
				<a
					class="hover:text-white"
					href="tel:+434286222"
					onclick={() => trackEvent('Contact: Phone Click', { source: 'home', line: 'landline' })}
				>
					+43 4286 222
				</a>
				<span class="text-white/50">•</span>
				<a
					class="hover:text-white"
					href="mailto:info@rader-gitschtal.at"
					onclick={() => trackEvent('Contact: Email Click', { source: 'home' })}
				>
					info@rader-gitschtal.at
				</a>
			</div>
		</div>
	</section>
</div>

<style>
	.guestcard-card-crop {
		left: -142.5%;
		top: -37.2%;
		width: 385%;
	}

	@media (max-width: 1023px) {
		.guestcard-mobile-hero {
			overflow: hidden;
		}

		.guestcard-mobile-card {
			transform: translate(-50%, -33%) rotate(8deg) scale(1);
			transform-origin: 52% 88%;
			transition:
				transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
				box-shadow 520ms cubic-bezier(0.22, 1, 0.36, 1);
		}

		.guestcard-mobile-card::after {
			background: linear-gradient(
				115deg,
				transparent 0%,
				rgba(255, 255, 255, 0) 36%,
				rgba(255, 255, 255, 0.56) 48%,
				rgba(255, 255, 255, 0.12) 58%,
				transparent 70%
			);
			content: '';
			inset: -18% -90%;
			opacity: 0;
			pointer-events: none;
			position: absolute;
			transform: translateX(-42%) skewX(-16deg);
			transition:
				opacity 220ms ease,
				transform 680ms cubic-bezier(0.22, 1, 0.36, 1);
			z-index: 30;
		}

		.guestcard-mobile-orbit {
			transform: translate(-50%, -8%) scale(1);
			transition:
				box-shadow 520ms cubic-bezier(0.22, 1, 0.36, 1),
				transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
		}

		.guestcard-section:hover .guestcard-mobile-card,
		.guestcard-section:active .guestcard-mobile-card,
		.guestcard-section:focus-within .guestcard-mobile-card {
			box-shadow: 0 32px 46px -22px rgba(48, 34, 19, 0.8);
			transform: translate(-50%, -40%) rotate(3deg) scale(1.035);
		}

		.guestcard-section:hover .guestcard-mobile-card::after,
		.guestcard-section:active .guestcard-mobile-card::after,
		.guestcard-section:focus-within .guestcard-mobile-card::after {
			opacity: 1;
			transform: translateX(42%) skewX(-16deg);
		}

		.guestcard-section:hover .guestcard-mobile-orbit,
		.guestcard-section:active .guestcard-mobile-orbit,
		.guestcard-section:focus-within .guestcard-mobile-orbit {
			box-shadow: 0 20px 38px -28px rgba(245, 146, 0, 0.72);
			transform: translate(-50%, -8%) scale(1.045);
		}
	}

	@media (min-width: 1024px) {
		.guestcard-desktop-card {
			transform: translate(-50%, -50%) rotate(0deg) scale(1);
			transform-origin: 52% 88%;
			transition:
				box-shadow 620ms cubic-bezier(0.22, 1, 0.36, 1),
				transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
		}

		.guestcard-desktop-card::after {
			background: linear-gradient(
				115deg,
				transparent 0%,
				rgba(255, 255, 255, 0) 35%,
				rgba(255, 255, 255, 0.58) 47%,
				rgba(255, 255, 255, 0.14) 58%,
				transparent 70%
			);
			content: '';
			inset: -18% -90%;
			opacity: 0;
			pointer-events: none;
			position: absolute;
			transform: translateX(-44%) skewX(-16deg);
			transition:
				opacity 220ms ease,
				transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
			z-index: 30;
		}

		.guestcard-section:hover .guestcard-desktop-card,
		.guestcard-section:focus-within .guestcard-desktop-card {
			box-shadow: 0 38px 68px -28px rgba(28, 24, 18, 0.82);
			transform: translate(-50%, -52%) rotate(-2deg) scale(1.035);
		}

		.guestcard-section:hover .guestcard-desktop-card::after,
		.guestcard-section:focus-within .guestcard-desktop-card::after {
			opacity: 1;
			transform: translateX(42%) skewX(-16deg);
		}
	}

	.season-house-image img {
		transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.season-house-image {
		transition: filter 620ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.season-row:hover .season-house-image img {
		transform: scale(1.035);
	}

	.season-row {
		isolation: isolate;
	}

	.season-copy {
		border-bottom-left-radius: 1.5rem;
		border-top-left-radius: 1.5rem;
		background:
			linear-gradient(110deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 84%, rgba(255, 255, 255, 0) 84.25%);
	}

	.season-row--reverse .season-copy {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 1.5rem;
		border-top-left-radius: 0;
		border-top-right-radius: 1.5rem;
		background:
			linear-gradient(120deg, rgba(248, 252, 255, 0.98) 0%, rgba(248, 252, 255, 0.96) 100%);
	}

	.season-feature + .season-feature {
		border-left: 1px solid rgba(148, 163, 184, 0.28);
	}

	.season-floater {
		height: 7.4rem;
		width: 39%;
		border: 1px solid rgba(255, 255, 255, 0.68);
		transition:
			left 620ms cubic-bezier(0.22, 1, 0.36, 1),
			right 620ms cubic-bezier(0.22, 1, 0.36, 1),
			top 620ms cubic-bezier(0.22, 1, 0.36, 1),
			bottom 620ms cubic-bezier(0.22, 1, 0.36, 1),
			width 620ms cubic-bezier(0.22, 1, 0.36, 1),
			height 620ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 620ms cubic-bezier(0.22, 1, 0.36, 1),
			border-color 260ms ease,
			opacity 400ms ease,
			box-shadow 620ms ease;
	}

	.season-floater-0 {
		right: 1rem;
		top: 1rem;
		transform: rotate(-2deg);
	}

	.season-floater-1 {
		right: 0.8rem;
		top: 37%;
		transform: rotate(1.5deg);
	}

	.season-floater-2 {
		right: 1.2rem;
		bottom: 1rem;
		transform: rotate(-1.5deg);
	}

	.season-row:hover .season-floater {
		box-shadow: 0 24px 54px -26px rgba(15, 23, 42, 0.78);
		transform: rotate(0deg) translateX(-0.25rem);
	}

	.season-floater:hover {
		z-index: 20;
		border-color: rgba(255, 255, 255, 1);
		height: 9.5rem;
		width: 48%;
		box-shadow: 0 28px 64px -26px rgba(15, 23, 42, 0.82);
		transform: rotate(0deg) translateX(-0.35rem) scale(1.035);
	}

	.season-row:hover .season-floater-0 {
		right: 1rem;
		top: 1rem;
	}

	.season-row:hover .season-floater-1 {
		right: 1rem;
		top: 36%;
	}

	.season-row:hover .season-floater-2 {
		right: 1rem;
		bottom: 1rem;
	}

	@media (min-width: 640px) {
		.season-floater {
			height: 8.2rem;
			width: 31%;
		}
	}

	@media (min-width: 1024px) {
		.season-row:not(.season-row--reverse) .season-visual {
			margin-left: -4.5rem;
		}

		.season-row:not(.season-row--reverse) .season-house-image {
			border-bottom-right-radius: 1.5rem;
			border-top-right-radius: 1.5rem;
		}

		.season-row--reverse .season-visual {
			margin-right: -1rem;
		}

		.season-row--reverse .season-house-image {
			border-bottom-left-radius: 1.5rem;
			border-top-left-radius: 1.5rem;
		}

		.season-house-image {
			width: 100%;
		}

		.season-floater {
			height: 7.8rem;
			width: 23%;
		}

		.season-floater-0 {
			left: auto;
			right: 2.1rem;
			top: 2rem;
		}

		.season-floater-1 {
			right: 2.1rem;
			top: calc(50% - 3.9rem);
		}

		.season-floater-2 {
			left: auto;
			right: 2.1rem;
			bottom: 2rem;
		}

		.season-row--reverse .season-floater {
			right: 1.35rem;
			width: 24%;
		}

		.season-row--reverse .season-floater:hover {
			width: 30%;
		}

		.season-row:hover .season-floater {
			height: calc((100% - 5.5rem) / 3);
			width: 24%;
		}

		.season-row--reverse:hover .season-floater {
			width: 25%;
		}

		.season-row:hover .season-floater:hover {
			height: calc((100% - 5.5rem) / 2.55);
			width: 30%;
			transform: translateX(-0.65rem) scale(1.035);
		}

		.season-row--reverse:hover .season-floater:hover {
			width: 32%;
		}

		.season-row:hover .season-floater-0 {
			left: auto;
			right: 1.6rem;
			top: 1.4rem;
		}

		.season-row:hover .season-floater-1 {
			left: auto;
			right: 1.6rem;
			top: calc(2.75rem + ((100% - 5.5rem) / 3));
		}

		.season-row:hover .season-floater-2 {
			left: auto;
			right: 1.6rem;
			top: calc(4.1rem + 2 * ((100% - 5.5rem) / 3));
			bottom: auto;
		}
	}

	@media (max-width: 1023px) {
		.season-copy {
			border-bottom-left-radius: 0;
			border-top-right-radius: 1.5rem;
			background: rgba(255, 255, 255, 0.94);
		}

		.season-house-image {
			border-bottom-left-radius: 1.5rem;
			border-bottom-right-radius: 1.5rem;
		}
	}

	@media (max-width: 639px) {
		.season-row {
			border-radius: 1.35rem;
			overflow: visible;
			background: #ffffff;
		}

		.season-row + .season-row {
			margin-top: 3.75rem !important;
			position: relative;
		}

		.season-row + .season-row::before {
			background: linear-gradient(
				90deg,
				transparent,
				rgba(148, 163, 184, 0.34),
				transparent
			);
			content: '';
			height: 1px;
			left: 12%;
			position: absolute;
			right: 12%;
			top: -1.9rem;
		}

		.season-stage {
			border-radius: inherit;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}

		.season-visual {
			min-height: clamp(22rem, 92vw, 25rem);
			order: 1;
			position: relative;
			z-index: 1;
		}

		.season-copy,
		.season-row--reverse .season-copy {
			background: #ffffff;
			border-radius: 0 0 1.35rem 1.35rem;
			display: flex;
			justify-content: flex-end;
			min-height: 0;
			order: 2;
			padding: 1.25rem 1.25rem 1.15rem;
			pointer-events: auto;
			position: relative;
			z-index: 2;
		}

		.season-kicker {
			display: none;
		}

		.season-divider {
			display: none;
		}

		.season-copy h3 {
			color: #0f172a;
			font-size: 2rem;
			line-height: 0.98;
			margin-top: 0;
			max-width: 12ch;
			text-shadow: none;
		}

		.season-copy p {
			color: #475569;
			font-size: 0.9rem;
			line-height: 1.45;
			margin-top: 0.75rem;
			max-width: 18rem;
			text-shadow: none;
		}

		.season-copy a {
			box-shadow: 0 14px 28px -22px rgba(15, 23, 42, 0.56);
			margin-top: 1.15rem;
			margin-bottom: 0;
			pointer-events: auto;
		}

		.season-features {
			background: #ffffff;
			border-top: 1px solid rgba(226, 232, 240, 0.9);
			border-radius: 0;
			box-shadow: none;
			margin-top: 1.3rem;
			max-width: 100%;
			padding: 1.05rem 0 0;
			pointer-events: auto;
			position: static;
		}

		.season-feature :global(svg) {
			color: #f59200;
			height: 1.55rem;
			width: 1.55rem;
		}

		.season-feature span {
			color: #111827;
			font-size: 0.72rem;
		}

		.season-house-image {
			border-radius: 1.35rem 1.35rem 0 0;
			height: clamp(22rem, 92vw, 25rem);
			min-height: 0;
		}

		.season-house-image::after {
			background:
				linear-gradient(90deg, rgba(15, 23, 42, 0.04), transparent 52%),
				linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.02) 58%, rgba(15, 23, 42, 0.18) 100%);
			content: '';
			inset: 0;
			pointer-events: none;
			position: absolute;
		}

		.season-house-image img {
			height: 100%;
			object-position: 38% center;
		}

		.season-floater {
			border-radius: 1.05rem;
			border-width: 1px;
			bottom: auto;
			box-shadow: 0 18px 38px -22px rgba(15, 23, 42, 0.92);
			display: block;
			height: clamp(6.2rem, 24vw, 7.8rem);
			right: 0.75rem;
			width: clamp(7.4rem, 32vw, 9.6rem);
			z-index: 3;
		}

		.season-floater-0 {
			top: 1rem;
			transform: rotate(3deg) translateX(0.1rem);
			z-index: 6;
		}

		.season-floater-1 {
			right: 1.05rem;
			top: clamp(6.75rem, 25vw, 8.2rem);
			transform: rotate(-2.5deg) translateX(-0.15rem);
			z-index: 5;
		}

		.season-floater-2 {
			right: 0.65rem;
			top: clamp(12.45rem, 46vw, 15.4rem);
			transform: rotate(2deg) translateX(0.25rem);
			z-index: 4;
		}

		.season-row:hover .season-floater-0,
		.season-floater-0:hover {
			bottom: auto;
			height: clamp(6.2rem, 24vw, 7.8rem);
			right: 0.75rem;
			top: 1rem;
			transform: rotate(3deg) translateX(0.1rem);
			width: clamp(7.4rem, 32vw, 9.6rem);
			z-index: 6;
		}

		.season-row:hover .season-floater-1,
		.season-floater-1:hover {
			bottom: auto;
			height: clamp(6.2rem, 24vw, 7.8rem);
			right: 1.05rem;
			top: clamp(6.75rem, 25vw, 8.2rem);
			transform: rotate(-2.5deg) translateX(-0.15rem);
			width: clamp(7.4rem, 32vw, 9.6rem);
			z-index: 5;
		}

		.season-row:hover .season-floater-2,
		.season-floater-2:hover {
			bottom: auto;
			height: clamp(6.2rem, 24vw, 7.8rem);
			right: 0.65rem;
			top: clamp(12.45rem, 46vw, 15.4rem);
			transform: rotate(2deg) translateX(0.25rem);
			width: clamp(7.4rem, 32vw, 9.6rem);
			z-index: 4;
		}

		.season-row:hover .season-house-image img,
		.season-floater:hover img {
			transform: none !important;
		}

		.season-row:hover .season-floater,
		.season-floater:hover {
			border-color: rgba(255, 255, 255, 0.86);
			box-shadow: 0 18px 38px -22px rgba(15, 23, 42, 0.92);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.season-house-image img,
		.season-floater {
			transition: none;
		}
	}
</style>
