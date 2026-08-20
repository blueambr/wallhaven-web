const fingerprint = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const createApiCacheRequest = async (url: URL, variant: "fresh" | "stale") => {
  const cacheUrl = new URL(url);
  const apiKey = cacheUrl.searchParams.get("apikey");

  cacheUrl.searchParams.delete("apikey");
  cacheUrl.searchParams.set("_cache", variant);

  if (apiKey) {
    cacheUrl.searchParams.set("_auth", await fingerprint(apiKey));
  }

  cacheUrl.searchParams.sort();
  return new Request(cacheUrl.toString());
};

export const putApiCacheResponse = (cache: Cache, request: Request, response: Response, maxAge: number) => {
  const cachedResponse = response.clone();
  const headers = new Headers(cachedResponse.headers);
  headers.set("Cache-Control", `public, max-age=${maxAge}`);

  return cache.put(
    request,
    new Response(cachedResponse.body, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers,
    }),
  );
};
