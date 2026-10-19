const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function load(file) {
	const exports = {};
	const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
	const code = ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
	}).outputText;
	vm.runInNewContext(code, {
		exports,
		require(id) {
			if (id === 'lucide-svelte') return new Proxy({}, { get: () => () => null });
			throw new Error(`Unexpected dependency: ${id}`);
		},
	});
	return exports;
}

const { getGuestCardVisual, getHeroExperienceIds, getViennaMonth } = load('src/lib/hero-season.ts');
const { experienceEvents } = load('src/lib/data/experience.ts');

test('every month offers two distinct existing experiences with local photos and bilingual copy', () => {
	for (let month = 1; month <= 12; month++) {
		const ids = getHeroExperienceIds(month);
		assert.equal(new Set(ids).size, 2);
		for (const id of ids) {
			const event = experienceEvents.find((item) => item.id === id);
			assert.ok(event, id);
			assert.ok(fs.existsSync(path.join(__dirname, '..', 'static', event.image)));
			for (const lang of ['de', 'en']) {
				assert.ok(event.title[lang]);
				assert.ok(event.description[lang]);
			}
		}
	}
});

test('winter promotion starts in October while nature ice stays in midwinter', () => {
	for (let month = 1; month <= 12; month++) {
		assert.equal(getHeroExperienceIds(month).includes('winter-ice'), month <= 2);
	}
	assert.ok(getHeroExperienceIds(9).every((id) => id.startsWith('summer-')));
	assert.deepEqual([...getHeroExperienceIds(10)], ['winter-ski', 'winter-hike']);
	assert.ok(getHeroExperienceIds(7).includes('summer-lake'));
	assert.ok(getHeroExperienceIds(12).every((id) => id.startsWith('winter-')));
});

test('no seasonal slides before client month is available', () => {
	assert.equal(getHeroExperienceIds(0).length, 0);
});

test('guest card uses winter from October through April and summer from May through September', () => {
	for (let month = 1; month <= 12; month++) {
		const summer = month >= 5 && month <= 9;
		const visual = getGuestCardVisual(month);
		assert.equal(visual.altKey.endsWith('.summer'), summer);
		assert.equal(visual.src, summer ? '/images/Umgebung/nassfeld-lift.jpg' : '/images/Umgebung/skigebiet-weissbriach-2.jpg');
	}
	assert.equal(getGuestCardVisual(null).src, getGuestCardVisual(10).src);
});

test('season month follows Vienna at UTC month boundaries', () => {
	assert.equal(getViennaMonth(new Date('2026-09-30T22:30:00Z')), 10);
	assert.equal(getViennaMonth(new Date('2026-04-30T22:30:00Z')), 5);
	assert.equal(getViennaMonth(new Date('2026-09-30T21:30:00Z')), 9);
});
