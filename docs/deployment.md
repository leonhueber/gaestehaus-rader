# Website veröffentlichen: DomainFactory / cPanel

Stand: 14.10.2026. Ablauf vom Betreiber bestätigt.

## Vorbereiten im Repository

1. Änderungen prüfen: `npm run check` und die relevanten Tests mit `node --test tests/*.test.cjs`.
2. Produktionsbuild erstellen: `npm run build`. Für `rader-gitschtal.at` ohne GitHub-Pages-Unterpfad bauen; keine Preview-Umgebungsvariablen verwenden.
3. Mit `npm run preview` den statischen Build prüfen, insbesondere Bilder, Deutsch/Englisch und die geänderten Funktionen.
4. Quellcode **und den vollständigen `build/` im selben Commit speichern**. Dazu gehören `.htaccess`, HTML, `_app/`, Bilder und die Löschung veralteter Build-Dateien. Keine fremden offenen Änderungen mit aufnehmen.
5. Den Release-Commit nach `main` pushen und seinen Commit-Hash notieren.

**Wichtig:** cPanel führt keinen npm-Build aus. Ein Commit mit ausschließlich Quellcode veröffentlicht weiterhin den alten Stand aus `build/`. Geprüfte Release-Builds deshalb nicht per `git restore -- build` zurücksetzen.

## Veröffentlichen im Hosting

1. [DomainFactory-Kundenmenü öffnen](https://admin.df.eu/kunde/index.php?module=cpanel) und anmelden.
2. Auf **Login** klicken, um zum Hosting zu gelangen.
3. Beim Hosting das **Drei-Punkte-Menü** öffnen und **cPanel Administrator** wählen.
4. **Git Version Control** öffnen und beim Repository **gaestehaus-rader** auf **Manage** klicken.
5. Zum Tab **Pull or Deploy** wechseln.
6. **Update from Remote** klicken und auf den erfolgreichen Abschluss warten.
7. Prüfen: **Currently Checked-Out Branch = main** und **HEAD Commit = erwarteter Release-Commit**. Bei Fehlern oder abweichendem Commit zuerst die Ursache klären.
8. **Deploy HEAD Commit** klicken und auf den erfolgreichen Abschluss warten.
9. Unter **Last Deployment Information** den deployten SHA mit dem Release-Commit vergleichen.
10. [rader-gitschtal.at](https://rader-gitschtal.at/) neu laden und die geänderten Bereiche in Deutsch und Englisch prüfen. Bei scheinbar altem Inhalt einmal hart neu laden.

## Technischer Hintergrund

- Repository im Hosting: `/home/ycmjxegouest/repositories/gaestehaus-rader`.
- Produktionsziel laut `.cpanel.yml`: `/home/ycmjxegouest/gaestehaus-rader/`.
- `.cpanel.yml` entfernt vor dem Kopieren die bisherigen nicht versteckten Dateien im Produktionsziel und kopiert anschließend `build/.` dorthin. Deshalb vor **Deploy HEAD Commit** sicherstellen, dass der richtige Commit den vollständigen geprüften Build enthält; bei einem Kopierfehler kann die Website vorübergehend fehlen.
- Lokales Git-Remote: `https://github.com/leonhueber/gaestehaus-rader`. Der bereitgestellte Hosting-Screenshot zeigt noch den früheren Namen `HLeonidas`; entscheidend ist, dass **Update from Remote** den erwarteten Release-Commit abruft.
- Der GitHub-Pages-Workflow ist ein separater Preview-Deploy und ersetzt diese cPanel-Schritte nicht.

Passwörter und Zugangsdaten gehören nicht in diese Anleitung. Die bevorzugte Wissensablage ist die [Knowledge Base in Notion](https://app.notion.com/p/3f9aadb8aea58167aab5f6b27914fadb), mit der [vollständigen Deployment-Anleitung](https://app.notion.com/p/3f9aadb8aea58104b629e931c4a6268c). Diese Repo-Datei bleibt die technische Referenz; die vorhandene iCloud-Kopie ist ein früherer Export.
