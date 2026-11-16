import { AppError } from "@/lib/errors";

export const EMAIL_TAKEN_FIELD = "newEmail";
export const EMAIL_CODE_INVALID_FIELD = "code";

/**
 * @param error - the mutation error thrown by the HTTP layer as an `AppError`.
 * @returns The form field the error belongs to when the backend rejects the request:
 * `newEmail` when the new address is already in use (409 `UA-COM-004`, checked only
 * after the identity code proves out), `code` when the identity code is wrong, expired
 * or already spent (401 `UA-AUTH-010`), or `null` for anything else, which the form
 * surfaces through its generic save-failure path.
 */
export function mapEmailChangeError(error: unknown): "newEmail" | "code" | null {
  if (!(error instanceof AppError)) {
    return null;
  }

  if (error.code === "UA-COM-004") {
    return EMAIL_TAKEN_FIELD;
  }

  if (error.code === "UA-AUTH-010") {
    return EMAIL_CODE_INVALID_FIELD;
  }

  return null;
}
