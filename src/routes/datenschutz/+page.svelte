<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { t } from '$lib/i18n';
	import SeoHead from '$lib/components/SeoHead.svelte';
</script>

<SeoHead titleKey="privacy.seo.title" descriptionKey="privacy.seo.description" />

<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<Card as="section" tone="default" padding="lg" >
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-brand">Gästehaus Rader</p>
		<h1 class="mt-4 break-words font-serif text-4xl leading-[0.95] text-slate-900 sm:text-5xl">
			Datenschutz&shy;erkl&auml;rung
		</h1>
		<div class="mt-4 h-[3px] w-14 rounded-full bg-brand"></div>

		<div class="mt-8 space-y-8 text-sm text-slate-600 sm:text-base">
			<section>
				<h2 class="text-base font-semibold text-slate-900">1. Verantwortlicher</h2>
				<div class="mt-3 space-y-1">
					<p class="font-semibold text-slate-800">Gästehaus Rader</p>
					<p>Hueber Astrid</p>
					<p>Weißbriach 92</p>
					<p>9622 Weißbriach</p>
					<p>Österreich</p>
				<p class="mt-3">
						Telefon: <a class="hover:text-slate-900" href="tel:+434286222">+43 4286 222</a>
					</p>
					<p>
						E-Mail:
						<a class="hover:text-slate-900" href="mailto:info@rader-gitschtal.at">
							info@rader-gitschtal.at
						</a>
					</p>
				</div>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">2. Allgemeines zur Datenverarbeitung</h2>
				<p class="mt-3">
					Der Schutz Ihrer personenbezogenen Daten ist uns ein besonderes Anliegen. Wir verarbeiten
					personenbezogene Daten ausschließlich im Rahmen der gesetzlichen Bestimmungen, insbesondere der
					Datenschutz-Grundverordnung (DSGVO).
				</p>
				<p class="mt-3">
					Diese Datenschutzerklärung informiert Sie über Art, Umfang und Zweck der Verarbeitung
					personenbezogener Daten im Zusammenhang mit unserer Website / Svelte App.
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">3. Webanalyse mit Plausible (ohne Cookies)</h2>
				<p class="mt-3">
					Wir nutzen Plausible Analytics, um die Nutzung unserer Website zu verstehen und zu verbessern.
					Plausible verwendet keine Cookies und erstellt keine personenbezogenen Nutzerprofile.
				</p>
				<p class="mt-3">Dabei können insbesondere folgende Daten verarbeitet werden:</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>aufgerufene Seite / URL</li>
					<li>Referrer-URL</li>
					<li>Browsertyp und Betriebssystem</li>
					<li>Datum und Uhrzeit des Zugriffs</li>
				</ul>
				<p class="mt-3">
					Die IP-Adresse wird von Plausible nur gekürzt verarbeitet (anonymisiert).
				</p>
				<p class="mt-3">
					Zweck: Reichweitenmessung und Verbesserung unserer Website<br />
					Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
				</p>
				<p class="mt-3">
					Anbieter: Plausible Insights O&Uuml; (Plausible Analytics). Die Datenübermittlung erfolgt
					an den Plausible-Endpunkt (https://plausible.io/api/event).
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">4. Google Search Console</h2>
				<p class="mt-3">
					Wir nutzen die Google Search Console, um technische Informationen zur Auffindbarkeit unserer
					Website in der Google-Suche zu erhalten (z. B. Crawling- und Indexierungsdaten).
				</p>
				<p class="mt-3">
					Google Search Console verarbeitet keine personenbezogenen Daten unserer Website-Besucher. Es
					werden keine Cookies gesetzt, kein Opt-In benötigt und keine Tracking-Skripte auf der Website
					eingebunden.
				</p>
				<p class="mt-3">
					Zweck: Technische Analyse und Optimierung der Sichtbarkeit in Suchmaschinen<br />
					Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">5. Hosting bei DomainFactory</h2>
				<p class="mt-3">Unsere Website wird bei folgendem Hosting-Anbieter betrieben:</p>
				<div class="mt-3 space-y-1">
					<p class="font-semibold text-slate-800">DomainFactory GmbH</p>
				</div>
				<p class="mt-3">
					Beim Besuch unserer Website werden durch DomainFactory technisch notwendige Daten verarbeitet,
					um den sicheren und stabilen Betrieb der Website zu gewährleisten (Server-Logfiles).
				</p>
				<p class="mt-3">Dabei können folgende Daten verarbeitet werden:</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>IP-Adresse des Besuchers</li>
					<li>Datum und Uhrzeit des Zugriffs</li>
					<li>aufgerufene Seite / URL</li>
					<li>Browsertyp und Browserversion</li>
					<li>Betriebssystem</li>
					<li>Referrer-URL</li>
				</ul>
				<p class="mt-3">
					Zweck: Sicherer Betrieb und Fehleranalyse<br />
					Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
				</p>
				<p class="mt-3">
					DomainFactory verarbeitet diese Daten als Auftragsverarbeiter in unserem Auftrag gemäß Art. 28
					DSGVO.
				</p>
				<p class="mt-3">
					Speicherdauer: abhängig von den Server-Log-Einstellungen von DomainFactory (in der Regel wenige
					Tage).
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">6. Kontakt per E-Mail oder Telefon</h2>
				<p class="mt-3">
					Wenn Sie per E-Mail oder telefonisch mit uns Kontakt aufnehmen, werden die von Ihnen
					übermittelten Daten (z. B. Name, Kontaktdaten, Inhalt Ihrer Anfrage) verarbeitet, um Ihre
					Anfrage zu bearbeiten.
				</p>
				<p class="mt-3">
					Zweck: Bearbeitung von Anfragen<br />
					Rechtsgrundlage:
				</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>
						Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen), sofern Ihre Anfrage auf eine Buchung
						oder Leistung abzielt
					</li>
					<li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Kommunikation)</li>
				</ul>
				<p class="mt-3">
					Speicherdauer: Ihre Anfrage wird gelöscht, sobald sie abschließend bearbeitet ist, sofern keine
					gesetzlichen Aufbewahrungspflichten bestehen.
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">7. Schriftarten (lokal gehostet)</h2>

				<p class="mt-3">
					Unsere Website verwendet die Schriftart „Montserrat“. Diese Schriftart wird lokal auf unserem
					eigenen Server gespeichert und von dort geladen.
				</p>

				<p class="mt-3">
					Dabei wird keine Verbindung zu Servern von Google oder anderen externen Anbietern hergestellt.
					Es erfolgt somit keine Übertragung personenbezogener Daten an Dritte im Zusammenhang mit der
					Nutzung der Schriftart.
				</p>

				<p class="mt-3">
					Zweck: Einheitliche und ansprechende Darstellung unserer Website<br />
					Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">8. Google Maps</h2>
				<p class="mt-3">
					Auf unserer Website ist Google Maps eingebunden, um unseren Standort darzustellen. Die Karte
					wird erst nach Aktivierung geladen.
				</p>
				<p class="mt-3">
					Beim Aufruf der Kartenfunktion wird eine Verbindung zu Servern von Google Ireland Limited,
					Gordon House, Barrow Street, Dublin 4, Irland hergestellt. Dabei können folgende Daten
					verarbeitet werden:
				</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>IP-Adresse</li>
					<li>ggf. Standortdaten (abhängig von Ihren Geräteeinstellungen)</li>
					<li>Nutzungsdaten (Interaktion mit der Karte)</li>
				</ul>
				<p class="mt-3">
					Eine Übermittlung von Daten an Google-Server in den USA kann nicht ausgeschlossen werden.
				</p>
				<p class="mt-3">
					Zweck: Darstellung unseres Standorts und erleichterte Anfahrt<br />
					Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
				</p>
				<p class="mt-3">
					Wenn Sie mit der Datenübertragung an Google nicht einverstanden sind, können Sie Google Maps
					deaktivieren, indem Sie JavaScript in Ihrem Browser deaktivieren. Die Kartenanzeige steht dann
					nicht zur Verfügung.
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">
					9. Online-Buchung über externe Buchungsplattform (iFrame)
				</h2>
				<p class="mt-3">
					Auf unserer Website besteht die Möglichkeit, Appartements online zu buchen. Die
					Buchungsfunktion wird über eine externe Buchungsplattform der Tourismusregion
					Nassfeld-Pressegger See bereitgestellt und mittels iFrame in unsere Website eingebunden. Beim
					Aufruf der Buchungsmaske wird eine direkte Verbindung zu den Servern der jeweiligen Anbieter
					hergestellt.
				</p>

				<Card tone="muted" padding="sm" class="mt-4">
					<p class="text-sm font-semibold text-slate-900">
						Anbieter der Buchungsplattform (Verantwortlicher)
					</p>
					<div class="mt-2 space-y-1 text-sm text-slate-600">
						<p class="font-semibold text-slate-800">Nassfeld-Pressegger See Tourismus GmbH</p>
						<p>9620 Hermagor, Österreich</p>
					</div>

					<p class="mt-4 text-sm font-semibold text-slate-900">Technischer Systemanbieter</p>
					<div class="mt-2 space-y-1 text-sm text-slate-600">
						<p class="font-semibold text-slate-800">feratel media technologies AG</p>
						<p>Maria-Theresien-Straße 8, 6020 Innsbruck, Österreich</p>
					</div>
				</Card>

				<p class="mt-3">
					Beim Aufruf der Buchungsmaske wird eine direkte Verbindung zwischen Ihrem Browser und den
					Servern des Buchungsanbieters hergestellt. Dabei können insbesondere folgende
					personenbezogene Daten verarbeitet werden:
				</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>IP-Adresse</li>
					<li>Datum und Uhrzeit des Zugriffs</li>
					<li>Browser- und Geräteinformationen</li>
					<li>Buchungs- und Kontaktdaten, die Sie im Buchungsformular eingeben</li>
					<li>ggf. Informationen zur gewählten Unterkunft / Reisedaten</li>
				</ul>
				<p class="mt-3">
					Die Verarbeitung der Buchungsdaten erfolgt in eigener Verantwortung der jeweiligen Anbieter.
					Wir haben keinen Einfluss auf Art, Umfang und Zweck der Datenverarbeitung innerhalb der
					Buchungsmaske.
				</p>
				<p class="mt-3">
					Zweck: Bereitstellung einer Online-Buchungsmöglichkeit<br />
					Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw. vorvertragliche Maßnahmen)
				</p>
				<p class="mt-3">
					Es kann nicht ausgeschlossen werden, dass personenbezogene Daten in Drittländer (z. B.
					außerhalb der EU) übermittelt werden, abhängig von den eingesetzten Diensten der Anbieter.
				</p>
				<p class="mt-3">
					Weitere Informationen finden Sie in den Datenschutzerklärungen der Anbieter:
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
							Datenschutzerklärung
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
							Datenschutzerklärung
						</a>
					</li>
				</ul>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">10. Weitergabe von Daten</h2>
				<p class="mt-3">
					Wir geben personenbezogene Daten nicht an Dritte weiter, außer: dies ist zur Vertragserfüllung
					erforderlich, wir sind gesetzlich dazu verpflichtet oder Sie haben eingewilligt.
				</p>
				<p class="mt-3">
					Durch die Einbindung von Plausible Analytics und Google Maps k&ouml;nnen Plausible Insights
					O&Uuml; sowie Google als Empf&auml;nger Ihrer Daten auftreten (siehe Punkte 3 und 8). Bei
					Nutzung der Online-Buchung können die Nassfeld-Pressegger See Tourismus GmbH sowie feratel
					als Empfänger auftreten (siehe Punkt 9).
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">11. Ihre Rechte</h2>
				<p class="mt-3">
					Sie haben nach der DSGVO folgende Rechte: Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16
					DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO),
					Datenübertragbarkeit (Art. 20 DSGVO), Widerspruch gegen Verarbeitung (Art. 21 DSGVO).
				</p>
				<p class="mt-3">
					Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter:
					<a class="hover:text-slate-900" href="mailto:info@rader-gitschtal.at">
						info@rader-gitschtal.at
					</a>
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">12. Beschwerderecht</h2>
				<p class="mt-3">
					Wenn Sie glauben, dass die Verarbeitung Ihrer personenbezogenen Daten gegen Datenschutzrecht
					verstößt, haben Sie das Recht, sich bei der Aufsichtsbehörde zu beschweren.
				</p>
				<p class="mt-3">Österreichische Datenschutzbehörde</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">13. Datensicherheit</h2>
				<p class="mt-3">
					Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten vor Verlust,
					Missbrauch und unbefugtem Zugriff zu schützen. Unsere Website verwendet eine
					TLS-/HTTPS-Verschlüsselung.
				</p>
			</section>

			<section>
				<h2 class="text-base font-semibold text-slate-900">
					14. Änderungen dieser Datenschutzerklärung
				</h2>
				<p class="mt-3">
					Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Es gilt die jeweils
					aktuelle Version auf unserer Website.
				</p>
				<p class="mt-3">Stand: 20.02.2026</p>
			</section>
		</div>
	</Card>
</div>
