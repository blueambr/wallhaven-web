const getErrorMessage = (body: string, contentType: string) => {
  if (!contentType.includes("application/json")) return null;

  try {
    const parsed = JSON.parse(body) as { message?: unknown };
    return typeof parsed.message === "string" ? parsed.message : null;
  } catch {
    return null;
  }
};

type ApiError = Error & { status: number };

const createApiError = (message: string, status: number): ApiError => Object.assign(new Error(message), { status });

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof Error && "status" in error && typeof error.status === "number";

export const fetchJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const body = await response.text();

  if (!response.ok) {
    const message = getErrorMessage(body, contentType);
    const detail = message ? `: ${message}` : "";
    throw createApiError(`HTTP ${response.status} ${response.statusText}${detail}`, response.status);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON but received ${contentType || "an unknown content type"} (HTTP ${response.status})`);
  }

  try {
    return JSON.parse(body) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON response (HTTP ${response.status}): ${message}`, { cause: error });
  }
};
