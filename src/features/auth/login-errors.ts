import { AppError } from "@/lib/errors";

/**
 * The four login failures (COU-281, S6-S8) are account or rate conditions, never field
 * validation, so all four render as one form-level message. Mapping lives here, pure, so
 * the decision is assertable without rendering anything.
 */
export type LoginErrorKey =
  | "login.errors.invalidCredentials"
  | "login.errors.locked"
  | "login.errors.inactive"
  | "login.errors.rateLimited";

export function resolveLoginError(error: unknown): LoginErrorKey | null {
  if (!(error instanceof AppError)) {
    return null;
  }

  // Checked before the code: a 429 is a rate limit whoever answered it.
  if (error.status === 429) {
    return "login.errors.rateLimited";
  }

  // A `switch` instead of a lookup table on purpose: `code` is server-controlled, and a
  // prototype key like `constructor` must not resolve to anything.
  switch (error.code) {
    case "UA-AUTH-002":
      return "login.errors.invalidCredentials";
    case "UA-AUTH-003":
      return "login.errors.locked";
    case "UA-AUTH-004":
      return "login.errors.inactive";
    default:
      return null;
  }
}
