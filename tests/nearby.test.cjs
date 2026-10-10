const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const places = require('../src/lib/data/nearby-places.json');
const routes = require('../src/lib/data/nearby-routes.json');
const exportsMap = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/nearby.ts'), 'utf8'), {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText, { exports: exportsMap, URLSearchParams, require(id) {
	if (id === '$lib/data/nearby-places.json') return { default: places };
	if (id === '$lib/data/nearby-routes.json') return { default: routes };
	throw new Error(id);
} });

function distance(a, b) {
	const radians = Math.PI / 180;
	return 6371000 * 2 * Math.asin(Math.sqrt(Math.sin((a[1] - b[1]) * radians / 2) ** 2 + Math.cos(a[1] * radians) * Math.cos(b[1] * radians) * Math.sin((a[0] - b[0]) * radians / 2) ** 2));
}

test('all destinations have both valid road routes ending near the actual destination', () => {
	const factsExports = {};
	vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/data/facts.ts'), 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS }
	}).outputText, { exports: factsExports });
	assert.equal(places.origin.lat, factsExports.guesthouseFacts.geo.latitude);
	assert.equal(places.origin.lon, factsExports.guesthouseFacts.geo.longitude);
	assert.equal(new Set(places.places.map((p) => p.id)).size, places.places.length);
	assert.deepEqual(routes.origin, places.origin);
	assert.equal(Object.keys(routes.routes).length, places.places.length);
	for (const place of places.places) {
		assert.ok(place.name.de && place.name.en && place.description.de && place.description.en);
		assert.ok(place.source.startsWith('https://'));
		for (const mode of ['foot', 'car']) {
			const route = routes.routes[place.id][mode];
			assert.ok(route.meters > 0 && route.seconds > 0);
			assert.ok(route.coordinates.length > 2);
			assert.ok(distance(route.coordinates[0], [places.origin.lon, places.origin.lat]) < 100, `${place.id}: origin`);
			assert.ok(distance(route.coordinates.at(-1), [place.lon, place.lat]) < 100, `${place.id}: destination`);
			assert.ok(route.meters >= distance(route.coordinates[0], route.coordinates.at(-1)) * .95);
			for (const [lon, lat] of route.coordinates) assert.ok(lon > 13 && lon < 14 && lat > 46 && lat < 47);
		}
	}
});

test('category and scope filters cannot mix local and regional results', () => {
	assert.equal(exportsMap.filterPlaces('village', 'shopping').length, 1);
	assert.equal(exportsMap.filterPlaces('village', 'food').length, 3);
	assert.equal(exportsMap.filterPlaces('village', 'experiences').length, 2);
	assert.equal(exportsMap.filterPlaces('region', 'all').length, 8);
	assert.equal(exportsMap.filterPlaces('region', 'shopping').length, 0);
});

test('every seasonal experience has one real map destination and no stale experience links', () => {
	const experienceExports = {};
	vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/data/experience.ts'), 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS }
	}).outputText, { exports: experienceExports, require(id) {
		if (id === 'lucide-svelte') return new Proxy({}, { get: () => () => {} });
		throw new Error(id);
	} });
	const experienceIds = experienceExports.experienceEvents.map((event) => event.id);
	const mappedIds = places.places.flatMap((place) => place.experienceIds);
	assert.equal(new Set(mappedIds).size, mappedIds.length, 'Duplicate experience mappings');
	assert.deepEqual([...mappedIds].sort(), [...experienceIds].sort(), 'Every experience must resolve to a map destination');
	for (const place of places.places) {
		if (place.experienceIds.length) assert.equal(place.category, 'experiences');
	}
});

test('duration and distance labels handle sub-minute, hour and locale boundaries', () => {
	assert.equal(exportsMap.routeDuration(30, 'de'), '1 min');
	assert.equal(exportsMap.routeDuration(3600, 'de'), '1 Std.');
	assert.equal(exportsMap.routeDuration(3660, 'en'), '1 hr 1 min');
	assert.equal(exportsMap.routeDistance(1536, 'de'), '1,5 km');
	assert.equal(exportsMap.routeDistance(1536, 'en'), '1.5 km');
});

test('external navigation always uses the guesthouse and the selected destination and mode', () => {
	for (const place of places.places) for (const mode of ['foot', 'car']) {
		const url = new URL(exportsMap.navigationUrl(place, mode));
		assert.equal(url.origin, 'https://www.google.com');
		assert.equal(url.searchParams.get('origin'), `${places.origin.lat},${places.origin.lon}`);
		assert.equal(url.searchParams.get('destination'), `${place.lat},${place.lon}`);
		assert.equal(url.searchParams.get('travelmode'), mode === 'foot' ? 'walking' : 'driving');
	}
});
