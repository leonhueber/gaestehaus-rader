# Gästehaus Rader — Design guidelines

The website should feel **clean, modern and welcoming**. Convey the guesthouse's alpine character through photography, warm neutrals and clear content. Prioritize readability, space and an easy path to apartment details and booking.

## Visual system

- Use Montserrat for navigation, buttons, body text and functional headings. Use the existing `font-serif` stack for editorial page/section headings, following the “Über uns” page. Keep the distinction intentional; neither font should replace all headings globally. See the typography guidance below for compact sections and cards.
- Reuse shared colors and fonts from `tailwind.config.js` and `src/app.css`. The current foundation is warm off-white (`#fbfaf7`), dark neutral text and brand orange (`#f29200`). Use orange sparingly for primary actions and selected emphasis; verify text and control contrast for each pairing.
- Let headings stand on their own. Add a short kicker only when it provides context. Decorative dividers, wide uppercase tracking and serif headings are not required patterns.
- Use generous, consistent spacing and clear alignment. Prefer `max-w-6xl` for general content and narrower measures for reading-heavy sections; adapt to the content and viewport.
- Prefer open sections and simple grids. Use cards only to group meaningful units; keep corners, borders and shadows restrained. Avoid nested cards, decorative badges and competing background effects.

## Interaction and imagery

- Give each section a clear next action. Keep primary buttons visually consistent, secondary actions quieter, and link text descriptive. Avoid repeating the same call to action in adjacent blocks.
- Use `lucide-svelte` for interface icons; do not hand-code inline SVG icons. Pair unfamiliar icons with text.
- Use relevant images from `static/images`, consistent aspect ratios and intentional crops. Preserve room details and avoid crops or presentation that misrepresent the accommodation. Supply useful alt text; decorative images use empty alt text.
- Optimize photographs from the highest-resolution original, never by enlarging an existing thumbnail. Reuse the responsive image manifest and `imageAttrs()` with accurate `sizes` (including `object-cover` cropping). Supply several WebP widths for the actual display sizes and pixel densities; visually compare compression settings rather than treating a quality number as universal. Keep EXIF/GPS out of published derivatives, preserve source originals separately, and keep the first hero image eager/high-priority while later slides use lazy/low-priority loading. See [web.dev image performance](https://web.dev/learn/performance/image-performance).
- Build mobile first: readable wrapping in both languages, touch targets of at least 44 × 44 CSS pixels and visible keyboard focus. Prevent page-level horizontal overflow; intentional card and thumbnail rails scroll within their own container. Never rely on color or hover alone to communicate state.
- Keep motion subtle and purposeful, honor reduced-motion preferences, and avoid animations that delay access to content. Loading, empty and error states must explain what happens next.

## Typography and copy

These conventions capture the design decisions agreed on 2026-10-19. Match the role and density of the section rather than copying the largest heading on another page.

| Role | Direction |
| --- | --- |
| Editorial page/section title | Existing `font-serif`, normal or medium weight, dark slate. Use “Über uns” as the font reference; scale down for compact sections. |
| Contact section | Main title: 30px mobile / 36px desktop. Subheadings: 20px serif, normal weight. Contact values, address and payment details: 14px; supporting labels: 12px. |
| Seasonal feature title | Montserrat, medium weight, approximately 28–32px. Keep it subordinate to the section heading; avoid oversized, heavy serif text inside the card. |
| Card title / control | Montserrat, medium or semibold; usually 14–18px according to hierarchy. |
| Body copy | Normally 16px with comfortable line height. Use 14px for compact information groups, not as a global reduction. |
| Secondary label | Usually 12–14px. Keep it readable and allow long German/English labels to wrap. |

- Use short, concrete copy. Do not add promotional headings and paragraphs to cards that already communicate through a photo, name and key facts.
- Keep general gallery introductions season-neutral, for example “dein Rückzugsort und der Blick in die Berge”. Seasonal captions may describe the actual summer or winter photo.
- Preserve the established orange kicker where it helps orient the reader. Avoid adding a kicker, underline and extra introductory sentence to every component.
- Keep prices and numbers compact and aligned. Put qualifications such as the local-tax age threshold and per-person/per-night basis on a separate, quieter line. Read amounts and translations from shared content; do not duplicate them in styling code or this guide.

## Cards and mobile layout

- Use white surfaces, subtle slate borders and restrained rounding: normally 16px for cards, 12px for small supporting cards. Interactive cards gain only a soft shadow on hover; avoid dark hover borders, strong lifts and scaling. Keyboard focus must remain clearly visible.
- Apartment cards lead with a large, consistent photo. Below it, show “Appartement Nr. …”, area/guest capacity and the base price with its night label. Keep the footer compact, with facts on the left and price on the right when space allows. Avoid extra marketing paragraphs or a redundant details button inside a whole-card link.
- The homepage apartment section does not need the removed “Drei Appartements. Finde deinen Lieblingsplatz.” introduction. Keep “Alle Appartements ansehen” and its arrow in the primary brand color; retain an accessible focus treatment and check text contrast.
- On mobile, use a horizontal rail for the homepage apartment and benefit cards, with a glimpse of the next card and scroll snapping. Do not turn these compact groups into a long stack of tall cards. Preserve normal vertical scrolling and keyboard access.
- Combine Google, Booking.com and Airbnb in one review-summary card. Give each platform its own link, recognizable logo, score with its original scale and review count only when available. Separate rows subtly; avoid nested cards and duplicate platform links below. Keep individual review quotations in separate cards.
- Navigation sidebars use plain icons and calm rows. Indicate the active row with a small orange accent and pale background; avoid a separate rounded icon box inside every rounded row. Let filter chips wrap naturally.

## Tooltips and fullscreen galleries

- Reuse `tooltipClasses` from [ui/styles.ts](src/lib/components/ui/styles.ts): warm off-white surface, subtle border, dark text, small radius and soft shadow. Do not introduce dark tooltip bubbles.
- Anchor a tooltip to its own trigger. Hero/gallery-dot tooltips sit directly above the relevant dot, not at the center of the whole navigation. Keep them within the viewport and usable on keyboard focus; essential information must not depend on hover.
- Use [GalleryLightbox.svelte](src/lib/components/GalleryLightbox.svelte) for every fullscreen image gallery, including the house, seasonal and apartment galleries. Improve this shared component instead of creating page-specific lightbox styles.
- Fullscreen galleries use a warm off-white backdrop, a white surface, subtle slate borders and a soft shadow. Keep the header, caption and thumbnail strip light; do not use a black backdrop or dark translucent footer.
- Use a quiet close button in the header and shared white secondary buttons for previous/next navigation, centered on the image area. Keep labels localized and preserve Escape/arrow-key navigation.
- Display the full image with `object-contain`, including floor plans. Allow captions to wrap, keep the count secondary, and use a horizontally scrollable thumbnail strip with an orange selection ring and a visible keyboard focus state.
- Size the image area around the controls and available viewport height. On small screens, keep close/navigation controls reachable and captions scrollable if necessary.
- Preview cards do not need decorative fullscreen/expand icons. The image/card can open the gallery with an accessible label; retain the explicit “Alle Bilder ansehen” action for discovery.

## Contact and map consent

- Keep contact information compact, with a clear hierarchy between labels and values. Use the serif heading treatment specified above, not large bold sans-serif headings throughout the section.
- The contact map card initially shows the consent explanation on a softly faded house photo, with the address and route link below. Match the site's light surfaces and shared buttons.
- Load the embedded map only after explicit consent. Restyling must not bypass consent, hide the privacy explanation or remove the close/cancel actions.

## Shared UI components

Use `src/lib/components/ui/` for repeated controls and surfaces:

| Component | Purpose | Options |
| --- | --- | --- |
| `Button` | An action; defaults to `type="button"` | `variant`: primary, secondary, overlay, ghost; `size`: sm, md, lg, icon |
| `ButtonLink` | Navigation styled as a button; requires `href` | Same variants; sm, md, lg sizes |
| `Card` | Non-interactive content; `as`: div, section, article | `tone`: default, muted, accent, quiet; `padding`: none, sm, compact, md, lg |
| `CardLink` | A whole card that navigates; requires `href` | Same tone and padding options |
| `CardButton` | A whole card that performs an action, such as opening a gallery | Same tone and padding options |

- Native attributes, event handlers and ARIA labels pass through to the element. Use `bind:element` on buttons/links when a DOM reference is needed. Icon-only buttons need an accessible label; form submission requires `type="submit"`.
- Use `quiet` for small supporting cards: white surface, subtle border, 12px corners. `compact` keeps padding at 24px across breakpoints.
- Keep localized URL creation in the page. Do not nest links or buttons inside interactive cards.
- Use `class` for placement, width and content layout. Change colors, corners, padding, focus and hover styles centrally in `ui/styles.ts`, not at each call site. Primary buttons use dark text on orange for contrast; overlay buttons are for dark/image backgrounds.
- If a native element must retain a Svelte transition directive, reuse `buttonClasses` or `cardClasses` from `ui/styles.ts`. Specialized controls such as tabs, thumbnails and modal backdrops can retain their own behavior and layout.

## Reviewing design changes

- Start from the existing components and the user's latest accepted reference. When explicitly asked for mockups or alternatives, present three distinct directions before implementing the selected one. Apply concrete corrections to an established design directly.
- Inspect desktop and mobile layouts in German and English, including long labels, card scrolling, gallery controls, keyboard focus and loading/error states. Check contrast rather than assuming a brand color is suitable for every text size.
- Follow [AGENTS.md](AGENTS.md) for technical checks. A successful type check or build does not establish visual quality. If browser inspection is blocked, record the limitation and do not claim visual verification.

These rules guide future edits; they are not a claim that every existing page already meets them. Update shared patterns deliberately rather than introducing a new visual style on each page.
