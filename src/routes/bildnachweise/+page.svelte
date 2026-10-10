<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { t } from '$lib/i18n';
	import SeoHead from '$lib/components/SeoHead.svelte';
</script>

<SeoHead titleKey="credits.seo.title" descriptionKey="credits.seo.description" />

<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<Card as="section" tone="default" padding="lg" >
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">{$t('brand.name')}</p>
		<h1 class="mt-4 font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
			{$t('credits.title')}
		</h1>
		<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>

		<div class="mt-8 space-y-6 text-sm text-slate-600 sm:text-base">
			<p>
				{$t('credits.intro')}
			</p>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('credits.own.title')}</p>
				<p class="mt-2">
					{$t('credits.own.body')}
				</p>
			</div>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('credits.external.title')}</p>
				<p class="mt-2">
					{$t('credits.external.body')}
				</p>
			</div>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('credits.logos.title')}</p>
				<p class="mt-2">
					{$t('credits.logos.body')}
				</p>
			</div>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('credits.icons.title')}</p>
				<p class="mt-2">
					{$t('credits.icons.body')}
					<a class="text-brand hover:opacity-90" href="https://lucide.dev" target="_blank" rel="noreferrer">
						https://lucide.dev
					</a>
				</p>
			</div>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('credits.fonts.title')}</p>
				<p class="mt-2">
					{$t('credits.fonts.body')}
					<a
						class="text-brand hover:opacity-90"
						href="https://fonts.google.com"
						target="_blank"
						rel="noreferrer"
					>
						https://fonts.google.com
					</a>
				</p>
			</div>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('credits.maps.title')}</p>
				<p class="mt-2">
					{$t('credits.maps.body')}
					<a
						class="text-brand hover:opacity-90"
						href="https://www.google.com/maps"
						target="_blank"
						rel="noreferrer"
					>
						https://www.google.com/maps
					</a>
				</p>
			</div>

			<div>
				<p class="text-sm font-semibold text-slate-900">{$t('credits.liability.title')}</p>
				<p class="mt-2">
					{$t('credits.liability.body')}
				</p>
			</div>

			<p class="pt-2 text-sm text-slate-500">{$t('credits.updated')}</p>
		</div>
	</Card>
</div>
