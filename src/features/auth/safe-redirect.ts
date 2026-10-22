/**
 * Where to send the user after a successful login (COU-281, T5 / S1). `?redirect=` comes
 * from a link, so it is attacker-controlled: the allowlist beats a denylist — the value is
 * used only as a same-origin absolute path, everything else falls back (ADR-13 → `/app`).
 */
export const DEFAULT_REDIRECT = "/app";

/**
 * Browsers treat `\` as `/` in URLs, so a backslash is a path-traversal vector too, and
 * control characters (a newline in a header-shaped value) are never a legitimate path.
 */
function hasForbiddenCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (character === "\\" || code < 0x20 || code === 0x7f) {
      return true;
    }
  }

  return false;
}

export function resolveRedirectTarget(params: URLSearchParams): string {
  const requested = params.get("redirect");

  if (requested === null || requested === "") {
    return DEFAULT_REDIRECT;
  }

  // Must be an absolute path on this origin: one leading slash, never two.
  if (!requested.startsWith("/") || requested.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }

  if (hasForbiddenCharacter(requested)) {
    return DEFAULT_REDIRECT;
  }

  return requested;
}
