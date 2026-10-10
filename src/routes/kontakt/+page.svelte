<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { asset } from '$app/paths';
	import { reveal } from '$lib/actions/reveal';
	import { trackEvent } from '$lib/analytics/plausible';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { t } from '$lib/i18n';
	import {
		Check,
		ChevronRight,
		Clock3,
		Copy,
		Globe2,
		Mail,
		MapPin,
		MessageCircle,
		Navigation,
		Phone,
		PhoneCall,
		SquareParking,
	} from 'lucide-svelte';

	let ibanCopied = false;
	let bicCopied = false;
	let ibanTimer: ReturnType<typeof setTimeout> | null = null;
	let bicTimer: ReturnType<typeof setTimeout> | null = null;

	const withAsset = (path: string) => asset(path);
	const mapSrc =
		'https://www.google.com/maps?q=Weissbriach%2092%2C%209622%20Weissbriach%2C%20Austria&output=embed';
	const mapLink = 'https://maps.app.goo.gl/cXgd5iJbYPmSx2ad9';
	const iban = 'AT86 3936 4001 0361 6109';
	const bic = 'RZKTAT2K364';

	let mapEnabled = false;

	const enableMap = () => {
		mapEnabled = true;
		void trackEvent('Map: Loaded', { source: 'contact' });
	};

	const copyToClipboard = async (value: string, type: 'iban' | 'bic') => {
		if (!navigator?.clipboard) return;
		await navigator.clipboard.writeText(value);

		if (type === 'iban') {
			ibanCopied = true;
			if (ibanTimer) clearTimeout(ibanTimer);
			ibanTimer = setTimeout(() => {
				ibanCopied = false;
			}, 2000);
			return;
		}

		bicCopied = true;
		if (bicTimer) clearTimeout(bicTimer);
		bicTimer = setTimeout(() => {
			bicCopied = false;
		}, 2000);
	};

	const contactMethods = [
		{
			labelKey: 'contact.cta.whatsapp',
			value: '+43 676 6246826',
			href: 'https://wa.me/436766246826',
			icon: MessageCircle,
			color: 'text-emerald-600',
			bg: 'bg-emerald-50',
			external: true,
			event: () =>
				trackEvent('Contact: WhatsApp Click', { source: 'contact', placement: 'methods-action' }),
		},
		{
			labelKey: 'contact.methods.mobile',
			value: '+43 676 6246826',
			href: 'tel:+436766246826',
			icon: Phone,
			color: 'text-brand',
			bg: 'bg-brand/10',
			external: false,
			event: () =>
				trackEvent('Contact: Phone Click', {
					source: 'contact',
					line: 'mobile',
					placement: 'methods-action',
				}),
		},
		{
			labelKey: 'contact.methods.landline',
			value: '+43 4286 222',
			href: 'tel:+434286222',
			icon: PhoneCall,
			color: 'text-brand',
			bg: 'bg-brand/10',
			external: false,
			event: () =>
				trackEvent('Contact: Phone Click', {
					source: 'contact',
					line: 'landline',
					placement: 'methods-action',
				}),
		},
		{
			labelKey: 'contact.methods.email',
			value: 'info@rader-gitschtal.at',
			href: 'mailto:info@rader-gitschtal.at',
			icon: Mail,
			color: 'text-brand',
			bg: 'bg-brand/10',
			external: false,
			event: () => trackEvent('Contact: Email Click', { source: 'contact', placement: 'methods-action' }),
		},
	] as const;

	const trustItems = [
		{ textKey: 'contact.trust.languagesShort', icon: Globe2 },
		{ textKey: 'contact.trust.checkinShort', icon: Clock3 },
		{ textKey: 'contact.trust.parkingShort', icon: SquareParking },
	] as const;
</script>

<SeoHead titleKey="contact.seo.title" descriptionKey="contact.seo.description" />

<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<section
		use:reveal
		class="opacity-0 translate-y-4 py-4 transition-all duration-700 ease-out sm:py-8"
	>
		<div class="max-w-2xl">
			<p class="text-xs font-semibold uppercase tracking-[0.42em] text-brand">
				{$t('contact.hero.kicker')}
			</p>
			<h1 class="mt-4 font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
				{$t('contact.title')}
			</h1>
			<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
			<p class="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
				{$t('contact.subtitle')}
			</p>

			<div class="mt-8">
				<p class="text-sm font-semibold text-slate-900">{$t('contact.quick.title')}</p>
				<div class="mt-4 flex flex-wrap items-center gap-3">
					<ButtonLink variant="primary" size="md"
						href="https://wa.me/436766246826"
						target="_blank"
						rel="noopener noreferrer"
						onclick={() =>
							trackEvent('Contact: WhatsApp Click', { source: 'contact', placement: 'quick' })}
					>
						<MessageCircle class="h-4 w-4" aria-hidden="true" />
						{$t('contact.cta.whatsapp')}
					</ButtonLink>
					<ButtonLink variant="secondary" size="md"
						href="tel:+436766246826"
						onclick={() =>
							trackEvent('Contact: Phone Click', {
								source: 'contact',
								line: 'mobile',
								placement: 'quick',
							})}
					>
						<Phone class="h-4 w-4" aria-hidden="true" />
						{$t('contact.cta.callNow')}
					</ButtonLink>
				</div>
			</div>
		</div>
	</section>

	<div class="mt-6 grid gap-6 lg:grid-cols-[1fr,1.03fr]">
		<Card as="section" tone="default" padding="md"

		>
			<div>
				<h2 class="font-serif text-2xl font-semibold text-slate-950">{$t('contact.card.title')}</h2>
				<div class="mt-3 h-[2px] w-10 rounded-full bg-brand"></div>
			</div>

			<div class="mt-8 flex gap-4">
				<div
					class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-900 ring-1 ring-slate-200"
				>
					<MapPin class="h-5 w-5" aria-hidden="true" />
				</div>
				<div class="min-w-0">
					<p class="text-sm font-semibold text-slate-900">{$t('contact.address.title')}</p>
					<div class="mt-3 space-y-1 text-sm leading-relaxed text-slate-600">
						<p class="font-semibold text-slate-900">{$t('contact.address.name')}</p>
						<p>
							<a
								class="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:text-slate-950"
								href={mapLink}
								target="_blank"
								rel="noopener noreferrer"
								onclick={() =>
									trackEvent('Map: Open External', {
										source: 'contact',
										placement: 'address-line1',
									})}
							>
								{$t('contact.address.line1')}
							</a>
						</p>
						<p>{$t('contact.address.line2')}</p>
					</div>
				</div>
			</div>

			<div class="my-8 h-px bg-slate-200"></div>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('contact.methods.title')}</p>
				<div class="mt-5 divide-y divide-slate-200">
					{#each contactMethods as method}
						<a
							href={method.href}
							target={method.external ? '_blank' : undefined}
							rel={method.external ? 'noopener noreferrer' : undefined}
							class="group flex items-center justify-between gap-4 py-4"
							onclick={method.event}
						>
							<div class="flex min-w-0 items-center gap-4">
								<div
									class={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${method.bg} ${method.color}`}
								>
									<method.icon class="h-5 w-5" aria-hidden="true" />
								</div>
								<div class="min-w-0">
									<p class="text-sm font-semibold text-slate-950">{$t(method.labelKey)}</p>
									<p class="mt-0.5 break-words text-sm text-slate-600">{method.value}</p>
								</div>
							</div>
							<ChevronRight
								class="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand"
								aria-hidden="true"
							/>
						</a>
					{/each}
				</div>
			</div>
		</Card>

		<Card as="section" tone="default" padding="md"
			class="flex flex-col"
		>
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h2 class="font-serif text-2xl font-semibold text-slate-950">{$t('contact.map.title')}</h2>
					<div class="mt-3 h-[2px] w-10 rounded-full bg-brand"></div>
				</div>
				<ButtonLink variant="secondary" size="sm"
					href={mapLink}
					target="_blank"
					rel="noopener noreferrer"
					onclick={() => trackEvent('Map: Open External', { source: 'contact', placement: 'map-header' })}
				>
					<Navigation class="h-4 w-4" aria-hidden="true" />
					{$t('contact.route.cta')}
				</ButtonLink>
			</div>

			<div class="mt-6 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
				<div class="relative h-full min-h-[430px]">
					{#if mapEnabled}
						<iframe
							title={$t('contact.map.iframeTitle')}
							class="h-full w-full border-0"
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"
							src={mapSrc}
						></iframe>
					{:else}
						<div class="absolute inset-0 bg-slate-900">
							<img
								src={withAsset('/images/Haus/gaestehaus-sommer.jpg')}
								alt=""
								class="h-full w-full object-cover opacity-80"
								loading="lazy"
								decoding="async"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-white/10"></div>
							<a
								href={mapLink}
								target="_blank"
								rel="noopener noreferrer"
								class="group/address absolute left-5 top-5 rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-2xl sm:left-7 sm:top-7"
								onclick={() =>
									trackEvent('Map: Open External', { source: 'contact', placement: 'map-address' })}
							>
								<div class="flex items-start gap-3">
									<span
										class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white shadow-sm transition group-hover/address:scale-105"
									>
										<MapPin class="h-5 w-5" aria-hidden="true" />
									</span>
									<span>
										<span class="block text-sm font-semibold text-slate-950">{$t('contact.address.line1')}</span>
										<span class="mt-1 block text-xs text-slate-600">{$t('contact.address.line2')}</span>
									</span>
								</div>
							</a>
							<button
								type="button"
								class="absolute inset-x-5 bottom-5 rounded-2xl bg-white/95 p-5 text-left shadow-xl ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-2xl sm:inset-x-auto sm:left-7 sm:w-[360px]"
								onclick={enableMap}
							>
								<p class="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
									{$t('contact.map.label')}
								</p>
								<p class="mt-2 text-lg font-semibold text-slate-950">{$t('contact.map.load')}</p>
								<p class="mt-2 text-sm leading-relaxed text-slate-600">{$t('contact.map.tip')}</p>
								<span class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
									<Navigation class="h-4 w-4" aria-hidden="true" />
									{$t('contact.route.cta')}
								</span>
							</button>
						</div>
					{/if}
				</div>
			</div>
		</Card>
	</div>

	<Card as="section" tone="default" padding="md"
		class="mt-6"
	>
		<div class="grid gap-8 lg:grid-cols-[1.08fr,0.92fr] lg:divide-x lg:divide-slate-200">
			<div class="lg:pr-10">
				<h2 class="text-lg font-semibold text-slate-950">{$t('contact.payment.title')}</h2>
				<p class="mt-2 text-sm text-slate-500">{$t('contact.payment.subtitle')}</p>
				<div class="mt-6 grid gap-4 md:grid-cols-2">
					<Card tone="muted" padding="sm"
						class="group/payment"
					>
						<p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">IBAN</p>
						<button
							type="button"
							class="mt-3 block w-full rounded-lg text-left font-mono text-base font-semibold leading-relaxed tracking-wide text-slate-950 transition hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:text-lg"
							onclick={() => copyToClipboard(iban, 'iban')}
							aria-label={$t('contact.payment.copyIban')}
						>
							{iban}
						</button>
						<Button variant="secondary" size="sm"
							type="button"
							class="mt-4"
							onclick={() => copyToClipboard(iban, 'iban')}
							aria-label={$t('contact.payment.copyIban')}
						>
							{#if ibanCopied}
								<Check class="h-4 w-4 text-emerald-600" />
								<span aria-live="polite">{$t('contact.payment.copied')}</span>
							{:else}
								<Copy class="h-4 w-4 text-slate-500" />
								<span>{$t('contact.payment.copy')}</span>
							{/if}
						</Button>
					</Card>
					<Card tone="muted" padding="sm"
						class="group/payment"
					>
						<p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">BIC</p>
						<button
							type="button"
							class="mt-3 block w-full rounded-lg text-left font-mono text-base font-semibold leading-relaxed tracking-wide text-slate-950 transition hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:text-lg"
							onclick={() => copyToClipboard(bic, 'bic')}
							aria-label={$t('contact.payment.copyBic')}
						>
							{bic}
						</button>
						<Button variant="secondary" size="sm"
							type="button"
							class="mt-4"
							onclick={() => copyToClipboard(bic, 'bic')}
							aria-label={$t('contact.payment.copyBic')}
						>
							{#if bicCopied}
								<Check class="h-4 w-4 text-emerald-600" />
								<span aria-live="polite">{$t('contact.payment.copied')}</span>
							{:else}
								<Copy class="h-4 w-4 text-slate-500" />
								<span>{$t('contact.payment.copy')}</span>
							{/if}
						</Button>
					</Card>
				</div>
			</div>

			<div class="border-t border-slate-100 pt-8 lg:border-t-0 lg:pl-10 lg:pt-0">
				<h2 class="text-lg font-semibold text-slate-950">{$t('contact.trust.title')}</h2>
				<div class="mt-6 grid gap-3 sm:grid-cols-3">
					{#each trustItems as item}
						<Card tone="muted" padding="sm" class="text-center">
							<div
								class="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
							>
								<item.icon class="h-5 w-5" aria-hidden="true" />
							</div>
							<p class="mt-3 text-sm font-semibold leading-snug text-slate-700">{$t(item.textKey)}</p>
						</Card>
					{/each}
				</div>
			</div>
		</div>
	</Card>
</div>
