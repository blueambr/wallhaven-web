import { externalApiSearchUrl } from "$lib/config";
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
        externalApiUrl.searchParams.set(key, value);
      }

      const res = await fetch(externalApiUrl.toString());

      if (!res.ok) {
        throw new Error(`API request failed: ${res.statusText}`);
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

export const GET: RequestHandler = async ({ url, fetch }) =>
  Effect.runPromise(
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

export const OPTIONS: RequestHandler = async () =>
  new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    status: 200,
  });
