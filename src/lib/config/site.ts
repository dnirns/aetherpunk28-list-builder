/**
 * Site-wide constants used for SEO metadata (canonical URLs, Open Graph,
 * structured data and the sitemap). Change the deployment domain here only.
 */

export const SITE_URL = 'https://aetherpunk28-field-guide.vercel.app';

export const SITE_NAME = 'Aetherpunk 28 Field Guide';

export const SITE_DESCRIPTION =
	'Free list builder and companion app for Aetherpunk 28, the tabletop skirmish game by Jack Edwards. Build a College, pick a faction and print a game-ready roster.';

export const OG_IMAGE = '/images/og-card.jpg';

export const OG_IMAGE_ALT =
	'Aetherpunk 28 Field Guide, a list builder for the Aetherpunk 28 skirmish game';

export const GAME_NAME = 'Aetherpunk 28';

export const GAME_AUTHOR = 'Jack Edwards';

export const GAME_URL =
	'https://www.wargamevault.com/product/463718/Aetherpunk28?manufacturers_id=26307';

/** Resolve a route path to its absolute canonical URL. */
export const absoluteUrl = (path: string) =>
	`${SITE_URL}${path === '/' ? '/' : path.replace(/\/$/, '')}`;
