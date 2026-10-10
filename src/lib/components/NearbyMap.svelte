<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { page } from '$app/state';
	import { lang } from '$lib/i18n';
	import { localizePath } from '$lib/routing';
	import { nearbyCopy } from '$lib/data/nearby-copy';
	import { experienceEvents } from '$lib/data/experience';
	import { filterPlaces, nearbyOrigin, nearbyPlaces, nearbyRoutes, routeDate, routeDistance, routeDuration, navigationUrl, type NearbyCategory, type NearbyScope, type TravelMode, type NearbyPlace } from '$lib/nearby';
	import { MapPinned, ArrowUpRight, ArrowRight, Footprints, Car, LocateFixed, House, X } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Map as LeafletMap, LayerGroup } from 'leaflet';

	let scope = $state<NearbyScope>('village');
	let category = $state<NearbyCategory>('all');
	let mode = $state<TravelMode>('foot');
	let selectedId = $state('loeffele');
	let enabled = $state(false);
	let loading = $state(false);
	let ready = $state(false);
	let loadError = $state(false);
	let tileError = $state(false);
	let mapElement = $state<HTMLDivElement>();
	let map: LeafletMap | undefined;
	let layers: LayerGroup | undefined;
	let leaflet: typeof import('leaflet');
	let resizeObserver: ResizeObserver | undefined;
	let generation = 0;
	let disposed = false;
	let hasRoute = false;
	let routeAnimation: Animation | undefined;
	const copy = $derived(nearbyCopy[$lang]);
	const visible = $derived(filterPlaces(scope, category));
	const selected = $derived(nearbyPlaces.find((place) => place.id === selectedId)!);
	const route = $derived(nearbyRoutes[selectedId][mode]);
	const selectedExperiences = $derived(experienceEvents.filter((experience) => selected.experienceIds.includes(experience.id)));
	const categories = $derived((['all', 'food', 'shopping', 'experiences'] as NearbyCategory[]).filter((item) => item === 'all' || nearbyPlaces.some((place) => place.scope === scope && place.category === item)));

	function changeScope(value: NearbyScope) {
		scope = value;
		category = 'all';
		mode = value === 'village' ? 'foot' : 'car';
		selectedId = filterPlaces(value, 'all')[0].id;
	}

	function changeCategory(value: NearbyCategory) {
		category = value;
		const places = filterPlaces(scope, value);
		if (!places.some((place) => place.id === selectedId)) selectedId = places[0].id;
	}

	const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function fitRoute(animate = true) {
		if (!map || !leaflet) return;
		const points = route.coordinates.map(([lon, lat]) => leaflet.latLng(lat, lon));
		const bounds = leaflet.latLngBounds([...points, leaflet.latLng(nearbyOrigin.lat, nearbyOrigin.lon), leaflet.latLng(selected.lat, selected.lon)]);
		map.stop();
		const options = { padding: leaflet.point(65, 65), maxZoom: 16 };
		if (animate && !reducedMotion()) map.flyToBounds(bounds, { ...options, duration: .85 });
		else map.fitBounds(bounds, { ...options, animate: false });
	}

	function updateLabels() {
		if (!mapElement) return;
		const area = mapElement.getBoundingClientRect();
		const markers = [...mapElement.querySelectorAll<HTMLElement>('.nearby-marker-host')];
		const occupied: DOMRect[] = [];
		// Keep the guesthouse and selected destination readable first, then fit other names.
		markers.sort((a, b) => Number(b.dataset.labelPriority) - Number(a.dataset.labelPriority));
		for (const marker of markers) {
			const label = marker.querySelector<HTMLElement>('.nearby-marker-name');
			if (!label) continue;
			marker.classList.remove('is-label-hidden', 'label-left');
			let box = label.getBoundingClientRect();
			if (box.right > area.right - 10) {
				marker.classList.add('label-left');
				box = label.getBoundingClientRect();
			}
			const overlaps = occupied.some((other) => box.left < other.right + 8 && box.right + 8 > other.left && box.top < other.bottom + 6 && box.bottom + 6 > other.top);
			const outside = box.left < area.left + 8 || box.right > area.right - 8 || box.top < area.top + 65 || box.bottom > area.bottom - 25;
			marker.classList.toggle('is-label-hidden', overlaps || outside);
			if (!overlaps && !outside) occupied.push(box);
		}
	}

	function drawMap(place: NearbyPlace, travelMode: TravelMode, places: NearbyPlace[], locale: 'de' | 'en') {
		if (!map || !layers) return;
		const focusedPlace = (document.activeElement as HTMLElement | null)?.dataset.nearbyPlace;
		routeAnimation?.cancel();
		layers.clearLayers();
		const coordinates = nearbyRoutes[place.id][travelMode].coordinates.map(([lon, lat]) => leaflet.latLng(lat, lon));
		leaflet.polyline(coordinates, { color: '#ffffff', weight: 8, opacity: 0.95, interactive: false }).addTo(layers);
		const routeLine = leaflet.polyline(coordinates, { color: '#a95400', weight: 4, opacity: 1, interactive: false }).addTo(layers);
		const path = routeLine.getElement();
		if (path && !reducedMotion()) routeAnimation = path.animate([{ opacity: 0, strokeWidth: 1 }, { opacity: 1, strokeWidth: 4 }], { duration: 650, easing: 'ease-out' });
		const icon = (label: string, name: string, active: boolean, home = false) => {
			const container = document.createElement('span');
			const element = document.createElement('span');
			element.className = `nearby-marker${active ? ' is-active' : ''}${home ? ' is-home' : ''}`;
			element.textContent = label;
			const caption = document.createElement('span');
			caption.className = 'nearby-marker-name';
			caption.textContent = name;
			caption.setAttribute('aria-hidden', 'true');
			container.append(element, caption);
			return leaflet.divIcon({ html: container, className: 'nearby-marker-host', iconSize: [44, 44], iconAnchor: [22, 22] });
		};
		const homeLabel = document.createElement('span');
		homeLabel.textContent = 'Gästehaus Rader';
		const homeMarker = leaflet.marker([nearbyOrigin.lat, nearbyOrigin.lon], { icon: icon('R', 'Gästehaus Rader', false, true), alt: 'Gästehaus Rader', keyboard: false }).addTo(layers).bindTooltip(homeLabel, { direction: 'top', offset: [0, -15] });
		const homeElement = homeMarker.getElement();
		if (homeElement) homeElement.dataset.labelPriority = '2';
		for (const destination of places) {
			const number = nearbyPlaces.indexOf(destination) + 1;
			const label = document.createElement('span');
			const name = document.createElement('strong');
			name.textContent = destination.name[locale];
			const travel = document.createElement('span');
			travel.className = 'nearby-tooltip-detail';
			const estimate = nearbyRoutes[destination.id][travelMode];
			travel.textContent = `${nearbyCopy[locale][travelMode]} · ${nearbyCopy[locale].approx} ${routeDuration(estimate.seconds, locale)} · ${routeDistance(estimate.meters, locale)}`;
			label.append(name, travel);
			const marker = leaflet.marker([destination.lat, destination.lon], { icon: icon(String(number), destination.name[locale], destination.id === place.id), alt: destination.name[locale], zIndexOffset: destination.id === place.id ? 500 : 0 }).addTo(layers);
			marker.bindTooltip(label, { direction: 'top', offset: [0, -15] });
			const element = marker.getElement();
			element?.setAttribute('aria-label', destination.name[locale]);
			element?.setAttribute('aria-pressed', String(destination.id === place.id));
			if (element) {
				element.dataset.nearbyPlace = destination.id;
				element.dataset.labelPriority = destination.id === place.id ? '3' : '0';
			}
			element?.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					selectedId = destination.id;
				}
			});
			if (focusedPlace === destination.id) element?.focus({ preventScroll: true });
			marker.on('click', () => { selectedId = destination.id; });
		}
		fitRoute(hasRoute);
		hasRoute = true;
		updateLabels();
	}

	async function loadMap() {
		if (loading || ready) return;
		const current = ++generation;
		enabled = true;
		loading = true;
		loadError = false;
		tileError = false;
		try {
			const [library] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]);
			await tick();
			if (disposed || current !== generation || !mapElement) return;
			leaflet = library;
			map = leaflet.map(mapElement, { scrollWheelZoom: true, wheelPxPerZoomLevel: 100, wheelDebounceTime: 60, zoomControl: false, attributionControl: true, fadeAnimation: !reducedMotion(), zoomAnimation: !reducedMotion(), markerZoomAnimation: !reducedMotion() });
			map.setView([nearbyOrigin.lat, nearbyOrigin.lon], 15);
			leaflet.control.zoom({ position: 'topright', zoomInTitle: copy.zoomIn, zoomOutTitle: copy.zoomOut }).addTo(map);
			map.on('zoomend moveend', updateLabels);
			leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).on('tileerror', () => { tileError = true; }).addTo(map);
			layers = leaflet.layerGroup().addTo(map);
			resizeObserver = new ResizeObserver(() => { map?.invalidateSize({ pan: false }); updateLabels(); });
			resizeObserver.observe(mapElement);
			ready = true;
		} catch {
			map?.remove();
			map = undefined;
			enabled = false;
			loadError = true;
		} finally {
			if (!disposed && current === generation) loading = false;
		}
	}

	function closeMap() {
		generation++;
		routeAnimation?.cancel();
		routeAnimation = undefined;
		hasRoute = false;
		resizeObserver?.disconnect();
		map?.remove();
		map = undefined;
		layers = undefined;
		ready = false;
		enabled = false;
		loading = false;
		tileError = false;
	}

	$effect(() => { if (ready) drawMap(selected, mode, visible, $lang); });
	onDestroy(() => { disposed = true; closeMap(); });
</script>

<section id="umgebung" class="nearby-section mx-auto w-full max-w-[76rem] px-4 sm:px-6 lg:px-8" aria-labelledby="nearby-title">
	<div class="nearby-heading">
		<div>
			<p class="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{copy.kicker}</p>
			<h2 id="nearby-title" class="mt-3 font-serif text-3xl leading-tight text-slate-900 sm:text-4xl">{copy.title}</h2>
			<div class="mt-4 h-0.5 w-12 bg-brand"></div>
			<p class="mt-5 max-w-xl text-base leading-relaxed text-slate-600">{copy.intro}</p>
		</div>
		<div class="scope-switch" role="group" aria-label={copy.scope}>
			{#each ['village', 'region'] as area}
				<button type="button" class:chosen={scope === area} aria-pressed={scope === area} onclick={() => changeScope(area as NearbyScope)}>{copy[area as NearbyScope]}</button>
			{/each}
		</div>
	</div>
	<div class="nearby-layout">
		<div class="nearby-sidebar">
			<label class="category-label" for="nearby-category">{copy.selected}</label>
			<select id="nearby-category" class="category-select" value={category} aria-label={copy.categories} onchange={(event) => changeCategory(event.currentTarget.value as NearbyCategory)}>
				{#each categories as item}
					<option value={item}>{copy[item]}</option>
				{/each}
			</select>
			<div class="travel-modes" role="group" aria-label={copy.mode}>
				<button type="button" class:chosen={mode === 'foot'} aria-pressed={mode === 'foot'} onclick={() => mode = 'foot'}><Footprints size={16} aria-hidden="true" />{copy.foot}</button>
				<button type="button" class:chosen={mode === 'car'} aria-pressed={mode === 'car'} onclick={() => mode = 'car'}><Car size={16} aria-hidden="true" />{copy.car}</button>
			</div>
			<ul class="place-list" class:many-places={visible.length > 6} aria-label={copy.categories} data-lenis-prevent>
				{#each visible as place}
					<li><button type="button" class:chosen={place.id === selectedId} aria-pressed={place.id === selectedId} onclick={() => selectedId = place.id}>
						<span class="place-number">{String(nearbyPlaces.indexOf(place) + 1).padStart(2, '0')}</span>
						<span class="min-w-0 flex-1"><span class="block font-semibold">{place.name[$lang]}</span><span class="mt-1 block text-xs text-slate-500">{copy.approx} {routeDuration(nearbyRoutes[place.id][mode].seconds, $lang)} · {routeDistance(nearbyRoutes[place.id][mode].meters, $lang)}</span></span>
						<ArrowRight size={16} class="shrink-0" aria-hidden="true" />
					</button></li>
				{/each}
			</ul>
		</div>
		<div class="map-column">
			<div class="map-surface" data-lenis-prevent>
				{#if enabled}<div bind:this={mapElement} class="map-canvas" role="region" aria-label={copy.map}></div>{/if}
				{#if !ready}
					<div class="map-intro">
						<MapPinned size={28} strokeWidth={1.3} class="text-brand" aria-hidden="true" />
						<p class="mt-4 font-serif text-3xl text-slate-900">{copy.preview}</p>
						<p class="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">{loadError ? copy.loadError : copy.privacy}</p>
						<Button class="mt-6" onclick={loadMap} disabled={loading}>{loading ? copy.loading : loadError ? copy.retry : copy.load}<ArrowRight size={16} aria-hidden="true" /></Button>
						<a class="mt-4 text-xs text-slate-600 underline underline-offset-4" href={localizePath('/datenschutz', page.url.pathname)}>{copy.privacyLink}</a>
					</div>
				{:else}
					<div class="map-tools"><Button variant="secondary" size="icon" onclick={() => fitRoute()} aria-label={copy.reset} title={copy.reset}><LocateFixed size={18} aria-hidden="true" /></Button><Button variant="secondary" size="icon" onclick={closeMap} aria-label={copy.withdraw} title={copy.withdraw}><X size={18} aria-hidden="true" /></Button></div>
				{/if}
				{#if tileError}<p class="map-error" role="status">{copy.tileError}</p>{/if}
			</div>
			<div class="route-summary" aria-live="polite" aria-atomic="true">
				<div class="route-start"><House size={15} aria-hidden="true" />{copy.start}<span>→</span><span>{copy[mode]}</span></div>
				<div class="route-heading"><h3>{selected.name[$lang]}</h3><span class="route-time">{copy.approx} {routeDuration(route.seconds, $lang)}<small>{routeDistance(route.meters, $lang)}</small></span></div>
				<p class="mt-2 text-sm leading-relaxed text-slate-600">{selected.description[$lang]}</p>
				{#if selectedExperiences.length}
					<div class="related-experiences">
						<p>{copy.experiencesAtDestination}</p>
						<ul>
							{#each selectedExperiences as experience}
								<li><a href={`${localizePath(`/erlebnisse/${experience.season === 'summer' ? 'sommer' : 'winter'}`, page.url.pathname)}#${experience.id}`}>
									<span>{experience.title[$lang]}<small>{copy[experience.season]}</small></span><ArrowRight size={14} aria-hidden="true" />
								</a></li>
							{/each}
						</ul>
					</div>
				{/if}
				<a class="route-link" href={navigationUrl(selected, mode)} target="_blank" rel="noopener noreferrer">{copy.route}<ArrowUpRight size={16} aria-hidden="true" /></a>
			</div>
		</div>
	</div>
	<details class="map-sources mt-6 text-xs leading-relaxed text-slate-500"><summary>{copy.sources}</summary><p class="mt-3">{copy.note} {copy.access}</p><p class="mt-2">{copy.sourceText} {routeDate}. <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noopener noreferrer">FOSSGIS</a> · {copy.attribution}: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors (ODbL)</a> · <a href={selected.source} target="_blank" rel="noopener noreferrer">{copy.sourceLink}</a> · <a href={`https://www.openstreetmap.org/note/new#map=17/${selected.lat}/${selected.lon}`} target="_blank" rel="noopener noreferrer">{copy.mapError}</a></p></details>
</section>

<style>
	.nearby-section { scroll-margin-top: 130px; }
	.nearby-heading { display: flex; justify-content: space-between; align-items: end; gap: 2rem; margin-bottom: 2.5rem; }
	.scope-switch { display: flex; flex-shrink: 0; gap: 1.5rem; border-bottom: 1px solid #e2e8f0; }
	.scope-switch button { min-height: 48px; padding: .75rem 0; border-bottom: 2px solid transparent; color: #64748b; font-size: .875rem; font-weight: 500; }
	.scope-switch button.chosen { border-color: #f29200; color: #0f172a; }
	.nearby-layout { display: grid; grid-template-columns: 290px minmax(0, 1fr); gap: 3rem; }
	.nearby-sidebar { min-width: 0; }
	.category-label { display: block; margin-bottom: .65rem; color: #0f172a; font-size: .875rem; font-weight: 600; }
	.category-select { width: 100%; min-height: 46px; padding: .65rem .8rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; color: #334155; font: inherit; font-size: .875rem; }
	.category-select:focus-visible { outline: 2px solid #a95400; outline-offset: 3px; }
	.travel-modes { display: flex; gap: 1.5rem; margin: 1rem 0 .75rem; border-bottom: 1px solid #e2e8f0; }
	.travel-modes button { display: flex; align-items: center; gap: .4rem; min-height: 44px; padding: .6rem 0; border-bottom: 2px solid transparent; font-size: .75rem; color: #64748b; }
	.travel-modes button.chosen { border-color: #f29200; color: #0f172a; font-weight: 600; }
	.place-list { list-style: none; padding: 0; margin: 0; }
	.place-list.many-places { max-height: 370px; overflow-y: auto; overscroll-behavior-y: contain; scrollbar-width: thin; }
	.place-list li + li { border-top: 1px solid #e9e9e5; }
	.place-list button { width: 100%; display: flex; align-items: center; gap: .75rem; padding: 1rem .7rem; text-align: left; border-left: 2px solid transparent; font-size: .875rem; color: #334155; transition: background .2s, border-color .2s; }
	.place-list button :global(svg) { transition: transform .2s; }
	.place-list button:hover :global(svg) { transform: translateX(3px); }
	.place-list button:hover { background: #f4f2ed; }
	.place-list button.chosen { background: #f5f0e7; border-left-color: #f29200; color: #0f172a; }
	.place-number { flex-shrink: 0; align-self: start; padding-top: .15rem; font-size: .7rem; color: #94a3b8; font-variant-numeric: tabular-nums; }
	.chosen .place-number { color: #965000; }
	.map-column { min-width: 0; }
	.map-surface { height: 490px; position: relative; isolation: isolate; overflow: hidden; border-radius: 16px; background: #f0eee7; }
	.map-canvas { height: 100%; width: 100%; z-index: 0; }
	:global(.nearby-section .leaflet-tile-pane) { filter: saturate(.4); }
	.map-intro { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; background: #f0eee7; z-index: 1; }
	.map-tools { position: absolute; top: 12px; left: 12px; display: flex; gap: .5rem; z-index: 2; }
	.map-error { position: absolute; bottom: 30px; left: 12px; right: 12px; padding: .6rem; background: #fff; color: #7c4200; font-size: .75rem; z-index: 2; }
	.route-summary { padding: 1.5rem 0 0; }
	.route-start { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; color: #64748b; font-size: .7rem; }
	.route-heading { display: flex; justify-content: space-between; gap: 1rem; margin-top: .8rem; }
	.route-heading h3 { font-size: 1.25rem; font-weight: 600; color: #0f172a; }
	.route-time { flex-shrink: 0; text-align: right; font-size: .9rem; font-weight: 600; color: #172331; }
	.route-time small { display: block; margin-top: .2rem; color: #64748b; font-size: .7rem; font-weight: 400; }
	.route-link { display: inline-flex; align-items: center; gap: .5rem; margin-top: 1rem; font-size: .75rem; font-weight: 600; color: #172331; }
	.route-link:hover { text-decoration: underline; text-underline-offset: 4px; }
	.related-experiences { margin-top: 1rem; }
	.related-experiences > p { font-size: .7rem; color: #64748b; }
	.related-experiences ul { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; margin-top: .25rem; }
	.related-experiences a { display: inline-flex; align-items: center; gap: .6rem; min-height: 44px; color: #172331; font-size: .75rem; font-weight: 600; }
	.related-experiences a:hover { text-decoration: underline; text-underline-offset: 4px; }
	.related-experiences small { display: block; margin-top: .15rem; font-size: .65rem; font-weight: 400; color: #64748b; }
	.map-sources summary { cursor: pointer; width: fit-content; }
	.map-sources a { text-decoration: underline; text-underline-offset: 3px; }
	button:focus-visible, a:focus-visible, summary:focus-visible { outline: 2px solid #a95400; outline-offset: 3px; }
	:global(.nearby-marker-host) { display: grid; place-items: center; background: none; border: none; }
	:global(.nearby-marker-name) { position: absolute; top: 50%; left: 42px; transform: translateY(-50%); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 5px 8px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fffffff2; color: #172331; font: 500 11px/1.4 Montserrat, sans-serif; pointer-events: none; box-shadow: 0 1px 4px #17233112; transition: opacity .18s; }
	:global(.nearby-marker-host.label-left .nearby-marker-name) { left: auto; right: 42px; }
	:global(.nearby-marker-host.is-label-hidden .nearby-marker-name), :global(.nearby-marker-host:hover .nearby-marker-name), :global(.nearby-marker-host:focus .nearby-marker-name) { opacity: 0; }
	:global(.nearby-marker-host:hover .nearby-marker), :global(.nearby-marker-host:focus-visible .nearby-marker) { transform: scale(1.12); }
	:global(.nearby-marker-host:focus-visible) { outline: 2px solid #a95400; outline-offset: 2px; border-radius: 50%; }
	:global(.nearby-marker) { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #fff; color: #172331; border: 2px solid #172331; font: 600 12px Montserrat, sans-serif; box-shadow: 0 2px 8px #17233130; transition: transform .2s, background .2s; }
	:global(.nearby-marker.is-active) { background: #f29200; border-color: #fff; color: #172331; outline: 2px solid #a95400; }
	:global(.nearby-marker.is-active) { animation: marker-select .5s ease-out; }
	@keyframes marker-select { from { box-shadow: 0 0 0 12px #f2920030; } to { box-shadow: 0 0 0 0 #f2920000; } }
	:global(.nearby-marker.is-home) { background: #172331; border-color: #fff; color: #fff; border-radius: 8px; }
	:global(.nearby-section .leaflet-tooltip) { min-width: 180px; max-width: 240px; white-space: normal; font-family: Montserrat, sans-serif; color: #172331; border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 12px; box-shadow: 0 3px 12px #17233118; }
	:global(.nearby-tooltip-detail) { display: block; margin-top: 3px; color: #64748b; font-size: 11px; }
	@media (prefers-reduced-motion: reduce) {
		.place-list button, .place-list button :global(svg), :global(.nearby-marker), :global(.nearby-marker-name) { transition: none; }
		:global(.nearby-marker.is-active) { animation: none; }
	}
	@media (max-width: 1023px) { .nearby-heading { align-items: start; flex-direction: column; } .nearby-layout { grid-template-columns: 260px minmax(0, 1fr); gap: 2rem; } }
	@media (max-width: 699px) { .nearby-layout { grid-template-columns: minmax(0, 1fr); gap: 1.5rem; } .place-list, .place-list.many-places { max-height: 235px; overflow-y: auto; } .map-surface { height: 350px; } .route-heading h3 { font-size: 1rem; } .scope-switch { max-width: 100%; } }
</style>
