<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { t } from '$lib/i18n';
	import { imageAttrs } from '$lib/images';
	import SeoHead from '$lib/components/SeoHead.svelte';
</script>

<SeoHead
	titleKey="about.seo.title"
	descriptionKey="about.seo.description"
	image="/images/Haus/familie-hueber.jpg"
/>

<!-- <div class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"> -->
<!-- ABOUT / ÜBER UNS (Tailwind) -->
<section class="relative overflow-visible">
	<!-- soft gradient background -->

	<div class="relative mx-auto max-w-6xl px-6 py-16 lg:py-20">
		<div class="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
			<!-- LEFT: organic image -->
			<div class="relative">
				<!-- blob container -->
				<div
					class="relative aspect-[5/4] w-full overflow-hidden bg-white shadow-[0_30px_80px_rgba(16,24,40,0.18)]"
					style="
            border-radius: 46% 54% 55% 45% / 52% 45% 55% 48%;
            outline: 10px solid rgba(255,255,255,0.9);
          "
				>
					<!-- Replace src with your image -->
					<img
						{...imageAttrs('/images/Haus/familie-hueber.jpg', '(max-width: 1024px) 100vw, 50vw')}
						alt="Gästehaus Rader"
						class="h-full w-full object-cover"
						loading="eager"
						fetchpriority="high"
					/>
					<!-- subtle overlay to match design softness -->
				</div>

				<!-- floating badge card -->
				<div
					class="absolute -bottom-8 left-1/2 z-10 w-[220px] -translate-x-1/2 sm:left-[62%] sm:translate-x-0"
				>
					<Card tone="default" padding="md"
					>
						<div class="flex items-start gap-3">
							<div
								class="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15"
							>
								<!-- icon -->
								<svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="2">
									<path d="M12 3l2.1 6.5H21l-5.45 3.95L17.6 20 12 15.95 6.4 20l2.05-6.55L3 9.5h6.9L12 3z" />
								</svg>
							</div>
							<div>
								<p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
									{$t('about.traditionSince')}
								</p>
								<p class="mt-1 text-2xl font-semibold text-slate-900">1964</p>
							</div>
						</div>
					</Card>
				</div>
			</div>

			<!-- RIGHT: content -->
			<div class="relative">
				<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
					{$t('about.kicker')}
				</p>

				<h1 class="mt-4 font-serif text-5xl leading-[0.95] text-slate-900 sm:text-6xl">
					{$t('about.headingPrefix')} <span class="italic">{$t('about.headingEmphasis')}</span>
				</h1>

				<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>
				<p class="mt-6 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
					<span class="italic">
						{$t('about.paragraphOne')}
					</span>
				</p>

				<p class="mt-5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
					{$t('about.paragraphTwo')}
				</p>

				<div class="mt-7 flex items-center gap-4">
					<div class="text-sm text-slate-600">
						<span class="font-semibold text-slate-900">{$t('about.signature')}</span>, Familie Herold Hueber
					</div>
				</div>
			</div>
		</div>

		<!-- spacing because badge overlaps -->
		<div class="h-10 sm:h-12"></div>
	</div>
</section>
<!-- </div> -->



