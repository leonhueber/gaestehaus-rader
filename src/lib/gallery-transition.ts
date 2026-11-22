import { tick } from 'svelte';

export function openGalleryFrom(trigger: EventTarget | null, open: () => void) {
	const photo = trigger instanceof HTMLElement
		? trigger.querySelector('img') ?? trigger.closest('section')?.querySelector('img')
		: null;
	if (!photo || !document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		open();
		return;
	}

	const name = 'gallery-opening-photo';
	photo.style.viewTransitionName = name;
	let target: HTMLImageElement | null = null;
	const transition = document.startViewTransition(async () => {
		photo.style.removeProperty('view-transition-name');
		open();
		await tick();
		target = document.querySelector('[role="dialog"] [data-gallery-photo]');
		if (target) {
			target.style.viewTransitionName = name;
			if (!target.complete) {
				await Promise.race([target.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 150))]);
			}
		}
	});
	const clear = () => {
		photo.style.removeProperty('view-transition-name');
		target?.style.removeProperty('view-transition-name');
	};
	void transition.ready.then(clear, clear);
}
