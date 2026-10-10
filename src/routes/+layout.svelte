<script lang="ts">
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import favicon from '$lib/assets/favicon.ico';
	import { env } from '$env/dynamic/public';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { lang, setLang, t, type Lang } from '$lib/i18n';
	import { imageAttrs } from '$lib/images';
	import { localizePath, samePathOtherLocale, toGermanPath } from '$lib/routing';
	import { getLenisInstance, setLenisInstance } from '$lib/scroll';
	import { trackEvent, trackPageview } from '$lib/analytics/plausible';
	import { MessageCircle } from 'lucide-svelte';
	import Lenis from 'lenis';
	import { onMount } from 'svelte';
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';

	let { children, data } = $props();
	const currentLocale = $derived(data.locale);
	type WebMcpDocument = Document & {
		modelContext?: { registerTool?: unknown };
	};

	// svelte-ignore state_referenced_locally
	setLang(currentLocale);

	$effect(() => {
		setLang(currentLocale);
	});

	const localizedHref = (path: string) => localizePath(path, page.url.pathname);
	const localeSwitchHref = (targetLocale: Lang) => samePathOtherLocale(page.url.pathname, targetLocale);

	const navItems = $derived([
		{ href: localizedHref('/unterkuenfte-preise'), key: 'nav.roomsShort' },
		{ href: localizedHref('/erlebnisse'), key: 'nav.experiences' },
		{ href: localizedHref('/ueber-uns'), key: 'nav.about' },
		{ href: localizedHref('/kontakt'), key: 'nav.contact' },
	]);

	const bookingHref = $derived(localizedHref('/buchen'));
	const isPreviewDeployment = env.PUBLIC_IS_PREVIEW === 'true';
	const productionSiteOrigin = env.PUBLIC_PRODUCTION_SITE_ORIGIN || 'https://rader-gitschtal.at';

	const normalizePath = (path: string) => (path === '/' ? '/' : path.replace(/\/+$/, ''));
	const isActive = (href: string) => {
		const current = normalizePath(page.url.pathname);
		const target = normalizePath(href);

		return current === target || (target !== '/' && current.startsWith(`${target}/`));
	};

	// Keep ONLY for max-width control
	const isHome = $derived(toGermanPath(page.url.pathname) === '/');
	const isFullWidth = $derived(toGermanPath(page.url.pathname).startsWith('/buchen'));

	const trackLanguage = (nextLang: Lang) => {
		if ($lang === nextLang) return;
		void trackEvent('Filter: Language Change', { lang: nextLang });
	};

	let headerHidden = $state(false);

	onMount(() => {
		const modelContext = (document as WebMcpDocument).modelContext;
		if (typeof modelContext?.registerTool !== 'function') return;

		let disposed = false;
		let retryTimer: ReturnType<typeof setTimeout> | undefined;
		const register = async (retry: boolean) => {
			try {
				const { registerSiteTools } = await import('$lib/webmcp');
				if (disposed) return;
				if (await registerSiteTools()) return;
			} catch (error) {
				console.warn('[WebMCP] Could not load site tools.', error);
			}
			if (retry && !disposed) retryTimer = setTimeout(() => void register(false), 1000);
		};
		void register(true);
		return () => {
			disposed = true;
			clearTimeout(retryTimer);
		};
	});

	onMount(() => {
		let lenis: Lenis | null = null;
		let lenisRafId = 0;
		let lastScrollY = window.scrollY;
		const scrollDeltaThreshold = 8;
		const topRevealThreshold = 20;
		const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

		const isMobileViewport = () => window.matchMedia('(max-width: 1023px)').matches;
		const lenisEasing = (value: number) => Math.min(1, 1.001 - Math.pow(2, -10 * value));

		const stopLenis = () => {
			if (lenisRafId) {
				window.cancelAnimationFrame(lenisRafId);
				lenisRafId = 0;
			}

			if (!lenis) return;

			lenis.destroy();
			lenis = null;
			setLenisInstance(null);
		};

		const startLenis = () => {
			if (reducedMotionQuery.matches || lenis) return;

			lenis = new Lenis({
				smoothWheel: true,
				syncTouch: false,
				duration: 1,
				easing: lenisEasing,
				anchors: true,
				stopInertiaOnNavigate: true,
			});
			setLenisInstance(lenis);

			const onAnimationFrame = (time: number) => {
				lenis?.raf(time);
				lenisRafId = window.requestAnimationFrame(onAnimationFrame);
			};

			lenisRafId = window.requestAnimationFrame(onAnimationFrame);
		};

		const syncLenis = () => {
			if (reducedMotionQuery.matches) {
				stopLenis();
				return;
			}

			startLenis();
		};

		const onScroll = () => {
			const currentScrollY = window.scrollY;

			if (!isMobileViewport()) {
				headerHidden = false;
				lastScrollY = currentScrollY;
				return;
			}

			if (currentScrollY <= topRevealThreshold) {
				headerHidden = false;
				lastScrollY = currentScrollY;
				return;
			}

			const delta = currentScrollY - lastScrollY;
			if (Math.abs(delta) < scrollDeltaThreshold) {
				lastScrollY = currentScrollY;
				return;
			}

			headerHidden = delta > 0;
			lastScrollY = currentScrollY;
		};

		const onResize = () => {
			if (!isMobileViewport()) {
				headerHidden = false;
			}

			lenis?.resize();
		};

		const onReducedMotionChange = () => {
			syncLenis();
		};

		syncLenis();

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onResize);
		reducedMotionQuery.addEventListener('change', onReducedMotionChange);

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
			reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
			stopLenis();
		};
	});

	afterNavigate(({ to }) => {
		trackPageview(to?.url.href ?? page.url.href);

		if (typeof window !== 'undefined') {
			window.requestAnimationFrame(() => {
				getLenisInstance()?.resize();
			});
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href={favicon} />
</svelte:head>

<!-- No more isHome theme switching -->
<div class="flex min-h-screen flex-col bg-[#faf9f6] text-slate-900">
	<a
		href="#main-content"
		class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-md"
	>
		{$t('accessibility.skip')}
	</a>
	<div class="sticky top-0 z-50">
		{#if isPreviewDeployment}
			<div class="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-xs font-semibold leading-snug text-amber-950 sm:text-sm">
				{$t('deployment.previewNotice')}
				<a
					class="underline decoration-amber-500 underline-offset-2 hover:text-amber-800"
					href={productionSiteOrigin}
				>
					{productionSiteOrigin.replace(/^https?:\/\//, '')}
				</a>.
			</div>
		{/if}

		<header
			id="site-header"
			class={`w-full border-b border-slate-200 bg-white/90 backdrop-blur transition-transform duration-300 will-change-transform ${
				headerHidden ? '-translate-y-full' : 'translate-y-0'
			}`}
		>
		<div class="mx-auto flex w-full items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-[6vw] lg:py-6">
			<a
				href={localizedHref('/')}
				class="flex items-center rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/40"
				aria-label="Gästehaus Rader - Startseite"
			>
				<div
					class="flex h-16 w-32 items-center justify-center bg-white"
				>
					<img
						{...imageAttrs('/images/Logo/logo-rader-gitschtal.jpg', '(max-width: 640px) 128px, 208px')}
						alt="Gästehaus Rader"
						class="h-12 w-auto object-contain sm:h-14 lg:h-16"
						loading="eager"
						fetchpriority="high"
					/>
				</div>
			</a>

			<nav
				class="hidden flex-1 items-center justify-center text-sm font-semibold text-slate-700 lg:flex"
				aria-label={$t('nav.primary')}
			>
				{#each navItems as item}
					<a
						href={item.href}
						class={`transition-all hover:text-brand active:scale-[0.96] px-4 py-3 ${
							isActive(item.href) ? 'text-brand' : 'text-slate-700'
						}`}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						{$t(item.key)}
					</a>
				{/each}
			</nav>

			<div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
				<div
					class="flex items-center rounded-full border border-slate-200/80 bg-slate-50 p-0.5 text-[10px] font-medium sm:text-[11px]"
				>
					<a
						href={localeSwitchHref('de')}
						data-sveltekit-reload={isFullWidth}
						class={`rounded-full px-2 py-1 transition sm:px-2.5 ${
							$lang === 'de'
								? 'bg-white text-slate-700 ring-1 ring-slate-200'
								: 'text-slate-500 hover:bg-white/80 hover:text-slate-700'
						}`}
						onclick={() => trackLanguage('de')}
						aria-current={$lang === 'de' ? 'page' : undefined}
						aria-label={$t('nav.langDe')}
					>
						DE
					</a>
					<a
						href={localeSwitchHref('en')}
						data-sveltekit-reload={isFullWidth}
						class={`rounded-full px-2 py-1 transition sm:px-2.5 ${
							$lang === 'en'
								? 'bg-white text-slate-700 ring-1 ring-slate-200'
								: 'text-slate-500 hover:bg-white/80 hover:text-slate-700'
						}`}
						onclick={() => trackLanguage('en')}
						aria-current={$lang === 'en' ? 'page' : undefined}
						aria-label={$t('nav.langEn')}
					>
						EN
					</a>
				</div>

				<ButtonLink variant="primary" size="sm"
					href={bookingHref}
					aria-label={$t('nav.booking')}
					onclick={() => trackEvent('Booking: Jetzt buchen', { source: 'header' })}
				>
					{$t('nav.booking')}
				</ButtonLink>
			</div>
		</div>

		<nav class="border-t border-slate-100 bg-white/70 lg:hidden" aria-label={$t('nav.primary')}>
			<div
				class="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-4 py-3 text-sm font-medium sm:px-6"
			>
				{#each navItems as item}
					<a
						href={item.href}
						class={`whitespace-nowrap transition-colors hover:text-brand ${
							isActive(item.href) ? 'text-brand' : 'text-slate-700'
						}`}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						{$t(item.key)}
					</a>
				{/each}
			</div>
		</nav>
		</header>
	</div>

	<!-- ONLY remaining isHome logic: max-width behavior -->
	<main
		id="main-content"
		class={`w-full flex-1 ${isHome ? '' : isFullWidth ? '' : 'mx-auto max-w-6xl px-2 py-10 sm:px-6'}`}
	>
		{#key page.url.pathname}
			<div in:fade={{ duration: (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 0 : 400, delay: 150 }} class="h-full">
				{@render children()}
			</div>
		{/key}
	</main>

	<footer class="border-t border-slate-200 bg-white text-slate-800">
		<div class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
			<div class="grid gap-10 lg:grid-cols-3">
				<div>
					<div class="flex items-center gap-3">
						<div class="flex items-center justify-center rounded-lg shadow-sm">
							<img
								{...imageAttrs('/images/Logo/logo-rader-gitschtal.jpg', '(max-width: 640px) 128px, 224px')}
								alt="Gästehaus Rader"
								class="h-12 w-auto object-contain sm:h-14"
								loading="lazy"
								decoding="async"
							/>
						</div>
					</div>

					<p class="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
						{$t('footer.tagline')}
					</p>

					<div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
						<a
							href="https://www.nassfeld.at/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Nassfeld"
							onclick={() => trackEvent('Outbound: Partner Click', { source: 'footer', partner: 'nassfeld' })}
						>
							<img
								{...imageAttrs('/images/Logo/nassfeld-logo.png', '189px')}
								alt="Nassfeld"
								class="h-10 w-auto object-contain sm:h-12"
								loading="lazy"
								decoding="async"
							/>
						</a>
						<a
							href="https://www.kaernten.at/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Kärnten"
							onclick={() => trackEvent('Outbound: Partner Click', { source: 'footer', partner: 'kaernten' })}
						>
							<img
								{...imageAttrs('/images/Logo/kaernten-logo.png', '277px')}
								alt="Kärnten"
								class="h-10 w-auto object-contain sm:h-12"
								loading="lazy"
								decoding="async"
							/>
						</a>
					</div>
				</div>

				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.2em]">
						{$t('footer.quicklinks')}
					</p>
					<ul class="mt-4 space-y-3 text-sm text-slate-600">
						<li>
							<a class="hover:text-slate-900" href={localizedHref('/unterkuenfte-preise')}>
								{$t('nav.roomsShort')}
							</a>
						</li>
						<li>
							<a class="hover:text-slate-900" href={localizedHref('/erlebnisse')}>
								{$t('nav.experiences')}
							</a>
						</li>
						<li>
							<a class="hover:text-slate-900" href={localizedHref('/ueber-uns')}>
								{$t('nav.about')}
							</a>
						</li>
						<li>
							<a class="hover:text-slate-900" href={localizedHref('/kontakt')}>
								{$t('nav.contact')}
							</a>
						</li>
						<li>
							<a
								class="hover:text-slate-900"
								href={localizedHref('/faq')}
								onclick={() => trackEvent('Trust: FAQ Click', { source: 'footer' })}
							>
								{$t('footer.faq')}
							</a>
						</li>
					</ul>
				</div>

				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.2em]">
						{$t('footer.contact')}
					</p>
					<ul class="mt-4 space-y-3 text-sm text-slate-600">
						<li class="font-semibold text-slate-800">Familie Herold-Hueber</li>
						<li>
							<a
								class="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
								href="https://maps.app.goo.gl/cXgd5iJbYPmSx2ad9"
								target="_blank"
								rel="noopener noreferrer"
								onclick={() => trackEvent('Map: Route Click', { source: 'footer' })}
							>
								Weißbriach 92
							</a>
						</li>
						<li>9622 Weißbriach, Österreich</li>
						<li>
							<a
								class="hover:text-slate-900"
								href="tel:+436766246826"
								onclick={() => trackEvent('Contact: Phone Click', { source: 'footer', line: 'mobile' })}
							>
								+43 676 6246826
							</a>
							<a
								class="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
								href="https://wa.me/436766246826"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="WhatsApp: +43 676 6246826"
								onclick={() => trackEvent('Contact: WhatsApp Click', { source: 'footer' })}
							>
								<MessageCircle class="h-3.5 w-3.5" aria-hidden="true" />
								WhatsApp
							</a>
						</li>
						<li>
							<a
								class="hover:text-slate-900"
								href="mailto:info@rader-gitschtal.at"
								onclick={() => trackEvent('Contact: Email Click', { source: 'footer' })}
							>
								info@rader-gitschtal.at
							</a>
						</li>
					</ul>
				</div>
			</div>

			<div
				class="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"
			>
				<p>
					© {new Date().getFullYear()} Gästehaus Rader. {$t('footer.rights')}
				</p>
				<div class="flex flex-wrap gap-x-6 gap-y-2">
					<a href={localizedHref('/impressum')} class="hover:text-slate-900">{$t('footer.imprint')}</a>
					<a href={localizedHref('/datenschutz')} class="hover:text-slate-900">{$t('footer.privacy')}</a>
					<a href={localizedHref('/agb')} class="hover:text-slate-900">{$t('footer.terms')}</a>
					<a href={localizedHref('/barrierefreiheit')} class="hover:text-slate-900">
						{$t('footer.accessibility')}
					</a>
					<a href={localizedHref('/bildnachweise')} class="hover:text-slate-900">
						{$t('footer.credits')}
					</a>
				</div>
			</div>
		</div>
	</footer>
</div>
