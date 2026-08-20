import { externalApiSearchUrl } from "$lib/config";
import { createApiCacheRequest, putApiCacheResponse } from "$lib/server/apiCache";
import { json } from "@sveltejs/kit";
import { Data, Effect, pipe } from "effect";
import type { RequestHandler } from "./$types";

class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly message: string;
  readonly status?: number;
  readonly cause?: unknown;
}> {}

const fetchWallpapers = (searchParams: URLSearchParams, fetch: typeof globalThis.fetch) =>
  Effect.tryPromise({
    try: async () => {
      const externalApiUrl = new URL(externalApiSearchUrl);

      for (const [key, value] of searchParams) {
        if (key === "apikey" && !value) continue;
        externalApiUrl.searchParams.set(key, value);
      }

      const res = await fetch(externalApiUrl.toString(), {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; WallpapersLite/1.0)",
        },
      });

      if (!res.ok) {
        throw new NetworkError({
          message: `Wallhaven API request failed: ${res.status} ${res.statusText}`,
          status: res.status,
        });
      }

      const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";

      if (!contentType.includes("application/json")) {
        throw new NetworkError({
          message: `Wallhaven returned ${contentType || "an unknown content type"} instead of JSON`,
          status: 502,
        });
      }

      return await res.json();
    },
    catch: (error) => {
      if (error instanceof NetworkError) {
        return error;
      }

      return new NetworkError({
        message: "Failed to fetch wallpapers",
        cause: error,
      });
    },
  });

export const GET: RequestHandler = async ({ url, fetch, platform }) => {
  const cache = platform?.caches?.default;
  const freshCacheRequest = await createApiCacheRequest(url, "fresh");
  const staleCacheRequest = await createApiCacheRequest(url, "stale");
  const cachedResponse = await cache?.match(freshCacheRequest);

  if (cachedResponse) return cachedResponse;

  const response = await Effect.runPromise(
    pipe(
      fetchWallpapers(url.searchParams, fetch),
      Effect.map((data) =>
        json(data, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "public, max-age=300, s-maxage=600",
            "CDN-Cache-Control": "public, max-age=600",
          },
        }),
      ),
      Effect.catchTags({
        NetworkError: (error) =>
          Effect.succeed(
            json(
              {
                error: "NetworkError",
                message: error.message,
                status: error.status || 500,
              },
              {
                headers: { "Access-Control-Allow-Origin": "*" },
                status: error.status || 502,
              },
            ),
          ),
      }),
      Effect.catchAll(() =>
        Effect.succeed(
          json(
            {
              error: "UnknownError",
              message: "An unexpected error occurred",
            },
            {
              headers: { "Access-Control-Allow-Origin": "*" },
              status: 500,
            },
          ),
        ),
      ),
    ),
  );

  if (cache && response.status === 429) {
    const staleResponse = await cache.match(staleCacheRequest);
    if (staleResponse) return staleResponse;
  }

  if (cache && response.ok) {
    const cacheWrite = Promise.all([
      putApiCacheResponse(cache, freshCacheRequest, response, 600),
      putApiCacheResponse(cache, staleCacheRequest, response, 86_400),
    ]);

    if (platform?.ctx) {
      platform.ctx.waitUntil(cacheWrite);
    } else {
      await cacheWrite;
    }
  }

  return response;
};

export const OPTIONS: RequestHandler = async () =>
  new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    status: 200,
  });
