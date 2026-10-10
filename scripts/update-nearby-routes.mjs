// Explicit maintenance command; never runs in the browser or during a build.
import { readFile, writeFile } from 'node:fs/promises';
const data = JSON.parse(await readFile(new URL('../src/lib/data/nearby-places.json', import.meta.url), 'utf8'));
const routes = {};
for (const place of data.places) {
	routes[place.id] = {};
	for (const mode of ['foot', 'car']) {
		// FOSSGIS public routing service: at most one request per second.
		await new Promise((resolve) => setTimeout(resolve, 1200));
		const coordinates = `${data.origin.lon},${data.origin.lat};${place.lon},${place.lat}`;
		const response = await fetch(`https://routing.openstreetmap.de/routed-${mode}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`, {
			headers: { 'User-Agent': 'GaestehausRaderMapSetup/1.0 (https://rader-gitschtal.at)' },
			signal: AbortSignal.timeout(30000)
		});
		if (!response.ok) throw new Error(`${place.id}/${mode}: HTTP ${response.status}`);
		const result = await response.json();
		if (result.code !== 'Ok' || !result.routes?.[0]) throw new Error(`${place.id}/${mode}: no route`);
		const route = result.routes[0];
		routes[place.id][mode] = {
			meters: route.distance,
			seconds: route.duration,
			// GeoJSON longitude/latitude order; rounded to ~1m precision.
			coordinates: route.geometry.coordinates.map((point) => point.map((n) => +n.toFixed(5))),
			accessMeters: Math.ceil(result.waypoints.at(-1).distance)
		};
		console.log(`${place.id}/${mode}: ${route.distance} m, ${Math.ceil(route.duration / 60)} min, access ${routes[place.id][mode].accessMeters} m`);
	}
}
// Atomic at the dataset level: a failed request leaves the existing data intact.
await writeFile(new URL('../src/lib/data/nearby-routes.json', import.meta.url), JSON.stringify({
	generatedAt: new Date().toISOString().slice(0, 10),
	provider: 'https://routing.openstreetmap.de',
	origin: data.origin,
	routes
}) + '\n');
