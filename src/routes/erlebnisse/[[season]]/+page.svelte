<script lang="ts">
	import { cardClasses } from '$lib/components/ui/styles';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import CardButton from '$lib/components/ui/CardButton.svelte';
	import type { ComponentType } from 'svelte';
	import { lang, t } from '$lib/i18n';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
import { localizePath } from '$lib/routing';
	import { imageAttrs, largestImageUrl } from '$lib/images';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { scrollPageToElement } from '$lib/scroll';
	import {
		experienceEvents as events,
		experienceSeasonContent as content,
		experienceSectionLinks as sectionLinks,
		experienceSectionTrackingLinks as sectionTrackingLinks,
		experienceFestivalSection,
		showFestivalSection,
		type ExperienceEvent,
		type ExperienceLinkType,
		type SeasonKey,
		type SectionLink,
	} from '$lib/data/experience';
	import { onDestroy, onMount, tick } from 'svelte';
	import {
		ArrowRight,
		CalendarDays,
		CarFront,
		Clock3,
		ExternalLink,
		Gauge,
		List,
		MapPinned,
		Mountain,
		PartyPopper,
		Route,
		Snowflake,
		Sparkles,
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
				value: event.seasonMonths,
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

	// get active tab from url param (default: summer)
	const seoSeasonFromUrl = $derived.by(() => {
		const season = page.params.season;
		if (season === 'winter') return 'winter';
		if (season === 'sommer' || season === 'summer') return 'summer';
		return null;
	});

	const seasonFromUrl = $derived.by(() => {
		const season = seoSeasonFromUrl;
		if (season) return season;
		return 'summer';
	});

	let activeTab = $state<SeasonKey>('summer');
	let activeHighlightsSeason = $state<SeasonKey>('summer');
	let activeExperience = $state<ExperienceEvent | null>(null);
	let modalCloseButton = $state<HTMLButtonElement | null>(null);
	let lastExperienceTrigger: HTMLElement | null = null;
	let reduceMotion = $state(false);
	let supportsViewTransitions = $state(false);
	let showAllSeasons = $state(true);
	let activeSectionId = $state('aktivitaeten');
	let isMobileNavOpen = $state(false);
	let highlightObserver: IntersectionObserver | null = null;
	let seasonScrollTimers: number[] = [];
	let lastMobileNavPointerAt = 0;
	$effect(() => {
		if (activeTab !== seasonFromUrl) {
			activeTab = seasonFromUrl;
		}
	});

	const summerEvents = events.filter((event) => event.season === 'summer');
	const winterEvents = events.filter((event) => event.season === 'winter');
	const summerFeaturedEvent = summerEvents[0];
	const summerSecondaryEvents = summerEvents.slice(1);
	const winterFeaturedEvent = winterEvents[0];
	const winterSecondaryEvents = winterEvents.slice(1);

	const currentContent = $derived(content[activeTab]);
	const seo = $derived.by(() => {
		if (!seoSeasonFromUrl) {
			return {
				titleKey: 'experiences.seo.title',
				descriptionKey: 'experiences.seo.description',
			};
		}

		const isWinter = seoSeasonFromUrl === 'winter';

		return {
			titleKey: isWinter ? 'experiences.seo.winter.title' : 'experiences.seo.summer.title',
			descriptionKey: isWinter
				? 'experiences.seo.winter.description'
				: 'experiences.seo.summer.description',
		};
	});

	const navActiveSectionId = $derived(activeSectionId === 'highlights' ? '' : activeSectionId);

	const activeSectionLabelKey = $derived.by(() => {
		if (activeSectionId === 'highlights') {
			return activeHighlightsSeason === 'winter' ? 'experiences.nav.winter' : 'experiences.nav.summer';
		}
		const match = sectionTrackingLinks.find((section) => section.id === activeSectionId);
		return match?.labelKey ?? 'experiences.nav.title';
	});

	const festivalSection = experienceFestivalSection;

	const sectionIconById: Record<string, any> = {
		aktivitaeten: Mountain,
		highlights: Sparkles,
		'traditionelle-feste': PartyPopper,
	};

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (activeExperience) void closeExperienceModal();
			if (isMobileNavOpen) isMobileNavOpen = false;
		}
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

	async function openExperienceModal(event: ExperienceEvent, trigger: EventTarget | null = null) {
		if (trigger instanceof HTMLElement) lastExperienceTrigger = trigger;
		openingExperienceId = event.id;
		await tick();
		await updateWithViewTransition(() => {
			openingExperienceId = null;
			activeExperience = event;
			isMobileNavOpen = false;
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

	function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
		const scrollNow = () => {
			const topOffset = window.innerWidth < 1024 ? 92 : 28;
			return scrollPageToElement(id, {
				behavior,
				offset: -topOffset,
			});
		};

		if (scrollNow()) return true;
		window.setTimeout(() => {
			scrollNow();
		}, 120);
		return false;
	}

	function openMobileNav() {
		isMobileNavOpen = true;
	}

	function closeMobileNav() {
		isMobileNavOpen = false;
	}

	function onMobileNavSelect(id: string) {
		scrollToSection(id);
		closeMobileNav();
		window.setTimeout(() => {
			scrollToSection(id);
		}, 120);
	}

	function onMobileNavPointerUp(event: PointerEvent, id: string) {
		event.preventDefault();
		event.stopPropagation();
		lastMobileNavPointerAt = Date.now();
		onMobileNavSelect(id);
	}

	function onMobileNavClick(event: MouseEvent, id: string) {
		if (Date.now() - lastMobileNavPointerAt < 350) return;
		event.stopPropagation();
		onMobileNavSelect(id);
	}

	function clearSeasonScrollTimers() {
		seasonScrollTimers.forEach((timer) => clearTimeout(timer));
		seasonScrollTimers = [];
	}

	function scrollToSeasonHighlightsFromUrl(behavior: ScrollBehavior = 'auto') {
		if (!seoSeasonFromUrl) return;
		const linkedExperience = events.find((event) => `#${event.id}` === page.url.hash && event.season === seoSeasonFromUrl);
		const targetId = linkedExperience?.id ?? (seoSeasonFromUrl === 'winter' ? 'highlights-winter' : 'highlights-summer');
		activeSectionId = 'highlights';
		activeHighlightsSeason = seoSeasonFromUrl;
		scrollToSection(targetId, behavior);
	}

	function scheduleSeasonHighlightsScroll() {
		if (!seoSeasonFromUrl) return;
		clearSeasonScrollTimers();
		for (const delay of [0, 120, 420, 900]) {
			seasonScrollTimers.push(
				window.setTimeout(() => scrollToSeasonHighlightsFromUrl('auto'), delay)
			);
		}
	}

	function onWindowScroll() {
		updateActiveSectionFromViewport();
	}

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = activeExperience ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	function updateActiveSectionFromViewport() {
		const marker = window.innerHeight * 0.33;
		let current = sectionTrackingLinks[0]?.id ?? 'aktivitaeten';
		for (const section of sectionTrackingLinks) {
			const el = document.getElementById(section.id);
			if (!el) continue;
			if (el.getBoundingClientRect().top <= marker) {
				current = section.id;
			} else {
				break;
			}
		}
		activeSectionId = current;

		const summerHighlightsEl = document.getElementById('highlights-summer');
		const winterHighlightsEl = document.getElementById('highlights-winter');
		if (summerHighlightsEl && winterHighlightsEl) {
			const summerTop = summerHighlightsEl.getBoundingClientRect().top;
			const winterTop = winterHighlightsEl.getBoundingClientRect().top;
			if (winterTop <= marker) {
				activeHighlightsSeason = 'winter';
			} else if (summerTop <= marker) {
				activeHighlightsSeason = 'summer';
			}
		}
	}

	function reveal(node: HTMLElement, opts?: { once?: boolean; rootMargin?: string }) {
		const once = opts?.once ?? true;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					node.classList.add('is-revealed');
					if (once) io.disconnect();
				}
			},
			{ threshold: 0.12, rootMargin: opts?.rootMargin ?? '0px 0px -10% 0px' }
		);
		io.observe(node);
		return {
			destroy() {
				io.disconnect();
			},
		};
	}

	function enableHighlightSeasonAuto() {
		highlightObserver?.disconnect();
		highlightObserver = null;
		const container = document.getElementById('highlights');
		if (!container) return;
		const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-season]'));
		if (!cards.length) return;
		highlightObserver = new IntersectionObserver(
			(entries) => {
				if (activeSectionId !== 'highlights') return;
				if (!showAllSeasons) return;
				const best = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
				const seasonAttr = best?.target?.getAttribute('data-season');
				const season =
					seasonAttr === 'summer' || seasonAttr === 'winter' ? (seasonAttr as SeasonKey) : null;
				if (season && season !== activeTab) activeTab = season;
			},
			{
				root: null,
				threshold: [0.25, 0.4, 0.55, 0.7],
				rootMargin: '-20% 0px -55% 0px',
			}
		);
		cards.forEach((card) => highlightObserver?.observe(card));
	}

	$effect(() => {
		seoSeasonFromUrl;
		page.url.hash;
		queueMicrotask(scheduleSeasonHighlightsScroll);
	});

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updateMotionPreference = () => {
			reduceMotion = motionQuery.matches;
			supportsViewTransitions = 'startViewTransition' in document && !motionQuery.matches;
		};
		updateMotionPreference();
		motionQuery.addEventListener('change', updateMotionPreference);
		return () => motionQuery.removeEventListener('change', updateMotionPreference);
	});

	onMount(() => {
		updateActiveSectionFromViewport();
		window.addEventListener('scroll', onWindowScroll, { passive: true });
		window.addEventListener('resize', updateActiveSectionFromViewport);
		queueMicrotask(scheduleSeasonHighlightsScroll);
		return () => {
			window.removeEventListener('scroll', onWindowScroll);
			window.removeEventListener('resize', updateActiveSectionFromViewport);
			clearSeasonScrollTimers();
		};
	});

	onMount(() => {
		enableHighlightSeasonAuto();
		return () => {
			highlightObserver?.disconnect();
			highlightObserver = null;
		};
	});

	onDestroy(() => {
		highlightObserver?.disconnect();
		clearSeasonScrollTimers();
	});
</script>

<svelte:window onkeydown={onWindowKeydown} />

<SeoHead titleKey={seo.titleKey} descriptionKey={seo.descriptionKey} image={currentContent.bg} />


{#snippet featuredCard(event: ExperienceEvent)}
	<CardButton tone="default" padding="none"
		id={event.id}
		data-season={event.season}
		onclick={(clickEvent) => openExperienceModal(event, clickEvent.currentTarget)}
		class="group relative block w-full overflow-hidden text-left"
	>
		<div class="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 sm:aspect-[2/1] sm:min-h-96"
			style:view-transition-name={experienceImageTransitionName(event)}>
			<img {...imageAttrs(event.image, '(max-width: 1024px) 100vw, 1100px')}
				alt={localize(event.title)}
				class={['absolute inset-0 h-full w-full object-cover', event.id === 'summer-hike' ? 'object-left' : 'object-center']}
				loading="lazy" decoding="async" />
			<div class="absolute inset-0 hidden bg-gradient-to-t from-slate-950/45 to-transparent sm:block" aria-hidden="true"></div>
		</div>
		<div class="p-4 sm:absolute sm:bottom-5 sm:left-5 sm:right-5 sm:max-w-xl sm:rounded-xl sm:border sm:border-white/25 sm:bg-slate-950/45 sm:p-5 sm:text-white sm:backdrop-blur-md">
			<h3 class="text-xl font-semibold leading-tight sm:text-2xl">{localize(event.title)}</h3>
			{#if event.description}
				<p class="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 sm:text-white/90">{localize(event.description)}</p>
			{/if}
			<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-600 sm:text-white/90">
				{#each buildSummaryFacts(event) as fact}
					<span class="inline-flex items-center gap-1.5" title={fact.label}>
						<fact.icon size={14} aria-hidden="true" />{fact.value}
					</span>
				{/each}
			</div>
		</div>
	</CardButton>
{/snippet}

<!-- ERLEBNISSE PAGE (Tailwind) -->
<!-- Requirements: Tailwind + your bg-brand/text-brand utilities available -->

<main class="min-h-dvh bg-[#fbfaf7] pb-24 lg:pb-0">
	<div class="mx-auto w-full max-w-none px-4 sm:px-8 lg:px-10">
		<!-- CONTENT WRAPPER -->
		<div class="space-y-14 lg:space-y-20" id="aktivitaeten">
			<section class="pt-3 sm:px-10">
				<header class="mx-auto max-w-6xl text-center">
					<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
						{$t('experiences.destinations.kicker')}
					</p>
					<h1 class="mt-3 font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
						{$t('experiences.destinations.title')}
					</h1>
					<div class="mx-auto mt-3 h-[3px] w-14 rounded-full bg-brand" aria-hidden="true"></div>
					<p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
						{$t('experiences.destinations.subtitle')}
					</p>
				</header>

				<div class="anchor-target mt-8 sm:mt-10" id="highlights">
					<p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
						{$t('experiences.destinations.topHighlights')}
					</p>
					{#if showAllSeasons || activeTab === 'summer'}
						<div
							class="mt-4 space-y-6"
							id="highlights-summer"
							in:fly={{ y: 26, duration: 520, easing: cubicOut }}
						>
							<h2 class="font-serif text-2xl leading-tight text-slate-900">{$t('experiences.nav.summer')}</h2>
							{#if summerFeaturedEvent}
								{@render featuredCard(summerFeaturedEvent)}
							{/if}
							<div class="mt-6">
								<div class="divide-y divide-slate-200/70">
									{#each summerSecondaryEvents as event, i (event.id)}
										<button
											type="button"
											id={event.id}
											onclick={(clickEvent) => openExperienceModal(event, clickEvent.currentTarget)}
											use:reveal
											data-season={event.season}
											class="reveal group grid w-full cursor-pointer gap-6 py-8 text-left focus-visible:outline-offset-4 sm:grid-cols-[240px,1fr] lg:grid-cols-[320px,1fr] lg:items-center"
											style={`--reveal-delay: ${i * 70}ms;`}
										>
											<div
												class={`relative w-full overflow-hidden rounded-2xl bg-slate-100 aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/10] ${
													i % 2 === 1 ? 'sm:order-2' : ''
												}`}
												style={`view-transition-name: ${experienceImageTransitionName(event)};`}
											>
												<img
													{...imageAttrs(event.image, '(max-width: 640px) 100vw, 320px')}
													alt={`${localize(event.title)} – ${localize(event.kicker)}`}
													class={`h-full w-full object-center transition duration-700 will-change-transform object-cover group-hover:scale-[1.03] group-hover:saturate-[1.06]`}
													loading="lazy"
													decoding="async"
												/>

											</div>

											<div class={`min-w-0 ${i % 2 === 1 ? 'sm:pr-6' : 'sm:pl-6'}`}>
												<p
													class="flex items-center gap-2 text-xs font-medium text-slate-600"
												>
													<event.icon class="h-4 w-4" aria-hidden="true" />
													{localize(event.kicker)}
												</p>

												<h3 class="mt-1 text-xl font-semibold leading-tight text-slate-900">
													<span
														class="underline-offset-4 group-hover:underline"
													>
														{localize(event.title)}
													</span>
												</h3>

												{#if event.description}
													<p class="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
														{localize(event.description)}
													</p>
												{/if}

												{#if buildSummaryFacts(event).length}
													<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
														{#each buildSummaryFacts(event) as fact}
															<span class="inline-flex items-center gap-1.5" title={fact.label}>
																<fact.icon class="h-3.5 w-3.5 text-brand" aria-hidden="true" />
																{fact.value}
															</span>
														{/each}
													</div>
												{/if}

												<div class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
													{$lang === 'de' ? 'Details ansehen' : 'View details'}
													<ArrowRight size={16} aria-hidden="true" />
												</div>
											</div>
										</button>
									{/each}
								</div>
							</div>
						</div>
					{/if}

					{#if showAllSeasons || activeTab === 'winter'}
						<div
							class="mt-10 space-y-6"
							id="highlights-winter"
							in:fly={{ y: 26, duration: 520, easing: cubicOut }}
						>
							<h2 class="font-serif text-2xl leading-tight text-slate-900">{$t('experiences.nav.winter')}</h2>
							{#if winterFeaturedEvent}
								{@render featuredCard(winterFeaturedEvent)}
							{/if}
							<div class="mt-6">
								<div class="divide-y divide-slate-200/70">
									{#each winterSecondaryEvents as event, i (event.id)}
										<button
											type="button"
											id={event.id}
											onclick={(clickEvent) => openExperienceModal(event, clickEvent.currentTarget)}
											use:reveal
											data-season={event.season}
											class="reveal group grid w-full cursor-pointer gap-6 py-8 text-left focus-visible:outline-offset-4 sm:grid-cols-[240px,1fr] lg:grid-cols-[320px,1fr] lg:items-center"
											style={`--reveal-delay: ${i * 70}ms;`}
										>
											<div
												class={`relative w-full overflow-hidden rounded-2xl bg-slate-100 aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/10] ${
													i % 2 === 1 ? 'sm:order-2' : ''
												}`}
												style={`view-transition-name: ${experienceImageTransitionName(event)};`}
											>
												<img
													{...imageAttrs(event.image, '(max-width: 640px) 100vw, 320px')}
													alt={`${localize(event.title)} – ${localize(event.kicker)}`}
													class={`h-full w-full object-center transition duration-700 will-change-transform ${
														event.id === 'winter-hike'
															? 'object-cover object-[center_58%] group-hover:scale-[1.02] group-hover:saturate-[1.06]'
															: 'object-cover group-hover:scale-[1.03] group-hover:saturate-[1.06]'
													}`}
													loading="lazy"
													decoding="async"
												/>
											</div>

											<div class={`min-w-0 ${i % 2 === 1 ? 'sm:pr-6' : 'sm:pl-6'}`}>
												<p
													class="flex items-center gap-2 text-xs font-medium text-slate-600"
												>
													<event.icon class="h-4 w-4" aria-hidden="true" />
													{localize(event.kicker)}
												</p>

												<h3 class="mt-1 text-xl font-semibold leading-tight text-slate-900">
													<span
														class="underline-offset-4 group-hover:underline"
													>
														{localize(event.title)}
													</span>
												</h3>

												{#if event.description}
													<p class="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
														{localize(event.description)}
													</p>
												{/if}

												{#if buildSummaryFacts(event).length}
													<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
														{#each buildSummaryFacts(event) as fact}
															<span class="inline-flex items-center gap-1.5" title={fact.label}>
																<fact.icon class="h-3.5 w-3.5 text-brand" aria-hidden="true" />
																{fact.value}
															</span>
														{/each}
													</div>
												{/if}

												<div class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
													{$lang === 'de' ? 'Details ansehen' : 'View details'}
													<ArrowRight size={16} aria-hidden="true" />
												</div>
											</div>
										</button>
									{/each}
								</div>
							</div>
						</div>
					{/if}
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
							<figure use:reveal class="reveal group h-[340px] overflow-hidden rounded-3xl bg-slate-100 sm:h-[430px] lg:h-[500px]">
								<img
									{...imageAttrs(festivalSection.feature.image.src, '(max-width: 1024px) 100vw, 700px')}
									alt={localize(festivalSection.feature.image.alt)}
									class="h-full w-full object-cover object-left transition duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
									loading="lazy"
									decoding="async"
								/>
							</figure>

							<article use:reveal class="reveal py-1 lg:pl-1" style="--reveal-delay: 80ms;">
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
								<article use:reveal class="reveal order-2 py-1 lg:order-1 lg:pr-1">
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

								<figure use:reveal class="reveal group order-1 h-[320px] overflow-hidden rounded-3xl bg-slate-100 sm:h-[400px] lg:order-2 lg:h-[440px]" style="--reveal-delay: 80ms;">
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
							{#each festivalSection.localEvents.slice(1) as event, index}
								<article use:reveal class="reveal" style={`--reveal-delay: ${index * 90}ms;`}>
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
				aria-label="Details schließen"
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
						aria-label="Details schließen"
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
							<p class="flex items-center gap-2 text-xs font-medium text-slate-600">
								<activeExperience.icon class="h-4 w-4 text-brand" aria-hidden="true" />
								{localize(activeExperience.kicker)}
							</p>
							<h3 class="mt-2 text-2xl font-semibold leading-tight text-slate-900">
								{localize(activeExperience.title)}
							</h3>
							{#if activeExperience.description}
								<p class="mt-3 text-sm leading-relaxed text-slate-600">
									{localize(activeExperience.description)}
								</p>
							{/if}

							{#if buildPlanningFacts(activeExperience).length}
								<div class="mt-6">
									<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
										{$lang === 'de' ? 'Planung' : 'Planning'}
									</p>
									<dl class="mt-2 divide-y divide-slate-200 border-y border-slate-200">
										{#each buildPlanningFacts(activeExperience) as fact}
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

							{#if buildDetailFacts(activeExperience).length}
								<div class="mt-6">
									<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
										{$lang === 'de' ? 'Details' : 'Details'}
									</p>
									<dl class="mt-2 divide-y divide-slate-200 border-y border-slate-200">
										{#each buildDetailFacts(activeExperience) as fact}
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

							{#if getEventLinks(activeExperience).length}
								<div class="mt-7">
									<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
										{$lang === 'de' ? 'Verfügbare Links' : 'Available links'}
									</p>
									<div class="mt-2 divide-y divide-slate-200 border-y border-slate-200">
										{#each getEventLinks(activeExperience) as link}
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
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div class="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 lg:hidden">
		<div
			class="rounded-2xl border border-white/40 bg-white/75 shadow-[0_18px_50px_rgba(15,23,42,0.22)] backdrop-blur-xl ring-1 ring-slate-200/60"
		>
			<div class="flex items-center justify-between px-3 py-2">
				<Button variant="secondary" size="md"
					type="button"
					onclick={openMobileNav}
				>
					<List class="h-4 w-4 text-brand" aria-hidden="true" />
					<span class="max-w-[55vw] truncate">{$t(activeSectionLabelKey)}</span>
				</Button>
			</div>
		</div>
	</div>

	{#if isMobileNavOpen}
		<button
			type="button"
			class="fixed inset-0 z-[90] bg-slate-950/50 backdrop-blur-[2px]"
			onclick={closeMobileNav}
			aria-label="Navigation schließen"
		></button>
		<div
			class="fixed inset-x-0 bottom-0 z-[100] rounded-t-3xl border border-white/20 bg-white p-4 shadow-2xl"
		>
			<div class="flex items-center justify-between">
				<p class="text-sm font-semibold text-slate-900">{$t('experiences.nav.title')}</p>
				<Button variant="secondary" size="icon"
					type="button"
					onclick={closeMobileNav}
					aria-label="Navigation schließen"
				>
					<X class="h-5 w-5" aria-hidden="true" />
				</Button>
			</div>

			<div class="mt-3 space-y-2">
				{#each sectionLinks as section}
					{@const SectionIcon = sectionIconById[section.id] ?? List}
					<button
						type="button"
						class={`touch-manipulation flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
							navActiveSectionId === section.id
								? 'bg-brand/10 text-slate-900 ring-1 ring-brand/25'
								: 'bg-slate-50 text-slate-700 hover:bg-white'
						}`}
						onpointerup={(event) => onMobileNavPointerUp(event, section.id)}
						onclick={(event) => onMobileNavClick(event, section.id)}
					>
						<span class="grid h-9 w-9 place-items-center rounded-xl bg-white ring-1 ring-slate-200">
							<SectionIcon class="h-4 w-4 text-brand" aria-hidden="true" />
						</span>
						{$t(section.labelKey)}
					</button>

					{#if section.id === 'aktivitaeten'}
						<div class="space-y-2 pl-4">
							<button
								type="button"
								class={`touch-manipulation flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
									activeSectionId === 'highlights' && activeHighlightsSeason === 'summer'
										? 'bg-brand/10 text-slate-900 ring-1 ring-brand/25'
										: 'bg-slate-50 text-slate-700 hover:bg-white'
								}`}
								onpointerup={(event) => onMobileNavPointerUp(event, 'highlights-summer')}
								onclick={(event) => onMobileNavClick(event, 'highlights-summer')}
							>
								<Sun class="h-4 w-4 text-brand" aria-hidden="true" />
								{$t('experiences.nav.summer')}
							</button>
							<button
								type="button"
								class={`touch-manipulation flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
									activeSectionId === 'highlights' && activeHighlightsSeason === 'winter'
										? 'bg-brand/10 text-slate-900 ring-1 ring-brand/25'
										: 'bg-slate-50 text-slate-700 hover:bg-white'
								}`}
								onpointerup={(event) => onMobileNavPointerUp(event, 'highlights-winter')}
								onclick={(event) => onMobileNavClick(event, 'highlights-winter')}
							>
								<Snowflake class="h-4 w-4 text-brand" aria-hidden="true" />
								{$t('experiences.nav.winter')}
							</button>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

</main>

<style>
	.anchor-target {
		scroll-margin-top: 7rem;
		border-radius: 1rem;
		transition:
			background-color 240ms ease,
			box-shadow 240ms ease;
	}

	.anchor-target:target {
		background-color: rgba(247, 171, 0, 0.05);
		box-shadow:
			0 0 0 1px rgba(247, 171, 0, 0.22),
			0 0 0 12px rgba(247, 171, 0, 0.07),
			0 12px 28px -22px rgba(247, 171, 0, 0.45);
		animation: anchorTargetPulse 800ms ease-out 1;
	}

	@keyframes anchorTargetPulse {
		0% {
			background-color: rgba(247, 171, 0, 0.13);
			box-shadow:
				0 0 0 1px rgba(247, 171, 0, 0.3),
				0 0 0 16px rgba(247, 171, 0, 0.1),
				0 14px 30px -22px rgba(247, 171, 0, 0.5);
		}
		100% {
			background-color: rgba(247, 171, 0, 0.05);
			box-shadow:
				0 0 0 1px rgba(247, 171, 0, 0.22),
				0 0 0 12px rgba(247, 171, 0, 0.07),
				0 12px 28px -22px rgba(247, 171, 0, 0.45);
		}
	}

	.tab-btn {
		position: relative;
	}
	.tab-btn.is-active::after {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: 9999px;
		filter: blur(10px);
		opacity: 0.35;
		background: radial-gradient(circle, rgba(255, 180, 0, 0.6), transparent 60%);
	}

	.reveal {
		opacity: 0;
		transform: translateY(12px);
		filter: blur(2px);
		transition:
			opacity 600ms ease,
			transform 600ms ease,
			filter 600ms ease;
		transition-delay: var(--reveal-delay, 0ms);
		will-change: opacity, transform, filter;
	}

	.reveal.is-revealed {
		opacity: 1;
		transform: translateY(0);
		filter: blur(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal,
		.reveal.is-revealed {
			transition: none;
			transform: none;
			filter: none;
			opacity: 1;
		}
	}
</style>
