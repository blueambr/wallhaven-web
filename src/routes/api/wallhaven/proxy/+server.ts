import { Data, Effect, pipe } from "effect";
import type { RequestHandler } from "./$types";

const allowedHosts = ["w.wallhaven.cc", "th.wallhaven.cc"];

class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
}> {}

class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

class UnauthorizedHostError extends Data.TaggedError("UnauthorizedHostError")<{
  readonly host: string;
}> {}

const validateUrl = (url: string) =>
  Effect.try({
    try: () => {
      const parsedUrl = new URL(url);

      if (!allowedHosts.includes(parsedUrl.hostname)) {
        return Effect.fail(new UnauthorizedHostError({ host: parsedUrl.hostname }));
      }

      return Effect.succeed(parsedUrl);
    },
    catch: (error) => new ValidationError({ message: `Invalid URL format: ${error}` }),
  }).pipe(Effect.flatten);

const fetchImage = (url: string, fetch: typeof globalThis.fetch) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WallpapersLite/1.0)",
          Referer: "https://wallhaven.cc/",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        buffer: await response.arrayBuffer(),
        contentType: response.headers.get("content-type") || "image/jpeg",
      };
    },
    catch: (error) => new NetworkError({ message: "Failed to fetch image", cause: error }),
  });

export const GET: RequestHandler = async ({ url, fetch }: { url: URL; fetch: typeof globalThis.fetch }) => {
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl) {
    return new Response("URL parameter is required", { status: 400 });
  }

  return await Effect.runPromise(
    pipe(
      validateUrl(imageUrl),
      Effect.flatMap(() => fetchImage(imageUrl, fetch)),
      Effect.map(
        ({ buffer, contentType }) =>
          new Response(buffer, {
            headers: {
              "Content-Type": contentType,
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
              "Access-Control-Allow-Headers": "Content-Type",
              "Cache-Control": "public, max-age=3600, s-maxage=7200",
              "CDN-Cache-Control": "public, max-age=7200",
            },
          }),
      ),
      Effect.catchTags({
        ValidationError: (error) =>
          Effect.succeed(
            new Response(`Validation Error: ${error.message}`, {
              status: 400,
              headers: { "Access-Control-Allow-Origin": "*" },
            }),
          ),
        UnauthorizedHostError: (error) =>
          Effect.succeed(
            new Response(`Unauthorized host: ${error.host}`, {
              status: 403,
              headers: { "Access-Control-Allow-Origin": "*" },
            }),
          ),
        NetworkError: (error) =>
          Effect.succeed(
            new Response(`Network Error: ${error.message}`, {
              status: 502,
              headers: { "Access-Control-Allow-Origin": "*" },
            }),
          ),
      }),
      Effect.catchAll((error) =>
        Effect.succeed(
          new Response(`Internal Server Error: ${error}`, {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
          }),
        ),
      ),
    ),
  );
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
