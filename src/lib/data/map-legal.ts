export const mapLegal = {
	de: {
		google: [
			'Auf der Kontaktseite verwenden wir Google Maps von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland, zur Darstellung unseres Standorts und zur Orientierung bei der Anreise. „Karte laden“ öffnet zunächst einen Datenschutzhinweis. Erst mit „Zustimmen & Karte laden“ wird die eingebettete Karte aktiviert. Die Zustimmung wird nicht dauerhaft gespeichert.',
			'Dabei erhält Google insbesondere deine IP-Adresse sowie Browser- und Geräteinformationen. Abhängig von deinen Google- und Browsereinstellungen können Cookies, Kontozuordnungen und Interaktionen mit der Karte verarbeitet werden. Eine Verarbeitung auf Servern außerhalb der EU, insbesondere in den USA, ist möglich. Einzelheiten zu Empfängern, Speicherdauer und internationalen Übermittlungen beschreibt Google in seiner Datenschutzerklärung.',
			'Über „Karte schließen“ kannst du die Einbindung wieder beenden. Beim Neuladen der Seite bleibt die Karte zunächst deaktiviert. Bereits übermittelte Daten werden dadurch nicht zurückgeholt. Unsere Website fragt deinen Gerätestandort nicht ab.',
			'Die Links „Route planen“ und „Route in Google Maps öffnen“ führen nach dem Anklicken zum externen Dienst. Bei der Umgebungskarte werden dabei Gästehaus und gewähltes Ziel als Routenpunkte übergeben, nicht dein Gerätestandort.'
		],
		osm: [
			'Die Umgebungskarte auf der Startseite verwendet Kartenkacheln der OpenStreetMap Foundation (OSMF). Sie dient zur Orientierung im Ort und in der Region und lädt erst nach „Karte laden“ Daten von tile.openstreetmap.org.',
			'Dabei werden IP-Adresse, Browser- und Geräteinformationen, aufrufende Seite, angeforderter Kartenausschnitt und Zeitpunkt an die OSMF bzw. ihre Auslieferungsserver übermittelt. Die OSMF nutzt ein weltweites Netz von Cache-Servern; eine Verarbeitung außerhalb der EU ist möglich. Angaben zur Speicherung und weiteren Verarbeitung findest du in der Datenschutzerklärung der OSMF.',
			'Wir fragen keinen Gerätestandort ab und speichern die Kartenaktivierung nicht dauerhaft. „Karte schließen“ beendet weitere Kartenabrufe; bereits übermittelte Daten bleiben hiervon unberührt.',
			'Die Routen wurden mit dem Dienst routing.openstreetmap.de von FOSSGIS e. V. (OSRM) vorbereitet und werden mit unserer Website ausgeliefert. Beim Wechsel von Ziel oder Fortbewegungsart wird keine Anfrage an diesen Routendienst gesendet. Geh- und Fahrzeiten sind Schätzungen ohne Live-Verkehr, Sperrungen, Wetterlage oder Parkplatzsuche und ersetzen keine aktuelle Navigation.'
		],
		basis: 'Rechtsgrundlage für das freiwillige Laden externer Karten: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Die weitere Einbindung kannst du jederzeit über „Karte schließen“ beenden.',
		privacy: 'Datenschutzerklärung', terms: 'Nutzungsbedingungen', routing: 'Informationen zum Routendienst'
	},
	en: {
		google: [
			'Our contact page uses Google Maps, provided by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland, to show the guesthouse location and help with arrival. “Load map” first opens a privacy notice. Only “Agree & load map” activates the embedded map. Your consent is not stored permanently.',
			'Google then receives your IP address and browser/device information. Depending on your Google and browser settings, cookies, account associations and map interactions may be processed. Processing outside the EU, including in the United States, is possible. Google’s privacy policy explains recipients, retention and international transfers.',
			'“Close map” removes the embedded map. Reloading the page leaves it disabled until activated again. This does not undo data already transmitted. Our website does not request your device location.',
			'“Get directions” and “Open directions in Google Maps” open the external service when clicked. The area map passes the guesthouse and selected destination as route points, not your device location.'
		],
		osm: [
			'The homepage area map uses map tiles supplied by the OpenStreetMap Foundation (OSMF) to show the village and region. It only requests tiles from tile.openstreetmap.org after you select “Load map”.',
			'These requests disclose your IP address, browser/device information, referring page, requested map area and request time to OSMF or its delivery servers. OSMF uses a worldwide network of cache servers, so processing outside the EU is possible. Its privacy policy explains storage and further processing.',
			'We do not request your device location or persist map activation. “Close map” stops further map requests; it does not undo data already transmitted.',
			'Routes were prepared using routing.openstreetmap.de, operated by FOSSGIS e. V. (OSRM), and are delivered with our website. Selecting a destination or travel mode does not send a request to that routing service. Walking and driving times are estimates without live traffic, closures, weather or parking and do not replace current navigation.'
		],
		basis: 'Legal basis for voluntarily loading external maps: Article 6(1)(a) GDPR (consent). You can stop further embedding at any time by selecting “Close map”.',
		privacy: 'Privacy policy', terms: 'Terms of use', routing: 'Routing service information'
	}
};
