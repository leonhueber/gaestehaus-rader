import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { accommodationBySlug, accommodations } from '$lib/data/accommodations';

export const prerender = true;

export const entries = () =>
	accommodations.map((accommodation) => ({ slug: accommodation.slug }));

export const load: PageLoad = ({ params }) => {
	const accommodation = accommodationBySlug(params.slug);

	if (!accommodation) {
		throw error(404, 'Unterkunft nicht gefunden');
	}

	return { slug: accommodation.slug };
};
