import { site } from "$lib/config";
import { categories, staticRoutes } from "$lib/data";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${staticRoutes
    .map(
      (page) => `
	<url>
		<loc>${site.url}${page}</loc>
		<changefreq>weekly</changefreq>
		<priority>${page === "" ? "1.0" : "0.8"}</priority>
	</url>`,
    )
    .join("")}
	${categories
    .map(
      (category) => `
	<url>
		<loc>${site.url}/${category.slug}</loc>
		<changefreq>daily</changefreq>
		<priority>0.9</priority>
	</url>`,
    )
    .join("")}
</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml",
      },
    },
  );
