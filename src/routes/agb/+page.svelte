<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { lang } from '$lib/i18n';
	import { termsCopy as copy } from '$lib/data/termsCopy';
</script>

<SeoHead titleKey="terms.seo.title" descriptionKey="terms.seo.description" />

<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<Card as="section" tone="default" padding="lg" >
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">Gästehaus Rader</p>
		<h1 class="mt-4 font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">{copy.title[$lang]}</h1>
		<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>

		<div class="mt-8 space-y-8 text-sm text-slate-600 sm:text-base">
			<section>
				<h2 class="text-base font-semibold text-slate-900">Gästehaus Rader</h2>
				<div class="mt-3 space-y-1">
					<p class="font-semibold text-slate-800">Astrid Hueber</p>
					<p>Weißbriach 92</p>
					<p>9622 Weißbriach</p>
					<p>{copy.country[$lang]}</p>
					<p class="mt-3">{copy.phone[$lang]} <a class="hover:text-slate-900" href="tel:+434286222">+43 4286 222</a></p>
					<p>
						{copy.email[$lang]}
						<a class="hover:text-slate-900" href="mailto:info@rader-gitschtal.at">
							info@rader-gitschtal.at
						</a>
					</p>
				</div>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.scopeHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.scope[$lang]}
				</p>
				<p class="mt-3">{copy.acceptance[$lang]}</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.contractHeading[$lang]}</h2>
				<p class="mt-3">{copy.contractIntro[$lang]}</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>{copy.guestBooking[$lang]}</li>
					<li>{copy.confirmation[$lang]}</li>
				</ul>
				<p class="mt-3">
					{copy.contractParties[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.pricesHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.prices[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.paymentHeading[$lang]}</h2>
				<p class="mt-3">{copy.paymentIntro[$lang]}</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>{copy.prepayment[$lang]}</li>
					<li>{copy.onSite[$lang]}</li>
				</ul>
				<p class="mt-3">{copy.deposit[$lang]}</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.arrivalHeading[$lang]}</h2>
				<p class="mt-3">{copy.checkIn[$lang]}</p>
				<p>{copy.checkOut[$lang]}</p>
				<p class="mt-3">{copy.otherTimes[$lang]}</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.cancellationHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.cancellation[$lang]}
				</p>
				<p class="mt-3">{copy.cancellationReceived[$lang]}</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.hostCancellationHeading[$lang]}</h2>
				<p class="mt-3">{copy.hostCancellationIntro[$lang]}</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>{copy.unpaidDeposit[$lang]}</li>
					<li>{copy.forceMajeure[$lang]}</li>
					<li>{copy.disruption[$lang]}</li>
				</ul>
				<p class="mt-3">{copy.refund[$lang]}</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.houseRulesHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.houseRules[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.liabilityHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.liability[$lang]}
				</p>
				<p class="mt-3">
					{copy.valuables[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.petsHeading[$lang]}</h2>
				<p class="mt-3">{copy.pets[$lang]}</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.privacyHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.privacy[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.platformHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.platform[$lang]}
				</p>
				<p class="mt-3">
					{copy.accommodationContract[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.jurisdictionHeading[$lang]}</h2>
				<p class="mt-3">{copy.law[$lang]}</p>
				<p>{copy.court[$lang]}</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.severabilityHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.severability[$lang]}
				</p>
			</section>

			<p class="pt-2 text-sm text-slate-500">{copy.date[$lang]}</p>
		</div>
	</Card>
</div>
