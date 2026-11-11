import { AppError } from "@/lib/errors";

export type ResetPasswordErrorKey = "reset.errors.invalidToken";

export function resolveResetPasswordError(error: unknown): ResetPasswordErrorKey | null {
  if (error instanceof AppError && error.code === "UA-AUTH-005") {
    return "reset.errors.invalidToken";
  }

  return null;
}
