<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { onMount } from 'svelte';
	import { lang, t } from '$lib/i18n';
	import { mountDeskline, type DesklineStatus } from '$lib/deskline';
	import { getLocaleFromPathname } from '$lib/routing';
	import { Ticket } from 'lucide-svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';

	let containerEl: HTMLDivElement;
	let widgetStatus = $state<DesklineStatus>('loading');

	onMount(() => mountDeskline(containerEl, getLocaleFromPathname(window.location.pathname), {
		onStatusChange: (status) => { widgetStatus = status; },
	}));
</script>

<SeoHead titleKey="booking.seo.title" descriptionKey="booking.seo.description" />

<div class="mx-auto w-full max-w-4xl px-4 pt-8 sm:px-6">
	<Card tone="accent" padding="sm" >
		<div class="flex items-start gap-3">
			<div class="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
				<Ticket class="h-5 w-5" aria-hidden="true" />
			</div>
			<div>
				<p class="text-sm font-semibold text-slate-900">
					{$t('booking.guestcard.title')}
				</p>
				<p class="mt-1 text-xs text-slate-600 sm:text-sm">
					{$t('booking.guestcard.body')}
				</p>
			</div>
		</div>
	</Card>
</div>

{#if widgetStatus !== 'ready'}
	<div class="mx-auto max-w-4xl px-4 py-10 text-center" role="status" aria-live="polite">
		{#if widgetStatus === 'loading'}
			<p class="text-slate-500">
				{$lang === 'de' ? 'Buchungsplattform wird geladen…' : 'Booking platform is loading…'}
			</p>
		{:else}
			<p class="text-slate-700">
				{$lang === 'de'
					? 'Die Buchungsplattform konnte nicht vollständig geladen werden. Bitte laden Sie die Seite erneut oder kontaktieren Sie uns direkt.'
					: 'The booking platform could not finish loading. Please reload the page or contact us directly.'}
			</p>
			<div class="mt-4 flex flex-wrap justify-center gap-4">
				<Button variant="primary" size="md" type="button" onclick={() => window.location.reload()} >
					{$lang === 'de' ? 'Erneut laden' : 'Reload page'}
				</Button>
				<a href="mailto:info@rader-gitschtal.at" class="self-center text-sm font-semibold text-brand underline underline-offset-4">info@rader-gitschtal.at</a>
			</div>
		{/if}
	</div>
{/if}

<div id="deskline-container" bind:this={containerEl} class:hidden={widgetStatus === 'error'}></div>

