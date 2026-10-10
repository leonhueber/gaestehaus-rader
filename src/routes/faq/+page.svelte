<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { page } from '$app/state';
	import { lang, t } from '$lib/i18n';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { SITE_ORIGIN } from '$lib/seo';
	import { buildBreadcrumbListSchema, buildFaqPageSchema, buildJsonLdGraph } from '$lib/structured-data';

	const faqItems = [
		{ question: 'faq.q1', answer: 'faq.a1' },
		{ question: 'faq.q2', answer: 'faq.a2' },
		{ question: 'faq.q3', answer: 'faq.a3' },
		{ question: 'faq.q4', answer: 'faq.a4' },
		{ question: 'faq.q5', answer: 'faq.a5' },
		{ question: 'faq.q6', answer: 'faq.a6', id: 'gaestecard' },
		{ question: 'faq.q7', answer: 'faq.a7' },
		{ question: 'faq.q8', answer: 'faq.a8' },
		{ question: 'faq.q9', answer: 'faq.a9' },
		{ question: 'faq.q10', answer: 'faq.a10' },
		{ question: 'faq.q11', answer: 'faq.a11' },
	];

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
				faqItems.map((item) => ({
					question: $t(item.question),
					answer: $t(item.answer),
				}))
			),
		])
	);
</script>

<SeoHead titleKey="faq.seo.title" descriptionKey="faq.seo.description" />

<svelte:head>
	{@html `<script type="application/ld+json">${faqJsonLd}</script>`}
</svelte:head>

<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<Card as="section" tone="default" padding="lg" >
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
			{$t('brand.name')}
		</p>
		<h1 class="mt-4 font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
			{$t('faq.title')}
		</h1>
		<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
		<p class="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
			{$t('faq.subtitle')}
		</p>

		<div class="mt-8 grid gap-6 sm:grid-cols-2">
			{#each faqItems as item}
				<Card tone="muted" padding="sm"  id={item.id}>
					<h2 class="text-base font-semibold text-slate-900">
						{$t(item.question)}
					</h2>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">
						{$t(item.answer)}
					</p>
				</Card>
			{/each}
		</div>

		<section class="mt-12" id="gaestecard">
			<div class="space-y-4">
				<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
					{$t('faq.guestcard.kicker')}
				</p>
				<h2 class="font-serif text-3xl leading-[0.95] text-slate-900 sm:text-4xl">
					{$t('faq.guestcard.title')}
				</h2>
				<div class="h-[3px] w-14 rounded-full bg-brand"></div>
				<p class="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
					{$t('faq.guestcard.subtitle')}
				</p>
			</div>

			<div class="mt-8 grid gap-6 sm:grid-cols-2">
				<Card tone="muted" padding="sm" >
					<h3 class="text-base font-semibold text-slate-900">
						{$t('faq.guestcard.q1')}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">
						{$t('faq.guestcard.a1')}
					</p>
				</Card>
				<Card tone="muted" padding="sm" >
					<h3 class="text-base font-semibold text-slate-900">
						{$t('faq.guestcard.q2')}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">
						{$t('faq.guestcard.a2')}
					</p>
				</Card>
				<Card tone="muted" padding="sm" >
					<h3 class="text-base font-semibold text-slate-900">
						{$t('faq.guestcard.q3')}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">
						{$t('faq.guestcard.a3')}
					</p>
				</Card>
				<Card tone="muted" padding="sm" >
					<h3 class="text-base font-semibold text-slate-900">
						{$t('faq.guestcard.q4')}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">
						{$t('faq.guestcard.a4')}
					</p>
				</Card>
				<Card tone="muted" padding="sm" >
					<h3 class="text-base font-semibold text-slate-900">
						{$t('faq.guestcard.q5')}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">
						{$t('faq.guestcard.a5')}
					</p>
				</Card>
			</div>
		</section>
	</Card>
</div>
