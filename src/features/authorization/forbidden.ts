import { AppError } from "@/lib/errors";

export const FORBIDDEN_STATUS = 403;

export const FORBIDDEN_CODE = "UA-SEC-002";

export function isForbiddenError(error: unknown): boolean {
  if (!(error instanceof AppError)) {
    return false;
  }

  return error.status === FORBIDDEN_STATUS || error.code === FORBIDDEN_CODE;
}
