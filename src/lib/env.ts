/**
 * Typed environment access (COU-125, docs/adr.md "env handling policy"). Vite bakes
 * `VITE_*` variables into the bundle at build time, so this module is the single typed
 * gateway: `env` plus the build-mode flags, failing fast at import on missing variables.
 */
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

/** Maps a raw `MODE` value onto our known environments. Anything unexpected → dev safe-fail. */
export function resolveMode(mode: string): AppEnv {
  return MODE_TO_ENV[mode] ?? "development";
}

type ImportMetaEnvLike = Record<string, string | undefined>;

/** Resolves a required `VITE_*` variable, throwing an `AppError` (ENV_MISSING) if absent. */
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
  /** Base URL of the backend API the SPA talks to. */
  apiBaseUrl: string;
}

/**
 * Builds a typed configuration snapshot from an env-like object. Pure and unit-testable:
 * supply any record and get a checked `EnvShape`, with fail-fast on missing required vars.
 */
export function resolveEnv(env: ImportMetaEnvLike): EnvShape {
  return Object.freeze({
    apiBaseUrl: requireEnv(env, "VITE_API_BASE_URL"),
  });
}

/**
 * The Vite build mode (`import.meta.env.MODE`): "development" | "staging" | "production".
 * Anything unexpected (e.g. a custom `--mode` flag) safely resolves to "development".
 */
export const envMode: AppEnv = resolveMode(import.meta.env.MODE);

export const isDev = envMode === "development";
export const isStaging = envMode === "staging";
export const isProd = envMode === "production";

/**
 * The app's resolved configuration, evaluated eagerly at import time so a missing
 * `VITE_API_BASE_URL` fails fast with a loud startup error.
 */
export const env: EnvShape = resolveEnv(import.meta.env);

export default env;
