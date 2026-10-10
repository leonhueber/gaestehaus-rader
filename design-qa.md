# Homepage hero QA — 2026-10-10

Current status: implementation in progress; final visual review deferred at the user's request.

## Supporting benefit cards — 2026-10-10

- Rebuilt the four cards using shared `Card` with a `quiet` tone (white, subtle border, 12px corners) and `compact` padding (24px). Removed icon circles, decorative dividers, shadows, hover movement and reveal animation. Shortened DE/EN titles and body copy; supporting text stays at 16px.
- The content row is capped at 1152px excluding page gutters: four 270px cards with 24px gaps on desktop, two columns on tablet and one on small phones. It shares its content container with the apartment overview.
- Essential browser checks: measured all four cards at 270 × 168px on a 1440px viewport, with 24px padding, 12px radius and no shadow. DE/EN bodies fit one or two lines. The 820px viewport shows two columns; 390px shows one with no overflow inside the section. These are targeted component checks; the full responsive/site review remains deferred.
- Svelte check: 0 errors and 0 warnings. Static production build passed. Desktop evidence: `C:/Users/hueberl/.codex/visualizations/2026/10/10/01a126b2-09ed-7f50-9f06-beba60c69376/usp-cards-clean-desktop.png`.

## Carousel expansion — 2026-10-10

- Faster carousel: slide duration reduced from 7 to 5 seconds. Resume still starts at 50%, now leaving 2.5 seconds to the next image. This supersedes earlier duration notes; progress fill shares the same timer.
- Apartment kicker restored at the user's request: “Ein Blick in unsere Appartements” and its existing English translation appear above apartment titles again, with the original title spacing. This supersedes the removal note below.
- Hero loading copy: removed the visible “Bild wird geladen …” / “Loading image …” message. Image loading and actual failure feedback are unchanged; no placeholder text appears while a photo loads.
- Resume tooltip: the paused active dot now shows only “Karussell fortsetzen” / “Resume slideshow”, also used as its accessible name. Other dots retain their image titles. This supersedes earlier resume labels containing the current image title.
- Nr. 3 imagery: replaced the 1024 × 576 main image with responsive derivatives of the matching 4032 × 2268 `Schlafzimmer.jpeg` original from `Bilder/Nr3/Neue Bilder`. Shared accommodation data updates the hero, overview and detail page. Gallery now shows `Kochnische.jpeg` and `Balkon.jpeg` instead of the equipment/shelf close-ups, with matching DE/EN alternative text and categories. Original files remain unchanged. WebP quality 82 / effort 6, metadata stripped, no enlargement: main image 480–3840px (2560px: 178 KiB; 3840px: 301 KiB), gallery additions 480–2560px. Apartment hero `sizes` accounts for both 4:3 and 16:9 source ratios when using cover.
- Nr. 3 essential verification: Svelte check passed with no errors/warnings; static production build passed and incidental build files were restored. Browser at 2560 × 1440 loaded the 2560px main image; both added gallery images loaded through the lightbox. Full responsive/DE–EN review remains deferred. Hero evidence: `C:/Users/hueberl/.codex/visualizations/2026/10/10/01a126b2-09ed-7f50-9f06-beba60c69376/hero-nr3-original.png`.
- Apartment hero copy: removed the introductory kicker above apartment titles in DE/EN, including its title spacing. Other slide kickers remain. Full responsive review remains deferred.
- Experience hero actions: removed both action links and their spacing from seasonal experience slides in DE/EN. Welcome, summer-house and apartment slides retain their existing actions; carousel navigation remains available. Full responsive review remains deferred.
- Experience hero copy: removed the separate location line below the title for DE/EN. Apartment size and occupancy remain; absent metadata no longer renders an empty paragraph. No additional responsive review for this text-only simplification.
- Initial-height follow-up: user reported half-height hero growing after load. Full hero minimum height is now declared inline on the outer section in the server-rendered markup, and the content inherits it, reserving the area independently of page stylesheet arrival. At a 2048 × 1019 viewport, the initial section, content and images measured 906px high before seasonal hydration. The original transient half-height state was not reproduced at scroll position zero; one partial view was explained by restored scroll position. This is a defensive initial-layout fix, pending confirmation of the user's exact loading scenario. Full responsive review remains deferred.
- Continue timing follow-up: resuming a paused slide now starts progress at 50%, leaving 3.5 seconds until the next image. Subsequent slides retain their full 7-second interval. This supersedes earlier notes about restarting with a fresh full interval. Typecheck: 0 errors/warnings. Browser confirmed a roughly half-filled disc immediately after resume and the next slide after 3.7 seconds. Detailed responsive review remains deferred.
- Nr. 2 hero now uses the matching 4032 × 3024 original (`Bilder/Nr2/IMG_1889 2.heic` in the authorized iCloud source folder), decoded at full resolution. The iCloud original remains unchanged. A metadata-free quality-94 JPEG source is retained in `static/images/Nr2/nr2-bedroom-overview-original.jpg`; browser variants were encoded directly from the decoded original as WebP quality 82 / effort 6, without enlargement, at 480, 768, 1280, 1920, 2560 and 3840 pixels. Quality 76/82/88 detail crops were compared visually; 82 balances texture detail and size (1920: 256 KiB; 2560: 406 KiB; 3840: 732 KiB).
- Image delivery uses the existing manifest and `imageAttrs()`. Nr. 2's `sizes` accounts for its 4:3 source covering the full-width hero, including the minimum hero height. First-slide loading priority is unchanged. Browser checks at 2560 × 1440 and 3840 × 2160 confirmed selection of the corresponding 2560/3840 WebP files. All six variant dimensions and absence of EXIF/XMP were checked. `npm run check`: 0 errors/warnings; `npm run build`: passed, and prerendered HTML includes all six variants. Full responsive review remains deferred. Evidence: `C:/Users/hueberl/.codex/visualizations/2026/10/10/01a126b2-09ed-7f50-9f06-beba60c69376/hero-nr2-original-2560.png`.
- Latest resume design: a bare white Play icon replaces the active dot while paused, within the same hit target. No separate button above or beside the dots remains. Clicking the running active dot pauses; clicking its paused Play icon resumes; choosing another dot pauses on that image. Dot focus alone does not change playback state, preventing focus-before-click from reversing the intended action. Accessible label and tooltip include the image title and resume action. This supersedes the earlier playback-control variants below.
- Inline resume check: typecheck passed (0 errors/warnings). Browser confirmed dot selection pauses, the same target starts playback and restores the fill indicator, and clicking that running dot pauses again. Six controls remain, with no additional playback button. Detailed responsive checks stay deferred.
- Resume-only follow-up: playback control appears only while paused, directly above the active dot, with no extra column or Stop control. Clicking a dot still stops playback; Play starts a fresh interval and disappears. Paused dot tooltips sit above the Play button to avoid overlap. This supersedes the Pause/Play toggle described below.
- Resume-only essential checks: typecheck passed with 0 errors/warnings. Browser confirmed button centered exactly above the selected dot, removed on Play, with progress animation restarting; selecting another dot restores the control at that dot. Responsive checks remain deferred.
- Playback control: a shared overlay icon button beside the dots toggles Pause/Play with localized accessible labels and a title. Restart begins a fresh 7-second interval on the selected image. Focusing/clicking this control is exempt from the hero's automatic pause handler; selecting an image or focusing other hero controls still pauses. Reduced-motion users can explicitly start playback. Responsive placement remains part of the deferred review.
- Playback verification: Svelte diagnostics passed with 0 errors/warnings. Desktop browser confirmed manual selection → Play → automatic advance, Pause removing progress animation, and Enter toggling both states. Screenshot: `C:/Users/hueberl/.codex/visualizations/2026/10/10/01a126b2-09ed-7f50-9f06-beba60c69376/hero-playback-control.png`.
- Dot animation follow-up: removed the travelling dot and its 450ms transfer phase at the user's request. The active disc still fills clockwise over 7 seconds, then the image advances directly and the next disc starts filling. Manual selection still pauses autoplay. Earlier flight-animation checks below are historical.
- Summer-house photo in winter mode (October–April, matching the site's May–September summer split): welcome copy and buttons now use the lower-left layout and its local shade. Alignment is independent of apartment/experience content, so the house slide retains its existing headline, introduction and links. Current month comes from the browser's Europe/Vienna date. Detailed responsive review remains deferred.
- Shading follow-up: replaced the full-height info overlay with a soft lower-left radial shade. Upper/right photo areas fade to transparent; centered welcome shading also fades completely. A small local shade supports the dots instead of a dark strip across the full bottom edge. Svelte diagnostics: 0 errors/warnings. Essential desktop visual check only; final responsive contrast/crop checks remain deferred.
- Six slides after removing Nr. 1 at the user's request: winter balcony view, apartments Nr. 2 / Nr. 3, summer house photo and two monthly experience highlights. Apartment and experience copy/photos come from shared data. Every detail slide uses the lower-left info mode and localized links. Earlier seven-slide checks below document the prior state.
- Seasonal highlights are selected on mount using the current month in Europe/Vienna, independently of the static build date. At the user's request, winter promotion starts in October with Nassfeld and Skigebiet Weißbriach. Summer emphasizes lakes/lifts; winter emphasizes skiing and, in January/February only, nature ice. These are holiday ideas, not verified live opening conditions.
- Experience buttons link to the matching card anchor on the localized seasonal page; the existing automatic season scroll now respects these anchors. Seven 36px-wide dot targets keep the row compact; the flying dot uses the matching spacing. Tooltips are centered above the group.
- Essential checks: Svelte diagnostics passed with 0 errors/warnings. Three Node tests passed, checking all 12 months, real image paths, bilingual data and seasonal boundaries. Desktop browser check verified seven controls, Nr. 1/Nr. 3 copy and links, all seven images loaded, DE → EN → DE, localized experience URLs, the Garnitzenklamm anchor target and manual selection staying paused. No captured browser console errors.
- Static production build passed (initial sandbox EPERM resolved by running the approved build outside the sandbox). Prerendered homepage contains five base slides; the browser adds two monthly highlights. Homepage sitemap date is 2026-10-10 with DE/EN alternates. Incidental generated build output was restored.
- Desktop evidence: C:/Users/hueberl/.codex/visualizations/2026/10/10/01a126b2-09ed-7f50-9f06-beba60c69376/hero-season-experience.png (1440 × 900 CSS viewport).
- Deferred: responsive wrapping/crops for all six slides in both languages, six-dot tooltip/touch layout, full autoplay loop and interruption checks. Earlier three-slide QA below is historical and does not establish these new checks.

## Latest selected direction: centered hero (option 1)

- Typography follow-up: user explicitly restored the former serif hero style (`font-serif`, medium weight, 60px desktop) after selecting the centered layout. This supersedes the Montserrat hero measurements and screenshots below; navigation and body text remain Montserrat. The repository design guideline now records this selective serif accent.
- Selected reference: `C:/Users/hueberl/.codex/generated_images/01a126b2-09ed-7f50-9f06-beba60c69376/exec-a6310886-24f0-4dc4-88d8-8a8c1ed40f3f.png` (1777 × 885).
- Implementation capture: `C:/Users/hueberl/.codex/visualizations/2026/10/10/01a126b2-09ed-7f50-9f06-beba60c69376/hero-centered-option-1.png` (1762 × 878); CSS viewport 1777 × 885, DPR 1. Browser capture is slightly scaled; comparison uses proportional alignment rather than raw pixel differences.
- State: German homepage, winter balcony image selected. Text and actions centered; headline has the selected two-line break. The 113px shared header remains intentionally taller than the mockup, as previously requested.
- Essential visual check: Montserrat at 52px on desktop, centered spacing and orange shared action match the direction. A centered shade replaces the left-heavy overlay. Original guesthouse photography and logo are retained instead of the generated approximation. Existing translated copy is preserved. Full-view reference and implementation inspected together; text and controls are readable at this size, so no separate detail crops were needed.
- `npm run check`: 0 errors and 0 warnings. All three hero images loaded; selecting the winter dot works; no captured browser console errors.
- Essential desktop result: passed. Extended design QA, responsive checks and remaining checklist items below stay deferred at the user's explicit request. This is not full-site approval.

## Current implementation and verification scope

- Appartement info mode: the Nr. 2 slide moves the text from the centered welcome position to the lower left with a 650ms FLIP transition and a matching shade crossfade. It shows the apartment title, size, occupancy and description from shared accommodation data, plus localized detail/overview links. Other slides retain the centered welcome. Reduced motion disables the text movement. Typecheck passed (0 errors/warnings); desktop screenshot, actual text transform, return to welcome and navigation to Nr. 2 were checked. Screenshot: `C:/Users/hueberl/.codex/visualizations/2026/10/10/01a126b2-09ed-7f50-9f06-beba60c69376/hero-apartment-info.png`. Responsive checks remain deferred.
- Hero carousel: winter balcony view, bright apartment Nr. 2 and summer house photo. Three centered dots replace captions, arrows and playback buttons. The active 12px disc fills clockwise over 7 seconds, then travels on a small arc to the next dot over 450ms, including the last-to-first transition. The image advances on arrival; fill and travel share the animation clock. Selecting a dot chooses the image and stops autoplay for this page visit. Clicking anywhere on the hero or focusing its controls also stops autoplay and cancels travel. Reduced-motion preference disables initial autoplay; hidden tabs suspend the clock. Copy and actions remain fixed.
- German headline: “Ihr Rückzugsort für alpine Gelassenheit”. English: “Your retreat for alpine serenity”.
- Shared header uses the wide layout across pages.
- Summer framing follow-up: image position moved from `40% 20%` to `40% 65%` to reveal more of the lower house area in wide viewports. Shared desktop header gains 16px of height (113px total), with a 64px logo. `npm run check`: 0 errors and 0 warnings. Full responsive review remains deferred.
- During implementation, run essential diagnostics and smoke checks for changed core behavior. Batch detailed visual and responsive checks after the remaining design changes, as requested on 2026-10-10.
- Carousel smoke checks already passed before the latest headline edit: all three images load, forward/backward navigation wraps correctly, arrow keys work, translated labels update, and no browser console errors were captured.
- After the final headline edit: `npm run check` passed with 0 errors and 0 warnings; `npm run build` completed successfully. Detailed browser checks were deferred as requested.
- Autoplay follow-up: `npm run check` passed with 0 errors and 0 warnings. Browser smoke check confirmed automatic advance, pause holding the selected image beyond the interval, resume advancing again, and manual next wrapping to the first slide while pausing autoplay. No captured console errors. No additional responsive review or production build for this interaction-only change.
- Dot-navigation follow-up (supersedes previous controls): `npm run check` passed with 0 errors and 0 warnings. Browser smoke check confirmed three image-selection buttons, advancing ring and automatic image change, then selecting apartment Nr. 2 and retaining it beyond the 7-second interval with no progress animation. No captured console errors. Responsive and extended interaction checks remain deferred.
- Filled-dot follow-up: active dots now fill clockwise, then move to the next position along a small arc. Browser DOM sampling confirmed the moving dot changing its horizontal and vertical position; the visible dot is 12px. Each dot also exposes its localized image title on hover and keyboard focus. Full transition interruption/reduced-motion and tooltip edge-position checks remain in the deferred review.

## Deferred final checks

- [ ] Winter GästeCard image crop on homepage and experiences page: now uses `skigebiet-weissbriach-2.jpg`, matching the “Skigebiet Weißbriach” experience. DE/EN alternative text updated.
- [ ] Responsive layout at narrow mobile, tablet and desktop widths, including the final headline in DE and EN; check overflow and text wrapping.
- [ ] Image crops, text contrast and caption/control spacing for all six hero images at each relevant viewport.
- [ ] Consistent header width and navigation across pages, including mobile navigation and language switching.
- [ ] Full keyboard/focus review, screen-reader announcements and reduced-motion behavior.
- [ ] Autoplay lifecycle: hidden tab/return, leaving/returning to the homepage, changing reduced-motion preferences and translated playback controls.
- [ ] Slow-loading and failed-image states; carousel remains usable.
- [ ] Final DE → EN → DE pass and both hero action links after all design edits.
- [ ] Final visual comparison and fresh screenshots. Earlier screenshots do not represent the latest headline and carousel together.

## Historical review of the initial static hero

The results below describe earlier iterations, not final approval of the current carousel. The later carousel supersedes the winter-house photo choice and seasonal hero selection described below.

## Reference and scope

- Selected visual: mockup 2, `C:/Users/hueberl/.codex/generated_images/01a126b2-09ed-7f50-9f06-beba60c69376/exec-a64a53f6-ff53-4bca-91fa-c690c666a02e.png` (1774 × 887 pixels).
- Implementation: `http://127.0.0.1:5173/`, German homepage, winter image, top of page, default interaction state.
- Final capture: `C:/Users/hueberl/.codex/visualizations/2026/10/10/01a126b2-09ed-7f50-9f06-beba60c69376/hero-desktop-final.png` (1759 × 880 pixels).
- Browser CSS viewport: 1774 × 887, devicePixelRatio 1. The browser capture is scaled by approximately 0.9915; comparison used proportional visual alignment, not raw pixel differences.
- Full reference and implementation were opened together for comparison. Typography and controls were readable at full-view scale, so additional cropped comparisons were unnecessary.
- User constraint: retain repository typography. Montserrat, sentence-case context line, generous line height and existing shared button styling intentionally take precedence over literal mockup lettering and corner radii.
- Existing real photograph and logo reused. The seasonal image selection remains intact.

## Comparison history

1. Initial desktop capture (`hero-desktop-first.png` in the evidence directory above): the left sky was noticeably darker than the selected mockup; the header was taller than needed. Reduced header height and faded the readability overlay toward the top.
2. Compact desktop check at 1024 × 768: extended the dark area beneath the full text measure and explicitly retained 1.15 headline line height at larger breakpoints. Strengthened the bottom shade behind the small photo caption.
3. Final reference/implementation comparison: full-width winter image, open right side, left-aligned two-line headline, one orange primary action and quiet secondary link match the selected direction. No actionable P0/P1/P2 findings remain.

## Browser checks

- Final `npm run check`: 0 errors and 0 warnings. Final `npm run build`: static output generated successfully.
- Desktop: German and English at 1774 × 887; German additionally at 1024 × 768.
- Mobile: German and English at 390 × 844; German additionally at 320 × 740. No document-level horizontal overflow or clipped hero text. The existing mobile navigation scrolls within its own row.
- Computed typography: Montserrat; desktop headline 60px / 69px, weight 600; mobile headline 36px and body 16px.
- DE → EN → DE: translated hero copy and localized navigation update correctly.
- English primary action opens the apartment overview; German secondary action opens the experiences page.
- Both hero actions expose a visible white 2px keyboard focus outline.
- Hero image loaded successfully; no captured browser console errors.
- Hero copy is visible immediately without reveal-animation delays. A dark base background remains if the photograph fails to load.

## Limits and follow-up

- Photo follow-up: user selected the exact house photograph used by “Winterzeit in Kärnten”, `static/images/Haus/gaestehaus-winter.png`. Hero now uses its existing responsive image variants. Latest desktop evidence: `C:/Users/hueberl/.codex/visualizations/2026/10/10/01a126b2-09ed-7f50-9f06-beba60c69376/hero-winter-house.png`. Mobile crop keeps the front gable in view; typography and layout are unchanged. Earlier landscape captures document the initial design only.

- Winter imagery verified visually; summer imagery and a simulated image network failure were not separately exercised.
- This review covers the changed header and hero, not a full-site accessibility audit or booking-widget regression test.
- Existing small-screen navigation remains horizontally scrollable. No redesign of that interaction is included.
