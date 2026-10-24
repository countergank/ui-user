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

export class DataFetchError extends AppError {
  constructor(
    message: string,
    options: Omit<AppErrorOptions, "status"> & { status?: number } = {},
  ) {
    super(message, options);
    this.name = "DataFetchError";
  }
}

export class RouteError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, options);
    this.name = "RouteError";
  }
}

/**
 * @param unknown - any thrown value.
 * @returns The value as an `Error`, wrapping strings and falling back to a generic message.
 */
export function toError(unknown: unknown): Error {
  if (unknown instanceof Error) return unknown;
  if (typeof unknown === "string") return new Error(unknown);
  return new Error("An unexpected error occurred.");
}
