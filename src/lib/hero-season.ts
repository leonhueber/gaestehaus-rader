// Month is 1–12. These are holiday ideas, not live opening/availability data.
export function getViennaMonth(date = new Date()): number {
	return Number(new Intl.DateTimeFormat('en', { month: 'numeric', timeZone: 'Europe/Vienna' }).format(date));
}

export function getGuestCardVisual(month: number | null) {
	return month !== null && month >= 5 && month <= 9
		? { src: '/images/Umgebung/nassfeld-lift.jpg', altKey: 'experiences.guestcard.imageAlt.summer' }
		: { src: '/images/Umgebung/skigebiet-weissbriach-2.jpg', altKey: 'experiences.guestcard.imageAlt.winter' };
}

export function getHeroExperienceIds(month: number): string[] {
	if (month === 1 || month === 2) return ['winter-ski', 'winter-ice'];
	if (month === 3 || month === 10 || month === 11 || month === 12) return ['winter-ski', 'winter-hike'];
	if (month === 4) return ['winter-ski', 'summer-bike'];
	if (month === 5) return ['summer-lake', 'summer-gorge'];
	if (month >= 6 && month <= 8) return ['summer-lake', 'summer-lift'];
	if (month === 9) return ['summer-lake', 'summer-hike'];
	return [];
}
