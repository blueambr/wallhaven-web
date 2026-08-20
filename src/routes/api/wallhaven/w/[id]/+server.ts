import { externalApiWallpaperUrl } from "$lib/config";
import { createApiCacheRequest, putApiCacheResponse } from "$lib/server/apiCache";
import { json } from "@sveltejs/kit";
import { Data, Effect, pipe } from "effect";
import type { RequestHandler } from "./$types";

class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly message: string;
  readonly status?: number;
  readonly cause?: unknown;
}> {}

class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly field?: string;
}> {}

const fetchWallpaper = (id: string | undefined, searchParams: URLSearchParams, fetch: typeof globalThis.fetch) =>
  Effect.tryPromise({
    try: async () => {
      if (!id || id.trim() === "") {
        throw new ValidationError({
          message: "Wallpaper ID is required",
          field: "id",
        });
      }

      const externalApiUrl = new URL(`${externalApiWallpaperUrl}/${id}`);

      for (const [key, value] of searchParams) {
        if (key === "apikey" && !value) continue;
        externalApiUrl.searchParams.set(key, value);
      }

      const res = await fetch(externalApiUrl.toString());

      if (!res.ok) {
        throw new NetworkError({
          message: `API request failed: ${res.statusText}`,
          status: res.status,
        });
      }

      return await res.json();
    },
    catch: (error) => {
      if (error instanceof ValidationError || error instanceof NetworkError) {
        return error;
      }

      return new NetworkError({
        message: "Failed to fetch wallpaper details",
        cause: error,
      });
    },
  });

export const GET: RequestHandler = async ({ params, url, fetch, platform }) => {
  const cache = platform?.caches?.default;
  const freshCacheRequest = await createApiCacheRequest(url, "fresh");
  const staleCacheRequest = await createApiCacheRequest(url, "stale");
  const cachedResponse = await cache?.match(freshCacheRequest);

  if (cachedResponse) return cachedResponse;

  const response = await Effect.runPromise(
    pipe(
      fetchWallpaper(params.id, url.searchParams, fetch),
      Effect.map((data) =>
        json(data, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "public, max-age=600, s-maxage=1200",
            "CDN-Cache-Control": "public, max-age=1200",
          },
        }),
      ),
      Effect.catchTags({
        ValidationError: (error) =>
          Effect.succeed(
            json(
              {
                error: "ValidationError",
                message: error.message,
                field: error.field,
              },
              {
                headers: { "Access-Control-Allow-Origin": "*" },
                status: 400,
              },
            ),
          ),
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
                status: error.status === 404 || error.status === 429 ? error.status : 502,
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
      putApiCacheResponse(cache, freshCacheRequest, response, 1200),
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
