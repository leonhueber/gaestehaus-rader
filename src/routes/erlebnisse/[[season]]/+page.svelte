<script lang="ts">
	import { cardClasses } from '$lib/components/ui/styles';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import CardLink from '$lib/components/ui/CardLink.svelte';
	import type { ComponentType } from 'svelte';
	import { lang, t } from '$lib/i18n';
	import { page } from '$app/state';
import { localizePath } from '$lib/routing';
	import { imageAttrs, largestImageUrl } from '$lib/images';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getExperienceSeason, getViennaMonth } from '$lib/hero-season';
	import {
		experienceEvents as events,
		experienceSeasonContent as content,
		experienceFestivalSection,
		showFestivalSection,
		type ExperienceEvent,
		type ExperienceLinkType,
		type SeasonKey,
	} from '$lib/data/experience';
	import { onMount, tick } from 'svelte';
	import {
		ArrowRight,
		CalendarDays,
		CarFront,
		Clock3,
		ExternalLink,
		Gauge,
		MapPinned,
		Mountain,
		Route,
		Snowflake,
		Sun,
		X,
	} from 'lucide-svelte';

	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	type LocalizedText = { de: string; en: string };
	type LinkMeta = { label: LocalizedText; icon: ComponentType };
	type ExperienceFact = { label: string; value: string; icon: ComponentType };
	type ViewTransitionDocument = Document & {
		startViewTransition?: (
			update: () => void | Promise<void>
		) => { updateCallbackDone: Promise<void> };
	};

	const localizedHref = (path: string) => localizePath(path, page.url.pathname);
const localize = (value?: LocalizedText) => (value ? value[$lang] : '');
	const difficultyLabels: Record<'easy' | 'medium' | 'hard', LocalizedText> = {
		easy: { de: 'Leicht', en: 'Easy' },
		medium: { de: 'Mittel', en: 'Moderate' },
		hard: { de: 'Schwer', en: 'Hard' },
	};
	const formatDistance = (km: number) =>
		$lang === 'de' ? `${km.toString().replace('.', ',')} km` : `${km} km`;
	const formatElevation = (meters: number) =>
		$lang === 'de' ? `+${meters.toLocaleString('de-DE')} hm` : `+${meters.toLocaleString('en-US')} m`;
	const buildSummaryFacts = (event: ExperienceEvent): ExperienceFact[] => {
		const facts: ExperienceFact[] = [];
		if (event.driveMinutes != null) {
			facts.push({
				label: $lang === 'de' ? 'Anfahrt' : 'Drive',
				value: $lang === 'de' ? `${event.driveMinutes} min ab Haus` : `${event.driveMinutes} min from the house`,
				icon: CarFront,
			});
		}
		if (event.durationHours) {
			facts.push({
				label: $lang === 'de' ? 'Dauer' : 'Duration',
				value: `${event.durationHours} h`,
				icon: Clock3,
			});
		}
		if (event.difficulty) {
			facts.push({
				label: $lang === 'de' ? 'Schwierigkeit' : 'Difficulty',
				value: localize(difficultyLabels[event.difficulty]),
				icon: Gauge,
			});
		}
		return facts.slice(0, 3);
	};
	const buildPlanningFacts = (event: ExperienceEvent): ExperienceFact[] =>
		buildSummaryFacts(event).map((fact) => ({
			...fact,
			value:
				fact.icon === CarFront && event.driveMinutes != null
					? `${event.driveMinutes} min`
					: fact.value,
		}));
	const buildDetailFacts = (event: ExperienceEvent): ExperienceFact[] => {
		const facts: ExperienceFact[] = [];
		if (event.distanceKm != null) {
			facts.push({
				label: $lang === 'de' ? 'Strecke' : 'Distance',
				value: formatDistance(event.distanceKm),
				icon: Route,
			});
		}
		if (event.elevationGainM != null) {
			facts.push({
				label: $lang === 'de' ? 'Höhenmeter' : 'Elevation gain',
				value: formatElevation(event.elevationGainM),
				icon: Mountain,
			});
		}
		if (event.location) {
			facts.push({
				label: $lang === 'de' ? 'Ort' : 'Location',
				value: localize(event.location),
				icon: MapPinned,
			});
		}
		if (event.seasonMonths) {
			facts.push({
				label: $lang === 'de' ? 'Saison' : 'Season',
				value: event.seasonMonths[$lang],
				icon: CalendarDays,
			});
		}
		return facts;
	};
	const experienceLinkMeta: Record<ExperienceLinkType, LinkMeta> = {
		google: { label: { de: 'Google Maps', en: 'Google Maps' }, icon: MapPinned },
		nassfeld: { label: { de: 'Nassfeld', en: 'Nassfeld' }, icon: Mountain },
		bergfex: { label: { de: 'Bergfex', en: 'Bergfex' }, icon: Route },
		website: { label: { de: 'Website', en: 'Website' }, icon: ExternalLink },
	};
	const getEventLinks = (event: ExperienceEvent) => event.links ?? [];

	const seasonPaths: Record<SeasonKey, string> = {
		summer: '/erlebnisse/sommer',
		winter: '/erlebnisse/winter',
	};
	const seasonOptions: Array<{ key: SeasonKey; icon: ComponentType }> = [
		{ key: 'summer', icon: Sun },
		{ key: 'winter', icon: Snowflake },
	];

	const seoSeasonFromUrl = $derived.by((): SeasonKey | null => {
		const season = page.params.season;
		if (season === 'winter') return 'winter';
		if (season === 'sommer' || season === 'summer') return 'summer';
		return null;
	});

	// The overview starts with the prerendered season and switches to the visitor's current season after mount.
	let currentSeason = $state<SeasonKey>(
		(page.data as { defaultSeason?: SeasonKey }).defaultSeason ?? 'summer'
	);
	const activeSeason = $derived(seoSeasonFromUrl ?? currentSeason);

	let activeExperience = $state<ExperienceEvent | null>(null);
	let modalCloseButton = $state<HTMLButtonElement | null>(null);
	let lastExperienceTrigger: HTMLElement | null = null;
	let reduceMotion = $state(false);
	let supportsViewTransitions = $state(false);

	const eventsBySeason: Record<SeasonKey, ExperienceEvent[]> = {
		summer: events.filter((event) => event.season === 'summer'),
		winter: events.filter((event) => event.season === 'winter'),
	};
	const featuredEvent = $derived(eventsBySeason[activeSeason][0]);
	const secondaryEvents = $derived(eventsBySeason[activeSeason].slice(1));

	const currentContent = $derived(content[activeSeason]);
	const copyKey = $derived(seoSeasonFromUrl ? 'experiences.seo.' + seoSeasonFromUrl : 'experiences.seo');

	const festivalSection = experienceFestivalSection;

	// Desktop rows alternate a wide (2/3) and a narrow (1/3) card; an odd last card spans the full row.
	type CardLayout = 'wide' | 'narrow' | 'panorama';
	function cardLayout(index: number, count: number): CardLayout {
		if (count % 2 === 1 && index === count - 1) return 'panorama';
		const row = Math.floor(index / 2);
		return (index % 2 === 0) === (row % 2 === 0) ? 'wide' : 'narrow';
	}
	const photoCardClasses =
		'group relative block w-full scroll-mt-28 overflow-hidden rounded-2xl bg-slate-700 text-left text-white [text-shadow:0_1px_2px_rgba(15,23,42,0.55),0_2px_14px_rgba(15,23,42,0.45)] transition-shadow duration-300 hover:shadow-[0_14px_34px_rgba(15,23,42,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900 motion-reduce:transition-none';

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && activeExperience) void closeExperienceModal();
	}

	async function updateWithViewTransition(update: () => void) {
		if (typeof document === 'undefined' || reduceMotion) {
			update();
			await tick();
			return;
		}
		const transitionDocument = document as ViewTransitionDocument;
		if (!transitionDocument.startViewTransition) {
			update();
			await tick();
			return;
		}
		const transition = transitionDocument.startViewTransition(async () => {
			update();
			await tick();
		});
		await transition.updateCallbackDone.catch(() => undefined);
	}

	let openingExperienceId = $state<string | null>(null);

	function experienceImageTransitionName(event: ExperienceEvent) {
		return openingExperienceId === event.id ? `experience-image-${event.id}` : 'none';
	}

	async function openExperienceModal(event: ExperienceEvent, click: MouseEvent) {
		if (click.ctrlKey || click.metaKey || click.shiftKey || click.altKey) return;
		click.preventDefault();
		if (click.currentTarget instanceof HTMLElement) lastExperienceTrigger = click.currentTarget;
		openingExperienceId = event.id;
		await tick();
		await updateWithViewTransition(() => {
			openingExperienceId = null;
			activeExperience = event;
		});
		modalCloseButton?.focus({ preventScroll: true });
	}

	async function closeExperienceModal() {
		const trigger = lastExperienceTrigger;
		activeExperience = null;
		await tick();
		trigger?.focus({ preventScroll: true });
		lastExperienceTrigger = null;
	}

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = activeExperience ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	onMount(() => {
		currentSeason = getExperienceSeason(getViennaMonth());
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updateMotionPreference = () => {
			reduceMotion = motionQuery.matches;
			supportsViewTransitions = 'startViewTransition' in document && !motionQuery.matches;
		};
		updateMotionPreference();
		motionQuery.addEventListener('change', updateMotionPreference);
		return () => motionQuery.removeEventListener('change', updateMotionPreference);
	});
</script>

<svelte:window onkeydown={onWindowKeydown} />

<SeoHead titleKey={copyKey + '.title'} descriptionKey={copyKey + '.description'} image={currentContent.bg} />


{#snippet factsLine(event: ExperienceEvent)}
	{#if buildSummaryFacts(event).length}
		<p class="mt-2 text-sm text-white/90">
			{#each buildSummaryFacts(event) as fact, index}
				{#if index > 0}<span class="px-1.5 text-white/60" aria-hidden="true">·</span>{/if}<span
					class="whitespace-nowrap"><span class="sr-only">{fact.label}: </span>{fact.value}</span>
			{/each}
		</p>
	{/if}
{/snippet}

{#snippet photoLayer(event: ExperienceEvent, sizes: string, eager: boolean)}
	<div class="absolute inset-0 overflow-hidden" style:view-transition-name={experienceImageTransitionName(event)}>
		<img {...imageAttrs(event.image, sizes)}
			alt=""
			class={[
				'h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100',
				event.id === 'summer-hike' ? 'object-left' : event.id === 'winter-hike' ? 'object-[center_58%]' : 'object-center',
			]}
			loading={eager ? 'eager' : 'lazy'} decoding="async" />
	</div>
	<div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/15 via-30% to-transparent to-50%" aria-hidden="true"></div>
{/snippet}

{#snippet tourDetails(event: ExperienceEvent)}
	<p class="flex items-center gap-2 text-xs font-medium text-slate-600">
		<event.icon class="h-4 w-4 text-brand" aria-hidden="true" />
		{localize(event.kicker)}
	</p>
	<h3 class="mt-2 text-2xl font-semibold leading-tight text-slate-900">
		{localize(event.title)}
	</h3>
	{#if event.description}
		<p class="mt-3 text-sm leading-relaxed text-slate-600">
			{localize(event.description)}
		</p>
	{/if}

	{#if buildPlanningFacts(event).length}
		<div class="mt-6">
			<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
				{$lang === 'de' ? 'Planung' : 'Planning'}
			</p>
			<dl class="mt-2 divide-y divide-slate-200 border-y border-slate-200">
				{#each buildPlanningFacts(event) as fact}
					<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
						<dt class="inline-flex min-w-0 items-center gap-2 text-sm text-slate-600">
							<fact.icon class="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
							<span>{fact.label}</span>
						</dt>
						<dd class="text-right text-sm font-semibold text-slate-900">{fact.value}</dd>
					</div>
				{/each}
			</dl>
		</div>
	{/if}

	{#if buildDetailFacts(event).length}
		<div class="mt-6">
			<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
				{$lang === 'de' ? 'Details' : 'Details'}
			</p>
			<dl class="mt-2 divide-y divide-slate-200 border-y border-slate-200">
				{#each buildDetailFacts(event) as fact}
					<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
						<dt class="inline-flex min-w-0 items-center gap-2 text-sm text-slate-600">
							<fact.icon class="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
							<span>{fact.label}</span>
						</dt>
						<dd class="max-w-[12rem] text-right text-sm font-semibold text-slate-900">{fact.value}</dd>
					</div>
				{/each}
			</dl>
		</div>
	{/if}

	{#if getEventLinks(event).length}
		<div class="mt-7">
			<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
				{$lang === 'de' ? 'Verfügbare Links' : 'Available links'}
			</p>
			<div class="mt-2 divide-y divide-slate-200 border-y border-slate-200">
				{#each getEventLinks(event) as link}
					{@const linkMeta = experienceLinkMeta[link.urlType]}
					<a
						href={link.url}
						target="_blank"
						rel="noreferrer"
						class="group/link flex items-center justify-between gap-3 py-3 text-sm font-semibold text-slate-800 transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
					>
						<span class="inline-flex items-center gap-2">
							<linkMeta.icon class="h-4 w-4 text-brand" aria-hidden="true" />
							{localize(link.label ?? linkMeta.label)}
						</span>
						<ExternalLink class="h-4 w-4 text-slate-400 transition group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-brand" aria-hidden="true" />
					</a>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

{#snippet featuredCard(event: ExperienceEvent)}
	<CardLink tone="default" padding="none"
		id={event.id}
		href={`#tour-${event.id}`}
		onclick={(clickEvent) => openExperienceModal(event, clickEvent)}
		class="group relative block w-full scroll-mt-28 overflow-hidden text-left"
	>
		<div class="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 sm:aspect-[2/1] sm:min-h-96"
			style:view-transition-name={experienceImageTransitionName(event)}>
			<img {...imageAttrs(event.image, '(max-width: 1024px) 100vw, 1100px')}
				alt={localize(event.title)}
				class={['absolute inset-0 h-full w-full object-cover', event.id === 'summer-hike' ? 'object-left' : 'object-center']}
				loading="eager" decoding="async" />
			<div class="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent to-55% sm:from-slate-950/25 sm:to-60%" aria-hidden="true"></div>
		</div>
		<div class="absolute inset-x-3 bottom-3 rounded-xl border border-white/30 bg-slate-950/25 p-4 text-white backdrop-blur-sm [text-shadow:0_1px_8px_rgba(15,23,42,0.45)] sm:bottom-5 sm:left-5 sm:right-5 sm:max-w-xl sm:p-5">
			<h3 class="text-xl font-semibold leading-tight sm:text-2xl">{localize(event.title)}</h3>
			{#if event.description}
				<p class="mt-2 line-clamp-2 text-sm leading-relaxed text-white/90">{localize(event.description)}</p>
			{/if}
			<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-white/90">
				{#each buildSummaryFacts(event) as fact}
					<span class="inline-flex items-center gap-1.5" title={fact.label}>
						<fact.icon size={14} aria-hidden="true" />{fact.value}
					</span>
				{/each}
			</div>
		</div>
	</CardLink>
{/snippet}

{#snippet eventCard(event: ExperienceEvent, layout: CardLayout)}
	<a
		id={event.id}
		href={`#tour-${event.id}`}
		onclick={(clickEvent) => openExperienceModal(event, clickEvent)}
		class={[photoCardClasses, 'aspect-[4/3] lg:aspect-auto lg:h-full', layout === 'panorama' ? 'sm:aspect-[2/1]' : 'sm:aspect-[4/5]']}
	>
		{@render photoLayer(event, layout === 'narrow'
			? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 370px'
			: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1152px', false)}
		<div class="absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
			<p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">{localize(event.kicker)}</p>
			<h3 class={['mt-1.5 font-serif text-2xl leading-tight sm:text-[1.7rem]', layout !== 'narrow' && 'lg:text-[2.1rem]']}>{localize(event.title)}</h3>
			{@render factsLine(event)}
		</div>
	</a>
{/snippet}

<!-- ERLEBNISSE PAGE (Tailwind) -->
<!-- Requirements: Tailwind + your bg-brand/text-brand utilities available -->

<div class="min-h-dvh bg-[#fbfaf7] pb-16">
	<div class="mx-auto w-full max-w-none px-4 sm:px-8 lg:px-10">
		<!-- CONTENT WRAPPER -->
		<div class="space-y-14 lg:space-y-20" id="aktivitaeten">
			<section class="pt-3 sm:px-10">
				<header class="mx-auto max-w-6xl text-center">
					<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
						{$t('experiences.destinations.kicker')}
					</p>
					<h1 class="mt-3 font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
						{$t(copyKey + '.heading')}
					</h1>
					<div class="mx-auto mt-3 h-[3px] w-14 rounded-full bg-brand" aria-hidden="true"></div>
					<p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
						{$t(copyKey + '.description')}
					</p>
				</header>

				<nav aria-label={$t('experiences.nav.season')} class="mt-8 flex justify-center sm:mt-10">
					<div class="inline-flex rounded-full border border-slate-200 bg-white p-1">
						{#each seasonOptions as option (option.key)}
							{@const isActive = activeSeason === option.key}
							<a
								href={localizedHref(seasonPaths[option.key])}
								data-sveltekit-noscroll
								data-sveltekit-replacestate
								aria-current={isActive ? 'true' : undefined}
								class={[
									'inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transition-none',
									isActive ? 'bg-brand/10 text-slate-900' : 'text-slate-600 hover:text-slate-900',
								]}
							>
								<option.icon size={16} class={isActive ? 'text-brand' : ''} aria-hidden="true" />
								{$t(`experiences.nav.${option.key}`)}
							</a>
						{/each}
					</div>
				</nav>

				<div class="mx-auto mt-8 max-w-6xl" id="highlights">
					{#key activeSeason}
						<section
							aria-labelledby="highlights-title"
							id={`highlights-${activeSeason}`}
							in:fade={{ duration: reduceMotion ? 0 : 180 }}
						>
							<h2 id="highlights-title" class="sr-only">{$t(`experiences.nav.${activeSeason}`)}</h2>
							{#if featuredEvent}
								{@render featuredCard(featuredEvent)}
							{/if}
							<ul class="mt-6 grid gap-6 sm:grid-cols-2 lg:auto-rows-[26rem] lg:grid-cols-3">
								{#each secondaryEvents as event, index (event.id)}
									{@const layout = cardLayout(index, secondaryEvents.length)}
									<li class={[layout === 'wide' && 'lg:col-span-2', layout === 'panorama' && 'sm:col-span-2 lg:col-span-3']}>
										{@render eventCard(event, layout)}
									</li>
								{/each}
							</ul>
							{#each eventsBySeason[activeSeason] as event (event.id)}
								<article id={'tour-' + event.id} class="tour-details scroll-mt-28 rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
									{@render tourDetails(event)}
									<a href={'#' + event.id} class="mt-5 inline-block text-sm font-medium underline">
										{$lang === 'de' ? 'Zurück zur Ausflugskarte' : 'Back to activity card'}
									</a>
								</article>
							{/each}
						</section>
					{/key}
				</div>

				{#if showFestivalSection}
				<section class="scroll-mt-28 py-16 sm:py-20" id="traditionelle-feste">
					<div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
						<div class="mx-auto max-w-3xl text-center">
							<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
								{localize(festivalSection.kicker)}
							</p>
							<h2 class="mt-3 font-serif text-4xl leading-[0.98] text-slate-900 sm:text-5xl">
								{localize(festivalSection.title)}
							</h2>
							<div class="mx-auto mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
							<p class="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
								{localize(festivalSection.intro)}
							</p>
						</div>

						<div class="mt-12 grid gap-7 lg:grid-cols-[1.28fr,0.72fr] lg:items-center lg:gap-12">
							<figure class="group h-[340px] overflow-hidden rounded-3xl bg-slate-100 sm:h-[430px] lg:h-[500px]">
								<img
									{...imageAttrs(festivalSection.feature.image.src, '(max-width: 1024px) 100vw, 700px')}
									alt={localize(festivalSection.feature.image.alt)}
									class="h-full w-full object-cover object-left transition duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
									loading="lazy"
									decoding="async"
								/>
							</figure>

							<article class="py-1 lg:pl-1">
								<div class="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand">
									<festivalSection.feature.icon class="h-5 w-5" aria-hidden="true" />
								</div>
								<p class="mt-5 text-[11px] font-semibold uppercase tracking-[0.26em] text-brand">
									{localize(festivalSection.feature.kicker)}
								</p>
								<h3 class="mt-2 font-serif text-3xl leading-tight text-slate-900 sm:text-4xl">
									{localize(festivalSection.feature.title)}
								</h3>
								<p class="mt-4 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
									{localize(festivalSection.feature.body)}
								</p>
								<span class="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
									<CalendarDays class="h-4 w-4 text-brand" aria-hidden="true" />
									{localize(festivalSection.feature.seasonBadge)}
								</span>
							</article>
						</div>

						{#each festivalSection.localEvents.slice(0, 1) as event}
							<div class="mt-16 grid gap-7 border-t border-slate-200 pt-12 lg:grid-cols-[0.72fr,1.28fr] lg:items-center lg:gap-12">
								<article class="order-2 py-1 lg:order-1 lg:pr-1">
									<div class="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand">
										<event.icon class="h-5 w-5" aria-hidden="true" />
									</div>
									<p class="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
										{localize(event.seasonBadge)}
									</p>
									<h3 class="mt-2 font-serif text-3xl leading-tight text-slate-900 sm:text-4xl">
										{localize(event.title)}
									</h3>
									<p class="mt-4 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
										{localize(event.body)}
									</p>
									<span class="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
										<CalendarDays class="h-4 w-4 text-brand" aria-hidden="true" />
										{localize(event.seasonBadge)}
									</span>
								</article>

								<figure class="group order-1 h-[320px] overflow-hidden rounded-3xl bg-slate-100 sm:h-[400px] lg:order-2 lg:h-[440px]">
									<img
										{...imageAttrs(event.image.src, '(max-width: 1024px) 100vw, 700px')}
										alt={localize(event.image.alt)}
										class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
										loading="lazy"
										decoding="async"
									/>
								</figure>
							</div>
						{/each}

						<div class="mt-16 grid gap-10 border-t border-slate-200 pt-12 md:grid-cols-2 md:gap-6 lg:gap-8">
							{#each festivalSection.localEvents.slice(1) as event}
								<article>
									<figure class="group h-[300px] overflow-hidden rounded-3xl bg-slate-100 sm:h-[360px]">
										<img
											{...imageAttrs(event.image.src, '(max-width: 768px) 100vw, 560px')}
											alt={localize(event.image.alt)}
											class={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.025] motion-reduce:transition-none ${event.id === 'summer-theatre' ? 'object-[center_35%]' : 'object-center'}`}
											loading="lazy"
											decoding="async"
										/>
									</figure>
									<div class="pt-5 sm:px-2">
										<div class="flex items-center justify-between gap-4">
											<p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
												{localize(event.seasonBadge)}
											</p>
											{#if event.url}
												<a
													href={event.url}
													target="_blank"
													rel="noreferrer"
													class="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-brand/10 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
													aria-label={`${localize(event.title)} – ${$lang === 'de' ? 'mehr erfahren' : 'learn more'}`}
												>
													<ExternalLink class="h-4 w-4" aria-hidden="true" />
												</a>
											{/if}
										</div>
										<h3 class="mt-2 font-serif text-2xl leading-tight text-slate-900 sm:text-3xl">
											{localize(event.title)}
										</h3>
										<p class="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
											{localize(event.body)}
										</p>
									</div>
								</article>
							{/each}
						</div>

						<div class="mt-16">
							<h3 class="font-serif text-2xl text-slate-900 sm:text-3xl">
								{localize(festivalSection.regionalTitle)}
							</h3>
							<div class="mt-5 grid border-y border-slate-200 md:grid-cols-3">
								{#each festivalSection.regionalEvents as event}
									<a
										href={event.url}
										target="_blank"
										rel="noreferrer"
										class="group flex items-center gap-4 border-b border-slate-200 py-5 transition hover:bg-white/60 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand md:border-b-0 md:border-r md:px-5 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
									>
										<div class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
											<event.icon class="h-[18px] w-[18px]" aria-hidden="true" />
										</div>
										<div class="min-w-0 flex-1">
											<h4 class="font-serif text-lg leading-tight text-slate-900">
												{localize(event.title)}
											</h4>
											<p class="mt-1 text-xs font-medium text-slate-500">
												{localize(event.location)} · {localize(event.seasonBadge)}
											</p>
										</div>
										<ArrowRight class="h-4 w-4 shrink-0 text-brand transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
									</a>
								{/each}
							</div>
						</div>

						<div class="mt-6 flex flex-col items-start justify-between gap-4 text-sm font-medium leading-relaxed text-slate-600 sm:flex-row sm:items-center">
							<p class="max-w-3xl">{localize(festivalSection.note)}</p>
							<ButtonLink variant="secondary" size="md"
								href={festivalSection.eventInfoUrl}
								target="_blank"
								rel="noreferrer"
								class="shrink-0"
							>
								{$lang === 'de' ? 'Aktuelle Termine ansehen' : 'View current dates'}
								<ExternalLink class="h-4 w-4" aria-hidden="true" />
							</ButtonLink>
						</div>
					</div>
				</section>
				{/if}

				<section aria-labelledby="experiences-stay-title" class="mt-14 rounded-2xl border border-[#e8dfd1] bg-[#f5efe6] p-6 sm:p-8 lg:mt-16">
					<div class="max-w-2xl">
						<h2 id="experiences-stay-title" class="text-balance font-serif text-2xl leading-tight text-slate-900 sm:text-3xl">
							{$t('experiences.base.title')}
						</h2>
						<p class="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">{$t('experiences.base.body')}</p>
					</div>
					<div class="mt-5 flex flex-wrap gap-3">
						<ButtonLink variant="primary" size="sm" href={localizedHref('/buchen')}>
							{$t('experiences.base.cta.booking')}
						</ButtonLink>
						<a href={localizedHref('/unterkuenfte-preise')}
							class="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-900 focus-visible:outline-offset-2">
							{$t('experiences.base.cta.rooms')}
						</a>
					</div>
				</section>
			</section>


		</div>
	</div>

	{#if activeExperience}
		<div class="fixed inset-0 z-[130] p-3 sm:p-6">
			<button
				type="button"
				class="absolute inset-0 bg-slate-950/55 backdrop-blur-[3px]"
				onclick={closeExperienceModal}
				aria-label={$lang === 'de' ? 'Details schließen' : 'Close details'}
				transition:fade={{ duration: reduceMotion ? 0 : 180 }}
			></button>
			<div class="pointer-events-none relative mx-auto flex h-full max-w-6xl items-end sm:items-center">
				<div
					role="dialog"
					aria-modal="true"
					aria-label={localize(activeExperience.title)}
					class={cardClasses('default', 'none', false, 'pointer-events-auto relative w-full overflow-hidden')}
					in:fly={{ y: 24, duration: supportsViewTransitions || reduceMotion ? 0 : 320, easing: cubicOut }}
					out:fly={{ y: 16, duration: reduceMotion ? 0 : 220, easing: cubicOut }}
				>
					<Button variant="secondary" size="icon"
						type="button"
						bind:element={modalCloseButton}
						class="absolute right-3 top-3 z-20"
						onclick={closeExperienceModal}
						aria-label={$lang === 'de' ? 'Details schließen' : 'Close details'}
					>
						<X class="h-5 w-5" aria-hidden="true" />
					</Button>
					<div class="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[0.58fr,0.42fr]">
						<div
							class="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[600px]"
							style={`view-transition-name: experience-image-${activeExperience.id};`}
						>
							<img
								src={largestImageUrl(activeExperience.image)}
								alt={`${localize(activeExperience.title)} – ${localize(activeExperience.kicker)}`}
								class="h-full w-full object-cover"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent lg:hidden"></div>
						</div>
						<div
							class="p-5 sm:p-8 lg:p-9"
							in:fly={{ x: reduceMotion ? 0 : 14, duration: reduceMotion ? 0 : 320, delay: reduceMotion ? 0 : 70, easing: cubicOut }}
						>
							{@render tourDetails(activeExperience)}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

</div>

<style>
	.tour-details:not(:target) { display: none; }
</style>
