<script lang="ts">
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { asset, resolve } from '$app/paths';
import { page } from '$app/state';
	import { lang, t } from '$lib/i18n';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { localizePath } from '$lib/routing';
	import {
		Wifi,
		Trees,
		BriefcaseBusiness,
		Users,
		Laptop,
		PlugZap,
		LampDesk,
		Coffee,
		Check,
		ArrowRight,
		Clock3,
		PhoneCall,
		Mail,
	} from 'lucide-svelte';

	const withAsset = (path: string) => asset(path);
	const localizedHref = (path: string) => localizePath(path, page.url.pathname);

	// Adjust if routes change.
	const BOOKING_URL = $derived.by(() => localizedHref('/buchen'));
	const CONTACT_URL = $derived.by(() => localizedHref('/kontakt'));
	const APARTMENTS_URL = $derived.by(() => localizedHref('/unterkuenfte-preise'));
	const WORKATION_WIFI_MBPS = 100;

	const trustItems = [
		'workation.trust.wifi',
		'workation.trust.quiet',
		'workation.trust.workspace',
		'workation.trust.longstay',
	] as const;

	const fitItems = [
		{
			icon: Laptop,
			titleKey: 'workation.fit.remote.title',
			bodyKey: 'workation.fit.remote.body',
		},
		{
			icon: BriefcaseBusiness,
			titleKey: 'workation.fit.freelancer.title',
			bodyKey: 'workation.fit.freelancer.body',
		},
		{
			icon: Users,
			titleKey: 'workation.fit.teams.title',
			bodyKey: 'workation.fit.teams.body',
		},
	] as const;

	const setupItems = [
		{
			icon: Laptop,
			titleKey: 'workation.setup.desk.title',
			bodyKey: 'workation.setup.desk.body',
		},
		{
			icon: PlugZap,
			titleKey: 'workation.setup.power.title',
			bodyKey: 'workation.setup.power.body',
		},
		{
			icon: LampDesk,
			titleKey: 'workation.setup.light.title',
			bodyKey: 'workation.setup.light.body',
		},
		{
			icon: Coffee,
			titleKey: 'workation.setup.coffee.title',
			bodyKey: 'workation.setup.coffee.body',
		},
		{
			icon: Trees,
			titleKey: 'workation.setup.quiet.title',
			bodyKey: 'workation.setup.quiet.body',
		},
	] as const;

	const faqItems = [
		{ q: 'workation.faq.q1', a: 'workation.faq.a1' },
		{ q: 'workation.faq.q2', a: 'workation.faq.a2' },
		{ q: 'workation.faq.q3', a: 'workation.faq.a3' },
		{ q: 'workation.faq.q4', a: 'workation.faq.a4' },
		{ q: 'workation.faq.q5', a: 'workation.faq.a5' },
	] as const;

</script>

<SeoHead
	titleKey="workation.seo.title"
	descriptionKey="workation.seo.description"
	image="/images/Haus/gaestehaus-balkon-ausblick.jpg"
	noindex
	nofollow
/>

<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<section
		use:reveal class="opacity-0 translate-y-8 transition-all duration-700 ease-out relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 px-6 py-10 text-white shadow-sm sm:px-10 sm:py-14"
	>
		<img
			src={withAsset('/images/Haus/gaestehaus-balkon-ausblick.jpg')}
			alt={$t('workation.hero.imageAlt')}
			class="absolute inset-0 h-full w-full object-cover opacity-25"
			loading="eager"
			decoding="async"
		/>
		<div class="absolute inset-0 bg-gradient-to-br from-slate-950/80 to-brand/35"></div>
		<div class="relative">
			<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand-100">
				{$t('workation.hero.kicker')}
			</p>
			<h1 class="mt-4 max-w-3xl font-serif text-4xl leading-[0.95] sm:text-5xl">
				{$t('workation.hero.title')}
			</h1>
			<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
			<p class="mt-5 max-w-2xl text-base leading-relaxed text-slate-100/95 sm:text-lg">
				{$t('workation.hero.subtitle')}
			</p>
			<div class="mt-7 flex flex-wrap items-center gap-3">
				<ButtonLink variant="primary" size="md"
					href={CONTACT_URL}
				>
					{$t('workation.hero.ctaPrimary')}
					<ArrowRight class="h-4 w-4" />
				</ButtonLink>
				<ButtonLink variant="overlay" size="md"
					href={BOOKING_URL}
				>
					{$t('workation.hero.ctaSecondary')}
				</ButtonLink>
			</div>
		</div>
	</section>

	<Card as="section" tone="default" padding="md"  class="mt-8">
		<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each trustItems as item}
				<li class="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
					<Check class="h-4 w-4 shrink-0 text-brand" />
					<span>{$t(item)}</span>
				</li>
			{/each}
		</ul>
	</Card>

	<section use:reveal class="opacity-0 translate-y-8 transition-all duration-700 ease-out mt-12">
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
			{$t('workation.fit.kicker')}
		</p>
		<h2 class="mt-4 font-serif text-3xl leading-[0.95] text-slate-900 sm:text-4xl">
			{$t('workation.fit.title')}
		</h2>
		<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
		<p class="mt-5 max-w-3xl text-base leading-relaxed text-slate-600">
			{$t('workation.fit.subtitle')}
		</p>
		<div class="mt-8 grid gap-4 md:grid-cols-3">
			{#each fitItems as item}
				<Card as="article" tone="default" padding="md" >
					<item.icon class="h-5 w-5 text-brand" />
					<h3 class="mt-4 text-lg font-semibold text-slate-900">
						{$t(item.titleKey)}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">
						{$t(item.bodyKey)}
					</p>
				</Card>
			{/each}
		</div>
	</section>

	<section use:reveal class="opacity-0 translate-y-8 transition-all duration-700 ease-out mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
		<Card tone="default" padding="md" >
			<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
				{$t('workation.setup.kicker')}
			</p>
			<h2 class="mt-4 font-serif text-3xl leading-[0.95] text-slate-900 sm:text-4xl">
				{$t('workation.setup.title')}
			</h2>
			<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
			<div class="mt-6 grid gap-4 sm:grid-cols-2">
				{#each setupItems as item}
					<div class="rounded-2xl bg-slate-50 p-4">
						<div class="flex items-center gap-2">
							<item.icon class="h-4 w-4 text-brand" />
							<h3 class="text-sm font-semibold text-slate-900">{$t(item.titleKey)}</h3>
						</div>
						<p class="mt-2 text-sm leading-relaxed text-slate-600">
							{$t(item.bodyKey)}
						</p>
					</div>
				{/each}
			</div>
		</Card>

		<div class="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm sm:p-8">
			<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand-100">
				{$t('workation.internet.kicker')}
			</p>
			<h2 class="mt-4 font-serif text-3xl leading-[0.95] sm:text-4xl">
				{$t('workation.internet.title')}
			</h2>
			<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
			<div class="mt-6 rounded-2xl border border-white/20 bg-white/10 p-5">
				<div class="flex items-center gap-3">
					<Wifi class="h-5 w-5 text-brand-100" />
					<p class="text-sm font-semibold uppercase tracking-wide">
						{$t('workation.internet.promiseLabel')}
					</p>
				</div>
				<p class="mt-3 text-2xl font-semibold">>= {WORKATION_WIFI_MBPS} Mbit/s WLAN</p>
				<p class="mt-2 text-sm leading-relaxed text-slate-100/90">
					{$t('workation.internet.promiseBody')}
				</p>
			</div>
			<ul class="mt-5 space-y-2 text-sm text-slate-100/90">
				<li class="flex items-start gap-2">
					<Check class="mt-0.5 h-4 w-4 shrink-0 text-brand-100" />
					<span>{$t('workation.internet.bullet1')}</span>
				</li>
				<li class="flex items-start gap-2">
					<Check class="mt-0.5 h-4 w-4 shrink-0 text-brand-100" />
					<span>{$t('workation.internet.bullet2')}</span>
				</li>
				<li class="flex items-start gap-2">
					<Check class="mt-0.5 h-4 w-4 shrink-0 text-brand-100" />
					<span>{$t('workation.internet.bullet3')}</span>
				</li>
			</ul>
		</div>
	</section>

	<section use:reveal class="opacity-0 translate-y-8 transition-all duration-700 ease-out mt-12 grid gap-6 md:grid-cols-2">
		<Card as="article" tone="default" padding="md" >
			<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
				{$t('workation.balance.kicker')}
			</p>
			<h2 class="mt-4 font-serif text-3xl leading-[0.95] text-slate-900 sm:text-4xl">
				{$t('workation.balance.title')}
			</h2>
			<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
			<p class="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
				{$t('workation.balance.body')}
			</p>
			<ul class="mt-5 space-y-2 text-sm text-slate-700">
				<li class="flex items-start gap-2">
					<Trees class="mt-0.5 h-4 w-4 shrink-0 text-brand" />
					<span>{$t('workation.balance.bullet1')}</span>
				</li>
				<li class="flex items-start gap-2">
					<Trees class="mt-0.5 h-4 w-4 shrink-0 text-brand" />
					<span>{$t('workation.balance.bullet2')}</span>
				</li>
				<li class="flex items-start gap-2">
					<Trees class="mt-0.5 h-4 w-4 shrink-0 text-brand" />
					<span>{$t('workation.balance.bullet3')}</span>
				</li>
			</ul>
		</Card>

		<Card as="article" tone="default" padding="md" >
			<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
				{$t('workation.longstay.kicker')}
			</p>
			<h2 class="mt-4 font-serif text-3xl leading-[0.95] text-slate-900 sm:text-4xl">
				{$t('workation.longstay.title')}
			</h2>
			<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
			<div
				class="mt-5 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-dark"
			>
				<Clock3 class="h-3.5 w-3.5" />
				{$t('workation.longstay.badge')}
			</div>
			<ul class="mt-5 space-y-3 text-sm leading-relaxed text-slate-700">
				<li>{$t('workation.longstay.bullet1')}</li>
				<li>{$t('workation.longstay.bullet2')}</li>
				<li>{$t('workation.longstay.bullet3')}</li>
			</ul>
			<p class="mt-4 text-sm font-medium text-slate-900">
				{$t('workation.longstay.teaser')}
			</p>
		</Card>
	</section>

	<Card as="section" tone="default" padding="md"  class="mt-12" id="faq">
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
			{$t('workation.faq.kicker')}
		</p>
		<h2 class="mt-4 font-serif text-3xl leading-[0.95] text-slate-900 sm:text-4xl">
			{$t('workation.faq.title')}
		</h2>
		<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>

		<div class="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200">
			{#each faqItems as item, i}
				<details class="group bg-white" open={i === 0}>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-900 marker:content-none"
					>
						{$t(item.q)}
						<span class="text-slate-400 transition group-open:rotate-45">+</span>
					</summary>
					<div class="px-5 pb-5">
						<p class="text-sm leading-relaxed text-slate-600">
							{$t(item.a)}
						</p>
					</div>
				</details>
			{/each}
		</div>
	</Card>

	<section
		use:reveal class="opacity-0 translate-y-8 transition-all duration-700 ease-out mt-12 rounded-3xl border border-slate-200 bg-gradient-to-r from-brand/10 via-white to-slate-50 p-6 shadow-sm sm:p-10"
	>
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
			{$t('workation.cta.kicker')}
		</p>
		<h2 class="mt-4 max-w-2xl font-serif text-3xl leading-[0.95] text-slate-900 sm:text-4xl">
			{$t('workation.cta.title')}
		</h2>
		<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
		<p class="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
			{$t('workation.cta.body')}
		</p>
		<p class="mt-3 max-w-2xl text-sm font-medium text-slate-800">
			{$t('workation.cta.formTeaser')}
		</p>
		<div class="mt-7 flex flex-wrap gap-3">
			<ButtonLink variant="primary" size="md"
				href={BOOKING_URL}
			>
				{$t('workation.cta.primary')}
				<ArrowRight class="h-4 w-4" />
			</ButtonLink>
			<ButtonLink variant="secondary" size="md"
				href={CONTACT_URL}
			>
				<Mail class="h-4 w-4" />
				{$t('workation.cta.secondary')}
			</ButtonLink>
			<ButtonLink variant="secondary" size="md"
				href={APARTMENTS_URL}
			>
				{$t('workation.cta.apartments')}
			</ButtonLink>
		</div>
	</section>
</div>

<div class="fixed inset-x-3 bottom-3 z-40 sm:hidden">
	<div class="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
		<div class="flex items-center justify-between gap-3">
			<div>
				<p class="text-xs font-semibold uppercase tracking-wide text-brand">
					{$t('workation.mobileCta.kicker')}
				</p>
				<p class="text-sm font-semibold text-slate-900">>= {WORKATION_WIFI_MBPS} Mbit/s WLAN</p>
			</div>
			<ButtonLink variant="primary" size="sm"
				href={CONTACT_URL}
			>
				<PhoneCall class="h-3.5 w-3.5" />
				{$t('workation.mobileCta.button')}
			</ButtonLink>
		</div>
	</div>
</div>
