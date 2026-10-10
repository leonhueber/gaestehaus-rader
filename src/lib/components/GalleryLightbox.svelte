<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
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
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-md sm:p-5"
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

		<div class="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-7xl flex-col sm:max-h-[calc(100dvh-2.5rem)]">
			<Button variant="overlay" size="icon"
				type="button"
				class="absolute right-2 top-2 z-30 sm:-top-1 sm:right-0"
				onclick={onClose}
				aria-label={closeLabel}
			>
				<X class="h-5 w-5" strokeWidth={1.75} />
			</Button>

			{#if hasManyItems}
				<Button variant="overlay" size="icon"
					type="button"
					class="absolute left-2 top-[42%] z-30 -translate-y-1/2 sm:left-4"
					onclick={() => setIndex(activeIndex - 1)}
					aria-label={prevLabel}
				>
					<ChevronLeft class="h-5 w-5" strokeWidth={1.5} />
				</Button>

				<Button variant="overlay" size="icon"
					type="button"
					class="absolute right-2 top-[42%] z-30 -translate-y-1/2 sm:right-4"
					onclick={() => setIndex(activeIndex + 1)}
					aria-label={nextLabel}
				>
					<ChevronRight class="h-5 w-5" strokeWidth={1.5} />
				</Button>
			{/if}

			<div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/8 shadow-2xl ring-1 ring-black/20">
				<div class="relative min-h-0 flex-1 bg-slate-950/35">
					<img
						{...imageAttrs(activeItem.src, imageSizes)}
						alt={activeItem.alt}
						class={`h-full max-h-[calc(100dvh-10.5rem)] w-full object-contain sm:max-h-[calc(100dvh-12rem)] ${activeItem.contain ? 'p-4 sm:p-6' : ''}`}
						loading="eager"
						decoding="async"
					/>
					{#if activeItem.badge}
						<span class="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur">
							{activeItem.badge}
						</span>
					{/if}
				</div>

				<div class="border-t border-white/10 bg-slate-950/62 px-3 py-3 text-white backdrop-blur sm:px-4">
					<div class="flex items-center justify-between gap-4 text-sm">
						<p class="min-w-0 truncate font-semibold">
							{activeItem.title ?? activeItem.alt}
						</p>
						<p class="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
							{activeIndex + 1} / {items.length}
						</p>
					</div>

					{#if hasManyItems}
						<div class="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.35)_transparent]">
							{#each items as item, itemIndex}
								<button
									type="button"
									class={`relative h-14 w-24 shrink-0 overflow-hidden rounded-xl border transition sm:h-16 sm:w-28 ${itemIndex === activeIndex ? 'border-white ring-2 ring-white/45' : 'border-white/20 opacity-65 hover:border-white/70 hover:opacity-100'}`}
									onclick={() => setIndex(itemIndex)}
									aria-label={item.title ?? item.alt}
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
	</div>
{/if}
