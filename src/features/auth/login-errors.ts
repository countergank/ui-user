import { AppError } from "@/lib/errors";

export type LoginErrorKey =
  | "login.errors.invalidCredentials"
  | "login.errors.locked"
  | "login.errors.inactive"
  | "login.errors.rateLimited";

export function resolveLoginError(error: unknown): LoginErrorKey | null {
  if (!(error instanceof AppError)) {
    return null;
  }

  if (error.status === 429) {
    return "login.errors.rateLimited";
  }

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
