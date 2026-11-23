<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { ArrowRightLeft } from 'lucide-svelte';
	import { imageAttrs } from '$lib/images';
	import { page } from '$app/state';
	import { accommodationBySlug } from '$lib/data/accommodations';
	import { maximumGuests, readStay, stayQuery, type BookingStay } from '$lib/booking-search';
	import { onMount } from 'svelte';
	import { lang, t } from '$lib/i18n';
	import { mountDeskline, type DesklineStatus } from '$lib/deskline';
	import { getLocaleFromPathname, localizePath } from '$lib/routing';
	import SeoHead from '$lib/components/SeoHead.svelte';

	let containerEl: HTMLDivElement;
	let widgetStatus = $state<DesklineStatus>();

	const apartment = $derived(page.params.slug ? accommodationBySlug(page.params.slug) : undefined);
	let requestedStay = $state<BookingStay>();
	let invalidStay = $state(false);
	onMount(() => {
		widgetStatus = 'loading';
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

<section class={apartment || invalidStay ? 'mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6' : 'sr-only'}>
	{#if apartment}
		<div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-slate-200 pb-4">
			<div class="flex items-center gap-3 sm:gap-4">
				<img {...imageAttrs(apartment.images.main, '72px')} alt="" class="h-14 w-16 shrink-0 rounded-lg object-cover sm:h-16 sm:w-[72px]" />
				<div>
					<h1 class="font-serif text-2xl leading-tight text-slate-900 sm:text-3xl">
						{apartment.typeLabel[$lang]} {$lang === 'de' ? apartment.title : apartment.title.replace('Nr.', 'No.')}
					</h1>
					<p class="mt-1 text-sm text-slate-600">{apartment.attributes.size} · {apartment.attributes.guests[$lang]}</p>
				</div>
			</div>
			<a class="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 hover:border-slate-400 focus-visible:outline-offset-2"
				data-sveltekit-reload href={localizePath('/buchen', page.url.pathname) + (requestedStay ? stayQuery(requestedStay) : '')}>
				<ArrowRightLeft size={15} aria-hidden="true" />
				{$lang === 'de' ? 'Alle Appartements prüfen' : 'Check all apartments'}
			</a>
		</div>
	{:else}
		<h1 class="sr-only">{$t('nav.booking')}</h1>
	{/if}
	{#if invalidStay}
		<p role="status" class="mt-2 text-sm">{$lang === 'de' ? 'Bitte Reisedaten und Gäste unten neu auswählen.' : 'Please select your dates and guests below.'}</p>
	{/if}
</section>

{#if widgetStatus && widgetStatus !== 'ready'}
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


<div class="mx-auto max-w-6xl space-y-2 px-4 py-4 text-sm text-slate-600">
	<p>
		{$t('booking.directEnquiry')}
		<a data-sveltekit-reload href={localizePath('/kontakt', page.url.pathname)}
			class="font-semibold text-slate-800 underline underline-offset-4 hover:text-brand focus-visible:outline-offset-4">{$t('booking.contactLink')}</a>
	</p>
	<p>{$t('booking.guestcard.title')} · {$t('booking.guestcard.body')}</p>
</div>
