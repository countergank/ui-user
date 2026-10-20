/**
 * Is this failure the API saying "not allowed"? (COU-275, T5 / S6)
 *
 * A 403 must reach `ForbiddenView` instead of the generic error copy: "something went
 * wrong" hides the one thing the person needs to know — that the action is denied, not
 * broken. `api-user` answers 403 as `{ statusCode: 403, code: "UA-SEC-002" }`
 * (`src/common/errors/error-kind.ts:173`), and the HTTP client keeps both on the
 * `AppError` it throws, so either field is enough evidence. The UI still does not decide
 * permissions here: this only recognizes the server's answer (ADR-13).
 */
import { AppError } from "@/lib/errors";

/** The status the API uses for a denied action. */
export const FORBIDDEN_STATUS = 403;

/** The machine-readable code `api-user` attaches to that status. */
export const FORBIDDEN_CODE = "UA-SEC-002";

export function isForbiddenError(error: unknown): boolean {
  if (!(error instanceof AppError)) {
    return false;
  }

  return error.status === FORBIDDEN_STATUS || error.code === FORBIDDEN_CODE;
}
