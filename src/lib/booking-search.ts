const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isIntegerInRange = (value: unknown, minimum: number, maximum: number): value is number =>
	typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum;

export const isValidDate = (value: unknown): value is string => {
	if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const todayInAustria = () => {
	const parts = new Intl.DateTimeFormat('en', {
		timeZone: 'Europe/Vienna',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).formatToParts(new Date());
	const part = (type: string) => parts.find((value) => value.type === type)!.value;
	return `${part('year')}-${part('month')}-${part('day')}`;
};

export const maximumGuests = (guestsLabel: string) => {
	const values = guestsLabel.match(/\d+/g)?.map(Number) ?? [];
	return values.length > 0 ? Math.max(...values) : 0;
};

export type BookingStay = {
	checkIn: string;
	checkOut: string;
	adults: number;
	childAges: number[];
};

export function validateStay(values: Record<string, unknown>, capacity?: number): BookingStay | string {
	if (!isValidDate(values.checkIn) || !isValidDate(values.checkOut) ||
		values.checkIn < todayInAustria() || values.checkOut <= values.checkIn) {
		return 'Provide a valid future or current check-in and a later check-out (YYYY-MM-DD).';
	}
	const ages = values.childAges ?? [];
	if (!isIntegerInRange(values.adults, 1, 10) || !Array.isArray(ages) ||
		ages.length > 10 || !ages.every(age => isIntegerInRange(age, 0, 17))) {
		return 'Provide 1–10 adults and the actual age (0–17) of each child.';
	}
	if (capacity && values.adults + ages.length > capacity) return 'Party exceeds apartment capacity.';
	return { checkIn: values.checkIn, checkOut: values.checkOut, adults: values.adults, childAges: ages };
}

export function stayQuery(stay: BookingStay) {
	const params = new URLSearchParams({ checkIn: stay.checkIn, checkOut: stay.checkOut, adults: String(stay.adults) });
	for (const age of stay.childAges) params.append('childAge', String(age));
	return '?' + params.toString();
}

export function readStay(params: URLSearchParams, capacity?: number) {
	if (!['checkIn', 'checkOut', 'adults', 'childAge'].some(key => params.has(key))) return undefined;
	const ages = params.getAll('childAge');
	return validateStay({
		checkIn: params.get('checkIn'), checkOut: params.get('checkOut'), adults: Number(params.get('adults')),
		childAges: ages.map(age => /^\d+$/.test(age) ? Number(age) : NaN)
	}, capacity);
}
