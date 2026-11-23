<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { mapLegal } from '$lib/data/map-legal';
	import { lang } from '$lib/i18n';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { privacyCopy as copy } from '$lib/data/privacyCopy';
</script>

<SeoHead titleKey="privacy.seo.title" descriptionKey="privacy.seo.description" />

<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<Card as="section" tone="default" padding="lg" >
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">Gästehaus Rader</p>
		<h1 class="mt-4 break-words font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
			{copy.title[$lang]}
		</h1>
		<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>

		<div class="mt-8 space-y-8 text-sm text-slate-600 sm:text-base">
			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.controllerHeading[$lang]}</h2>
				<div class="mt-3 space-y-1">
					<p class="font-semibold text-slate-800">Gästehaus Rader</p>
					<p>Astrid Hueber</p>
					<p>Weißbriach 92</p>
					<p>9622 Weißbriach</p>
					<p>{copy.country[$lang]}</p>
				<p class="mt-3">
						{copy.phone[$lang]} <a class="hover:text-slate-900" href="tel:+434286222">+43 4286 222</a>
					</p>
					<p>
						{copy.email[$lang]}
						<a class="hover:text-slate-900" href="mailto:info@rader-gitschtal.at">
							info@rader-gitschtal.at
						</a>
					</p>
				</div>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.generalHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.general[$lang]}
				</p>
				<p class="mt-3">
					{copy.scope[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.analyticsHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.analytics[$lang]}
				</p>
				<p class="mt-3">{copy.analyticsData[$lang]}</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>{copy.pageUrl[$lang]}</li>
					<li>{copy.referrer[$lang]}</li>
					<li>{copy.browserOs[$lang]}</li>
					<li>{copy.accessTime[$lang]}</li>
				</ul>
				<p class="mt-3">
					{copy.anonymisation[$lang]}
				</p>
				<p class="mt-3">
					{copy.analyticsPurpose[$lang]}<br />
					{copy.legitimateInterest[$lang]}
				</p>
				<p class="mt-3">
					{copy.analyticsProvider[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">4. Google Search Console</h2>
				<p class="mt-3">
					{copy.searchConsole[$lang]}
				</p>
				<p class="mt-3">
					{copy.searchPrivacy[$lang]}
				</p>
				<p class="mt-3">
					{copy.searchPurpose[$lang]}<br />
					{copy.legitimateInterest[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.hostingHeading[$lang]}</h2>
				<p class="mt-3">{copy.hostIntro[$lang]}</p>
				<div class="mt-3 space-y-1">
					<p class="font-semibold text-slate-800">DomainFactory GmbH</p>
				</div>
				<p class="mt-3">
					{copy.hostLogs[$lang]}
				</p>
				<p class="mt-3">{copy.logData[$lang]}</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>{copy.visitorIp[$lang]}</li>
					<li>{copy.accessTime[$lang]}</li>
					<li>{copy.pageUrl[$lang]}</li>
					<li>{copy.browserVersion[$lang]}</li>
					<li>{copy.operatingSystem[$lang]}</li>
					<li>{copy.referrer[$lang]}</li>
				</ul>
				<p class="mt-3">
					{copy.hostingPurpose[$lang]}<br />
					{copy.legitimateInterest[$lang]}
				</p>
				<p class="mt-3">
					{copy.processor[$lang]}
				</p>
				<p class="mt-3">
					{copy.logRetention[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.contactHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.contact[$lang]}
				</p>
				<p class="mt-3">
					{copy.contactPurpose[$lang]}<br />
					{copy.legalBasis[$lang]}
				</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>
						{copy.precontract[$lang]}
					</li>
					<li>{copy.communication[$lang]}</li>
				</ul>
				<p class="mt-3">
					{copy.enquiryRetention[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.fontsHeading[$lang]}</h2>

				<p class="mt-3">
					{copy.fonts[$lang]}
				</p>

				<p class="mt-3">
					{copy.fontPrivacy[$lang]}
				</p>

				<p class="mt-3">
					{copy.fontPurpose[$lang]}<br />
					{copy.legitimateInterest[$lang]}
				</p>
			</section>

			<section id="google-maps">
				<h2 class="text-base font-semibold text-slate-900">8. Google Maps</h2>
				{#each mapLegal[$lang].google as paragraph}<p class="mt-3">{paragraph}</p>{/each}
				<p class="mt-3"><a class="underline underline-offset-4" href={`https://policies.google.com/privacy?hl=${$lang}`} target="_blank" rel="noopener noreferrer">Google: {mapLegal[$lang].privacy}</a> · <a class="underline underline-offset-4" href="https://www.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer">Google Maps: {mapLegal[$lang].terms}</a></p>
			</section>

			<section id="openstreetmap">
				<h2 class="text-base font-semibold text-slate-900">8a. OpenStreetMap &amp; FOSSGIS</h2>
				{#each mapLegal[$lang].osm as paragraph}<p class="mt-3">{paragraph}</p>{/each}
				<p class="mt-3">{mapLegal[$lang].basis}</p>
				<p class="mt-3"><a class="underline underline-offset-4" href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">OpenStreetMap Foundation: {mapLegal[$lang].privacy}</a> · <a class="underline underline-offset-4" href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noopener noreferrer">{mapLegal[$lang].routing}</a></p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">
					{copy.bookingHeading[$lang]}
				</h2>
				<p class="mt-3">
					{copy.booking[$lang]}
				</p>

				<Card tone="muted" padding="sm" class="mt-4">
					<p class="text-sm font-semibold text-slate-900">
						{copy.providerHeading[$lang]}
					</p>
					<div class="mt-2 space-y-1 text-sm text-slate-600">
						<p class="font-semibold text-slate-800">Nassfeld-Pressegger See Tourismus GmbH</p>
						<p>{copy.providerLocation[$lang]}</p>
					</div>

					<p class="mt-4 text-sm font-semibold text-slate-900">{copy.technicalProvider[$lang]}</p>
					<div class="mt-2 space-y-1 text-sm text-slate-600">
						<p class="font-semibold text-slate-800">feratel media technologies AG</p>
						<p>{copy.technicalAddress[$lang]}</p>
					</div>
				</Card>

				<p class="mt-3">
					{copy.bookingData[$lang]}
				</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>{copy.ip[$lang]}</li>
					<li>{copy.accessTime[$lang]}</li>
					<li>{copy.device[$lang]}</li>
					<li>{copy.bookingContact[$lang]}</li>
					<li>{copy.travelDates[$lang]}</li>
				</ul>
				<p class="mt-3">
					{copy.providerResponsibility[$lang]}
				</p>
				<p class="mt-3">
					{copy.bookingPurpose[$lang]}<br />
					{copy.contractBasis[$lang]}
				</p>
				<p class="mt-3">
					{copy.internationalTransfers[$lang]}
				</p>
				<p class="mt-3">
					{copy.providerPolicies[$lang]}
				</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>
						Nassfeld-Pressegger See Tourismus GmbH:
						<a
							class="hover:text-slate-900"
							href="https://www.nassfeld.at/de/Service/Datenschutz"
							target="_blank"
							rel="noopener noreferrer"
						>
							{copy.privacyLink[$lang]}
						</a>
					</li>
					<li>
						feratel:
						<a
							class="hover:text-slate-900"
							href="https://www.feratel.com/datenschutz.html"
							target="_blank"
							rel="noopener noreferrer"
						>
							{copy.privacyLink[$lang]}
						</a>
					</li>
				</ul>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.disclosureHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.disclosure[$lang]}
				</p>
				<p class="mt-3">
					{copy.recipients[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.rightsHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.rights[$lang]}
				</p>
				<p class="mt-3">
					{copy.exerciseRights[$lang]}
					<a class="hover:text-slate-900" href="mailto:info@rader-gitschtal.at">
						info@rader-gitschtal.at
					</a>
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.complaintHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.complaint[$lang]}
				</p>
				<p class="mt-3">{copy.authority[$lang]}</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">{copy.securityHeading[$lang]}</h2>
				<p class="mt-3">
					{copy.security[$lang]}
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">
					{copy.changesHeading[$lang]}
				</h2>
				<p class="mt-3">
					{copy.changes[$lang]}
				</p>
				<p class="mt-3">{copy.date[$lang]}</p>
			</section>
		</div>
	</Card>
</div>
