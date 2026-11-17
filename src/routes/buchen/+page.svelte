<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { page } from '$app/state';
	import { accommodationBySlug } from '$lib/data/accommodations';
	import { maximumGuests, readStay, stayQuery, type BookingStay } from '$lib/booking-search';
	import { onMount } from 'svelte';
	import { lang, t } from '$lib/i18n';
	import { mountDeskline, type DesklineStatus } from '$lib/deskline';
	import { getLocaleFromPathname, localizePath } from '$lib/routing';
	import SeoHead from '$lib/components/SeoHead.svelte';

	let containerEl: HTMLDivElement;
	let widgetStatus = $state<DesklineStatus>('loading');

	const apartment = $derived(page.params.slug ? accommodationBySlug(page.params.slug) : undefined);
	let requestedStay = $state<BookingStay>();
	let invalidStay = $state(false);
	onMount(() => {
		const selection = readStay(new URLSearchParams(window.location.search), apartment && maximumGuests(apartment.attributes.guests.de));
		invalidStay = typeof selection === 'string';
		requestedStay = typeof selection === 'object' ? selection : undefined;
		return mountDeskline(containerEl, getLocaleFromPathname(window.location.pathname), {
			productIds: apartment ? [apartment.desklineProductId] : [],
			stay: requestedStay,
			onStatusChange: (status) => { widgetStatus = status; },
		});
	});
</script>

<SeoHead titleKey="booking.seo.title" descriptionKey="booking.seo.description" />

<section class="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
	<h1 class="font-serif text-2xl sm:text-3xl">
		{apartment ? ($lang === 'de' ? 'Verfügbarkeit für Appartement ' : 'Availability for apartment ') + apartment.title : $t('nav.booking')}
	</h1>
	<p class="mt-2 text-sm text-slate-700">{$t('room.detail.card.note')}</p>
	{#if invalidStay}
		<p role="status" class="mt-2 text-sm">{$lang === 'de' ? 'Bitte Reisedaten und Gäste unten neu auswählen.' : 'Please select your dates and guests below.'}</p>
	{/if}
	{#if apartment}
		<a class="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
			data-sveltekit-reload href={localizePath('/buchen', page.url.pathname) + (requestedStay ? stayQuery(requestedStay) : '')}>
			{$lang === 'de' ? 'Alle Appartements prüfen' : 'Check all apartments'}
		</a>
	{/if}
</section>

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


<p class="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-600">{$t('booking.guestcard.title')} · {$t('booking.guestcard.body')}</p>
