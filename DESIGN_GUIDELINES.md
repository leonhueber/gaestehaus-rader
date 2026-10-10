# Design direction

The website should feel **clean, modern and welcoming**. Convey the guesthouse's alpine character through photography, warm neutrals and clear content. Prioritize readability, space and an easy path to apartment details and booking.

## Visual system

- Use the existing Montserrat family for headings and body text, with a clear hierarchy of size and weight. Keep body text comfortably readable, normally `text-base` with generous line height; reserve smaller text for secondary details.
- Reuse shared colors and fonts from `tailwind.config.js` and `src/app.css`. The current foundation is warm off-white (`#fbfaf7`), dark neutral text and brand orange (`#f29200`). Use orange sparingly for primary actions and selected emphasis; verify text and control contrast for each pairing.
- Let headings stand on their own. Add a short kicker only when it provides context. Decorative dividers, wide uppercase tracking and serif headings are not required patterns.
- Use generous, consistent spacing and clear alignment. Prefer `max-w-6xl` for general content and narrower measures for reading-heavy sections; adapt to the content and viewport.
- Prefer open sections and simple grids. Use cards only to group meaningful units; keep corners, borders and shadows restrained. Avoid nested cards, decorative badges and competing background effects.

## Interaction and imagery

- Give each section a clear next action. Keep primary buttons visually consistent, secondary actions quieter, and link text descriptive. Avoid repeating the same call to action in adjacent blocks.
- Use `lucide-svelte` for interface icons; do not hand-code inline SVG icons. Pair unfamiliar icons with text.
- Use relevant images from `static/images`, consistent aspect ratios and intentional crops. Preserve room details and avoid crops or presentation that misrepresent the accommodation. Supply useful alt text; decorative images use empty alt text.
- Build mobile first: readable wrapping in both languages, comfortable touch targets, visible keyboard focus and no horizontal overflow. Never rely on color or hover alone to communicate state.
- Keep motion subtle and purposeful, honor reduced-motion preferences, and avoid animations that delay access to content. Loading, empty and error states must explain what happens next.

These rules guide future edits; they are not a claim that every existing page already meets them. Update shared patterns deliberately rather than introducing a new visual style on each page.
