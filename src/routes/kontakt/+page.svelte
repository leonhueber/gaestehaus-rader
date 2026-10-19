<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { page } from '$app/state';
	import { localizePath } from '$lib/routing';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { imageAttrs } from '$lib/images';
	import { trackEvent } from '$lib/analytics/plausible';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { t } from '$lib/i18n';
	import { ArrowUpRight, Check, Clock3, Copy, CreditCard, Globe2, Landmark, Mail, Map, MapPin, MessageCircle, Navigation, Phone, PhoneCall, SquareParking, X } from 'lucide-svelte';

	const mapSrc = 'https://www.google.com/maps?q=Weissbriach%2092%2C%209622%20Weissbriach%2C%20Austria&output=embed';
	const mapLink = 'https://maps.app.goo.gl/cXgd5iJbYPmSx2ad9';
	const bankDetails = [
		{ type: 'iban', label: 'IBAN', value: 'AT86 3936 4001 0361 6109', copyKey: 'contact.payment.copyIban', icon: CreditCard },
		{ type: 'bic', label: 'BIC', value: 'RZKTAT2K364', copyKey: 'contact.payment.copyBic', icon: Landmark },
	] as const;
	let mapEnabled = $state(false);
	let mapConsentOpen = $state(true);
	let mapToggle: HTMLButtonElement | null = $state(null);
	let mapConsentPanel: HTMLElement | null = $state(null);
	let copied = $state<'iban' | 'bic' | null>(null);
	let copyError = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;

	const closeMap = async () => {
		mapConsentOpen = false;
		mapEnabled = false;
		await tick();
		mapToggle?.focus();
	};
	const toggleMap = async () => {
		if (mapEnabled || mapConsentOpen) return closeMap();
		mapConsentOpen = true;
		await tick();
		mapConsentPanel?.focus();
	};
	const enableMap = async () => {
		mapConsentOpen = false;
		mapEnabled = true;
		await tick();
		mapToggle?.focus();
		void trackEvent('Map: Loaded', { source: 'contact' });
	};
	const copyToClipboard = async (value: string, type: 'iban' | 'bic') => {
		copyError = false;
		try {
			await navigator.clipboard.writeText(value);
			copied = type;
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => { copied = null; }, 2000);
		} catch {
			copied = null;
			copyError = true;
		}
	};
	onDestroy(() => { if (copyTimer) clearTimeout(copyTimer); });

	const contactMethods = [
		{
			labelKey: 'contact.cta.whatsapp', value: '+43 676 6246826', href: 'https://wa.me/436766246826', icon: MessageCircle, external: true,
			event: () => trackEvent('Contact: WhatsApp Click', { source: 'contact', placement: 'methods-action' }),
		},
		{
			labelKey: 'contact.methods.email', value: 'info@rader-gitschtal.at', href: 'mailto:info@rader-gitschtal.at', icon: Mail, external: false,
			event: () => trackEvent('Contact: Email Click', { source: 'contact', placement: 'methods-action' }),
		},
		{
			labelKey: 'contact.methods.mobile', value: '+43 676 6246826', href: 'tel:+436766246826', icon: Phone, external: false,
			event: () => trackEvent('Contact: Phone Click', { source: 'contact', line: 'mobile', placement: 'methods-action' }),
		},
		{
			labelKey: 'contact.methods.landline', value: '+43 4286 222', href: 'tel:+434286222', icon: PhoneCall, external: false,
			event: () => trackEvent('Contact: Phone Click', { source: 'contact', line: 'landline', placement: 'methods-action' }),
		},
	] as const;
	const stayDetails = [
		{ textKey: 'contact.trust.languages', icon: Globe2 },
		{ textKey: 'contact.trust.checkin', icon: Clock3 },
		{ textKey: 'contact.trust.parking', icon: SquareParking },
	] as const;
</script>

<svelte:window onkeydown={(event) => { if (mapConsentOpen && event.key === 'Escape') { event.preventDefault(); void closeMap(); } }} />

<SeoHead titleKey="contact.seo.title" descriptionKey="contact.seo.description" />

<div class="mx-auto w-full max-w-[76rem] px-4 py-12 font-sans text-sm font-normal leading-6 sm:px-6 sm:py-16 lg:px-8">
	<header class="max-w-2xl">
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">{$t('contact.title')}</p>
		<h1 class="mt-3 text-balance font-serif text-3xl font-normal leading-tight tracking-normal text-slate-900 sm:text-4xl">{$t('contact.hero.title')}</h1>
	</header>

	<div class="mt-10 grid items-start gap-10 lg:mt-12 lg:grid-cols-[0.9fr,1.1fr] lg:gap-16">
		<section aria-labelledby="contact-methods-heading">
			<p class="text-xs leading-5 text-slate-600">{$t('contact.hosts')}</p>
			<h2 id="contact-methods-heading" class="mt-1 font-serif text-xl font-normal leading-snug tracking-normal text-slate-900">{$t('contact.address.name')}</h2>
			<div class="mt-6 divide-y divide-slate-200 border-y border-slate-200">
				{#each contactMethods as method}
					<a href={method.href} target={method.external ? '_blank' : undefined} rel={method.external ? 'noopener noreferrer' : undefined}
						class="group flex items-center gap-3 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
						onclick={method.event}>
						<method.icon class="h-5 w-5 shrink-0 text-brand" aria-hidden="true" strokeWidth={1.5} />
						<div class="min-w-0 flex-1">
							<p class="text-xs leading-5 text-slate-600">{$t(method.labelKey)}</p>
							<p class="mt-0.5 break-words text-sm font-medium leading-6 tabular-nums text-slate-900 underline-offset-4 group-hover:underline">{method.value}</p>
						</div>
						<ArrowUpRight class="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-900" aria-hidden="true" strokeWidth={1.5} />
					</a>
				{/each}
			</div>
		</section>

		<Card as="section" tone="default" padding="none" class="overflow-hidden" aria-labelledby="contact-arrival-heading">
			<div id="contact-map" class={['relative bg-slate-100 sm:h-[320px]', mapConsentOpen ? 'h-[440px]' : 'h-[280px]']}>
				{#if mapEnabled}
					<iframe title={$t('contact.map.iframeTitle')} class="absolute inset-0 h-full w-full border-0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src={mapSrc}></iframe>
				{:else}
					<img {...imageAttrs('/images/Haus/gaestehaus-sommer.jpg', '(min-width: 1280px) 600px, (min-width: 1024px) 55vw, 100vw')} alt={$t('home.gallery.imageAlt.sommer')} class="h-full w-full object-cover" decoding="async" />
				{/if}
				{#if mapConsentOpen}
					<section bind:this={mapConsentPanel} tabindex="-1" aria-labelledby="map-consent-title" aria-describedby="map-consent-description" class="absolute inset-0 flex flex-col justify-center bg-white/95 px-5 pb-5 pt-16 outline-none sm:px-6">
						<h3 id="map-consent-title" class="font-serif text-xl font-normal leading-snug tracking-normal text-slate-900">{$t('contact.map.consentTitle')}</h3>
						<p id="map-consent-description" class="mt-2 text-sm leading-6 text-slate-600">{$t('contact.map.description')}</p>
						<a class="mt-2 w-fit text-sm text-slate-600 underline underline-offset-4 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900" href={`${localizePath('/datenschutz', page.url.pathname)}#google-maps`} target="_blank" rel="noopener noreferrer">{$t('contact.map.privacy')}</a>
						<div class="mt-4 flex flex-wrap items-center gap-2">
							<Button size="sm" onclick={enableMap}>{$t('contact.map.consentAccept')}</Button>
							<Button variant="ghost" size="sm" onclick={closeMap}>{$t('contact.map.consentDecline')}</Button>
						</div>
					</section>
				{/if}
				<div class="absolute right-4 top-4">
					<Button bind:element={mapToggle} variant="secondary" size={mapConsentOpen ? 'icon' : 'sm'} aria-label={$t(mapEnabled ? 'contact.map.close' : mapConsentOpen ? 'contact.map.consentClose' : 'contact.map.load')} title={mapConsentOpen ? $t('contact.map.consentClose') : undefined} aria-expanded={mapEnabled || mapConsentOpen} aria-controls="contact-map" onclick={toggleMap}>
						{#if mapEnabled || mapConsentOpen}<X class="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />{:else}<Map class="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />{/if}
						{#if !mapConsentOpen}{$t(mapEnabled ? 'contact.map.close' : 'contact.map.load')}{/if}
					</Button>
				</div>
			</div>
			<div class="flex items-center gap-3 p-5 sm:gap-4 sm:p-6">
				<div class="flex min-w-0 flex-1 items-start gap-3">
					<MapPin class="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" strokeWidth={1.5} />
					<div>
						<h2 id="contact-arrival-heading" class="font-serif text-xl font-normal leading-snug tracking-normal text-slate-900">{$t('contact.map.title')}</h2>
						<address class="mt-2 text-sm not-italic leading-6 text-slate-600">
							{$t('contact.address.line1')}<br />{$t('contact.address.line2')}
						</address>
					</div>
				</div>
				<ButtonLink variant="ghost" size="sm" class="shrink-0" href={mapLink} target="_blank" rel="noopener noreferrer" aria-label={$t('contact.route.cta')} title={$t('contact.route.cta')} onclick={() => trackEvent('Map: Open External', { source: 'contact', placement: 'map-address' })}>
					<Navigation class="h-4 w-4" aria-hidden="true" strokeWidth={1.5} /><span class="hidden sm:inline">{$t('contact.route.cta')}</span>
				</ButtonLink>
			</div>
		</Card>
	</div>

	<div class="mt-12 grid items-start gap-10 border-t border-slate-200 pt-10 lg:mt-16 lg:grid-cols-[0.9fr,1.1fr] lg:gap-16">
		<section aria-labelledby="contact-stay-heading">
			<h2 id="contact-stay-heading" class="font-serif text-xl font-normal leading-snug tracking-normal text-slate-900">{$t('contact.trust.title')}</h2>
			<ul class="mt-4 space-y-3">
				{#each stayDetails as item}
					<li class="flex items-start gap-3 text-sm leading-6 text-slate-600">
						<item.icon class="mt-1 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" strokeWidth={1.5} />
						<span>{$t(item.textKey)}</span>
					</li>
				{/each}
			</ul>
		</section>
		<section aria-labelledby="contact-payment-heading">
			<h2 id="contact-payment-heading" class="font-serif text-xl font-normal leading-snug tracking-normal text-slate-900">{$t('contact.payment.title')}</h2>
			<ul class="mt-4 space-y-3">
				{#each bankDetails as detail}
					<li class="flex items-start gap-3 text-sm leading-6 text-slate-600">
						<detail.icon class="mt-1 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" strokeWidth={1.5} />
						<div class="min-w-0 flex-1">
							<p class="text-xs leading-5 text-slate-600">{detail.label}</p>
							<p class="mt-1 break-words font-medium tabular-nums text-slate-900">{detail.value}</p>
						</div>
						<Button variant="ghost" size="icon" onclick={() => copyToClipboard(detail.value, detail.type)} aria-label={$t(detail.copyKey)} title={$t(detail.copyKey)}>
							{#if copied === detail.type}<Check class="h-4 w-4" aria-hidden="true" />{:else}<Copy class="h-4 w-4" aria-hidden="true" />{/if}
						</Button>
					</li>
				{/each}
			</ul>
			<p class="mt-5 text-sm leading-6 text-slate-600">{$t('contact.payment.subtitle')}</p>
			<p role="status" class={copyError ? 'mt-2 text-sm leading-6 text-slate-600' : 'sr-only'}>{copyError ? $t('contact.payment.copyError') : copied ? $t('contact.payment.copied') : ''}</p>
		</section>
	</div>
</div>
