import { AppError } from "@/lib/errors";

export type AppEnv = "development" | "staging" | "production";

export interface AppEnvRecord {
  MODE: string;
}

const MODE_TO_ENV: Record<string, AppEnv> = {
  development: "development",
  staging: "staging",
  production: "production",
};

/**
 * @param mode - the raw `MODE` value.
 * @returns The known environment, falling back to `development` for anything unexpected.
 */
export function resolveMode(mode: string): AppEnv {
  return MODE_TO_ENV[mode] ?? "development";
}

type ImportMetaEnvLike = Record<string, string | undefined>;

/**
 * @param env - an env-like record (`import.meta.env` in production, a stub in tests).
 * @param name - the required variable name.
 * @returns The variable value; throws an `AppError` (`ENV_MISSING`) when absent.
 */
export function requireEnv(env: ImportMetaEnvLike, name: string): string {
  const value = env[name];
  if (value === undefined || value === "") {
    throw new AppError(`Missing required environment variable "${name}".`, {
      code: "ENV_MISSING",
    });
  }
  return value;
}

export interface EnvShape {
  apiBaseUrl: string;
}

/**
 * @param env - an env-like record to read required `VITE_*` variables from.
 * @returns A frozen, typed configuration snapshot; throws on missing required variables.
 */
export function resolveEnv(env: ImportMetaEnvLike): EnvShape {
  return Object.freeze({
    apiBaseUrl: requireEnv(env, "VITE_API_BASE_URL"),
  });
}

export const envMode: AppEnv = resolveMode(import.meta.env.MODE);

export const isDev = envMode === "development";
export const isStaging = envMode === "staging";
export const isProd = envMode === "production";

export const env: EnvShape = resolveEnv(import.meta.env);

export default env;
