<script lang="ts">
	import { onMount } from 'svelte';
	import { CalendarDays, X } from 'lucide-svelte';
	import { todayInAustria } from '$lib/booking-search';
	import { trackEvent } from '$lib/analytics/plausible';
	import { t } from '$lib/i18n';
	import Button from '$lib/components/ui/Button.svelte';

	let { slug, roomName, capacity, href }: { slug: string; roomName: string; capacity: number; href: string } = $props();
	const panelId = $derived('booking-search-' + slug);
	const bookingLabel = $derived($t('home.rooms.bookingLabel').replace('{room}', roomName));
	let supported = $state(false);
	let open = $state(false);
	let trigger = $state<HTMLButtonElement>();
	let panel = $state<HTMLDivElement>();
	let today = $state('');
	let arrival = $state('');
	let adults = $state(2);
	let children = $state(0);

	onMount(() => { supported = 'showPopover' in HTMLElement.prototype; });

	function nextDay(isoDate: string) {
		if (!isoDate) return undefined;
		const next = new Date(isoDate + 'T00:00:00Z');
		next.setUTCDate(next.getUTCDate() + 1);
		return next.toISOString().slice(0, 10);
	}

	$effect(() => {
		const anchor = trigger;
		const dropdown = panel;
		if (!open || !anchor || !dropdown) return;
		const positionPanel = () => {
			const rect = anchor.getBoundingClientRect();
			const margin = 8;
			const { offsetWidth: width, offsetHeight: height } = dropdown;
			const left = Math.max(margin, Math.min(rect.right - width, document.documentElement.clientWidth - width - margin));
			const below = rect.bottom + margin;
			const top = below + height <= window.innerHeight - margin ? below :
				Math.max(margin, Math.min(rect.top - height - margin, window.innerHeight - height - margin));
			dropdown.style.left = left + 'px';
			dropdown.style.top = top + 'px';
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
	const fieldClass = 'mt-1 block h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-base font-normal text-slate-900 focus-visible:outline-slate-900';
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
		onbeforetoggle={(event) => { if (event.newState === 'open') today = todayInAustria(); }}
		ontoggle={(event) => { open = event.newState === 'open'; }}
		class="fixed inset-auto m-0 max-h-[calc(100dvh-1rem)] w-80 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-lg">
		<div class="mb-3 flex items-center justify-between gap-2">
			<h3 id={panelId + '-title'} class="text-base font-semibold">{roomName}</h3>
			<button type="button" popovertarget={panelId} popovertargetaction="hide" aria-label={$t('home.rooms.close')}
				class="-mr-2 grid size-11 place-items-center rounded-full hover:bg-slate-100"><X size={18} aria-hidden="true" /></button>
		</div>
		<form action={href} method="GET" data-sveltekit-reload class="grid grid-cols-2 gap-3 text-sm font-medium"
			onsubmit={() => trackEvent('Booking: Jetzt buchen', { source: 'home-room-card', room: slug })}>
			<label class="min-w-0">{$t('home.rooms.arrival')}
				<input type="date" name="checkIn" min={today} bind:value={arrival} required class={fieldClass} />
			</label>
			<label class="min-w-0">{$t('home.rooms.departure')}
				<input type="date" name="checkOut" min={nextDay(arrival || today)} required class={fieldClass} />
			</label>
			<label>{$t('home.rooms.adults')}
				<select name="adults" bind:value={adults} class={fieldClass}>
					{#each Array(capacity) as _, i}<option value={i + 1} disabled={i + 1 + children > capacity}>{i + 1}</option>{/each}
				</select>
			</label>
			<label>{$t('home.rooms.children')}
				<select bind:value={children} class={fieldClass}>
					{#each Array(capacity) as _, i}<option value={i} disabled={i + adults > capacity}>{i}</option>{/each}
				</select>
			</label>
			{#each Array(children) as _, i}
				<label>{$t('home.rooms.childAge').replace('{n}', String(i + 1))}
					<select name="childAge" required class={fieldClass}>
						<option value="">{$t('home.rooms.selectAge')}</option>
						{#each Array(18) as _, age}<option value={age}>{age}</option>{/each}
					</select>
				</label>
			{/each}
			<Button type="submit" class="col-span-2">{$t('home.rooms.search')}</Button>
		</form>
	</div>
{:else}
	<a {href} class={triggerClass} aria-label={bookingLabel} title={bookingLabel}>{@render calendar()}</a>
{/if}
