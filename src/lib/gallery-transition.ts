import { tick } from 'svelte';

type GalleryOrigin = { trigger: HTMLElement; photo: HTMLImageElement | null; openedSrc?: string };

const photoTransitionName = 'gallery-opening-photo';
let galleryOrigin: GalleryOrigin | undefined;

function canAnimateGallery() {
	return Boolean(document.startViewTransition) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function openGalleryFrom(trigger: EventTarget | null, open: () => void) {
	const photo = trigger instanceof HTMLElement
		? trigger.querySelector('img') ?? trigger.closest('section')?.querySelector('img') ?? null
		: null;
	const origin: GalleryOrigin | undefined = trigger instanceof HTMLElement ? { trigger, photo } : undefined;
	galleryOrigin = origin;
	if (!photo || !origin || !canAnimateGallery()) {
		open();
		return;
	}

	photo.style.viewTransitionName = photoTransitionName;
	let target: HTMLImageElement | null = null;
	const transition = document.startViewTransition(async () => {
		photo.style.removeProperty('view-transition-name');
		open();
		await tick();
		target = document.querySelector('[role="dialog"] [data-gallery-photo]');
		if (target) {
			origin.openedSrc = target.getAttribute('src') ?? undefined;
			target.style.viewTransitionName = photoTransitionName;
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

export function closeGalleryToOrigin(photo: HTMLImageElement | undefined, close: () => void) {
	const origin = galleryOrigin;
	galleryOrigin = undefined;
	const returnPhoto = origin?.photo;
	const bounds = returnPhoto?.getBoundingClientRect();
	const matchesPreview = photo && returnPhoto?.isConnected && bounds &&
		bounds.bottom > 0 && bounds.top < window.innerHeight &&
		origin?.openedSrc === photo.getAttribute('src');

	const closeAndRestoreFocus = async () => {
		close();
		await tick();
		origin?.trigger.focus({ preventScroll: true });
	};

	if (!canAnimateGallery()) {
		void closeAndRestoreFocus();
		return;
	}

	if (matchesPreview) photo.style.viewTransitionName = photoTransitionName;
	const transition = document.startViewTransition(async () => {
		await closeAndRestoreFocus();
		if (matchesPreview) returnPhoto.style.viewTransitionName = photoTransitionName;
	});
	const clear = () => {
		if (!matchesPreview) return;
		photo.style.removeProperty('view-transition-name');
		returnPhoto.style.removeProperty('view-transition-name');
	};
	void transition.ready.then(clear, clear);
}
