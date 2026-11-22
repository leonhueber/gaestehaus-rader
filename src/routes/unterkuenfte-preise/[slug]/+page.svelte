<script lang="ts">
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { lang, t } from '$lib/i18n';
	import { getSortedAccommodationGallery } from '$lib/data/accommodations';
	import { imageAttrs } from '$lib/images';
	import { trackEvent } from '$lib/analytics/plausible';
	import { openGalleryFrom } from '$lib/gallery-transition';
	import GalleryLightbox, { type GalleryLightboxItem } from '$lib/components/GalleryLightbox.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/seo';
	import { localizePath, normalizePathname } from '$lib/routing';
	import {
		buildBreadcrumbListSchema,
		buildJsonLdGraph,
		buildVacationRentalSchema,
	} from '$lib/structured-data';
	import { onMount } from 'svelte';
	import {
		ArrowLeft,
		Bath,
		Coffee,
		Mountain,
		Ruler,
		Refrigerator,
		CookingPot,
		Sofa,
		Tv,
		Users,
		SquareParking,
		Sun,
		Utensils,
		Wifi,
		Microwave,
		ChevronDown,
	} from 'lucide-svelte';

	let { data } = $props();
	const accommodation = $derived.by(() => data.accommodation);

	const localizedHref = (path: string) => localizePath(path, page.url.pathname);
	const entryPoint = $derived(browser ? page.url.searchParams.get('from') : null);
	const fromHome = $derived(entryPoint === 'home' || entryPoint === 'home-rooms');
	const listHref = $derived(localizedHref('/unterkuenfte-preise'));
	const backHref = $derived(fromHome
		? localizedHref('/') + (entryPoint === 'home-rooms' ? '#appartements' : '')
		: listHref + '#' + accommodation.slug);
	let enteredFromList = false;

	afterNavigate(({ from, type }) => {
		enteredFromList = type === 'link' && from !== null &&
			normalizePathname(from.url.pathname) === normalizePathname(listHref);
	});

	function returnToList(event: MouseEvent) {
		if (fromHome || !enteredFromList || event.button !== 0 ||
			event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		history.back();
	}
	const siteUrl = SITE_ORIGIN;

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

	const roomImageAlt = $derived.by(() => `${accommodation.detailHeading[$lang]} – ${accommodation.subtitle[$lang]}`);
	const sortedGalleryImages = $derived.by(() => getSortedAccommodationGallery(accommodation));
	const floorplanAlt = $derived.by(
		() => `${$t('room.detail.sections.floorplan')} – ${accommodation.title}`
	);

	type GalleryItem = {
		src: string;
		alt: string;
		kind: 'photo' | 'floorplan';
	};

	const galleryItems = $derived.by<GalleryItem[]>(() => {
		const seen = new Set<string>();
		const items: GalleryItem[] = [];

		const pushPhoto = (src: string, alt: string) => {
			if (seen.has(src)) return;
			seen.add(src);
			items.push({
				src,
				alt,
				kind: 'photo',
			});
		};

		pushPhoto(accommodation.images.main, roomImageAlt);

		for (const image of sortedGalleryImages) {
			pushPhoto(image.src, image.alt[$lang]);
		}

		if (accommodation.floorplanImage && !seen.has(accommodation.floorplanImage)) {
			items.push({
				src: accommodation.floorplanImage,
				alt: floorplanAlt,
				kind: 'floorplan',
			});
		}

		return items;
	});
	const galleryLightboxItems = $derived.by<GalleryLightboxItem[]>(() =>
		galleryItems.map((item) => ({
			src: item.src,
			alt: item.alt,
			title: item.alt,
			badge: item.kind === 'floorplan' ? $t('room.detail.gallery.floorplanBadge') : undefined,
			contain: item.kind === 'floorplan',
		}))
	);
	const roomUrl = $derived.by(() =>
		new URL(`${localizedHref('/unterkuenfte-preise')}${accommodation.slug}/`, siteUrl).toString()
	);
	const roomName = $derived(accommodation.typeLabel[$lang] + ' ' + ($lang === 'de' ? accommodation.title : accommodation.title.replace('Nr.', 'No.')));
	const seoTitle = $derived.by(() => accommodation.seoTitle[$lang]);
	const seoDescription = $derived.by(() => accommodation.seoDescription[$lang]);
	const amenityLabels = $derived.by(() =>
		accommodation.amenities.map((amenity) => $t(`amenity.${amenity}`))
	);
	const roomJsonLd = $derived.by(() => {
		const roomSchema = buildVacationRentalSchema({
			accommodation,
			locale: $lang,
			pageUrl: roomUrl,
			siteOrigin: siteUrl,
			imagePaths: galleryItems.map((item) => item.src),
			amenityLabels,
			description: accommodation.detailBody[$lang],
			mainEntityOfPage: roomUrl,
		});

		return buildJsonLdGraph([
			buildBreadcrumbListSchema(
				[
					{ name: $t('nav.home'), path: '/' },
					{ name: $t('rooms.page.title'), path: localizedHref('/unterkuenfte-preise') },
					{ name: accommodation.title, path: page.url.pathname },
				],
				siteUrl
			),
			roomSchema.vacationRentalNode,
			roomSchema.accommodationNode,
			roomSchema.offerNode,
		]);
	});

	const galleryPreviewItems = $derived.by(() => galleryItems.slice(0, 3));

	const nightlyPrice = $derived(new Intl.NumberFormat($lang === 'de' ? 'de-AT' : 'en-IE', {
		style: 'currency', currency: 'EUR', maximumFractionDigits: 0, minimumFractionDigits: 0
	}).format(accommodation.pricePerNightBase));
	const reviewDate = $derived(new Intl.DateTimeFormat($lang === 'de' ? 'de-AT' : 'en-GB', {
		month: 'long', year: 'numeric', timeZone: 'UTC'
	}));

	let galleryOpen = $state(false);
	let galleryIndex = $state(0);
	let priceSectionEl: HTMLElement | null = null;
	let priceSectionTracked = false;
	let mainBookingCtaEl = $state<HTMLAnchorElement | null>(null);
	let stickyBookingBarVisible = $state(false);

	const openGallery = (index: number) => {
		galleryIndex = index;
		galleryOpen = true;
		void trackEvent('Content: Gallery Opened', { room: accommodation.slug, index });
		void trackEvent('Content: Photo Lightbox Opened', { room: accommodation.slug, index });
	};

	const closeGallery = () => {
		galleryOpen = false;
	};

	onMount(() => {
		if (!browser || !priceSectionEl) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (priceSectionTracked) return;
				const hasVisible = entries.some((entry) => entry.isIntersecting);
				if (!hasVisible) return;

				priceSectionTracked = true;
				void trackEvent('Trust: Price Section Viewed', { room: accommodation.slug });
				observer.disconnect();
			},
			{ threshold: 0.4 }
		);

		observer.observe(priceSectionEl);

		const updateStickyBookingBar = () => {
			const isMobile = window.matchMedia('(max-width: 1023px)').matches;
			if (!isMobile) {
				stickyBookingBarVisible = false;
				return;
			}

			const stickyShowOffset = Math.max(120, Math.round(window.innerHeight * 0.2));
			let shouldShow = window.scrollY > stickyShowOffset;
			if (mainBookingCtaEl) {
				const rect = mainBookingCtaEl.getBoundingClientRect();
				const ctaInView = rect.top < window.innerHeight && rect.bottom > 0;
				if (ctaInView) shouldShow = false;
			}

			stickyBookingBarVisible = shouldShow;
		};

		window.addEventListener('scroll', updateStickyBookingBar, { passive: true });
		window.addEventListener('resize', updateStickyBookingBar);
		updateStickyBookingBar();

		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', updateStickyBookingBar);
			window.removeEventListener('resize', updateStickyBookingBar);
		};
	});
</script>

<SeoHead title={seoTitle} description={seoDescription} image={accommodation.images.main} />

<svelte:head>
	<!-- eslint-disable-next-line -->
	{@html `<script type="application/ld+json">${roomJsonLd}</script>`}
</svelte:head>

<article class="room-detail px-2 sm:px-0">
	<div class="flex items-center justify-between gap-4">
		<a href={backHref} onclick={returnToList} class="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 hover:underline">
			<ArrowLeft size={16} aria-hidden="true" />{$t(fromHome ? 'nav.home' : 'nav.roomsShort')}
		</a>
	</div>

	<header class="room-heading mt-3 sm:mt-5">
		<h1 class="font-serif text-[2rem] leading-tight text-slate-900 sm:text-[2.5rem]">
			{roomName}
		</h1>
		<p class="mt-1 text-base leading-relaxed text-slate-600">{accommodation.subtitle[$lang]}</p>
	</header>
	<ul class="room-facts mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-700">
		<li class="flex items-center gap-2"><Ruler size={16} aria-hidden="true" />{accommodation.attributes.size}</li>
		<li class="flex items-center gap-2"><Users size={16} aria-hidden="true" />{accommodation.attributes.guests[$lang]}</li>
	</ul>

	<div class="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-[2fr_1fr]">
		{#each galleryPreviewItems as item, i}
			<button
				type="button"
				class={['group relative overflow-hidden rounded-xl', i === 0 ? 'col-span-2 aspect-[16/10] w-full sm:col-span-1 sm:row-span-2 sm:aspect-auto' : i === 1 ? 'room-preview-first aspect-[2/1]' : 'room-preview-second aspect-[2/1]']}
				data-room-photo={i === 0 ? accommodation.slug : undefined}
				aria-label={item.alt + ' · ' + (i + 1) + ' / ' + galleryItems.length}
				onclick={(event) => openGalleryFrom(event.currentTarget, () => openGallery(i))}
			>
				<img
					{...imageAttrs(item.src, i === 0 ? '(max-width: 639px) 100vw, 720px' : '(max-width: 639px) 50vw, 360px')}
					alt={item.alt}
					class={['absolute inset-0 h-full w-full motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02]', item.kind === 'floorplan' ? 'object-contain bg-white p-3' : 'object-cover']}
					loading={i === 0 ? 'eager' : 'lazy'}
					fetchpriority={i === 0 ? 'high' : 'auto'}
				/>
				{#if i === 2 && galleryItems.length > 3}
					<span class="absolute bottom-2 right-2 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-900">
						+{galleryItems.length - 3} {$t('room.detail.gallery.more')}
					</span>
				{:else if item.kind === 'floorplan'}
					<span class="absolute bottom-2 right-2 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold">{$t('room.detail.gallery.floorplanBadge')}</span>
				{/if}
			</button>
		{/each}
	</div>

	<div class="mt-6 grid items-start gap-8 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
		<aside class="booking-card lg:sticky lg:col-start-2 lg:row-start-1" bind:this={priceSectionEl}>
			<Card padding="md">
				<p class="flex flex-wrap items-baseline gap-x-1.5 text-sm text-slate-600">
					{$t('home.rooms.priceFrom')} <strong class="text-3xl font-semibold tracking-tight text-slate-900">{nightlyPrice}</strong> / {$t('price.night')}
				</p>
				<p class="mt-1 text-xs leading-relaxed text-slate-600">{$t('room.detail.card.vatNote')}</p>
				<dl aria-label={$t('room.detail.card.breakdown.title')} class="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-700">
					<div class="flex items-baseline justify-between gap-3">
						<dt>{$t('room.detail.card.breakdown.cleaningLabel')}</dt>
						<dd class="text-right font-medium">{$t('room.detail.card.breakdown.cleaningValue')}</dd>
					</div>
					<div class="flex items-baseline justify-between gap-3">
						<dt>
							{$t('room.detail.card.breakdown.taxLabel')}
							<span class="mt-0.5 block text-xs leading-relaxed text-slate-600">{$t('room.detail.card.breakdown.taxNote')}</span>
						</dt>
						<dd class="shrink-0 font-medium">{$t('rooms.page.pricing.tax.price')}</dd>
					</div>
				</dl>
				<ButtonLink variant="primary" size="md" href={localizedHref('/buchen/' + accommodation.slug)}
					bind:element={mainBookingCtaEl} class="mt-4 w-full"
					onclick={() => trackEvent('Booking: Jetzt buchen', { source: 'room-detail', room: accommodation.slug })}>
					{$t('booking.bar.cta')}
				</ButtonLink>
				<details class="group mt-4 border-t border-slate-200">
					<summary class="flex min-h-11 cursor-pointer items-center justify-between gap-2 pt-2 text-sm font-semibold">
						{$t('room.detail.card.stayDetails')} <ChevronDown size={16} class="group-open:rotate-180" aria-hidden="true" />
					</summary>
					<dl class="space-y-2 pt-2 text-sm">
						{#each ['checkin', 'checkout', 'minStay', 'cancel', 'pets'] as fact}
							<div class="flex justify-between gap-3"><dt>{$t('room.detail.card.facts.' + fact + 'Label')}</dt><dd>{$t('room.detail.card.facts.' + fact + 'Value')}</dd></div>
						{/each}
					</dl>
					<p class="mt-3 text-sm leading-relaxed text-slate-600">{$t('room.detail.card.note')}</p>
				</details>
			</Card>
		</aside>

		<div class="min-w-0 space-y-8 lg:col-start-1 lg:row-start-1">
			<section>
				<h2 class="text-xl font-semibold leading-snug text-slate-900">{$t('room.detail.sections.amenities')}</h2>
				<ul class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm leading-relaxed text-slate-700">
					{#each accommodation.amenities as amenity}
						{@const Icon = amenityIcons[amenity as keyof typeof amenityIcons]}
						<li class="flex items-center gap-2.5">
							{#if Icon}<Icon size={18} class="shrink-0" strokeWidth={1.5} aria-hidden="true" />{/if}
							{$t('amenity.' + amenity)}
						</li>
					{/each}
				</ul>
				<details class="group mt-4 border-b border-slate-200">
					<summary class="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-medium">
						{$lang === 'de' ? 'Mehr zum Appartement' : 'About the apartment'}
						<ChevronDown size={16} class="group-open:rotate-180" aria-hidden="true" />
					</summary>
					<div class="max-w-prose space-y-2 pb-4 text-sm leading-relaxed text-slate-600">
						<p>{$lang === 'de' ? accommodation.attributes.floor + '. Stock' : 'Floor ' + accommodation.attributes.floor} · {accommodation.attributes.view[$lang]}</p>
						{#each accommodation.description[$lang] as paragraph}<p>{paragraph}</p>{/each}
					</div>
				</details>
			</section>
			{#if accommodation.reviews.length}
				<section>
					<h2 class="text-xl font-semibold leading-snug text-slate-900">{$t('room.detail.sections.reviews')}</h2>
					{#each accommodation.reviews as review}
						<figure class="mt-4 max-w-prose">
							<figcaption class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
								<strong class="font-semibold">{review.name}</strong>
								<span class="text-slate-600"><span class="text-amber-700" aria-hidden="true">★</span> {review.rating} / 5</span>
								{#if review.date}<time datetime={review.date} class="text-slate-600">{reviewDate.format(new Date(review.date))}</time>{/if}
							</figcaption>
							<blockquote class="mt-2 text-sm leading-relaxed text-slate-700">“{review.text}”</blockquote>
						</figure>
					{/each}
				</section>
			{/if}
		</div>
	</div>
</article>

<div
	class={`mobile-sticky-booking lg:hidden ${stickyBookingBarVisible ? 'is-visible' : ''}`}
	inert={!stickyBookingBarVisible}
>
	<div class="rounded-2xl border border-white/40 bg-white shadow-md ring-1 ring-slate-200">
		<div class="flex items-center justify-between gap-3 px-3 py-2">
			<div class="min-w-0">
				<p class="text-base font-semibold leading-tight text-slate-900">
					{$t('home.rooms.priceFrom')} {nightlyPrice} / {$t('price.night')}
				</p>
				<p class="truncate text-xs text-slate-500">
					{roomName}
				</p>
			</div>
			<ButtonLink variant="primary" size="md"
				href={localizedHref('/buchen/' + accommodation.slug)}
				class="shrink-0"
				onclick={() =>
					trackEvent('Booking: Jetzt buchen', { source: 'room-detail-sticky', room: accommodation.slug })}
			>
				{$t('booking.bar.cta')}
			</ButtonLink>
		</div>
	</div>
</div>

<GalleryLightbox
	open={galleryOpen}
	items={galleryLightboxItems}
	index={galleryIndex}
	title={roomName}
	closeLabel={$t('room.detail.gallery.close')}
	prevLabel={$t('room.detail.gallery.prev')}
	nextLabel={$t('room.detail.gallery.next')}
	onClose={closeGallery}
	onIndexChange={(nextIndex) => (galleryIndex = nextIndex)}
/>

<style>
	summary::-webkit-details-marker { display: none; }

	.booking-card {
		top: 9rem;
	}

	.mobile-sticky-booking {
		position: fixed;
		left: 0.75rem;
		right: 0.75rem;
		bottom: calc(0.75rem + env(safe-area-inset-bottom));
		z-index: 50;
		transform: translateY(120%);
		opacity: 0;
		transition: transform 0.25s ease, opacity 0.25s ease;
	}

	.mobile-sticky-booking.is-visible {
		transform: translateY(0);
		opacity: 1;
	}
</style>
