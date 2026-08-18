import { absoluteUrl } from '$lib/config/site';

export const prerender = true;

/**
 * Only the two publicly meaningful entry points are listed. /edit and
 * /builder?view= are per-visitor views of Colleges held in localStorage,
 * so there is nothing there for a crawler to fetch.
 */
const PAGES = [
	{ path: '/', changefreq: 'monthly', priority: '1.0' },
	{ path: '/builder', changefreq: 'monthly', priority: '0.8' }
] as const;

export const GET = async () => {
	const lastmod = new Date().toISOString().split('T')[0];

	const urls = PAGES.map(
		({ path, changefreq, priority }) => `	<url>
		<loc>${absoluteUrl(path)}</loc>
		<lastmod>${lastmod}</lastmod>
		<changefreq>${changefreq}</changefreq>
		<priority>${priority}</priority>
	</url>`
	).join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
};
