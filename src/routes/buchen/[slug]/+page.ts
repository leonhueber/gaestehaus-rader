import type { PageLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { accommodationBySlug, accommodations } from '$lib/data/accommodations';
import { localizePath } from '$lib/routing';

export const prerender = true;

export const entries = () =>
	accommodations.map((accommodation) => ({ slug: accommodation.slug }));

export const load: PageLoad = ({ params, url }) => {
	const accommodation = accommodationBySlug(params.slug);

	if (!accommodation) {
		throw error(404, 'Unterkunft nicht gefunden');
	}

	throw redirect(308, localizePath('/buchen', url.pathname));
};
