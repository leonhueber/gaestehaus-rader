<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { cardClasses } from '$lib/components/ui/styles';
	import { imageAttrs } from '$lib/images';
	import { ChevronLeft, ChevronRight, X } from 'lucide-svelte';

	export type GalleryLightboxItem = {
		src: string;
		alt: string;
		title?: string;
		badge?: string;
		contain?: boolean;
	};

	type Props = {
		open: boolean;
		items: GalleryLightboxItem[];
		index: number;
		title?: string;
		closeLabel?: string;
		prevLabel?: string;
		nextLabel?: string;
		imageSizes?: string;
		onClose: () => void;
		onIndexChange: (index: number) => void;
	};

	let {
		open,
		items,
		index,
		title = 'Galerie',
		closeLabel = 'Galerie schließen',
		prevLabel = 'Vorheriges Bild',
		nextLabel = 'Nächstes Bild',
		imageSizes = '(max-width: 1024px) 100vw, 1100px',
		onClose,
		onIndexChange,
	}: Props = $props();

	const activeIndex = $derived(
		items.length ? Math.min(Math.max(index, 0), items.length - 1) : 0
	);
	const activeItem = $derived(items[activeIndex]);
	const hasManyItems = $derived(items.length > 1);

	const setIndex = (nextIndex: number) => {
		if (!items.length) return;
		onIndexChange((nextIndex + items.length) % items.length);
	};

	const portal = (node: HTMLElement) => {
		document.body.appendChild(node);

		return {
			destroy: () => {
				node.remove();
			},
		};
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (!open) return;
		if (event.key === 'Escape') {
			onClose();
			return;
		}
		if (event.key === 'ArrowLeft') {
			setIndex(activeIndex - 1);
			return;
		}
		if (event.key === 'ArrowRight') {
			setIndex(activeIndex + 1);
		}
	};

	$effect(() => {
		if (!open) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && activeItem}
	<div
		use:portal
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fbfaf7]/95 p-3 text-slate-900 backdrop-blur-sm sm:p-5"
		role="dialog"
		aria-modal="true"
		aria-label={title}
		tabindex="-1"
	>
		<button
			type="button"
			class="absolute inset-0"
			onclick={onClose}
			aria-label={closeLabel}
		></button>

		<div class={cardClasses('default', 'none', false, 'relative z-10 flex h-full max-h-[960px] w-full max-w-7xl flex-col overflow-hidden shadow-[0_12px_48px_rgba(15,23,42,0.08)]')}>
			<div class="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200/70 px-3 py-2 sm:px-5 sm:py-3">
				<p class="min-w-0 text-sm font-medium leading-snug sm:text-base">{title}</p>
				<Button variant="ghost" size="icon"
					type="button"
					onclick={onClose}
					aria-label={closeLabel}
				>
					<X class="h-5 w-5" strokeWidth={1.75} />
				</Button>
			</div>

			<div class="relative min-h-0 flex-1 bg-[#fbfaf7]">
				{#if hasManyItems}
					<Button variant="secondary" size="icon"
						type="button"
						class="absolute left-2 top-1/2 z-30 -translate-y-1/2 sm:left-4"
						onclick={() => setIndex(activeIndex - 1)}
						aria-label={prevLabel}
					>
						<ChevronLeft class="h-5 w-5" strokeWidth={1.5} />
					</Button>

					<Button variant="secondary" size="icon"
						type="button"
						class="absolute right-2 top-1/2 z-30 -translate-y-1/2 sm:right-4"
						onclick={() => setIndex(activeIndex + 1)}
						aria-label={nextLabel}
					>
						<ChevronRight class="h-5 w-5" strokeWidth={1.5} />
					</Button>
				{/if}

				<img
					{...imageAttrs(activeItem.src, imageSizes)}
					alt={activeItem.alt}
					class={`absolute inset-0 h-full w-full object-contain ${activeItem.contain ? 'p-4 sm:p-6' : ''}`}
					loading="eager"
					decoding="async"
				/>
				{#if activeItem.badge}
					<span class="absolute left-3 top-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 sm:left-5 sm:top-5">
						{activeItem.badge}
					</span>
				{/if}
			</div>

			<div class="max-h-[40%] shrink-0 overflow-y-auto border-t border-slate-200/70 bg-white px-3 py-3 sm:px-5 sm:py-4">
				<div class="flex items-center justify-between gap-4 text-sm">
					<p class="min-w-0 text-sm font-medium leading-snug">
						{activeItem.title ?? activeItem.alt}
					</p>
					<p class="shrink-0 text-xs tabular-nums text-slate-500">
						{activeIndex + 1} / {items.length}
					</p>
				</div>

				{#if hasManyItems}
					<div class="mt-3 flex gap-2 overflow-x-auto p-1 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
						{#each items as item, itemIndex}
							<button
								type="button"
								class={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 motion-reduce:transition-none sm:h-16 sm:w-24 ${itemIndex === activeIndex ? 'border-brand ring-2 ring-brand/40' : 'border-slate-200 hover:ring-2 hover:ring-brand/20'}`}
								onclick={() => setIndex(itemIndex)}
								aria-label={item.title ?? item.alt}
								aria-pressed={itemIndex === activeIndex}
							>
								<img
									{...imageAttrs(item.src, '112px')}
									alt=""
									class={`h-full w-full bg-slate-100 ${item.contain ? 'object-contain p-1.5' : 'object-cover'}`}
									loading="lazy"
									decoding="async"
								/>
								{#if item.badge}
									<span class="absolute inset-x-1 bottom-1 rounded bg-white/95 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-900">
										{item.badge}
									</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
