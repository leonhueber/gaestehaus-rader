<script lang="ts">
	import { cardClasses } from '$lib/components/ui/styles';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardButton from '$lib/components/ui/CardButton.svelte';
	import type { ComponentType } from 'svelte';
	import { lang, t } from '$lib/i18n';
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
import { localizePath } from '$lib/routing';
	import { imageAttrs, largestImageUrl } from '$lib/images';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { scrollPageToElement } from '$lib/scroll';
	import {
		activityFilters,
		experienceEvents as events,
		experienceSeasonContent as content,
		experienceSectionLinks as sectionLinks,
		experienceSectionTrackingLinks as sectionTrackingLinks,
		experienceFestivalSection,
		type ActivityFilterKey,
		type ExperienceEvent,
		type ExperienceLinkType,
		type SeasonKey,
		type SectionLink,
	} from '$lib/data/experience';
	import { onDestroy, onMount, tick } from 'svelte';
	import {
		ArrowRight,
		BusFront,
		CalendarDays,
		CarFront,
		Clock3,
		ExternalLink,
		Gauge,
		List,
		MapPinned,
		Menu,
		Mountain,
		PartyPopper,
		Pin,
		Route,
		Snowflake,
		Sparkles,
		SlidersHorizontal,
		Sun,
		Ticket,
		Waves,
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
	const badgeClass = (tier?: 'top' | 'tip') =>
		tier === 'top'
			? 'border border-brand/30 bg-brand text-white'
			: 'border border-white/45 bg-white/88 text-slate-900';

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
	let selectedActivity = $state<ActivityFilterKey | null>(null);
	let activeExperience = $state<ExperienceEvent | null>(null);
	let modalCloseButton = $state<HTMLButtonElement | null>(null);
	let lastExperienceTrigger: HTMLElement | null = null;
	let reduceMotion = $state(false);
	let supportsViewTransitions = $state(false);
	let showAllSeasons = $state(true);
	let activeSectionId = $state('aktivitaeten');
	let isMobileFilterOpen = $state(false);
	let isMobileNavOpen = $state(false);
	let isNavPinned = $state(false);
	let isNavPointerInside = $state(false);
	let isNavFocusWithin = $state(false);
	let isNavDismissed = $state(false);
	let highlightObserver: IntersectionObserver | null = null;
	let seasonScrollTimers: number[] = [];
	let lastMobileNavPointerAt = 0;
	let manualTabUntil = 0;
	const ROW_BASE =
		'min-h-11 rounded-lg border-l-2 text-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transition-none';
	const ROW_PEEK = 'flex w-full items-center gap-3 px-3 py-2.5 text-left';
	const ROW_COMPACT = 'mx-auto grid h-11 w-11 place-items-center';
	const ROW_ACTIVE = 'border-brand bg-brand/10 font-semibold text-slate-900';
	const ROW_IDLE = 'border-transparent font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900';
	const seasonNavLinks = [
		{ id: 'highlights-summer', season: 'summer', labelKey: 'experiences.nav.summer', icon: Sun },
		{ id: 'highlights-winter', season: 'winter', labelKey: 'experiences.nav.winter', icon: Snowflake },
	];

	const isPeek = $derived(
		isNavPinned || (!isNavDismissed && (isNavPointerInside || isNavFocusWithin))
	);

	$effect(() => {
		if (activeTab !== seasonFromUrl) {
			activeTab = seasonFromUrl;
		}
	});

	const summerEvents = events.filter((event) => event.season === 'summer');
	const winterEvents = events.filter((event) => event.season === 'winter');
	const filteredSummerEvents = $derived.by(() => {
		const activity = selectedActivity;
		if (!activity) return summerEvents;
		const matches = summerEvents.filter((event) => event.activities.includes(activity));
		return matches.length ? matches : summerEvents;
	});
	const filteredWinterEvents = $derived.by(() => {
		const activity = selectedActivity;
		if (!activity) return winterEvents;
		const matches = winterEvents.filter((event) => event.activities.includes(activity));
		return matches.length ? matches : winterEvents;
	});
	const summerFeaturedEvent = $derived(filteredSummerEvents[0]);
	const summerSecondaryEvents = $derived(filteredSummerEvents.slice(1));
	const winterFeaturedEvent = $derived(filteredWinterEvents[0]);
	const winterSecondaryEvents = $derived(filteredWinterEvents.slice(1));

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

	const guestCardLinks = {
		benefitsOverview:
			'https://www.nassfeld.at/de/Unterkunft-finden/Reise-planen/PREMIUM-Cards/GaesteCard-basic',
		brochure: 'https://www.nassfeld.at/PDFs/NPS/Gaestekarten/BasisCard_Broschuere.pdf',
	};
	const guestCardVisual = $derived.by(() =>
		activeTab === 'winter'
			? {
					src: '/images/Umgebung/skigebiet-weissbriach-2.jpg',
					altKey: 'experiences.guestcard.imageAlt.winter',
				}
			: {
					src: '/images/Umgebung/ski_nassfeld.jpg',
					altKey: 'experiences.guestcard.imageAlt.summer',
				}
	);
	const festivalSection = experienceFestivalSection;

	const sectionIconById: Record<string, any> = {
		aktivitaeten: Mountain,
		highlights: Sparkles,
		'traditionelle-feste': PartyPopper,
		gaestecard: Ticket,
	};

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (activeExperience) void closeExperienceModal();
			if (isMobileFilterOpen) isMobileFilterOpen = false;
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

	function experienceImageTransitionName(event: ExperienceEvent) {
		return activeExperience?.id === event.id ? 'none' : `experience-image-${event.id}`;
	}

	async function openExperienceModal(event: ExperienceEvent, trigger: EventTarget | null = null) {
		if (trigger instanceof HTMLElement) lastExperienceTrigger = trigger;
		await updateWithViewTransition(() => {
			activeExperience = event;
			isMobileFilterOpen = false;
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

	function setDesktopNavTarget(id: string) {
		if (id === 'highlights-summer' || id === 'highlights-winter') {
			activeSectionId = 'highlights';
			activeHighlightsSeason = id === 'highlights-winter' ? 'winter' : 'summer';
		} else {
			activeSectionId = id;
		}
	}

	function onDesktopNavSelect(id: string) {
		setDesktopNavTarget(id);
		scrollToSection(id);
	}

	function openMobileNav() {
		isMobileFilterOpen = false;
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

	function setActiveTabManual(next: SeasonKey) {
		activeTab = next;
		manualTabUntil = Date.now() + 1500;
	}

	function onNavEnter() {
		isNavPointerInside = true;
	}

	function onNavLeave() {
		isNavPointerInside = false;
		isNavDismissed = false;
	}

	function onNavFocusIn() {
		isNavFocusWithin = true;
	}

	function onNavFocusOut(event: FocusEvent) {
		const panel = event.currentTarget as HTMLElement;
		const nextTarget = event.relatedTarget;
		if (nextTarget instanceof Node && panel.contains(nextTarget)) return;
		isNavFocusWithin = false;
		if (!isNavPointerInside) isNavDismissed = false;
	}

	function toggleDesktopNav(event: MouseEvent) {
		if (isNavPinned) {
			isNavPinned = false;
			isNavDismissed = true;
			(event.currentTarget as HTMLButtonElement).blur();
			isNavFocusWithin = false;
			return;
		}
		isNavDismissed = false;
		isNavPinned = true;
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
				if (Date.now() < manualTabUntil) return;
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
		filteredSummerEvents.length;
		filteredWinterEvents.length;
		showAllSeasons;
		queueMicrotask(enableHighlightSeasonAuto);
	});

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

<aside class="hidden lg:block">
	<div class="pointer-events-none fixed left-6 top-36 z-40">
		<div
			class={`pointer-events-auto origin-top-left transition-[width] duration-200 ease-out motion-reduce:transition-none ${isPeek ? 'w-72' : 'w-16'}`}
			role="group"
			aria-label={$t('experiences.nav.title')}
			onpointerenter={onNavEnter}
			onpointerleave={onNavLeave}
			onfocusin={onNavFocusIn}
			onfocusout={onNavFocusOut}
		>
			<div class={cardClasses('default', 'none', false, 'experience-nav-scroll max-h-[calc(100dvh-10rem)] overflow-x-hidden overflow-y-auto overscroll-contain shadow-sm')}>
				<div class={`flex min-h-16 items-center px-2 py-2 ${isPeek ? 'gap-3' : 'justify-center'}`}>
					<button
						type="button"
						class={`grid h-11 w-11 shrink-0 place-items-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transition-none ${isNavPinned ? 'bg-brand/10 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
						aria-label={isNavPinned
							? $lang === 'de' ? 'Navigation schließen' : 'Close navigation'
							: isPeek
								? $lang === 'de' ? 'Navigation offen halten' : 'Keep navigation open'
								: $lang === 'de' ? 'Navigation öffnen' : 'Open navigation'}
						aria-expanded={isPeek}
						aria-pressed={isNavPinned}
						onclick={toggleDesktopNav}
					>
						{#if isNavPinned}
							<X class="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
						{:else if isPeek}
							<Pin class="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
						{:else}
							<Menu class="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
						{/if}
					</button>
					{#if isPeek}
						<p class="min-w-0 pr-2 text-sm font-semibold leading-snug text-slate-900">{$t('experiences.nav.title')}</p>
					{/if}
				</div>

				<nav aria-label={$t('experiences.nav.title')} class="space-y-1 px-2 pb-3">
					{#each sectionLinks as section}
						{@const SectionIcon = sectionIconById[section.id] ?? List}
						{@const isActive = navActiveSectionId === section.id}
						<div>
							<button
								type="button"
								class={`${ROW_BASE} ${isPeek ? ROW_PEEK : ROW_COMPACT} ${isActive ? ROW_ACTIVE : ROW_IDLE}`}
								onclick={() => onDesktopNavSelect(section.id)}
								aria-label={$t(section.labelKey)}
								aria-current={isActive ? 'location' : undefined}
								title={isPeek ? undefined : $t(section.labelKey)}
							>
								<SectionIcon class={`h-5 w-5 shrink-0 ${isActive ? 'text-brand' : 'text-slate-500'}`} aria-hidden="true" strokeWidth={1.5} />
								{#if isPeek}<span class="min-w-0 leading-snug">{$t(section.labelKey)}</span>{/if}
							</button>
							{#if section.id === 'aktivitaeten'}
								<div class={`mt-1 space-y-1 ${isPeek ? 'pl-5' : ''}`}>
									{#each seasonNavLinks as season}
										{@const isSeasonActive = activeSectionId === 'highlights' && activeHighlightsSeason === season.season}
										<button
											type="button"
											class={`${ROW_BASE} ${isPeek ? ROW_PEEK : ROW_COMPACT} ${isSeasonActive ? ROW_ACTIVE : ROW_IDLE}`}
											onclick={() => onDesktopNavSelect(season.id)}
											aria-label={$t(season.labelKey)}
											aria-current={isSeasonActive ? 'location' : undefined}
											title={isPeek ? undefined : $t(season.labelKey)}
										>
											<season.icon class={`h-5 w-5 shrink-0 ${isSeasonActive ? 'text-brand' : 'text-slate-500'}`} aria-hidden="true" strokeWidth={1.5} />
											{#if isPeek}<span class="min-w-0 leading-snug">{$t(season.labelKey)}</span>{/if}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</nav>

				{#if isPeek}
					<div class="border-t border-slate-100 px-4 py-4">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<p class="text-xs font-semibold text-slate-700">{$t('experiences.nav.filters')}</p>
							{#if selectedActivity}
								<button
									type="button"
									class="rounded py-1 text-xs font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
									onclick={() => (selectedActivity = null)}
								>
									{$t('experiences.nav.reset')}
								</button>
							{/if}
						</div>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each activityFilters as filter}
								<button
									type="button"
									class={`inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-xs font-medium leading-snug transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transition-none ${selectedActivity === filter.id ? 'border-brand/40 bg-brand/10 text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
									onclick={() => (selectedActivity = selectedActivity === filter.id ? null : filter.id)}
									aria-pressed={selectedActivity === filter.id}
								>
									<filter.icon class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
									<span class="min-w-0">{$t(filter.labelKey)}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</aside>

<!-- ERLEBNISSE PAGE (Tailwind) -->
<!-- Requirements: Tailwind + your bg-brand/text-brand utilities available -->

<main class="min-h-dvh bg-[#fbfaf7] pb-24 lg:pb-0">
	<div class="mx-auto w-full max-w-none px-4 sm:px-8 lg:px-10">
		<!-- CONTENT WRAPPER -->
		<div class="space-y-14 lg:space-y-20" id="aktivitaeten">
			<section class="pt-4 sm:pt-6 sm:px-10">
				<div class="mx-auto max-w-6xl text-center">
					<p class="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-brand sm:mt-7">
						{$t('experiences.destinations.kicker')}
					</p>
					<h1 class="mt-3 font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
						{$t('experiences.destinations.title')}
					</h1>
					<div class="mx-auto mt-3 h-[3px] w-14 rounded-full bg-brand"></div>
					<p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
						{$t('experiences.destinations.subtitle')}
					</p>
				</div>
				<!-- <div class="anchor-target mt-10" id="interessen">
					<p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
						{$t('experiences.interests.title')}
					</p>
					<div class="mt-4 flex flex-wrap gap-3">
						{#each interestLinks as interest}
							<a
								href={interest.href}
								class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-slate-700 shadow-sm transition duration-300 hover:scale-[1.02] hover:border-brand/30 hover:text-slate-900"
							>
								<interest.icon class="h-4 w-4 text-brand" aria-hidden="true" />
								{$t(interest.labelKey)}
							</a>
						{/each}
					</div>
				</div> -->

				<div class="anchor-target mt-8 sm:mt-9" id="highlights">
					<p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
						{$t('experiences.destinations.topHighlights')}
					</p>

					{#if showAllSeasons || activeTab === 'summer'}
						<div
							class="mt-4 space-y-6"
							id="highlights-summer"
							in:fly={{ y: 26, duration: 520, easing: cubicOut }}
						>
							<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
								{$t('experiences.nav.summer')}
							</p>
							{#if summerFeaturedEvent}
								<div class="mx-auto w-full max-w-6xl px-0 sm:px-0 lg:px-0">
									<CardButton tone="default" padding="none"
										type="button"
										id={summerFeaturedEvent.id}
										onclick={(clickEvent) => openExperienceModal(summerFeaturedEvent, clickEvent.currentTarget)}
										data-season={summerFeaturedEvent.season}
										class="group block w-full cursor-pointer overflow-hidden text-left"
									>
									<div
										class="relative aspect-[16/10] overflow-hidden rounded-3xl sm:min-h-[420px] lg:h-[min(65dvh,650px)]"
										style={`view-transition-name: ${experienceImageTransitionName(summerFeaturedEvent)};`}
									>
											<img
												{...imageAttrs(summerFeaturedEvent.image, '(max-width: 1024px) 100vw, 1200px')}
												alt={`${localize(summerFeaturedEvent.title)} – ${localize(summerFeaturedEvent.kicker)}`}
												class={`absolute inset-0 block h-full w-full object-cover transition-transform duration-700 will-change-transform ${
													summerFeaturedEvent.id === 'summer-hike'
														? 'object-left scale-[1.12] group-hover:scale-[1.14]'
														: 'object-center scale-[1.05] group-hover:scale-[1.07]'
												}`}
												loading="lazy"
												decoding="async"
											/>
											<div class="absolute inset-0 hidden bg-gradient-to-t from-black/78 via-black/38 to-black/8 sm:block"></div>

											{#if summerFeaturedEvent.badge}
												<span
													class={`absolute right-5 top-5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm ${badgeClass(summerFeaturedEvent.badgeTier)}`}
												>
													{localize(summerFeaturedEvent.badge)}
												</span>
											{/if}

											<div
												class="hidden sm:absolute sm:inset-x-0 sm:bottom-0 sm:block sm:px-6 sm:pb-6 sm:pt-6"
											>
												<div
													class="relative max-w-[86%] rounded-2xl border border-white/25 bg-white/16 p-3 shadow-[0_10px_26px_rgba(15,23,42,0.16)] backdrop-blur-md sm:max-w-2xl sm:p-6"
												>
													<div class="overflow-visible pr-0 sm:overflow-visible sm:pr-0">
														<p
															class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand"
														>
															<summerFeaturedEvent.icon class="h-4 w-4 text-brand" aria-hidden="true" />
															{localize(summerFeaturedEvent.kicker)}
														</p>
														<h3
															class={`mt-2 font-semibold text-white ${summerFeaturedEvent.titleSize ?? 'text-xl'}`}
														>
															{localize(summerFeaturedEvent.title)}
														</h3>
														{#if summerFeaturedEvent.description}
															<p class="mt-2 max-w-xl text-sm text-white/85">
																{localize(summerFeaturedEvent.description)}
															</p>
														{/if}
														{#if buildSummaryFacts(summerFeaturedEvent).length}
															<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-white/90">
																{#each buildSummaryFacts(summerFeaturedEvent) as fact}
																	<span class="inline-flex items-center gap-1.5" title={fact.label}>
																		<fact.icon class="h-3.5 w-3.5 text-brand" aria-hidden="true" />
																		{fact.value}
																	</span>
																{/each}
															</div>
														{/if}
													</div>
												</div>
											</div>
										</div>
										<div class="border-t border-slate-200/80 p-4 sm:hidden">
											<p
												class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand"
											>
												<summerFeaturedEvent.icon class="h-4 w-4 text-brand" aria-hidden="true" />
												{localize(summerFeaturedEvent.kicker)}
											</p>
											<h3
												class={`mt-2 font-semibold text-slate-900 ${summerFeaturedEvent.titleSize ?? 'text-xl'}`}
											>
												{localize(summerFeaturedEvent.title)}
											</h3>
											{#if summerFeaturedEvent.description}
												<p class="mt-2 max-w-xl text-sm text-slate-600">
													{localize(summerFeaturedEvent.description)}
												</p>
											{/if}
										{#if buildSummaryFacts(summerFeaturedEvent).length}
											<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
												{#each buildSummaryFacts(summerFeaturedEvent) as fact}
													<span class="inline-flex items-center gap-1.5" title={fact.label}>
														<fact.icon class="h-3.5 w-3.5 text-brand" aria-hidden="true" />
														{fact.value}
													</span>
												{/each}
											</div>
										{/if}
										</div>
									</CardButton>
								</div>
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
											class="reveal group grid w-full cursor-pointer gap-6 py-8 text-left transition duration-300 hover:-translate-y-0.5 hover:drop-shadow-[0_18px_30px_rgba(15,23,42,0.10)] sm:grid-cols-[240px,1fr] lg:grid-cols-[320px,1fr] lg:items-center"
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

												{#if event.badge}
													<span
														class="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-800 backdrop-blur"
													>
														{localize(event.badge)}
													</span>
												{/if}
											</div>

											<div class={`min-w-0 ${i % 2 === 1 ? 'sm:pr-6' : 'sm:pl-6'}`}>
												<p
													class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand"
												>
													<event.icon class="h-4 w-4" aria-hidden="true" />
													{localize(event.kicker)}
												</p>

												<h3 class="mt-1 text-xl font-semibold leading-tight text-slate-900">
													<span
														class="bg-gradient-to-r from-slate-900 to-slate-700 bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]"
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
													Mehr erfahren
													<span
														class="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:translate-x-1 group-hover:shadow-md"
													>
														<ArrowRight
															class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
															aria-hidden="true"
														/>
													</span>
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
							<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
								{$t('experiences.nav.winter')}
							</p>
							{#if winterFeaturedEvent}
								<div class="mx-auto w-full max-w-6xl px-0 sm:px-0 lg:px-0">
									<CardButton tone="default" padding="none"
										type="button"
										id={winterFeaturedEvent.id}
										onclick={(clickEvent) => openExperienceModal(winterFeaturedEvent, clickEvent.currentTarget)}
										data-season={winterFeaturedEvent.season}
										class="group block w-full cursor-pointer overflow-hidden text-left"
									>
									<div
										class="relative aspect-[16/10] overflow-hidden rounded-3xl sm:min-h-[420px] lg:h-[min(72dvh,720px)]"
										style={`view-transition-name: ${experienceImageTransitionName(winterFeaturedEvent)};`}
									>
											<img
												{...imageAttrs(winterFeaturedEvent.image, '(max-width: 1024px) 100vw, 1200px')}
												alt={`${localize(winterFeaturedEvent.title)} – ${localize(winterFeaturedEvent.kicker)}`}
												class="absolute inset-0 h-full w-full scale-[1.05] object-cover object-center transition-transform duration-700 will-change-transform group-hover:scale-[1.07]"
												loading="lazy"
												decoding="async"
											/>
											<div class="absolute inset-0 hidden bg-gradient-to-t from-black/78 via-black/38 to-black/8 sm:block"></div>

											{#if winterFeaturedEvent.badge}
												<span
													class={`absolute right-5 top-5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm ${badgeClass(winterFeaturedEvent.badgeTier)}`}
												>
													{localize(winterFeaturedEvent.badge)}
												</span>
											{/if}

											<div
												class="hidden sm:absolute sm:inset-x-0 sm:bottom-0 sm:block sm:px-6 sm:pb-6 sm:pt-6"
											>
												<div
													class="relative max-w-[86%] rounded-2xl border border-white/25 bg-white/16 p-3 shadow-[0_10px_26px_rgba(15,23,42,0.16)] backdrop-blur-md sm:max-w-2xl sm:p-6"
												>
													<div class="overflow-visible pr-0 sm:overflow-visible sm:pr-0">
														<p
															class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand"
														>
															<winterFeaturedEvent.icon class="h-4 w-4 text-brand" aria-hidden="true" />
															{localize(winterFeaturedEvent.kicker)}
														</p>
														<h3
															class={`mt-2 font-semibold text-white ${winterFeaturedEvent.titleSize ?? 'text-xl'}`}
														>
															{localize(winterFeaturedEvent.title)}
														</h3>
														{#if winterFeaturedEvent.description}
															<p class="mt-2 max-w-xl text-sm text-white/85">
																{localize(winterFeaturedEvent.description)}
															</p>
														{/if}
														{#if buildSummaryFacts(winterFeaturedEvent).length}
															<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-white/90">
																{#each buildSummaryFacts(winterFeaturedEvent) as fact}
																	<span class="inline-flex items-center gap-1.5" title={fact.label}>
																		<fact.icon class="h-3.5 w-3.5 text-brand" aria-hidden="true" />
																		{fact.value}
																	</span>
																{/each}
															</div>
														{/if}
													</div>
												</div>
											</div>
										</div>
										<div class="border-t border-slate-200/80 p-4 sm:hidden">
											<p
												class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand"
											>
												<winterFeaturedEvent.icon class="h-4 w-4 text-brand" aria-hidden="true" />
												{localize(winterFeaturedEvent.kicker)}
											</p>
											<h3
												class={`mt-2 font-semibold text-slate-900 ${winterFeaturedEvent.titleSize ?? 'text-xl'}`}
											>
												{localize(winterFeaturedEvent.title)}
											</h3>
											{#if winterFeaturedEvent.description}
												<p class="mt-2 max-w-xl text-sm text-slate-600">
													{localize(winterFeaturedEvent.description)}
												</p>
											{/if}
										{#if buildSummaryFacts(winterFeaturedEvent).length}
											<div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
												{#each buildSummaryFacts(winterFeaturedEvent) as fact}
													<span class="inline-flex items-center gap-1.5" title={fact.label}>
														<fact.icon class="h-3.5 w-3.5 text-brand" aria-hidden="true" />
														{fact.value}
													</span>
												{/each}
											</div>
										{/if}
										</div>
									</CardButton>
								</div>
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
											class="reveal group grid w-full cursor-pointer gap-6 py-8 text-left transition duration-300 hover:-translate-y-0.5 hover:drop-shadow-[0_18px_30px_rgba(15,23,42,0.10)] sm:grid-cols-[240px,1fr] lg:grid-cols-[320px,1fr] lg:items-center"
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
												{#if event.badge}
													<span
														class="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-800 backdrop-blur"
													>
														{localize(event.badge)}
													</span>
												{/if}
											</div>

											<div class={`min-w-0 ${i % 2 === 1 ? 'sm:pr-6' : 'sm:pl-6'}`}>
												<p
													class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand"
												>
													<event.icon class="h-4 w-4" aria-hidden="true" />
													{localize(event.kicker)}
												</p>

												<h3 class="mt-1 text-xl font-semibold leading-tight text-slate-900">
													<span
														class="bg-gradient-to-r from-slate-900 to-slate-700 bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]"
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
													Mehr erfahren
													<span
														class="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:translate-x-1 group-hover:shadow-md"
													>
														<ArrowRight
															class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
															aria-hidden="true"
														/>
													</span>
												</div>
											</div>
										</button>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				</div>

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

				<div class="mt-10 rounded-2xl border border-brand/15 bg-[#fdf8f2] p-6 shadow-sm">
					<div class="grid gap-6 md:grid-cols-[1.5fr,auto] md:items-center">
						<div>
							<p class="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
								{$t('experiences.base.kicker')}
							</p>
							<h3 class="mt-2 text-2xl font-semibold text-slate-900">
								{$t('experiences.base.title')}
							</h3>
							<p class="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
								{$t('experiences.base.body')}
							</p>
						</div>
						<div class="flex flex-wrap gap-3 md:flex-col md:justify-center">
							<ButtonLink variant="secondary" size="md"
								href={localizedHref('/unterkuenfte-preise')}
							>
								{$t('experiences.base.cta.rooms')}
							</ButtonLink>
							<ButtonLink variant="primary" size="md"
								href={localizedHref('/buchen')}
							>
								{$t('experiences.base.cta.booking')}
							</ButtonLink>
						</div>
					</div>
				</div>
			</section>

			<div class="mx-auto mt-10 w-full max-w-6xl px-1 sm:mt-14">
				<div class="h-px w-full bg-gradient-to-r from-transparent via-brand/45 to-transparent"></div>
			</div>

			<section class="anchor-target mt-12 sm:p-10" id="gaestecard">
				<div class="mx-auto max-w-3xl text-center">
					<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
						INKLUSIVE FÜR ÜBERNACHTUNGSGÄSTE
					</p>
					<h2 class="mt-3 font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
						Urlaub genießen.<br />Mobil bleiben.<br />Alles inklusive.
					</h2>
					<div class="mx-auto mt-3 h-[3px] w-14 rounded-full bg-brand"></div>
					<p class="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
						Mit der GästeCard Basic nutzen Sie Bus & Bahn kostenlos und entdecken die Region flexibel -
						ganz ohne Auto.
					</p>
				</div>

				<div class="mx-auto mt-10 max-w-6xl space-y-14">
					<Card tone="default" padding="none" class="overflow-hidden">
						<div class="grid lg:grid-cols-[0.45fr_0.55fr]">
							<div class="h-full">
								<img
									{...imageAttrs(guestCardVisual.src, '(max-width: 1024px) 100vw, 45vw')}
									alt={$t(guestCardVisual.altKey)}
									class="aspect-[16/10] w-full rounded-none object-cover sm:aspect-[4/3] lg:h-full lg:aspect-auto"
									loading="lazy"
									decoding="async"
								/>
							</div>

							<div class="p-8 sm:p-10 lg:p-12">
								<p class="text-xs font-semibold uppercase tracking-[0.32em] text-brand">
									GästeCard Basic inklusive
								</p>
								<h2 class="mt-4 font-serif text-3xl leading-[1.02] text-slate-900 sm:text-4xl">
									Ihre Vorteile auf einen Blick
								</h2>

								<div class="mt-5 flex flex-wrap gap-2">
									<span
										class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
									>
										Bus & Bahn gratis
									</span>
									<span
										class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
									>
										Vorteile ab 1. Nacht
									</span>
								</div>

								<p class="mt-6 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
									Bei Ihrer Übernachtung im Gästehaus Rader ist die GästeCard Basic inklusive. Sie starten
									direkt in Mobilität, Erholung und Naturerlebnisse - ohne zusätzliche Planung.
								</p>

								<ul class="mt-7 space-y-2 text-sm text-slate-700">
									<li class="flex items-start gap-2">
										<span class="mt-2 h-1.5 w-1.5 rounded-full bg-brand"></span>
										Bus & Bahn in Kärnten gratis nutzen
									</li>
									<li class="flex items-start gap-2">
										<span class="mt-2 h-1.5 w-1.5 rounded-full bg-brand"></span>
										Viele Freizeitvorteile ab der ersten Nacht
									</li>
									<li class="flex items-start gap-2">
										<span class="mt-2 h-1.5 w-1.5 rounded-full bg-brand"></span>
										Mehr Zeit für Urlaub statt Organisation
									</li>
								</ul>

								<div class="mt-6 flex flex-wrap items-center gap-3">
									<ButtonLink variant="primary" size="md"
										href={guestCardLinks.benefitsOverview}
										target="_blank"
										rel="noreferrer"
									>
										Alle Vorteile ansehen
										<ArrowRight class="h-4 w-4" aria-hidden="true" />
									</ButtonLink>
									<a
										href={guestCardLinks.brochure}
										target="_blank"
										rel="noreferrer"
										class="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:transition-none"
									>
										Aktuelle Leistungsübersicht
									</a>
								</div>
							</div>
						</div>
					</Card>

					<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
						<Card as="article" tone="default" padding="none"
							class="reveal group flex h-full flex-col overflow-hidden"
							style="--reveal-delay: 0ms;"
						>
							<img
								src={asset('/images/Umgebung/train.png')}
								alt="Zugverbindung durch Kärnten für Ausflüge ohne Auto"
								class="h-44 w-full object-cover"
								loading="lazy"
								decoding="async"
							/>
							<div class="flex flex-1 flex-col p-5">
								<div class="flex items-center gap-2">
									<BusFront class="h-4 w-4 text-brand" aria-hidden="true" />
									<h3 class="text-lg font-semibold text-slate-900">Flexibel unterwegs</h3>
								</div>
								<p class="mt-2 text-sm leading-relaxed text-slate-600">
									Kostenfreie Bus- und Bahnverbindungen bringen Sie bequem durch Kärnten - ideal für Ausflüge
									ohne Auto.
								</p>
								<div class="mt-4 flex flex-wrap gap-2">
									<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
										>Bus & Bahn gratis</span
									>
									<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
										>Ohne Parkplatzsuche</span
									>
								</div>
								<a
									href={guestCardLinks.benefitsOverview}
									target="_blank"
									rel="noreferrer"
									class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:transition-none"
								>
									Mehr erfahren
									<ArrowRight
										class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
										aria-hidden="true"
									/>
								</a>
							</div>
						</Card>

						<Card as="article" tone="default" padding="none"
							class="reveal group flex h-full flex-col overflow-hidden"
							style="--reveal-delay: 90ms;"
						>
							<img
								{...imageAttrs('/images/Umgebung/sauna.png', '(max-width: 1024px) 100vw, 360px')}
								alt="Baden und Wellness mit Gästekarte-Vorteilen"
								class="h-44 w-full object-cover"
								loading="lazy"
								decoding="async"
							/>
							<div class="flex flex-1 flex-col p-5">
								<div class="flex items-center gap-2">
									<Waves class="h-4 w-4 text-brand" aria-hidden="true" />
									<h3 class="text-lg font-semibold text-slate-900">Baden & Wellness</h3>
								</div>
								<p class="mt-2 text-sm leading-relaxed text-slate-600">
									Freibäder, Seen und ausgewählte Wellness-Angebote machen aus jedem Urlaubstag einen
									entspannten Genießertag.
								</p>
								<div class="mt-4 flex flex-wrap gap-2">
									<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
										>Freibäder & Seen</span
									>
									<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
										>Sauna-Vorteile</span
									>
								</div>
								<a
									href={guestCardLinks.benefitsOverview}
									target="_blank"
									rel="noreferrer"
									class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:transition-none"
								>
									Mehr erfahren
									<ArrowRight
										class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
										aria-hidden="true"
									/>
								</a>
							</div>
						</Card>

						<Card as="article" tone="default" padding="none"
							class="reveal group flex h-full flex-col overflow-hidden"
							style="--reveal-delay: 180ms;"
						>
							<img
								{...imageAttrs('/images/Umgebung/aussicht-vom-golz.jpg', '(max-width: 1024px) 100vw, 360px')}
								alt="Aktiv in der Natur am Nassfeld und im Gailtal"
								class="h-44 w-full object-cover"
								loading="lazy"
								decoding="async"
							/>
							<div class="flex flex-1 flex-col p-5">
								<div class="flex items-center gap-2">
									<Mountain class="h-4 w-4 text-brand" aria-hidden="true" />
									<h3 class="text-lg font-semibold text-slate-900">Aktiv & Natur</h3>
								</div>
								<p class="mt-2 text-sm leading-relaxed text-slate-600">
									Von Nassfeld bis Gailtal: Radwege, Bergmomente und geführte Naturerlebnisse für aktive
									Urlaubstage.
								</p>
								<div class="mt-4 flex flex-wrap gap-2">
									<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
										>Nassfeld Highlights</span
									>
									<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
										>Naturprogramme</span
									>
								</div>
								<a
									href={guestCardLinks.benefitsOverview}
									target="_blank"
									rel="noreferrer"
									class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:transition-none"
								>
									Mehr erfahren
									<ArrowRight
										class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
										aria-hidden="true"
									/>
								</a>
							</div>
						</Card>
					</div>

					<details class="group rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
						<summary
							class="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
						>
							<span>Alle Leistungen im Überblick</span>
							<ArrowRight
								class="h-4 w-4 transition-transform duration-300 group-open:rotate-90 motion-reduce:transition-none"
								aria-hidden="true"
							/>
						</summary>
						<div class="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
							<div>
								<h3 class="text-sm font-semibold text-slate-900">Mobilität</h3>
								<ul class="mt-2 space-y-1.5 text-sm text-slate-600">
									<li>Regionale Buslinien im Gültigkeitsbereich inklusive</li>
									<li>ÖBB S-Bahn in Kärnten kostenfrei nutzbar</li>
									<li>Auch am An- und Abreisetag gültig</li>
								</ul>
							</div>
							<div>
								<h3 class="text-sm font-semibold text-slate-900">Wellness</h3>
								<ul class="mt-2 space-y-1.5 text-sm text-slate-600">
									<li>Ermäßigungen bei Freibädern in der Region</li>
									<li>Vorteile bei ausgewählten Saunen</li>
									<li>Seen und Naturbadeplätze schnell erreichbar</li>
								</ul>
							</div>
							<div>
								<h3 class="text-sm font-semibold text-slate-900">Draußen</h3>
								<ul class="mt-2 space-y-1.5 text-sm text-slate-600">
									<li>Vergünstigungen bei Berg- und Naturangeboten</li>
									<li>Geführte Naturerlebnisse saisonal verfügbar</li>
									<li>Rad- und Wandererlebnisse rund ums Gailtal</li>
								</ul>
							</div>
							<div>
								<h3 class="text-sm font-semibold text-slate-900">Kulinarik</h3>
								<ul class="mt-2 space-y-1.5 text-sm text-slate-600">
									<li>Vorteile bei regionalen Genuss-Partnern</li>
									<li>Ausgewählte Produzenten und Hofläden entdecken</li>
								</ul>
							</div>
						</div>
					</details>
				</div>
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
							<p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
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
				<Button variant="primary" size="md"
					type="button"
					onclick={() => (isMobileFilterOpen = true)}
				>
					<SlidersHorizontal class="h-4 w-4" aria-hidden="true" />
					{$t('experiences.nav.filters')}
					{#if selectedActivity}
						<span class="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">1</span>
					{/if}
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

	{#if isMobileFilterOpen}
		<button
			type="button"
			class="fixed inset-0 z-[90] bg-slate-950/50 backdrop-blur-[2px]"
			onclick={() => (isMobileFilterOpen = false)}
			aria-label="Filter schließen"
		></button>
		<div
			class="fixed inset-x-0 bottom-0 z-[100] rounded-t-3xl border border-white/20 bg-white p-4 shadow-2xl"
		>
			<div class="flex items-center justify-between">
				<p class="text-sm font-semibold text-slate-900">{$t('experiences.nav.filters')}</p>
				<Button variant="secondary" size="icon"
					type="button"
					onclick={() => (isMobileFilterOpen = false)}
					aria-label="Filter schließen"
				>
					<X class="h-5 w-5" aria-hidden="true" />
				</Button>
			</div>

			<div class="mt-3 flex flex-wrap gap-2">
				{#each activityFilters as filter}
					<button
						type="button"
						class={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
							selectedActivity === filter.id
								? 'bg-brand text-white'
								: 'border border-slate-200 bg-white text-slate-700'
						}`}
						onclick={() => (selectedActivity = selectedActivity === filter.id ? null : filter.id)}
						aria-pressed={selectedActivity === filter.id}
					>
						<filter.icon class="h-4 w-4" aria-hidden="true" />
						{$t(filter.labelKey)}
					</button>
				{/each}
			</div>

			<div class="mt-4 flex gap-2">
				<Button variant="secondary" size="md"
					type="button"
					class="flex-1"
					onclick={() => (selectedActivity = null)}
				>
					{$t('experiences.nav.reset')}
				</Button>
				<Button variant="primary" size="md"
					type="button"
					class="flex-1"
					onclick={() => (isMobileFilterOpen = false)}
				>
					{$t('experiences.nav.apply')}
				</Button>
			</div>
		</div>
	{/if}
</main>

<style>
	.experience-nav-scroll {
		scrollbar-width: thin;
		scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
	}

	.experience-nav-scroll::-webkit-scrollbar {
		width: 6px;
	}

	.experience-nav-scroll::-webkit-scrollbar-thumb {
		border-radius: 999px;
		background: rgba(100, 116, 139, 0.38);
	}

	.experience-nav-scroll::-webkit-scrollbar-track {
		background: transparent;
	}

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
