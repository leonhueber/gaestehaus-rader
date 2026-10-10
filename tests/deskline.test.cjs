const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function harness() {
	const intervals = new Set();
	const timeouts = new Set();
	const frames = new Set();
	const states = [];
	const scripts = [];
	let ready = false;
	let reloads = 0;
	const window = {
		location: { reload() { reloads++; } },
		requestAnimationFrame(fn) { frames.add(fn); return fn; },
		cancelAnimationFrame(fn) { frames.delete(fn); },
	};
	const container = {
		isConnected: true,
		replaceChildren() {},
		appendChild(script) { scripts.push(script); },
		querySelector() { return { shadowRoot: { querySelector: () => ready ? {} : null } }; },
	};
	const exports = {};
	const source = fs.readFileSync(path.join(__dirname, '../src/lib/deskline.ts'), 'utf8');
	vm.runInNewContext(ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
	}).outputText, {
		exports, window,
		require: () => ({ browser: true }),
		document: { querySelectorAll: () => [], createElement: () => ({}) },
		setInterval(fn) { intervals.add(fn); return fn; },
		clearInterval(fn) { intervals.delete(fn); },
		setTimeout(fn) { timeouts.add(fn); return fn; },
		clearTimeout(fn) { timeouts.delete(fn); },
	});
	return {
		states, scripts, intervals, timeouts,
		get reloads() { return reloads; },
		get settings() { return window.dw.q[0][2]; },
		mount(lang = 'en') { return exports.mountDeskline(container, lang, { onStatusChange: value => states.push(value) }); },
		frame() { for (const fn of frames) fn(); frames.clear(); },
		ready() { ready = true; for (const fn of intervals) fn(); },
		timeout() { for (const fn of timeouts) fn(); },
	};
}

test('explicit website language overrides saved Deskline language', () => {
	const h = harness(); h.mount('en'); h.frame();
	assert.equal(h.settings.lang, 'en');
	assert.equal(h.settings.doNotUseSelectedLang, true);
	assert.deepEqual(h.states, ['loading']);
	h.ready();
	assert.deepEqual(h.states, ['loading', 'ready']);
	assert.equal(h.intervals.size + h.timeouts.size, 0);
});

test('a loaded script without booking controls produces an actionable timeout', () => {
	const h = harness(); h.mount(); h.frame(); h.timeout();
	assert.deepEqual(h.states, ['loading', 'error']);
	assert.equal(h.intervals.size + h.timeouts.size, 0);
});

test('script errors are surfaced and unmount cancels readiness checks', () => {
	const h = harness(); const cleanup = h.mount(); h.frame();
	h.scripts[0].onerror();
	assert.deepEqual(h.states, ['loading', 'error']);
	cleanup(); h.ready(); h.timeout();
	assert.equal(h.states.length, 2);
	assert.equal(h.intervals.size + h.timeouts.size, 0);
});

test('unmount before animation frame does not start the provider', () => {
	const h = harness(); const cleanup = h.mount(); cleanup(); h.frame();
	assert.equal(h.scripts.length, 0);
	assert.equal(h.intervals.size + h.timeouts.size, 0);
});

test('returning to booking starts a fresh document instead of reusing provider globals', () => {
	const h = harness(); const cleanup = h.mount(); h.frame(); cleanup(); h.mount('de');
	assert.equal(h.reloads, 1);
	assert.equal(h.scripts.length, 1);
});
