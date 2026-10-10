# Website scope and operations

## Current scope

- Present Gästehaus Rader, its apartments, indicative prices and local experiences in German and English.
- Hand live availability and booking to Deskline. The site loads the provider's script/widget through `src/lib/deskline.ts`; it is not maintained as a simple iframe integration. The provider controls the booking interface and subsequent reservation flow.
- WebMCP exposes site facts, apartment recommendations, experience filtering, prepared inquiry links and navigation to booking. It does not itself send inquiries or complete reservations.
- Plausible tracking is integrated in `src/lib/analytics/plausible.ts`. Actual behavior depends on runtime configuration; inspect it when reviewing data processing.

## Content and booking expectations

- Keep prices, capacity, amenities and policies consistent with confirmed guesthouse information. Label indicative prices clearly; do not imply live availability from static data.
- Make the external booking handoff understandable and provide a contact option if loading fails. Do not treat a successfully loaded script as proof that the booking form works.
- Maintain the existing legal notice, privacy, terms, accessibility and image-credit pages in both languages, with footer links. Their presence alone does not establish completeness or legal compliance.
- Use images only with documented provenance and usage rights; identify generated imagery accurately where relevant.

## Items requiring confirmation

Keep these open until supported by provider documentation or an owner decision:

- Deskline's contractual role, data recipients, retention and any international transfers.
- Actual cookies, storage and network requests from the site and provider, and the resulting consent/disclosure requirements.
- Hosting and analytics configuration, corresponding privacy information and image-license records.
- Accuracy of business details, booking terms and the stated accessibility status.

This is an operational review list, not a completed legal assessment. Record confirmed answers here or in the relevant policy source rather than retaining outdated questions.
