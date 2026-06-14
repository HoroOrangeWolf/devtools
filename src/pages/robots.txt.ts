import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
	const siteUrl = site ?? new URL('https://dev-utils.example.com/');
	const sitemapUrl = new URL('/sitemap-index.xml', siteUrl);

	return new Response(
		[
			'User-agent: *',
			'Allow: /',
			'',
			`Sitemap: ${sitemapUrl.toString()}`,
			'',
		].join('\n'),
		{
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		},
	);
};
