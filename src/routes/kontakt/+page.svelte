<script lang="ts">
	import { onDestroy } from 'svelte';
	import { asset } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import { trackEvent } from '$lib/analytics/plausible';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { t } from '$lib/i18n';
	import { ArrowUpRight, Check, Clock3, Copy, Globe2, Mail, MessageCircle, Navigation, Phone, PhoneCall, SquareParking } from 'lucide-svelte';

	const mapLink = 'https://maps.app.goo.gl/cXgd5iJbYPmSx2ad9';
	const bankDetails = [
		{ type: 'iban', label: 'IBAN', value: 'AT86 3936 4001 0361 6109', copyKey: 'contact.payment.copyIban' },
		{ type: 'bic', label: 'BIC', value: 'RZKTAT2K364', copyKey: 'contact.payment.copyBic' },
	] as const;
	let copied = $state<'iban' | 'bic' | null>(null);
	let copyError = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;

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

	const whatsapp = {
			labelKey: 'contact.cta.whatsapp', value: '+43 676 6246826', href: 'https://wa.me/436766246826', icon: MessageCircle, external: true,
			event: () => trackEvent('Contact: WhatsApp Click', { source: 'contact', placement: 'methods-action' }),
		} as const;
	const contactMethods = [
		whatsapp,
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


<SeoHead titleKey="contact.seo.title" descriptionKey="contact.seo.description" />

<div class="mx-auto max-w-3xl px-2 sm:px-0">
	<h1 class="font-serif text-3xl leading-tight text-slate-900 sm:text-4xl">{$t('contact.title')}</h1>
	<div class="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
		<section aria-labelledby="contact-methods-heading">
			<h2 id="contact-methods-heading" class="mb-2 text-lg font-semibold text-slate-900">{$t('contact.address.name')}</h2>
			<div class="divide-y divide-slate-200 border-y border-slate-200">
				{#each contactMethods as method}
					<div class="flex items-center gap-2">
					<a href={method.href} target={method.external ? '_blank' : undefined} rel={method.external ? 'noopener noreferrer' : undefined}
						class="group flex min-w-0 flex-1 items-center gap-3 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
						onclick={method.event}>
						{#if method === whatsapp}
							<img src={asset('/images/Logo/whatsapp.svg')} width="20" height="20" alt="" />
						{:else}
							<method.icon class="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" strokeWidth={1.5} />
						{/if}
						<div class="min-w-0 flex-1">
							<p class="text-xs leading-5 text-slate-600">{$t(method.labelKey)}</p>
							<p class="mt-0.5 break-words text-sm font-medium leading-6 tabular-nums text-slate-900 underline-offset-4 group-hover:underline">{method.value}</p>
						</div>
						<ArrowUpRight class="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-900" aria-hidden="true" strokeWidth={1.5} />
					</a>

					</div>
				{/each}
			</div>
		</section>

	</div>

	<div class="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:mt-10 sm:grid sm:grid-cols-[0.9fr_1.1fr]">
		<section aria-labelledby="contact-arrival-heading" class="bg-[#f7f4ee] p-5 sm:p-6">
			<h2 id="contact-arrival-heading" class="text-lg font-semibold text-slate-900">{$t('contact.map.title')}</h2>
			<address class="mt-4 not-italic">
				<span class="block text-lg font-medium text-slate-900">{$t('contact.address.line1')}</span>
				<span class="block text-sm leading-6 text-slate-600">{$t('contact.address.line2')}</span>
			</address>
			<ButtonLink variant="secondary" size="sm" class="mt-4" href={mapLink} target="_blank" rel="noopener noreferrer" onclick={() => trackEvent('Map: Open External', { source: 'contact', placement: 'map-address' })}>
				<Navigation size={15} aria-hidden="true" />{$t('contact.route.cta')}
			</ButtonLink>
		</section>

		<section aria-labelledby="contact-payment-heading" class="min-w-0 border-t border-slate-200 p-5 sm:border-l sm:border-t-0 sm:p-6">
			<h2 id="contact-payment-heading" class="text-lg font-semibold text-slate-900">{$t('contact.payment.title')}</h2>
			<p class="mt-1 text-sm leading-relaxed text-slate-600">{$t('contact.payment.subtitle')}</p>
			<dl class="mt-3 divide-y divide-slate-200">
				{#each bankDetails as detail}
					<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 py-2">
						<dt class="text-xs font-medium text-slate-600">{detail.label}</dt>
						<dd class="col-start-1 break-words font-mono text-sm leading-6 text-slate-900">{detail.value}</dd>
						<dd class="col-start-2 row-start-1 row-span-2">
							<Button variant="ghost" size="icon" class="text-slate-600" onclick={() => copyToClipboard(detail.value, detail.type)} aria-label={$t(detail.copyKey)} title={$t(detail.copyKey)}>
								{#if copied === detail.type}<Check size={16} class="text-emerald-700" aria-hidden="true" />{:else}<Copy size={16} aria-hidden="true" />{/if}
							</Button>
						</dd>
					</div>
				{/each}
			</dl>
			<p role="status" class={copyError ? 'mt-2 text-sm text-slate-600' : 'sr-only'}>{copyError ? $t('contact.payment.copyError') : copied ? $t('contact.payment.copied') : ''}</p>
		</section>
	</div>
		<section class="mt-8 sm:mt-10">
			<h2 class="text-lg font-semibold text-slate-900">{$t('contact.trust.title')}</h2>
			<ul class="mt-4 space-y-3">
				{#each stayDetails as item}
					<li class="flex items-start gap-3 text-sm leading-6 text-slate-600">
						<item.icon class="mt-1 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" strokeWidth={1.5} />
						<span>{$t(item.textKey)}</span>
					</li>
				{/each}
			</ul>
		</section>
</div>
