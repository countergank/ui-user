import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";

export interface ApiErrorEnvelope {
  statusCode?: number;
  code?: string;
  message?: string;
}

export interface HttpRequestOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: Record<string, string>;
}

export interface HttpClientDeps {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => Promise<boolean>;
}

export interface HttpClient {
  request: <T>(path: string, options?: HttpRequestOptions) => Promise<T>;
}

const FALLBACK_CODE = "HTTP_ERROR";
const NETWORK_CODE = "NETWORK_ERROR";

function buildUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

async function toAppError(response: Response): Promise<AppError> {
  const raw = await response.text().catch(() => "");
  let envelope: ApiErrorEnvelope = {};

  if (raw !== "") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        envelope = parsed;
      }
      // eslint-disable-next-line no-empty -- a non-JSON body still leaves the status to explain the failure.
    } catch {}
  }

  const code = typeof envelope.code === "string" ? envelope.code : FALLBACK_CODE;
  const message =
    typeof envelope.message === "string" && envelope.message !== ""
      ? envelope.message
      : `Request failed with status ${String(response.status)}`;

  return new AppError(message, { code, status: response.status });
}

/**
 * @param deps - optional overrides: `baseUrl`, `fetchImpl`, `getAccessToken`, and
 * `onUnauthorized`, which owns the single retry after a session renewal.
 * @returns A minimal JSON client that does not know about sessions.
 */
export function createHttpClient(deps: HttpClientDeps = {}): HttpClient {
  const baseUrl = deps.baseUrl ?? env.apiBaseUrl;
  const fetchImpl = deps.fetchImpl ?? fetch;

  const execute = async <T>(
    path: string,
    options: HttpRequestOptions,
    alreadyRetried: boolean,
  ): Promise<T> => {
    const headers = new Headers(options.headers);
    if (options.body !== undefined) {
      headers.set("content-type", "application/json");
    }

    const token = deps.getAccessToken?.() ?? null;
    if (token !== null && token !== "") {
      headers.set("authorization", `Bearer ${token}`);
    }

    let response: Response;
    try {
      response = await fetchImpl(buildUrl(baseUrl, path), {
        ...options,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch {
      throw new AppError("Network request failed", { code: NETWORK_CODE });
    }

    if (response.ok) {
      if (response.status === 204) {
        return undefined as T;
      }

      const raw = await response.text();

      return raw === "" ? (undefined as T) : (JSON.parse(raw) as T);
    }

    const error = await toAppError(response);

    if (response.status === 401 && !alreadyRetried && deps.onUnauthorized !== undefined) {
      const renewed = await deps.onUnauthorized().catch(() => false);
      if (renewed) {
        return execute<T>(path, options, true);
      }
    }

    throw error;
  };

  return {
    request: <T>(path: string, options: HttpRequestOptions = {}) =>
      execute<T>(path, options, false),
  };
}
