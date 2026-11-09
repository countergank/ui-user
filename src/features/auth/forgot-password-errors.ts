import { AppError } from "@/lib/errors";

export type ForgotPasswordErrorKey = "forgot.errors.rateLimited";

export function resolveForgotPasswordError(error: unknown): ForgotPasswordErrorKey | null {
  if (error instanceof AppError && error.status === 429) {
    return "forgot.errors.rateLimited";
  }

  return null;
}
