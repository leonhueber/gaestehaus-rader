<script lang="ts">
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { lang, t } from '$lib/i18n';
	import { resolve } from '$app/paths';
import { page } from '$app/state';
	import { accommodations } from '$lib/data/accommodations';
	import { imageAttrs } from '$lib/images';
	import { trackEvent } from '$lib/analytics/plausible';
	import SeoHead from '$lib/components/SeoHead.svelte';
import { localizePath } from '$lib/routing';
	import { SITE_ORIGIN } from '$lib/seo';
	import { buildBreadcrumbListSchema, buildJsonLdGraph } from '$lib/structured-data';
	import {
		Lightbulb,
		Wifi,
		Tv,
		Mountain,
		Coffee,
		Sun,
		Flame,
		ShowerHead,
		Bath,
		Baby,
		Sofa,
		SquareParking,
		Utensils,
		ArrowRight,
		Gavel,
		CreditCard,
		CigaretteOff,
		Clock,
		Ticket,
	} from 'lucide-svelte';

	const amenityIcons: Record<string, typeof Wifi> = {
		wifi: Wifi,
		balcony: Sun,
		balkon: Sun,
		mountain: Mountain,
		coffee: Coffee,
		sauna: Flame,
		fireplace: Flame,
		shower: ShowerHead,
		bath: Bath,
		kitchen: Utensils,
		kueche: Utensils,
		badezimmer: Bath,
		fernseher: Tv,
		ausziehcouch: Sofa,
		parking: SquareParking,
	};


	const localizedHref = (path: string) => localizePath(path, page.url.pathname);

	const rooms = accommodations;
	const accommodationsBase = $derived.by(() => localizedHref('/unterkuenfte-preise'));
	const siteUrl = SITE_ORIGIN;
	const roomsJsonLd = $derived.by(() =>
		buildJsonLdGraph([
			buildBreadcrumbListSchema(
				[
					{ name: $t('nav.home'), path: '/' },
					{ name: $t('rooms.page.title'), path: page.url.pathname },
				],
				siteUrl
			),
			{
				'@type': 'ItemList',
				itemListElement: rooms.map((room, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: room.title,
					url: new URL(`${accommodationsBase}${room.slug}/`, siteUrl).toString(),
				})),
			},
		])
	);

	function badgeClasses(badgeLabel: string) {
		if (badgeLabel === 'Besonders ruhig' || badgeLabel === 'Especially quiet') {
			return 'bg-brand text-white';
		}
		return 'bg-slate-800/90 text-white';
	}
</script>

<SeoHead
	titleKey="rooms.seo.title"
	descriptionKey="rooms.seo.description"
	image={rooms[0]?.images?.main ?? '/images/Nr1/main.jpg'}
/>

<svelte:head>
	{@html /* eslint-disable-next-line */ `<script type="application/ld+json">${roomsJsonLd}</script>`}
</svelte:head>

<div class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
	<div class="space-y-10">
		<!-- Header / breadcrumb -->
		<section use:reveal class="opacity-0 translate-y-8 transition-all duration-700 ease-out space-y-4">
			<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
				{$t('rooms.page.breadcrumb')}
			</p>

			<h1 class="mt-4 font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
				{$t('rooms.page.title')}
			</h1>
			<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
			<p class="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
				{$t('rooms.page.subtitle')}
			</p>
		</section>

		<!-- Content grid -->
		<section>
			<!-- Filter -->
			<!-- removed -->

			<!-- Room list -->
			<div class="space-y-14 sm:space-y-16">
				{#each rooms as room}
					<Card as="article" tone="default" padding="none"
						class="group overflow-hidden"
					>
						<!-- Image -->
						<div class="relative">
							<a href={`${accommodationsBase}${room.slug}/`}>
								<img
									{...imageAttrs(room.images.main, '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 720px')}
									alt={`${room.title} – ${room.subtitle[$lang]}`}
									class="h-[38vh] min-h-48 max-h-72 w-full object-cover object-center sm:h-80 sm:max-h-none lg:h-[26rem]"
									loading="lazy"
									decoding="async"
								/>
							</a>
							{#if room.badgeLabel}
								<span
									class={`absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm ${badgeClasses(
										room.badgeLabel
									)}`}
								>
									{room.badgeLabel}
								</span>
							{/if}
							<div
								class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent"
							></div>
						</div>

						<!-- Content (split like screenshot) -->
						<div class="grid gap-6 p-6 sm:p-7 md:grid-cols-[1.6fr,0.9fr] md:gap-0">
							<!-- Left: title + meta -->
							<div class="md:pr-10">
								<h2 class="text-lg font-semibold text-slate-900 sm:text-xl">
									<a href={`${accommodationsBase}${room.slug}/`} class="hover:opacity-90">
										{room.title}
									</a>
								</h2>
								<p class="text-sm text-slate-700">{room.typeLabel[$lang]}</p>

								<div class="mt-2 text-xs text-slate-500">{room.detailMeta[$lang]}</div>

								<!-- Amenities row -->
								<div class="mt-5 hidden flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-600 sm:flex">
									{#each room.amenities as amenity}
										<span
											class={`items-center gap-2 ${
												['balkon', 'kueche', 'wifi', 'badezimmer'].includes(amenity)
													? 'inline-flex'
													: 'hidden lg:inline-flex'
											}`}
										>
											{#if amenityIcons[amenity]}
												{@const Icon = amenityIcons[amenity]}
												<Icon class="h-4 w-4 text-slate-400" />
											{/if}
											{$t(`amenity.${amenity}`)}
										</span>
									{/each}
								</div>
							</div>

							<!-- Right: price + CTA (early on mobile) -->
							<div
								class="flex w-full flex-col items-start gap-4 md:w-auto md:items-end md:border-l md:border-slate-200 md:pl-10"
							>
								<div class="text-left md:text-right">
									<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
										{$t('rooms.page.from')}
									</p>
									<div class="mt-2 flex items-end justify-start gap-2 md:justify-end">
										<p class="text-2xl font-semibold text-brand">€{room.pricePerNightBase}</p>
										<span class="pb-1 text-xs text-slate-500">/ {$t('price.night')}</span>
									</div>
								</div>

								<div class="flex w-full flex-col gap-4 md:w-auto md:items-end">
									<ButtonLink variant="primary" size="md"
										href={localizedHref('/buchen')}
										class="w-full md:w-auto md:min-w-[180px]"
										onclick={() => trackEvent('Booking: Jetzt buchen', { source: 'rooms-list' })}
									>
										{$t('rooms.page.cta')}
										<ArrowRight class="h-4 w-4" />
									</ButtonLink>
									<div class="grid gap-1 text-[11px] text-slate-500 md:text-right">
										<p>✓ {$lang === 'de' ? 'Bestpreis bei Direktbuchung' : 'Best price with direct booking'}</p>
										<p>✓ {$lang === 'de' ? 'Keine Buchungsgebühren' : 'No booking fees'}</p>
									</div>
								</div>
							</div>

						</div>
					</Card>
				{/each}
			</div>
		</section>

		<!-- Bottom section -->
		<section use:reveal class="opacity-0 translate-y-8 transition-all duration-700 ease-out space-y-12 sm:space-y-14">
			<div class="space-y-3 pt-14 text-center sm:pt-16">
				<p class="text-xs font-semibold tracking-[0.35em] uppercase text-brand">
					{$t('rooms.page.inclusive.kicker')}
				</p>

				<h2 class="font-serif text-3xl sm:text-4xl text-slate-900">
					{$t('rooms.page.inclusive.title')}
				</h2>

				<div class="mx-auto h-[2px] w-10 rounded-full bg-brand"></div>
			</div>

			<!-- Inclusive services tiles -->
			<div class="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5">
				<Card tone="default" padding="sm" class="text-left sm:text-center">
					<div class="flex items-center gap-3 sm:block">
					<div class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand sm:mx-auto sm:h-12 sm:w-12 sm:rounded-full">
						<Lightbulb class="h-6 w-6" />
					</div>
					<div class="min-w-0">
					<p class="text-sm font-semibold text-slate-900 leading-snug sm:mt-4">
						{#if $t('rooms.page.inclusive.power').includes('/')}
							{$t('rooms.page.inclusive.power').split('/')[0]}<br />
							{$t('rooms.page.inclusive.power').split('/')[1]}
						{:else}
							{$t('rooms.page.inclusive.power')}
						{/if}
					</p>
					<p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:mt-1">
						{$t('rooms.page.inclusive.free')}
					</p>
					</div>
					</div>
				</Card>

				<Card tone="default" padding="sm" class="text-left sm:text-center">
					<div class="flex items-center gap-3 sm:block">
					<div class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand sm:mx-auto sm:h-12 sm:w-12 sm:rounded-full">
						<Wifi class="h-6 w-6" />
					</div>
					<div class="min-w-0">
					<p class="text-sm font-semibold text-slate-900 leading-snug break-words sm:mt-4">
						{$t('rooms.page.inclusive.wifi')}
					</p>
					<p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:mt-1">
						{$t('rooms.page.inclusive.free')}
					</p>
					</div>
					</div>
				</Card>

				<Card tone="default" padding="sm" class="text-left sm:text-center">
					<div class="flex items-center gap-3 sm:block">
					<div class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand sm:mx-auto sm:h-12 sm:w-12 sm:rounded-full">
						<Baby class="h-6 w-6" />
					</div>
					<div class="min-w-0">
					<p class="text-sm font-semibold text-slate-900 leading-snug break-words sm:mt-4">
						{$t('rooms.page.inclusive.kids')}
					</p>
					<p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:mt-1">
						{$t('rooms.page.inclusive.free')}
					</p>
					</div>
					</div>
				</Card>

				<Card tone="default" padding="sm" class="text-left sm:text-center">
					<div class="flex items-center gap-3 sm:block">
					<div class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand sm:mx-auto sm:h-12 sm:w-12 sm:rounded-full">
						<SquareParking class="h-6 w-6" />
					</div>
					<div class="min-w-0">
					<p class="text-sm font-semibold text-slate-900 leading-snug break-words sm:mt-4">
						{$t('rooms.page.inclusive.parking')}
					</p>
					<p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:mt-1">
						{$t('rooms.page.inclusive.free')}
					</p>
					</div>
					</div>
				</Card>

				<Card tone="accent" padding="sm" class="text-left sm:text-center">
					<div class="flex items-center gap-3 sm:block">
					<div class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand sm:mx-auto sm:h-12 sm:w-12 sm:rounded-full">
						<Ticket class="h-6 w-6" />
					</div>
					<div class="min-w-0">
					<p class="text-sm font-semibold text-slate-900 leading-snug break-words sm:mt-4">
						{$t('rooms.page.inclusive.guestcard')}
					</p>
					<p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:mt-1">
						{$t('rooms.page.inclusive.free')}
					</p>
					</div>
					</div>
				</Card>
			</div>

			<!-- Price info card -->
			<Card tone="default" padding="md" >
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div class="min-w-0">
						<h2 class="text-2xl font-medium tracking-tight text-slate-900 sm:text-2xl">
							{$t('rooms.page.pricing.title')}
						</h2>
						<p class="mt-2 text-sm text-slate-500">
							{$t('rooms.page.pricing.subtitle')}
						</p>
					</div>

					<span
						class="inline-flex items-center rounded-full border border-brand/15 bg-brand/10 px-4 py-2 text-xs font-semibold text-brand"
					>
						{$t('rooms.page.pricing.kids')}
					</span>
				</div>

				<div class="mt-6 divide-y divide-slate-100">
					<div class="flex items-center justify-between gap-6 py-5">
						<p class="text-sm text-slate-700">
							{$t('rooms.page.pricing.extraPrefix')}
							<span class="font-semibold text-slate-900">{$t('rooms.page.pricing.extraHighlight')}</span>
							{$t('rooms.page.pricing.extraSuffix')}
						</p>
						<span class="whitespace-nowrap text-sm font-semibold text-slate-900">
							{$t('rooms.page.pricing.extraPrice')}
						</span>
					</div>

					<div class="flex items-center justify-between gap-6 py-5">
						<div>
							<p class="text-sm text-slate-700">{$t('rooms.page.pricing.tax')}</p>
						</div>
						<span class="whitespace-nowrap text-sm font-semibold text-slate-900">
							{$t('rooms.page.pricing.tax.price')}
						</span>
					</div>

					<div class="flex items-center justify-between gap-6 py-5">
						<p class="text-sm font-semibold text-slate-800">{$t('rooms.page.pricing.cleaning')}</p>
						<span class="whitespace-nowrap text-sm font-semibold text-slate-900">
							{$t('rooms.page.pricing.cleaningPrice')}
						</span>
					</div>
				</div>

				<p class="mt-5 inline-flex items-center gap-2 text-xs italic text-slate-400">
					<span aria-hidden="true">🐾</span>
					{$t('rooms.page.pricing.petsNote')}
				</p>
			</Card>

			<!-- Info blocks (with icons like design) -->
			<div class="grid gap-10 pt-2 md:grid-cols-2">
				<div class="flex items-start gap-4">
					<div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
						<CreditCard class="h-5 w-5" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-slate-900">
							{$t('rooms.page.info.payment.title')}
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-slate-600">
							{$t('rooms.page.info.payment.prefix')}
							<span class="font-semibold text-slate-900">
								{$t('rooms.page.info.payment.highlightCash')}
							</span>
							{$t('rooms.page.info.payment.middle')}
							<span class="font-semibold text-slate-900">
								{$t('rooms.page.info.payment.highlightTransfer')}
							</span>
							{$t('rooms.page.info.payment.suffix')}
						</p>
					</div>
				</div>

				<div class="flex items-start gap-4">
					<div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
						<Clock class="h-5 w-5" />
					</div>
					<div class="w-full">
						<h3 class="text-lg font-semibold text-slate-900">
							{$t('rooms.page.info.arrival.title')}
						</h3>

						<div class="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
							<div class="flex items-center justify-between px-4 py-3 text-sm">
								<span class="font-semibold text-slate-900">
									{$t('rooms.page.info.arrival.checkin')}
								</span>
								<span class="text-slate-600">{$t('rooms.page.info.arrival.checkinTime')}</span>
							</div>
							<div class="flex items-center justify-between px-4 py-3 text-sm">
								<span class="font-semibold text-slate-900">
									{$t('rooms.page.info.arrival.checkout')}
								</span>
								<span class="text-slate-600">{$t('rooms.page.info.arrival.checkoutTime')}</span>
							</div>
						</div>
					</div>
				</div>

				<div class="flex items-start gap-4">
					<div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
						<SquareParking class="h-5 w-5" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-slate-900">
							{$t('rooms.page.info.parking.title')}
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-slate-600">
							<span class="font-semibold text-slate-900">
								{$t('rooms.page.info.parking.highlightFree')}
							</span>
							{$t('rooms.page.info.parking.middle')}
							<span class="font-semibold text-slate-900">
								{$t('rooms.page.info.parking.highlightGuesthouse')}
							</span>
							{$t('rooms.page.info.parking.suffix')}
						</p>
					</div>
				</div>

				<div class="flex items-start gap-4">
					<div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
						<CigaretteOff class="h-5 w-5" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-slate-900">
							{$t('rooms.page.info.smoking.title')}
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-slate-600">
							{$t('rooms.page.info.smoking.prefix')}
							<span class="font-semibold text-slate-900">
								{$t('rooms.page.info.smoking.highlight')}
							</span>
							{$t('rooms.page.info.smoking.suffix')}
						</p>
					</div>
				</div>
			</div>

			<!-- Cancellation card (like design) -->
			<Card tone="accent" padding="md" >
				<div class="flex items-start gap-4">
					<div
						class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white shadow-sm"
					>
						<Gavel class="h-5 w-5" />
					</div>

					<div class="min-w-0">
						<h3 class="text-lg font-semibold text-slate-900 sm:text-xl">
							{$t('rooms.page.info.cancellation.title')}
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-slate-600">
							{$t('rooms.page.info.cancellation.prefix')}
							<span class="font-semibold text-slate-900">
								{$t('rooms.page.info.cancellation.highlight')}
							</span>
							{$t('rooms.page.info.cancellation.middle')}
							<a
								class="font-semibold text-brand hover:opacity-90"
								href="https://www.europaeische.at"
								target="_blank"
								rel="noreferrer"
							>
								{$t('rooms.page.info.cancellation.link')}
							</a>.
						</p>
					</div>
				</div>
			</Card>
		</section>
	</div>
</div>


