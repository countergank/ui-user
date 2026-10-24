export const DEFAULT_REDIRECT = "/app";

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

  if (!requested.startsWith("/") || requested.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }

  if (hasForbiddenCharacter(requested)) {
    return DEFAULT_REDIRECT;
  }

  return requested;
}
