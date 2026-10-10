<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { browser } from '$app/environment';
import { page } from '$app/state';
	import { asset, resolve } from '$app/paths';
	import { lang, t } from '$lib/i18n';
	import { getSortedAccommodationGallery } from '$lib/data/accommodations';
	import { imageAttrs } from '$lib/images';
	import { trackEvent } from '$lib/analytics/plausible';
	import GalleryLightbox, { type GalleryLightboxItem } from '$lib/components/GalleryLightbox.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/seo';
import { localizePath } from '$lib/routing';
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
		Building2,
		MountainSnow,
		CookingPot,
		Sofa,
		Tv,
		Users,
		Share2,
		SquareParking,
		Sun,
		Utensils,
		Wifi,
		Microwave,
		Info,
	} from 'lucide-svelte';

	let { data } = $props();
	const accommodation = $derived.by(() => data.accommodation);

	const withAsset = (path: string) => asset(path);
	const localizedHref = (path: string) => localizePath(path, page.url.pathname);
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
	const ogImage = $derived.by(() =>
		new URL(withAsset(accommodation.images.main), siteUrl).toString()
	);
	const seoTitle = $derived.by(() => accommodation.seoTitle[$lang]);
	const seoDescription = $derived.by(() => accommodation.seoDescription[$lang]);
	const detailHeading = $derived.by(() => accommodation.detailHeading[$lang]);
	const detailIntro = $derived.by(() => accommodation.detailIntro[$lang]);
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

	// helper for "+X Bilder" overlay
	const galleryCount = $derived.by(() => Math.max(0, galleryItems.length - 1));
	const overlayMore = $derived.by(() => Math.max(0, galleryCount - 2));

	// reviews carousel UI-only
	let reviewIndex = $state(0);
	const visibleReviews = 3; // like screenshot
	const canPrev = $derived.by(() => reviewIndex > 0);
	const canNext = $derived.by(
		() => reviewIndex + visibleReviews < (accommodation?.reviews?.length ?? 0)
	);
	const reviewCount = $derived.by(() => accommodation?.reviews?.length ?? 0);
	const averageRating = $derived.by(() => {
		const ratings = (accommodation?.reviews ?? []).map((review) => review.rating).filter((rating) => rating > 0);
		if (!ratings.length) return null;
		return Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1));
	});

	let galleryOpen = $state(false);
	let galleryIndex = $state(0);
	let shareStatus = $state<'idle' | 'copied' | 'error'>('idle');
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

	const shareRoom = async () => {
		if (!browser) return;

		const shareUrl = roomUrl;
		const shareTitle = accommodation.title;
		const shareText = accommodation.subtitle[$lang];

		if (navigator.share) {
			try {
				await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
				return;
			} catch {
				shareStatus = 'error';
				return;
			}
		}

		if (navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(shareUrl);
				shareStatus = 'copied';
				setTimeout(() => {
					shareStatus = 'idle';
				}, 2000);
			} catch {
				shareStatus = 'error';
			}
		}
	};
</script>

<SeoHead title={seoTitle} description={seoDescription} image={accommodation.images.main} />

<svelte:head>
	<!-- eslint-disable-next-line -->
	{@html `<script type="application/ld+json">${roomJsonLd}</script>`}
</svelte:head>

<main class="bg-[#fbfaf7]">
	<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
		<section class="rounded-3xl bg-transparent">
			<!-- Back -->
			<a
				href={localizedHref('/unterkuenfte-preise')}
				class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand hover:opacity-90"
			>
				<ArrowLeft class="h-4 w-4" />{$t('room.detail.back')}</a>

			<!-- GALLERY -->
			<div class="mt-5 grid gap-4 lg:grid-cols-[1fr,340px]">
				<!-- Left big -->
				<button
					type="button"
					class="group relative overflow-hidden rounded-3xl"
					onclick={() => openGallery(0)}
				>
					<img
						{...imageAttrs((galleryPreviewItems[0] ?? galleryItems[0]).src, '(max-width: 1024px) 100vw, 900px')}
						alt={(galleryPreviewItems[0] ?? galleryItems[0]).alt}
						class={`h-[260px] w-full transition duration-700 group-hover:scale-[1.02] sm:h-[360px] lg:h-[480px] ${(galleryPreviewItems[0] ?? galleryItems[0]).kind === 'floorplan' ? 'object-contain bg-white p-4 sm:p-6' : 'object-cover'}`}
						loading="eager"
						fetchpriority="high"
					/>
					{#if (galleryPreviewItems[0] ?? galleryItems[0]).kind === 'floorplan'}
						<span class="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900 shadow-sm">
							{$t('room.detail.gallery.floorplanBadge')}
						</span>
					{/if}
				</button>

				<!-- Right stack -->
				<div class="grid gap-4 grid-cols-2 lg:grid-cols-1">
					<button
						type="button"
						class="relative overflow-hidden rounded-3xl transition hover:opacity-90"
						onclick={() => openGallery(1)}
					>
						<img
							{...imageAttrs((galleryPreviewItems[1] ?? galleryItems[0]).src, '(max-width: 1024px) 50vw, 340px')}
							alt={(galleryPreviewItems[1] ?? galleryItems[0]).alt}
							class={`h-[120px] w-full sm:h-[160px] lg:h-[230px] ${(galleryPreviewItems[1] ?? galleryItems[0]).kind === 'floorplan' ? 'object-contain bg-white p-3' : 'object-cover'}`}
							loading="lazy"
							decoding="async"
						/>
						{#if (galleryPreviewItems[1] ?? galleryItems[0]).kind === 'floorplan'}
							<span class="pointer-events-none absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900 shadow-sm">
								{$t('room.detail.gallery.floorplanBadge')}
							</span>
						{/if}
					</button>

					<button
						type="button"
						class="relative overflow-hidden rounded-3xl transition hover:opacity-90"
						onclick={() => openGallery(2)}
					>
						<img
							{...imageAttrs((galleryPreviewItems[2] ?? galleryItems[0]).src, '(max-width: 1024px) 50vw, 340px')}
							alt={(galleryPreviewItems[2] ?? galleryItems[0]).alt}
							class={`h-[120px] w-full sm:h-[160px] lg:h-[230px] ${(galleryPreviewItems[2] ?? galleryItems[0]).kind === 'floorplan' ? 'object-contain bg-white p-3' : 'object-cover'}`}
							loading="lazy"
							decoding="async"
						/>
						{#if (galleryPreviewItems[2] ?? galleryItems[0]).kind === 'floorplan'}
							<span class="pointer-events-none absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900 shadow-sm">
								{$t('room.detail.gallery.floorplanBadge')}
							</span>
						{/if}

						{#if overlayMore > 0}
							<div class="absolute inset-0 bg-black/35"></div>
							<div class="absolute inset-0 grid place-items-center">
								<span
									class="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur"
								>
									+{overlayMore} {$t('room.detail.gallery.more')}
								</span>
							</div>
						{/if}
					</button>
				</div>
			</div>

			<!-- HEADER + SHARE -->
			<div class="mt-8 flex items-start justify-between gap-6">
				<div class="min-w-0">
					<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand pb-3">
						{$t('brand.name')} · {accommodation.title}
					</p>
					<h1 class="font-serif text-3xl leading-[0.95] text-slate-900 sm:text-5xl">
						{detailHeading}
					</h1>
					<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
					<p class="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
						{detailIntro}
					</p>
				</div>

				<Button variant="secondary" size="sm"
					type="button"
					class="hidden sm:inline-flex"
					onclick={shareRoom}
					aria-live="polite"
				>
					<Share2 class="h-4 w-4" />
					{#if shareStatus === 'copied'}
						{$t('room.detail.shareCopied')}
					{:else}
						{$t('room.detail.share')}
					{/if}
				</Button>
			</div>

			<!-- META ROW -->
			<div class="mt-7 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
				<span class="inline-flex items-center gap-2"><Ruler class="h-4 w-4 text-brand" />{accommodation.attributes.size}</span>
				<span class="text-slate-300">•</span>
				<span class="inline-flex items-center gap-2"><Building2 class="h-4 w-4 text-brand" />{accommodation.attributes.floor}</span>
				<span class="text-slate-300">•</span>
				<span class="inline-flex items-center gap-2"><MountainSnow class="h-4 w-4 text-brand" />{accommodation.attributes.view[$lang]}</span>
				<span class="text-slate-300">•</span>
				<span class="inline-flex items-center gap-2"><Users class="h-4 w-4 text-brand" />{accommodation.attributes.guests[$lang]}</span>
			</div>

			<!-- MAIN CONTENT + BOOKING CARD -->
			<div class="mt-4 grid gap-10 lg:grid-cols-[1fr,360px] lg:items-start">
				<!-- LEFT CONTENT -->
				<div class="space-y-12 lg:pt-4">
					<!-- Description -->
					<section>
						<h2 class="text-2xl font-serif text-slate-900">{$t('room.detail.sections.homeTitle')}</h2>
						<div class="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
							{#each accommodation.description[$lang] as paragraph}
								<p>{paragraph}</p>
							{/each}
						</div>
					</section>

					<!-- Amenities -->
					<section>
						<h2 class="text-2xl font-serif text-slate-900">{$t('room.detail.sections.amenities')}</h2>
						<div class="mt-5 grid gap-x-10 gap-y-4 text-sm text-slate-700 sm:grid-cols-2">
							{#each accommodation.amenities as amenity}
								{#if amenityIcons[amenity as keyof typeof amenityIcons]}
									{@const Icon = amenityIcons[amenity as keyof typeof amenityIcons]}
									<div class="flex items-center gap-3">
										<span class="grid h-8 w-8 place-items-center rounded-xl bg-brand/10 text-brand">
											<Icon class="h-4 w-4" />
										</span>
										<span>{$t(`amenity.${amenity}`)}</span>
									</div>
								{/if}
							{/each}
						</div>
					</section>

					<!-- Prices & Details TABLE -->
					<section bind:this={priceSectionEl}>
						<h2 class="text-2xl font-serif text-slate-900">{$t('room.detail.sections.prices')}</h2>

						<Card tone="default" padding="none"
							class="mt-5 w-full overflow-hidden"
						>
							<table class="hidden w-full text-left text-sm sm:table">
								<thead class="bg-[#fbf3e8] text-sm font-semibold text-slate-600">
									<tr>
										<th class="px-4 py-4">{$t('room.detail.prices.season')}</th>
										<!-- <th class="px-4 py-3">Zeitraum</th> -->
										<th class="px-4 py-4">{$t('room.detail.prices.priceNight')}</th>
										<th class="px-4 py-4">{$t('room.detail.prices.extraPerson')}</th>
										<th class="px-4 py-4">{$t('room.detail.prices.minStay')}</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-100">
									{#each accommodation.priceMatrix as row}
										<tr class={`text-slate-700 ${/sommer|summer/i.test(row.season[$lang]) ? 'bg-amber-50/50' : ''}`}>
											<td class="px-4 py-3 font-semibold text-slate-900">{row.season[$lang]}</td>
											<!-- <td class="px-4 py-3 text-slate-600">{row.period}</td> -->
											<td class="px-4 py-3 font-semibold text-brand">{row.pricePerNight}</td>
											<td class="px-4 py-3 font-semibold text-slate-900">
												{row.extraPerson[$lang]}
											</td>
											<td class="px-4 py-3 font-semibold text-slate-900">{row.minStay[$lang]}</td>
										</tr>
									{/each}
								</tbody>
							</table>
							<div class="divide-y divide-slate-100 text-sm sm:hidden">
								{#each accommodation.priceMatrix as row}
									<div class="space-y-3 p-4 text-slate-700">
										<div class="flex items-baseline justify-between gap-3">
											<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
												{$t('room.detail.prices.season')}
											</p>
											<p class="text-right font-semibold text-slate-900">{row.season[$lang]}</p>
										</div>
										<div class="flex items-baseline justify-between gap-3">
											<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
												{$t('room.detail.prices.priceNight')}
											</p>
											<p class="text-right font-semibold text-brand">{row.pricePerNight}</p>
										</div>
										<div class="flex items-baseline justify-between gap-3">
											<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
												{$t('room.detail.prices.extraPersonShort')}
											</p>
											<p class="text-right font-semibold text-slate-900">{row.extraPerson[$lang]}</p>
										</div>
										<div class="flex items-baseline justify-between gap-3">
											<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
												{$t('room.detail.card.facts.minStayLabel')}
											</p>
											<p class="text-right font-semibold text-slate-900">{row.minStay[$lang]}</p>
										</div>
									</div>
								{/each}
							</div>
						</Card>

						<p class="mt-3 text-xs text-slate-500">{$t('room.detail.prices.note')}</p>
					</section>

					<!-- Reviews carousel -->
					<section>
						<div class="flex items-center justify-between gap-4">
							<div>
								<h2 class="text-2xl font-serif text-slate-900">{$t('room.detail.sections.reviews')}</h2>
								{#if averageRating}
									<p class="mt-1 text-sm font-semibold text-slate-700">
										<span class="text-amber-500">★</span> {averageRating} / 5
										<span class="font-normal text-slate-500"> · {reviewCount} Bewertungen</span>
									</p>
								{/if}
							</div>

							<div class="flex items-center gap-2">
								<button
									type="button"
									class={`grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 ${
										!canPrev ? 'opacity-40 pointer-events-none' : ''
									}`}
									onclick={() => (reviewIndex = Math.max(0, reviewIndex - 1))}
									aria-label="{$t('room.detail.reviews.prev')}"
								>
									‹
								</button>
								<button
									type="button"
									class={`grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 ${
										!canNext ? 'opacity-40 pointer-events-none' : ''
									}`}
									onclick={() =>
										(reviewIndex = Math.min(
											(accommodation.reviews.length ?? 0) - visibleReviews,
											reviewIndex + 1
										))}
									aria-label="{$t('room.detail.reviews.next')}"
								>
									›
								</button>
							</div>
						</div>

						<div class="mt-5 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
							{#each accommodation.reviews.slice(reviewIndex, reviewIndex + visibleReviews) as review}
								<div class="rounded-2xl border border-[#f2e8d9] bg-[#fdfbf7] p-5 shadow-sm">
									<div class="flex items-center gap-1 text-amber-500">
										{#each Array(5) as _, starIndex}
											<span class={`${starIndex < review.rating ? 'opacity-100' : 'opacity-25'}`}>★</span>
										{/each}
									</div>
									<p class="mt-3 text-sm leading-relaxed text-slate-600">“{review.text}”</p>

									<div class="mt-4 flex items-center gap-3">
										<div
											class="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-xs font-semibold text-brand"
										>
											{review.name?.slice(0, 2)?.toUpperCase()}
										</div>
										<div class="min-w-0">
											<p class="text-xs font-semibold text-slate-900">{review.name}</p>
											<p class="text-[10px] text-slate-500">{review.date ?? ''}</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</section>
				</div>

				<!-- RIGHT BOOKING CARD (sticky) -->
				<aside class="lg:sticky booking-card">
					<Card tone="default" padding="md"
					>
						<!-- Header -->
						<div>
							<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
								{$t('room.detail.card.priceFrom')}
							</p>
							<p class="mt-2 text-slate-900">
								<span class="text-5xl font-semibold tracking-tight">{accommodation.pricePerNightBase}&euro;</span>
							</p>
							<p class="mt-1 text-sm text-slate-500">{$t('price.night')}</p>
							<p class="mt-2 text-xs text-slate-500">{$t('room.detail.card.vatNote')}</p>
						</div>

						<!-- Aufschlsselung -->
						<div class="mt-6 border-t border-slate-200 pt-4">
							<p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
								{$t('room.detail.card.breakdown.title')}
							</p>

							<div class="mt-3 space-y-2 text-sm text-slate-700">
								<div class="flex items-center justify-between gap-4">
									<span class="text-slate-600">{$t('room.detail.card.breakdown.nightLabel')}</span>
									<span class="font-semibold text-slate-900">
										{$t('room.detail.card.breakdown.nightFrom')} {accommodation.pricePerNightBase}&euro; /
										{$t('price.night')}
									</span>
								</div>
								<div class="flex items-center justify-between gap-4">
									<span class="text-slate-600">{$t('room.detail.card.breakdown.cleaningLabel')}</span>
									<span class="font-semibold text-slate-900">
										{$t('room.detail.card.breakdown.cleaningValue')}
									</span>
								</div>
								<div class="flex items-center justify-between gap-4">
									<span class="text-slate-600">{$t('room.detail.card.breakdown.taxLabel')}</span>
									<span class="font-semibold text-slate-900">
										{$t('room.detail.card.breakdown.taxValue')}
									</span>
								</div>
							</div>

							<div class="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
								<Info class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
								<span>
								{$t('room.detail.card.breakdown.tip')}
								</span>
							</div>
						</div>

						<!-- Fakten -->
						<div class="mt-6 border-t border-slate-200 pt-4">
							<p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
								{$t('room.detail.card.facts.title')}
							</p>

							<div class="mt-3 space-y-3 text-sm">
								<div class="flex items-center justify-between gap-4">
									<span class="text-slate-600">{$t('room.detail.card.facts.checkinLabel')}</span>
									<span class="font-semibold text-slate-900">
										{$t('room.detail.card.facts.checkinValue')}
									</span>
								</div>
								<div class="flex items-center justify-between gap-4">
									<span class="text-slate-600">{$t('room.detail.card.facts.checkoutLabel')}</span>
									<span class="font-semibold text-slate-900">
										{$t('room.detail.card.facts.checkoutValue')}
									</span>
								</div>
								<div class="flex items-center justify-between gap-4">
									<span class="text-slate-600">{$t('room.detail.card.facts.minStayLabel')}</span>
									<span class="font-semibold text-slate-900">
										{$t('room.detail.card.facts.minStayValue')}
									</span>
								</div>
								<div class="flex items-center justify-between gap-4">
									<span class="text-slate-600">{$t('room.detail.card.facts.cancelLabel')}</span>
									<span class="font-semibold text-slate-900">
										{$t('room.detail.card.facts.cancelValue')}
									</span>
								</div>
								<div class="flex items-center justify-between gap-4">
									<span class="text-slate-600">{$t('room.detail.card.facts.petsLabel')}</span>
									<span class="font-semibold text-slate-900">
										{$t('room.detail.card.facts.petsValue')}
									</span>
								</div>
							</div>
						</div>

						<!-- CTA -->
						<ButtonLink variant="primary" size="md"
							href={localizedHref('/buchen')}
							bind:element={mainBookingCtaEl}
							class="mt-5 w-full"
							onclick={() =>
								trackEvent('Booking: Jetzt buchen', { source: 'room-detail', room: accommodation.slug })
							}
						>
							{$t('room.detail.card.cta')}
						</ButtonLink>

						<!-- Secondary line -->
						<p class="mt-3 text-center text-[11px] text-slate-500">
							{$t('room.detail.card.note')}
						</p>
					</Card>
				</aside>
			</div>
		</section>
	</div>
</main>

<div
	class={`mobile-sticky-booking lg:hidden ${stickyBookingBarVisible ? 'is-visible' : ''}`}
	aria-hidden={!stickyBookingBarVisible}
>
	<div class="rounded-2xl border border-white/40 bg-white/75 shadow-[0_18px_50px_rgba(15,23,42,0.22)] backdrop-blur-xl ring-1 ring-slate-200/60">
		<div class="flex items-center justify-between gap-3 px-3 py-2">
			<div class="min-w-0">
				<p class="text-base font-extrabold leading-tight text-slate-900">
					{$lang === 'de'
						? `ab €${accommodation.pricePerNightBase} / ${$t('price.night')}`
						: `from €${accommodation.pricePerNightBase} / ${$t('price.night')}`}
				</p>
				<p class="truncate text-xs text-slate-500">
					{accommodation.attributes.guests[$lang]} · {accommodation.attributes.size}
				</p>
			</div>
			<ButtonLink variant="primary" size="md"
				href={localizedHref('/buchen')}
				class="shrink-0"
				onclick={() =>
					trackEvent('Booking: Jetzt buchen', { source: 'room-detail-sticky', room: accommodation.slug })}
			>
				{$lang === 'de' ? 'Jetzt buchen' : 'Book now'}
			</ButtonLink>
		</div>
	</div>
</div>

<GalleryLightbox
	open={galleryOpen}
	items={galleryLightboxItems}
	index={galleryIndex}
	title={accommodation.title}
	closeLabel={$t('room.detail.gallery.close')}
	prevLabel={$t('room.detail.gallery.prev')}
	nextLabel={$t('room.detail.gallery.next')}
	onClose={closeGallery}
	onIndexChange={(nextIndex) => (galleryIndex = nextIndex)}
/>


<style>
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




























