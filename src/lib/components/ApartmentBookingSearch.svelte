<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { CalendarDays, ChevronDown, ChevronRight, Minus, Plus, Users, X } from 'lucide-svelte';
	import { todayInAustria } from '$lib/booking-search';
	import { trackEvent } from '$lib/analytics/plausible';
	import { lang, t } from '$lib/i18n';
	import Button from '$lib/components/ui/Button.svelte';
	import StayRangeCalendar from '$lib/components/StayRangeCalendar.svelte';

	let { slug, roomName, capacity, href, source = 'home-room-card' }: {
		slug: string; roomName: string; capacity: number; href: string; source?: 'home-room-card' | 'rooms-list';
	} = $props();
	const panelId = $derived('booking-search-' + slug);
	const bookingLabel = $derived($t('home.rooms.bookingLabel').replace('{room}', roomName));
	let supported = $state(false);
	let open = $state(false);
	let trigger = $state<HTMLButtonElement>();
	let panel = $state<HTMLDivElement>();
	let today = $state('');
	let arrival = $state('');
	let departure = $state('');
	let adults = $state(2);
	let childAges = $state<(number | '')[]>([]);
	let section = $state<'dates' | 'summary' | 'guests'>('dates');
	let dateRow = $state<HTMLButtonElement>();
	const completeRange = $derived(!!arrival && departure > arrival);
	const completeParty = $derived(childAges.every(age => age !== ''));
	const atCapacity = $derived(adults + childAges.length >= capacity);
	const nights = $derived((Date.parse(departure) - Date.parse(arrival)) / 86400000);
	const dateFormat = $derived(new Intl.DateTimeFormat($lang === 'de' ? 'de-DE' : 'en-GB', {
		day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
	}));
	const rangeLabel = $derived(completeRange ? dateFormat.formatRange(new Date(arrival), new Date(departure)) :
		arrival ? dateFormat.format(new Date(arrival)) : $t('home.rooms.selectStay'));
	const adultLabel = $derived(adults + ' ' + $t(adults === 1 ? 'home.rooms.oneAdult' : 'home.rooms.adults'));
	const guestLabel = $derived(childAges.length ? adultLabel + ', ' + childAges.length + ' ' + $t(childAges.length === 1 ? 'home.rooms.oneChild' : 'home.rooms.children') : adultLabel);

	onMount(() => { supported = 'showPopover' in HTMLElement.prototype; });

	function prepareDates() {
		today = todayInAustria();
		if (arrival < today) {
			arrival = '';
			departure = '';
		}
		section = !completeRange ? 'dates' : completeParty ? 'summary' : 'guests';
	}

	async function editDates() {
		section = 'dates';
		await tick();
		panel?.querySelector<HTMLButtonElement>('[data-date][tabindex="0"]')?.focus({ preventScroll: true });
	}

	async function finishDates() {
		section = completeParty ? 'summary' : 'guests';
		await tick();
		dateRow?.focus({ preventScroll: true });
	}

	$effect(() => {
		const anchor = trigger;
		const dropdown = panel;
		if (!open || !anchor || !dropdown) return;
		const positionPanel = () => {
			if (window.innerWidth < 640) return;
			const rect = anchor.getBoundingClientRect();
			const margin = 8;
			const { offsetWidth: width, offsetHeight: height } = dropdown;
			const left = Math.max(margin, Math.min(rect.right - width, document.documentElement.clientWidth - width - margin));
			const below = rect.bottom + margin;
			const top = below + height <= window.innerHeight - margin ? below :
				Math.max(margin, Math.min(rect.top - height - margin, window.innerHeight - height - margin));
			dropdown.style.setProperty('--panel-left', left + 'px');
			dropdown.style.setProperty('--panel-top', top + 'px');
		};
		positionPanel();
		const observer = new ResizeObserver(positionPanel);
		observer.observe(dropdown);
		window.addEventListener('resize', positionPanel);
		window.addEventListener('scroll', positionPanel, true);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', positionPanel);
			window.removeEventListener('scroll', positionPanel, true);
		};
	});

	const triggerClass = 'group grid size-11 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900';
</script>

{#snippet stepper(label: string, count: number, minimum: number, less: () => void, more: () => void)}
	<div class="flex items-center justify-between gap-2">
		<span>{label}</span>
		<div class="stepper" role="group" aria-label={label}>
			<button type="button" aria-label={label + ' −1'} disabled={count <= minimum} onclick={less}><Minus size={15} /></button>
			<span aria-live="polite">{count}</span>
			<button type="button" aria-label={label + ' +1'} disabled={atCapacity} onclick={more}><Plus size={15} /></button>
		</div>
	</div>
{/snippet}

{#snippet calendar()}
	<span class="grid size-8 place-items-center rounded-full bg-white text-slate-800 shadow-sm group-hover:bg-slate-100">
		<CalendarDays size={17} aria-hidden="true" />
	</span>
{/snippet}

{#if supported}
	<button type="button" bind:this={trigger} class={triggerClass} title={bookingLabel} aria-label={bookingLabel}
		aria-haspopup="dialog" popovertarget={panelId}>
		{@render calendar()}
	</button>
	<div id={panelId} popover="auto" role="dialog" aria-labelledby={panelId + '-title'} bind:this={panel}
		onbeforetoggle={(event) => { if (event.newState === 'open') prepareDates(); }}
		ontoggle={(event) => { open = event.newState === 'open'; }}
		data-lenis-prevent
		class="booking-panel fixed m-0 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white px-5 pb-5 pt-3 text-slate-900">
		<div class="mb-1 flex items-center justify-between gap-2">
			<h3 id={panelId + '-title'} class="font-serif text-2xl">{roomName}</h3>
			<button type="button" popovertarget={panelId} popovertargetaction="hide" aria-label={$t('home.rooms.close')}
				class="-mr-2 grid size-11 place-items-center rounded-full hover:bg-slate-100"><X size={18} aria-hidden="true" /></button>
		</div>
		<form action={href} method="GET" data-sveltekit-reload class="text-sm font-medium"
			onsubmit={(event) => {
				if (!completeRange || !completeParty) { event.preventDefault(); return; }
				trackEvent('Booking: Jetzt buchen', { source, room: slug });
			}}>
			<input type="hidden" name="checkIn" value={arrival} />
			<input type="hidden" name="checkOut" value={departure} />
			<input type="hidden" name="adults" value={adults} />
			{#each childAges as age}<input type="hidden" name="childAge" value={age} />{/each}
			{#if today && section === 'dates'}
				<div class="reveal-section pb-2">
					{#key today}<StayRangeCalendar {today} bind:arrival bind:departure oncomplete={finishDates} />{/key}
				</div>
			{:else}
				<button type="button" class="edit-row" bind:this={dateRow} onclick={editDates}>
					<CalendarDays size={20} aria-hidden="true" />
					<span class="grow">
						<strong>{rangeLabel}</strong>
						{#if completeRange}<small>{nights} {$t(nights === 1 ? 'price.night' : 'home.rooms.nights')}</small>
						{:else if arrival}<small>{$t('home.rooms.pickEnd')}</small>{/if}
					</span>
					<ChevronRight size={16} aria-hidden="true" />
				</button>
			{/if}
			<button type="button" class="edit-row guest-row" aria-expanded={section === 'guests'} aria-controls={panelId + '-guests'}
				onclick={() => { section = section === 'guests' ? (completeRange ? 'summary' : 'dates') : 'guests'; }}>
				<Users size={20} aria-hidden="true" />
				<span class="grow"><strong>{guestLabel}</strong>
					{#if !completeParty && section !== 'guests'}<small>{$t('home.rooms.selectAge')}</small>{/if}
				</span>
				<ChevronDown size={16} aria-hidden="true" class={section === 'guests' ? 'rotate-180' : ''} />
			</button>
			<div id={panelId + '-guests'} hidden={section !== 'guests'}>
				{#if section === 'guests'}
					<div class="reveal-section space-y-1 pb-2">
						{@render stepper($t('home.rooms.adults'), adults, 1, () => adults--, () => adults++)}
						{@render stepper($t('home.rooms.children'), childAges.length, 0, () => childAges.pop(), () => childAges.push(''))}
						{#each childAges as _, i}
							<label class="flex min-h-11 items-center justify-between gap-3">
								{$t('home.rooms.childAge').replace('{n}', String(i + 1))}
								<select bind:value={childAges[i]} required class="h-11 rounded-lg border border-slate-200 bg-white px-2">
									<option value="">{$t('home.rooms.selectAge')}</option>
									{#each Array(18) as _, age}
										<option value={age}>{age === 0 ? $t('home.rooms.underOne') : age + ' ' + $t(age === 1 ? 'home.rooms.year' : 'home.rooms.years')}</option>
									{/each}
								</select>
							</label>
						{/each}
					</div>
				{/if}
			</div>
			{#if completeRange && section !== 'dates'}
				<Button type="submit" disabled={!completeParty} class="mt-2 w-full">{$t('home.rooms.search')}</Button>
			{/if}
		</form>
	</div>
{:else}
	<a {href} class={triggerClass} aria-label={bookingLabel} title={bookingLabel}>{@render calendar()}</a>
{/if}

<style>
	.edit-row { display: flex; align-items: center; gap: .8rem; width: 100%; text-align: left; padding-block: .85rem; min-height: 52px; }
	.edit-row strong { font-weight: 600; }
	.edit-row small { display: block; font-size: .8rem; color: #536171; margin-top: .15rem; }
	.guest-row { border-top: 1px solid #e2e8f0; }
	.stepper { display: flex; align-items: center; text-align: center; font-variant-numeric: tabular-nums; }
	.stepper span { min-width: 1.5rem; }
	.stepper button { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; }
	.stepper button::before { content: ''; position: absolute; inset: 7px; border: 1px solid #cbd2d9; border-radius: 50%; }
	.stepper button:enabled:hover::before { border-color: currentColor; }
	.stepper button:disabled::before { border-color: #e6e9ed; }
	.stepper button:disabled { color: #aab0b8; }
	.booking-panel {
		inset: auto auto 0 0;
		width: 100%;
		max-width: none;
		max-height: calc(100dvh - .75rem);
		padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
		border-radius: 1.25rem 1.25rem 0 0;
		box-shadow: 0 12px 45px #17233424;
		--enter-y: 18px;
	}
	.booking-panel::backdrop { background: #1826383b; }
	@media (min-width: 640px) {
		.booking-panel {
			inset: var(--panel-top, 8px) auto auto var(--panel-left, 8px);
			width: 23.5rem; border-radius: 1rem; --enter-y: 6px;
		}
		.booking-panel::backdrop { background: transparent; }
	}
	@media (prefers-reduced-motion: no-preference) {
		.reveal-section { animation: section-in 160ms ease-out; }
		.booking-panel {
			opacity: 0; transform: translateY(var(--enter-y));
			transition: opacity 160ms ease, transform 190ms cubic-bezier(.2,.75,.25,1), display 190ms allow-discrete, overlay 190ms allow-discrete;
		}
		.booking-panel:popover-open { opacity: 1; transform: translateY(0); }
		@starting-style { .booking-panel:popover-open { opacity: 0; transform: translateY(var(--enter-y)); } }
	}
	@keyframes section-in { from { opacity: .3; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
</style>
