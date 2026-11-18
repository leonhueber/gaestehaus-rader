<script lang="ts">
	import { tick } from 'svelte';
	import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { lang, t } from '$lib/i18n';

	let { today, arrival = $bindable(''), departure = $bindable(''), oncomplete }: {
		today: string; arrival?: string; departure?: string; oncomplete: () => void;
	} = $props();

	const dateOf = (iso: string) => new Date(iso + 'T00:00:00Z');
	const isoOf = (date: Date) => date.toISOString().slice(0, 10);
	let cursor = $state('');
	let editing = $state<'arrival' | 'departure'>();
	const active = $derived(editing ?? (arrival && !departure ? 'departure' : 'arrival'));
	let hovered = $state('');
	let calendar: HTMLDivElement;
	const current = $derived(cursor || arrival || today);
	const first = $derived(dateOf(current.slice(0, 7) + '-01'));
	const lastDay = $derived(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate());
	const offset = $derived((first.getUTCDay() + 6) % 7);
	const locale = $derived($lang === 'de' ? 'de-AT' : 'en-GB');
	const monthFormat = $derived(new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }));
	const longFormat = $derived(new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' }));
	const shortFormat = $derived(new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }));
	const weekdayFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }));
	const previewEnd = $derived(active === 'departure' && hovered > arrival ? hovered : departure);
	let direction = $state(1);

	function move(iso: string) {
		const next = iso < today ? today : iso;
		if (next.slice(0, 7) !== current.slice(0, 7)) direction = next > current ? 1 : -1;
		cursor = next;
		hovered = '';
	}

	function changeMonth(by: number) {
		const end = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + by + 1, 0));
		end.setUTCDate(Math.min(dateOf(current).getUTCDate(), end.getUTCDate()));
		move(isoOf(end));
	}

	function select(iso: string) {
		move(iso);
		if (active === 'departure' && iso > arrival) {
			departure = iso;
			oncomplete();
		} else {
			arrival = iso;
			departure = '';
			editing = 'departure';
		}
	}

	function edit(part: 'arrival' | 'departure') {
		editing = part;
		move((part === 'arrival' ? arrival : departure || arrival) || today);
	}

	async function onDayKey(event: KeyboardEvent, iso: string) {
		const date = dateOf(iso);
		const weekday = (date.getUTCDay() + 6) % 7;
		const shifts: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -weekday, End: 6 - weekday };
		if (event.key in shifts) {
			date.setUTCDate(date.getUTCDate() + shifts[event.key]);
			move(isoOf(date));
		} else if (event.key === 'PageUp' || event.key === 'PageDown') {
			changeMonth(event.key === 'PageDown' ? 1 : -1);
		} else return;
		event.preventDefault();
		await tick();
		calendar.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus({ preventScroll: true });
	}
</script>

<div class="dates">
	<button type="button" class:editing={active === 'arrival'} onclick={() => edit('arrival')}>
		<span>{$t('home.rooms.arrival')}</span>
		<strong>{arrival ? shortFormat.format(dateOf(arrival)) : $t('home.rooms.chooseDate')}</strong>
	</button>
	<ArrowRight size={15} aria-hidden="true" />
	<button type="button" disabled={!arrival} class:editing={active === 'departure'} onclick={() => edit('departure')}>
		<span>{$t('home.rooms.departure')}</span>
		<strong>{departure ? shortFormat.format(dateOf(departure)) : $t(arrival ? 'home.rooms.pickEnd' : 'home.rooms.chooseDate')}</strong>
	</button>
</div>
<div bind:this={calendar} class="calendar" style:--slide={direction > 0 ? '9px' : '-9px'}>
	<div class="month">
		<strong aria-live="polite">{monthFormat.format(first)}</strong>
		<button type="button" disabled={current.slice(0, 7) === today.slice(0, 7)} aria-label={$t('home.rooms.prevMonth')} onclick={() => changeMonth(-1)}><ChevronLeft size={17} /></button>
		<button type="button" aria-label={$t('home.rooms.nextMonth')} onclick={() => changeMonth(1)}><ChevronRight size={17} /></button>
	</div>
	<div class="week" aria-hidden="true">
		{#each Array(7) as _, i}<span>{weekdayFormat.format(new Date(Date.UTC(2024, 0, 1 + i))).replace('.', '')}</span>{/each}
	</div>
	{#key current.slice(0, 7)}
		<div class="days" role="group" aria-label={monthFormat.format(first)} onpointerleave={() => hovered = ''}>
			{#each Array(offset) as _}<span></span>{/each}
			{#each Array(lastDay) as _, i}
				{@const iso = current.slice(0, 8) + String(i + 1).padStart(2, '0')}
				<button type="button" disabled={iso < today} data-date={iso}
					tabindex={iso === current ? 0 : -1} aria-label={longFormat.format(dateOf(iso))}
					aria-current={iso === today ? 'date' : undefined} aria-pressed={iso === arrival || iso === departure}
					class:start={iso === arrival} class:end={iso === departure}
					class:range={!!arrival && iso >= arrival && iso <= previewEnd}
					onpointerenter={(event) => { if (event.pointerType === 'mouse') hovered = iso; }}
					onkeydown={(event) => onDayKey(event, iso)} onclick={() => select(iso)}>
					<span>{i + 1}</span>
				</button>
			{/each}
		</div>
	{/key}
</div>
<p class="sr-only" aria-live="polite">{arrival ? shortFormat.format(dateOf(arrival)) : ''} {departure ? '– ' + shortFormat.format(dateOf(departure)) : $t(active === 'departure' ? 'home.rooms.pickEnd' : 'home.rooms.pickStart')}</p>

<style>
	.dates { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: .6rem; }
	.dates button { text-align: left; border-bottom: 2px solid #e2e8f0; padding: .3rem 0 .55rem; }
	.dates button.editing { border-color: #f29200; }
	.dates span, .dates strong { display: block; }
	.dates span, .week { font-size: .75rem; color: #536171; }
	.dates strong { font-size: .9375rem; margin-top: .15rem; font-weight: 600; }
	.dates :global(svg) { color: #78838f; }
	.calendar { margin-top: .5rem; }
	.month { display: flex; align-items: center; }
	.month strong { margin-right: auto; font-size: .9375rem; }
	.month button { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; }
	button:focus-visible { outline: 2px solid #26374a; outline-offset: -2px; }
	.month button:hover:enabled, .days button:hover:enabled:not(.start,.end) span { background: #f1f3f4; }
	.month button:disabled, .days button:disabled { color: #aab0b8; }
	.week, .days { display: grid; grid-template-columns: repeat(7,minmax(0,1fr)); text-align: center; }
	.week { padding-block: .35rem; }
	.days button { position: relative; display: grid; place-items: center; min-height: 44px; font-size: .875rem; font-variant-numeric: tabular-nums; isolation: isolate; }
	.days button.range::before { content: ''; position: absolute; inset: 5px 0; background: #fff0d9; z-index: -1; }
	.days button.start::before { left: 50%; }
	.days button.end::before { right: 50%; }
	.days button span { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; }
	.days button.start span, .days button.end span { background: #283445; color: white; font-weight: 600; }
	.days button[aria-current=date] span { text-decoration: underline; text-underline-offset: 4px; }
	@media (prefers-reduced-motion: no-preference) {
		.days { animation: month-in 170ms ease-out; }
		.dates button, .days button span { transition: background-color 130ms, border-color 150ms; }
	}
	@keyframes month-in { from { opacity: .35; transform: translateX(var(--slide)); } to { opacity: 1; transform: translateX(0); } }
</style>
