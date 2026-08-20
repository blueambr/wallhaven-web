import { site } from "$lib/config";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () =>
  new Response(
    `User-agent: *
Disallow: /api/

User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml`,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    },
  );
