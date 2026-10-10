const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

// Exercise the actual TypeScript and content without a browser or new dependencies.
// Only browser routing and visual icon components are replaced in this harness.
function harness({ failOn, now = '2026-10-10T22:30:00Z' } = {}) {
	const registered = new Map();
	const warnings = [];
	const cache = new Map();
	let attempts = 0;
	let failureEnabled = true;
	class FixedDate extends Date {
		constructor(...args) { super(...(args.length ? args : [now])); }
	}
	const document = { modelContext: {
		async registerTool(tool) {
			attempts++;
			if (failureEnabled && tool.name === failOn) throw new Error('Simulated transient failure');
			assert.equal(registered.has(tool.name), false, `Duplicate registration: ${tool.name}`);
			registered.set(tool.name, tool);
		},
	} };
	function load(file) {
		if (cache.has(file)) return cache.get(file);
		const exports = {};
		cache.set(file, exports);
		const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
		const code = ts.transpileModule(source, {
			compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
		}).outputText;
		vm.runInNewContext(code, {
			exports, document, URL, Date: FixedDate,
			window: { location: { pathname: '/', origin: 'http://localhost:5173' } },
			console: { warn: (...args) => warnings.push(args) },
			require(id) {
				if (id === 'lucide-svelte') return new Proxy({}, { get: () => () => null });
				if (id === '$lib/routing') return { getLocaleFromPathname: () => 'de', localizePath: p => p };
				if (id.startsWith('$lib/')) return load(`src/lib/${id.slice(5)}.ts`);
				throw new Error(`Unexpected dependency: ${id}`);
			},
		}, { filename: file });
		return exports;
	}
	const api = load('src/lib/webmcp.ts');
	return {
		api, registered, warnings, document,
		get attempts() { return attempts; },
		recover() { failureEnabled = false; },
		call(name, input) { return registered.get(name).execute(input); },
	};
}

test('festival results never bypass filters with missing metadata', async () => {
	const h = harness();
	await h.api.registerSiteTools();
	assert.ok(h.call('find_experiences', { season: 'summer', activity: 'culture' }).festivals.length > 0);
	for (const filter of [{ indoor: true }, { indoor: false }, { maxDriveMinutes: 0 }, { difficulty: 'easy' }]) {
		const result = h.call('find_experiences', filter);
		assert.equal(result.festivals.length, 0);
		assert.equal(result.festivalsOmittedReason, 'missing_filter_metadata');
	}
	assert.equal(h.call('find_experiences', { indoor: true, maxDriveMinutes: 0 }).matches.length, 0);
	assert.equal(h.call('find_experiences', { includeFestivals: false }).festivalsOmittedReason, null);
	assert.equal(h.call('find_experiences', { season: 'winter' }).festivals.length, 0);
});

test('arrival uses the Austrian day, including the UTC midnight boundary', async () => {
	const h = harness();
	await h.api.registerSiteTools();
	const input = { checkIn: '2026-10-10', checkOut: '2026-10-12', adults: 2 };
	assert.equal(h.call('prepare_booking_inquiry', input).ok, false);
	assert.match(h.call('prepare_booking_inquiry', input).message, /2026-10-11/);
	assert.equal(h.call('prepare_booking_inquiry', { ...input, checkIn: '2026-10-11' }).ok, true);
	assert.equal(h.call('prepare_booking_inquiry', { ...input, checkIn: '2027-02-30' }).ok, false);
	assert.equal(h.call('prepare_booking_inquiry', { ...input, checkIn: '2026-10-12' }).ok, false);
});

test('apartment capacity includes children and allows general group inquiries', async () => {
	const h = harness();
	await h.api.registerSiteTools();
	const input = { checkIn: '2027-01-01', checkOut: '2027-01-02', adults: 2, apartmentSlug: 'nr-3' };
	assert.equal(h.call('prepare_booking_inquiry', input).ok, true);
	assert.equal(h.call('prepare_booking_inquiry', { ...input, children: 1 }).ok, false);
	assert.equal(h.call('prepare_booking_inquiry', { ...input, adults: 10, children: 10 }).ok, false);
	assert.equal(h.call('prepare_booking_inquiry', { ...input, children: 1, apartmentSlug: 'nr-1' }).ok, true);
	assert.equal(h.call('prepare_booking_inquiry', { ...input, adults: 4, apartmentSlug: undefined }).ok, true);
});

test('partial registration recovers without duplicate tools and coalesces concurrent calls', async () => {
	const h = harness({ failOn: 'recommend_apartments' });
	const first = h.api.registerSiteTools();
	assert.equal(h.api.registerSiteTools(), first);
	assert.equal(await first, false);
	assert.equal(h.registered.size, 1);
	assert.match(h.warnings[0][0], /recommend_apartments/);
	h.recover();
	assert.equal(await h.api.registerSiteTools(), true);
	assert.equal(h.registered.size, 5);
	assert.equal(h.attempts, 6);
	assert.equal(await h.api.registerSiteTools(), true);
	assert.equal(h.attempts, 6);
});

test('registration can retry after browser support becomes available', async () => {
	const h = harness();
	const context = h.document.modelContext;
	delete h.document.modelContext;
	assert.equal(await h.api.registerSiteTools(), false);
	h.document.modelContext = context;
	assert.equal(await h.api.registerSiteTools(), true);
	assert.equal(h.registered.size, 5);
});
