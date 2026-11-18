<script lang="ts">
	import { onMount } from 'svelte';
	import { CalendarDays, X } from 'lucide-svelte';
	import { todayInAustria } from '$lib/booking-search';
	import { trackEvent } from '$lib/analytics/plausible';
	import { t } from '$lib/i18n';
	import Button from '$lib/components/ui/Button.svelte';
	import StayRangeCalendar from '$lib/components/StayRangeCalendar.svelte';

	let { slug, roomName, capacity, href }: { slug: string; roomName: string; capacity: number; href: string } = $props();
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
	let children = $state(0);

	onMount(() => { supported = 'showPopover' in HTMLElement.prototype; });

	function prepareDates() {
		today = todayInAustria();
		if (arrival < today) {
			arrival = '';
			departure = '';
		}
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

	const triggerClass = 'group absolute right-2 top-2 grid size-11 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900';
	const fieldClass = 'h-11 min-w-12 rounded-lg bg-transparent pl-1 pr-1 text-base font-semibold text-slate-900 focus-visible:outline-slate-900';
</script>

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
			onsubmit={() => trackEvent('Booking: Jetzt buchen', { source: 'home-room-card', room: slug })}>
			{#if today}
				{#key today}<StayRangeCalendar {today} bind:arrival bind:departure />{/key}
			{/if}
			<div class="mt-3 grid grid-cols-2 gap-x-5 gap-y-1 border-t border-slate-200 py-1">
			<label class="flex items-center justify-between">{$t('home.rooms.adults')}
				<select name="adults" bind:value={adults} class={fieldClass}>
					{#each Array(capacity) as _, i}<option value={i + 1} disabled={i + 1 + children > capacity}>{i + 1}</option>{/each}
				</select>
			</label>
			<label class="flex items-center justify-between">{$t('home.rooms.children')}
				<select bind:value={children} class={fieldClass}>
					{#each Array(capacity) as _, i}<option value={i} disabled={i + adults > capacity}>{i}</option>{/each}
				</select>
			</label>
			{#each Array(children) as _, i}
				<label class="pb-2 text-xs text-slate-600">{$t('home.rooms.childAge').replace('{n}', String(i + 1))}
					<select name="childAge" required class="mt-1 block h-11 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900">
						<option value="">{$t('home.rooms.selectAge')}</option>
						{#each Array(18) as _, age}<option value={age}>{age}</option>{/each}
					</select>
				</label>
			{/each}
			</div>
			<Button type="submit" disabled={!arrival || !departure} class="mt-1 w-full">{$t('home.rooms.search')}</Button>
		</form>
	</div>
{:else}
	<a {href} class={triggerClass} aria-label={bookingLabel} title={bookingLabel}>{@render calendar()}</a>
{/if}

<style>
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
		.booking-panel {
			opacity: 0; transform: translateY(var(--enter-y));
			transition: opacity 160ms ease, transform 190ms cubic-bezier(.2,.75,.25,1), display 190ms allow-discrete, overlay 190ms allow-discrete;
		}
		.booking-panel:popover-open { opacity: 1; transform: translateY(0); }
		@starting-style { .booking-panel:popover-open { opacity: 0; transform: translateY(var(--enter-y)); } }
	}
</style>
