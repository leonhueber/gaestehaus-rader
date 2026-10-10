import placesData from '$lib/data/nearby-places.json';
import routeData from '$lib/data/nearby-routes.json';
import type { Lang } from '$lib/i18n';

export type NearbyScope = 'village' | 'region';
export type NearbyCategory = 'all' | 'food' | 'shopping' | 'experiences';
export type TravelMode = 'foot' | 'car';
export type NearbyPlace = (typeof placesData.places)[number];
export type NearbyRoute = { meters: number; seconds: number; coordinates: number[][]; accessMeters: number };
export const nearbyOrigin = placesData.origin;
export const nearbyPlaces = placesData.places;
export const nearbyRoutes = routeData.routes as Record<string, Record<TravelMode, NearbyRoute>>;
export const routeDate = routeData.generatedAt;

export function filterPlaces(scope: NearbyScope, category: NearbyCategory) {
	return nearbyPlaces.filter((place) => place.scope === scope && (category === 'all' || place.category === category));
}

export function routeDuration(seconds: number, locale: Lang) {
	const minutes = Math.max(1, Math.ceil(seconds / 60));
	return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} ${locale === 'de' ? 'Std.' : 'hr'}${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
}

export function routeDistance(meters: number, locale: Lang) {
	return meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toLocaleString(locale, { maximumFractionDigits: 1 })} km`;
}

export function navigationUrl(place: NearbyPlace, mode: TravelMode) {
	const params = new URLSearchParams({ api: '1', origin: `${nearbyOrigin.lat},${nearbyOrigin.lon}`, destination: `${place.lat},${place.lon}`, travelmode: mode === 'foot' ? 'walking' : 'driving' });
	return `https://www.google.com/maps/dir/?${params}`;
}
