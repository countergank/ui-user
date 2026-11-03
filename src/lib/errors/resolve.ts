import { AppError } from "../errors";
import { type UaErrorCode, isUaErrorCode, resolveApiErrorKey, uaErrorKey } from "./catalog";

export type ApiErrorLevel = "field" | "form" | "page";

export type ApiErrorMessageKey =
  | "error.genericMessage"
  | "error.family.request"
  | "error.family.server"
  | `error.ua.${UaErrorCode}`;

export interface ApiErrorPresentation {
  level: ApiErrorLevel;
  messageKey: ApiErrorMessageKey;
  traceId: string | null;
}

const FORM_LEVEL_STATUSES = new Set([400, 409, 422]);

/**
 * Resolves how an unknown thrown value is presented to the user: which i18n key to render,
 * at which severity, and which trace identifier (if any) to offer for support.
 *
 * The backend `message` is never returned or exposed: copy always comes from the i18n
 * catalog. Field-level errors belong to form internals and are resolved there; this resolver
 * only distinguishes form-level from page-level failures, so it never returns `field`.
 *
 * @param error - any thrown value, typically from a route loader, query or mutation.
 * @returns The presentation: a `messageKey` from the error i18n catalog, a `level` of
 * `"form"` or `"page"` (`"field"` is reserved for form internals), and the `traceId` from the
 * API envelope or null.
 */
export function resolveApiErrorPresentation(error: unknown): ApiErrorPresentation {
  const traceId = error instanceof AppError && error.traceId ? error.traceId : null;

  if (!(error instanceof AppError) || typeof error.code !== "string" || error.code === "") {
    return { level: "page", messageKey: "error.genericMessage", traceId };
  }

  const messageKey = (
    isUaErrorCode(error.code)
      ? uaErrorKey(error.code)
      : resolveApiErrorKey(error.code, error.status)
  ) as ApiErrorMessageKey;
  const level =
    isUaErrorCode(error.code) && error.status !== undefined && FORM_LEVEL_STATUSES.has(error.status)
      ? "form"
      : "page";

  return { level, messageKey, traceId };
}
