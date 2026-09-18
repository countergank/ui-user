/**
 * Typed error model (ARCH-4, ts-001, p1-error-instances).
 *
 * All application errors are `Error` instances — never thrown as raw strings —
 * so they carry stack traces, support `instanceof`, and work with React error
 * boundaries. `AppError` carries an optional machine-readable code and an HTTP
 * status for consistent surfacing at route boundaries.
 */

export interface AppErrorOptions {
  code?: string;
  status?: number;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "AppError";
    this.code = options.code;
    this.status = options.status;
  }
}

/** Errors raised by data-fetching layers (TanStack Query / api client). */
export class DataFetchError extends AppError {
  constructor(
    message: string,
    options: Omit<AppErrorOptions, "status"> & { status?: number } = {},
  ) {
    super(message, options);
    this.name = "DataFetchError";
  }
}

/** Errors raised by route loading or rendering. */
export class RouteError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, options);
    this.name = "RouteError";
  }
}

/**
 * Normalize an unknown thrown value into an `Error` instance so error UI and
 * error boundaries always render a safe, typed message.
 */
export function toError(unknown: unknown): Error {
  if (unknown instanceof Error) return unknown;
  if (typeof unknown === "string") return new Error(unknown);
  return new Error("An unexpected error occurred.");
}
