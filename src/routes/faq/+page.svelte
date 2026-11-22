<script lang="ts">
	import { Check, ChevronDown, X } from 'lucide-svelte';
	import { page } from '$app/state';
	import { lang, t } from '$lib/i18n';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/seo';
	import { buildBreadcrumbListSchema, buildFaqPageSchema, buildJsonLdGraph } from '$lib/structured-data';

	const groups = [
		{ title: 'faq.arrival', items: ['faq.q1', 'faq.q3', 'faq.q4'] },
		{ title: 'faq.apartments', items: ['faq.q11', 'faq.q5', 'faq.q2', 'faq.q8', 'faq.q9', 'faq.q10'] },
		{ title: 'faq.guestcard.kicker', id: 'gaestecard', items: ['faq.guestcard.q1', 'faq.guestcard.q2', 'faq.q7', 'faq.guestcard.q3', 'faq.guestcard.q4', 'faq.guestcard.q5'] },
	];

	const yesNo: Record<string, boolean | undefined> = {
		'faq.q2': false, 'faq.q3': true, 'faq.q5': true, 'faq.q8': false, 'faq.q9': true, 'faq.q10': false,
	};

	const shortAnswers: Record<string, { de: string; en: string }> = {
		'faq.q1': { de: 'Ab 14 / bis 10 Uhr', en: 'From 2 pm / by 10 am' },
		'faq.q4': { de: 'Bar vor Ort', en: 'Cash on site' },
		'faq.q8': { de: 'Nur am Balkon', en: 'Balcony only' },
		'faq.q11': { de: '3', en: '3' },
		'faq.q7': { de: 'Saisonale Vorteile', en: 'Seasonal benefits' },
		'faq.guestcard.q1': { de: 'Alle Hausgäste', en: 'All overnight guests' },
		'faq.guestcard.q2': { de: 'Bei Anreise', en: 'On arrival' },
		'faq.guestcard.q3': { de: 'Bus & Regionalbahn', en: 'Bus & regional rail' },
		'faq.guestcard.q4': { de: 'Je nach Angebot', en: 'Depends on offer' },
		'faq.guestcard.q5': { de: 'Ersatz beim Gastgeber', en: 'Ask host for a replacement' },
	};

	function answerKey(question: string) {
		return question.replace(/\.q(\d+)$/, '.a$1');
	}
	const faqUrl = $derived.by(() => new URL(page.url.pathname, SITE_ORIGIN).toString());
	const faqJsonLd = $derived.by(() =>
		buildJsonLdGraph([
			buildBreadcrumbListSchema(
				[
					{ name: $t('nav.home'), path: '/' },
					{ name: $t('faq.title'), path: page.url.pathname },
				],
				SITE_ORIGIN
			),
			buildFaqPageSchema(
				faqUrl,
				$lang,
				groups.flatMap(group => group.items).map((question) => ({
					question: $t(question),
					answer: $t(answerKey(question)),
				}))
			),
		])
	);
</script>

<SeoHead titleKey="faq.seo.title" descriptionKey="faq.seo.description" />

<svelte:head>
	{@html `<script type="application/ld+json">${faqJsonLd}</script>`}
</svelte:head>

<div class="mx-auto max-w-3xl px-2 sm:px-0">
	<h1 class="font-serif text-3xl leading-tight text-slate-900 sm:text-4xl">{$t('faq.title')}</h1>
	{#each groups as group}
		<section id={group.id} class="mt-8 scroll-mt-40 sm:mt-10">
			<h2 class="mb-2 text-lg font-semibold text-slate-900">{$t(group.title)}</h2>
			<div class="divide-y divide-slate-200 border-y border-slate-200">
				{#each group.items as question}
					{@const status = yesNo[question]}
					{@const hint = shortAnswers[question]?.[$lang]}
					<details class="group">
						<summary class="grid min-h-12 cursor-pointer list-none grid-cols-[1fr_auto_auto] items-center gap-2 py-3 text-slate-800 focus-visible:outline-offset-2 sm:gap-4 [&::-webkit-details-marker]:hidden">
							<span class="text-base font-medium">{$t(question)}</span>
							<span class="inline-flex max-w-28 items-center justify-end gap-1 text-right text-xs leading-snug text-slate-600 sm:max-w-none">
								{#if hint}
									{hint}
								{:else if status}
									<Check size={16} class="text-emerald-700" aria-hidden="true" /><span class="sr-only">{$lang === 'de' ? 'Ja' : 'Yes'}</span>
								{:else}
									<X size={15} class="text-rose-700" aria-hidden="true" /><span class="sr-only">{$lang === 'de' ? 'Nein' : 'No'}</span>
								{/if}
							</span>
							<ChevronDown size={15} aria-hidden="true" class="text-slate-500 motion-safe:transition-transform group-open:rotate-180" />
						</summary>
						<p class="max-w-prose pb-4 text-sm leading-relaxed text-slate-600">{$t(answerKey(question))}</p>
					</details>
				{/each}
			</div>
		</section>
	{/each}
</div>
