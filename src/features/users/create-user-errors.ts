import { AppError } from "@/lib/errors";

export type CreateUserErrorKey =
  | "create.errors.emailTaken"
  | "create.errors.userNameTaken"
  | "create.errors.weakPassword";

export type CreateUserErrorField = "email" | "userName" | "password";

export interface CreateUserFieldError {
  field: CreateUserErrorField;
  messageKey: CreateUserErrorKey;
}

/**
 * @param error - any value thrown by the create-user mutation.
 * @returns The field and i18n key for a duplicate or weak-password failure, or `null` when the
 * failure belongs to the form level instead of a single field.
 */
export function resolveCreateUserError(error: unknown): CreateUserFieldError | null {
  if (!(error instanceof AppError)) {
    return null;
  }

  switch (error.code) {
    case "UA-COM-004":
      return { field: "email", messageKey: "create.errors.emailTaken" };
    case "UA-COM-003":
      return { field: "userName", messageKey: "create.errors.userNameTaken" };
    default:
      return error.code?.startsWith("PASSWORD_")
        ? { field: "password", messageKey: "create.errors.weakPassword" }
        : null;
  }
}
