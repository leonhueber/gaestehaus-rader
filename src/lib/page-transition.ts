import type { OnNavigate } from '@sveltejs/kit';
import { toGermanPath } from '$lib/routing';

function isRoomList(path: string) {
	return path === '/' || path === '/unterkuenfte-preise';
}

function visiblePhoto(selector: string) {
	return Array.from(document.querySelectorAll<HTMLElement>(selector)).find((node) => {
		const rect = node.getBoundingClientRect();
		return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
	});
}

// A snapshot belongs to one navigation, including when another link is followed mid-transition.
let activeSnapshot = 0;

export function transitionPage(navigation: OnNavigate) {
	const { from, to } = navigation;
	if (!from || !to || from.url.pathname === to.url.pathname || navigation.willUnload ||
		!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const origin = toGermanPath(from.url.pathname);
	const destination = toGermanPath(to.url.pathname);
	// The embedded booking widget manages its own loading and document lifecycle.
	if ([origin, destination].some(path => path === '/buchen' || path.startsWith('/buchen/'))) return;

	const detail = isRoomList(origin) ? destination : isRoomList(destination) ? origin : '';
	const slug = detail.match(/^\/unterkuenfte-preise\/([^/]+)$/)?.[1];
	const selector = slug ? `[data-room-photo="${CSS.escape(slug)}"]` : '';
	const source = selector ? visiblePhoto(selector) : undefined;
	const snapshot = String(++activeSnapshot);
	const mark = (node: HTMLElement) => { node.dataset.sharedRoomPhoto = snapshot; };
	const clear = (node?: HTMLElement) => {
		if (node?.dataset.sharedRoomPhoto === snapshot) delete node.dataset.sharedRoomPhoto;
	};
	let target: HTMLElement | undefined;

	return new Promise<void>((resume) => {
		if (source) mark(source);
		const transition: ViewTransition = document.startViewTransition(async () => {
			clear(source);
			resume();
			await navigation.complete;
			if (!source || snapshot !== String(activeSnapshot)) return;

			// SvelteKit restores page scroll, but the mobile apartment rail scrolls independently.
			const rail = document.querySelector<HTMLElement>('[data-room-rail]');
			const cardPhoto = rail?.querySelector<HTMLElement>(selector);
			if (rail && cardPhoto && navigation.type === 'popstate') {
				const bounds = rail.getBoundingClientRect();
				const photo = cardPhoto.getBoundingClientRect();
				if (photo.left < bounds.left || photo.right > bounds.right) {
					rail.scrollBy({ left: photo.left - bounds.left - rail.clientLeft - parseFloat(getComputedStyle(rail).paddingLeft), behavior: 'instant' });
				}
			}
			target = visiblePhoto(selector);
			if (target) {
				target.closest('[data-room-section]')?.setAttribute('data-room-restored', '');
				const image = target instanceof HTMLImageElement ? target : target.querySelector('img');
				if (image && (!image.complete || !image.naturalWidth)) {
					// The detail page may request a larger source than the one cached for the card.
					await Promise.race([
						image.decode().catch(() => {}),
						new Promise<void>(resolve => window.setTimeout(resolve, 150)),
					]);
					if (!image.naturalWidth || !image.complete) {
						transition.skipTransition();
						return;
					}
				}
				if (snapshot !== String(activeSnapshot)) return;
				mark(target);
			}
		});
		// A skipped transition still completes navigation and releases its temporary names.
		const cleanup = () => { clear(source); clear(target); };
		void transition.ready.then(cleanup, cleanup);
	});
}
