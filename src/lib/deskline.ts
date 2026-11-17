import type { BookingStay } from '$lib/booking-search';
import { browser } from '$app/environment';

const ACCOUNT_ID = 'fa73de04-c8e1-4b05-b4a8-5697e2d52a1c';
const SCRIPT_ID = 'deskline-script';
const APP_ELEMENT = 'dw-app-container';
const SCRIPT_SRC =
	'https://web5.deskline.net/start/ACCOKTN/fa73de04-c8e1-4b05-b4a8-5697e2d52a1c/index.js';
const PROVIDER_URL_PATTERN = /(deskline\.net|feratel|tosc)/i;

let activeMountId = 0;
let providerLoadedInDocument = false;

type DwFn = ((...args: unknown[]) => void) & {
	q?: unknown[][];
	accommodationDetailQuickFind?: (storageId: string, search: {
		dateFrom: string; dateTo: string; id: string; dbCode: string;
		occupancy1: { units: number; adults: number; children: number[] };
	}, ready: () => void) => void;
};

type DesklineWindow = Window & {
	dw?: DwFn;
};

export type DesklineStatus = 'loading' | 'ready' | 'error';

const createQueue = () => {
	const dwFn: DwFn = function (...args: unknown[]) {
		dwFn.q = dwFn.q || [];
		dwFn.q.push(args);
	};
	return dwFn;
};

const removeProviderArtifacts = (container?: HTMLElement | null) => {
	document.querySelectorAll<HTMLElement>(`#${SCRIPT_ID}`).forEach((element) => element.remove());
	document.querySelectorAll<HTMLElement>(APP_ELEMENT).forEach((element) => element.remove());

	document.querySelectorAll<HTMLScriptElement>('script[src]').forEach((script) => {
		if (PROVIDER_URL_PATTERN.test(script.src)) script.remove();
	});

	document.querySelectorAll<HTMLIFrameElement>('iframe[src]').forEach((iframe) => {
		if (PROVIDER_URL_PATTERN.test(iframe.src)) iframe.remove();
	});

	container?.replaceChildren();
	delete (window as DesklineWindow).dw;
};

export function cleanupDeskline(container?: HTMLElement | null) {
	if (!browser) return;
	activeMountId += 1;
	removeProviderArtifacts(container);
}

export function mountDeskline(
	container: HTMLElement,
	lang: string,
	options?: {
		serviceIds?: string[];
		productIds?: string[];
		stay?: BookingStay;
		onStatusChange?: (status: DesklineStatus) => void;
	}
) {
	if (!browser) return () => {};

	// Deskline keeps internal state that cannot be reset through its public API. Once its loader
	// ran in this document, a full reload is the only reliable way to initialize it a second time.
	if (providerLoadedInDocument) {
		window.location.reload();
		return () => {};
	}

	cleanupDeskline(container);
	const mountId = ++activeMountId;
	options?.onStatusChange?.('loading');
	let readinessTimer: ReturnType<typeof setInterval> | undefined;
	let utilityTimer: ReturnType<typeof setInterval> | undefined;
	let finished = false;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	const stopWaiting = () => {
		clearInterval(readinessTimer);
		clearInterval(utilityTimer);
		clearTimeout(timeout);
	};
	const setStatus = (status: DesklineStatus) => {
		finished = true;
		stopWaiting();
		if (mountId === activeMountId && container.isConnected) options?.onStatusChange?.(status);
	};

	// Give scripts from the previous route one frame to finish before starting a fresh widget.
	const frameId = window.requestAnimationFrame(() => {
		if (mountId !== activeMountId || !container.isConnected) return;

		removeProviderArtifacts(container);
		const win = window as DesklineWindow;
		win.dw = createQueue();
		win.dw('settings', ACCOUNT_ID, {
			localStorageId: ACCOUNT_ID,
			keepGetParamsOnAppStart: true,
			profileOverrides: options?.productIds?.length ? ['accommodation.showPriceMatrix=false'] : [],
			context: {
				serviceIds: options?.serviceIds ?? [],
				productIds: options?.productIds ?? [],
			},
			lang,
			// The site's language must take precedence over Deskline's saved selection.
			doNotUseSelectedLang: true,
		});

		const startWidget = () => {
			if (finished || mountId !== activeMountId || !container.isConnected) return;
			const script = document.createElement('script');
			script.id = SCRIPT_ID;
			script.async = true;
			script.src = SCRIPT_SRC;
			script.onerror = () => setStatus('error');
			providerLoadedInDocument = true;
			container.appendChild(script);
		};
		const stay = options?.stay;
		if (stay) {
			const utility = document.createElement('script');
			utility.src = 'https://web5.deskline.net/dwutility.js';
			utility.onerror = () => setStatus('error');
			// The utility loader loads its implementation in a second script.
			utilityTimer = setInterval(() => {
				if (finished || mountId !== activeMountId || !container.isConnected) return;
				if (!win.dw?.accommodationDetailQuickFind) return;
				clearInterval(utilityTimer);
				try {
					win.dw.accommodationDetailQuickFind(ACCOUNT_ID, {
						id: 'ee29ea3d-3203-4fc3-8e2a-2b996f9f66a1', dbCode: 'KTN',
						dateFrom: stay.checkIn, dateTo: stay.checkOut,
						occupancy1: { units: 1, adults: stay.adults, children: stay.childAges }
					}, startWidget);
				} catch {
					setStatus('error');
				}
			}, 100);
			container.appendChild(utility);
		} else {
			startWidget();
		}

		// The loader's load event only confirms its script, not a usable booking form.
		readinessTimer = setInterval(() => {
			const app = container.querySelector(APP_ELEMENT);
			const root = app?.shadowRoot ?? app;
			if (root?.querySelector('input, button')) setStatus('ready');
		}, 250);
		timeout = setTimeout(() => setStatus('error'), 30000);
	});

	return () => {
		window.cancelAnimationFrame(frameId);
		stopWaiting();
		if (mountId === activeMountId) cleanupDeskline(container);
	};
}
