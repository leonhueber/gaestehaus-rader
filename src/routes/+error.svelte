<script lang="ts">
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { t } from '$lib/i18n';
	import { MapPinOff, House, TriangleAlert } from 'lucide-svelte';

	let { error, status } = $props<{
		error?: unknown;
		status?: number;
	}>();

	const statusCode = $derived.by(() => status ?? (error as { status?: number })?.status ?? page.status);
	const is404 = $derived.by(
		() => statusCode === 404 || (error as { message?: string })?.message?.includes('Not Found')
	);
	const homeHref = resolve('/');
</script>

<main class="px-6 py-20">
	<div class="mx-auto max-w-xl text-center">
		<Card tone="default" padding="lg" >
			<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
				{#if is404}
					<MapPinOff class="h-8 w-8" />
				{:else}
					<TriangleAlert class="h-8 w-8" />
				{/if}
			</div>

			<p class="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-brand">
				{$t('brand.name')}
			</p>

			<h1 class="mt-3 font-serif text-3xl font-semibold leading-[0.95] text-slate-900 sm:text-4xl">
				{#if is404}
					{$t('error.404.title')}
				{:else}
					{$t('error.generic.title')}
				{/if}
			</h1>

			<div class="mx-auto mt-4 h-[3px] w-14 rounded-full bg-brand"></div>

			{#if is404}
				<p class="mt-6 text-sm text-slate-600">
					{$t('error.404.body')}
				</p>

				<ButtonLink variant="secondary" size="md"
					href={homeHref}
					class="mt-6"
				>
					<House class="h-4 w-4" />
					{$t('error.404.cta')}
				</ButtonLink>
			{:else}
				<p class="mt-6 text-sm text-slate-600">
					{$t('error.generic.body')}
				</p>

				<!-- Optional: show status for debugging -->
				<p class="mt-3 text-xs text-slate-400">
					{$t('error.statusLabel')}: {statusCode}
				</p>
			{/if}
		</Card>
	</div>
</main>




