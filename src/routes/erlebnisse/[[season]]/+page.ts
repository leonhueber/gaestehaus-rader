import { getExperienceSeason, getViennaMonth } from '$lib/hero-season';

// Prerendered fallback for the season overview; the page switches to the visitor's current season after mount.
export const load = () => ({
	defaultSeason: getExperienceSeason(getViennaMonth()),
});
