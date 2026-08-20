import { externalApiWallpaperUrl } from "$lib/config";
import { Data, Effect, pipe } from "effect";
import type { PageServerLoad } from "./$types";

class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly message: string;
  readonly status?: number;
  readonly cause?: unknown;
}> {}

class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly field?: string;
}> {}

const fetchWallpaper = (id: string | undefined, fetch: typeof globalThis.fetch) =>
  Effect.tryPromise({
    try: async () => {
      if (!id || id.trim() === "") {
        throw new ValidationError({
          message: "Wallpaper ID is required",
          field: "id",
        });
      }

      const res = await fetch(`${externalApiWallpaperUrl}/${id}`);

      if (!res.ok) {
        throw new NetworkError({
          message: `Failed to fetch wallpaper: ${res.statusText}`,
          status: res.status,
        });
      }

      const json = await res.json();
      return json.data as App.Wallpaper;
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

export const load: PageServerLoad<{ id: string; wallpaper: App.Wallpaper | null }> = async ({ params, fetch }) =>
  await Effect.runPromise(
    pipe(
      fetchWallpaper(params.id, fetch),
      Effect.map((wallpaper) => ({
        id: params.id,
        wallpaper,
      })),
      Effect.catchAll(() =>
        Effect.succeed({
          id: params.id,
          wallpaper: null,
        }),
      ),
    ),
  );
