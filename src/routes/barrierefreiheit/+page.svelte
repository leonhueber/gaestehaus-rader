<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { t } from '$lib/i18n';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { localizePath } from '$lib/routing';

	const localizedHref = (path: string) => localizePath(path, page.url.pathname);
</script>

<SeoHead titleKey="accessibility.seo.title" descriptionKey="accessibility.seo.description" />

<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<Card as="section" tone="default" padding="lg" >
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
			{$t('brand.name')}
		</p>
		<h1 class="mt-4 font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
			{$t('accessibility.title')}
		</h1>
		<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>

		<div class="mt-8 space-y-6 text-sm text-slate-600 sm:text-base">
			<p>{$t('accessibility.intro')}</p>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('accessibility.status.title')}</p>
				<p class="mt-2">{$t('accessibility.status.body')}</p>
			</div>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('accessibility.limitations.title')}</p>
				<p class="mt-2">{$t('accessibility.limitations.body')}</p>
				<ul class="mt-3 list-disc space-y-2 pl-5">
					<li>{$t('accessibility.limitations.item1')}</li>
					<li>{$t('accessibility.limitations.item2')}</li>
				</ul>
			</div>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('accessibility.feedback.title')}</p>
				<p class="mt-2">
					{$t('accessibility.feedback.body')}
					<a class="text-brand hover:opacity-90" href="mailto:info@rader-gitschtal.at">
						info@rader-gitschtal.at
					</a>.
				</p>
				<p class="mt-2">
					<a class="text-brand hover:opacity-90" href={localizedHref('/kontakt')}>
						{$t('accessibility.feedback.cta')}
					</a>
				</p>
			</div>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('accessibility.enforcement.title')}</p>
				<p class="mt-2">{$t('accessibility.enforcement.body')}</p>
			</div>

			<p class="pt-2 text-sm text-slate-500">{$t('accessibility.created.body')}</p>
		</div>
	</Card>
</div>
