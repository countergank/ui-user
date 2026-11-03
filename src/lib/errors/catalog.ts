export const UA_ERROR_CODES = [
  "UA-COM-001",
  "UA-COM-002",
  "UA-COM-003",
  "UA-COM-004",
  "UA-COM-005",
  "UA-APP-001",
  "UA-APP-002",
  "UA-APP-003",
  "UA-USR-001",
  "UA-USR-002",
  "UA-USR-003",
  "UA-USR-004",
  "UA-RBAC-001",
  "UA-AUTH-001",
  "UA-AUTH-002",
  "UA-AUTH-003",
  "UA-AUTH-004",
  "UA-AUTH-005",
  "UA-AUTH-006",
  "UA-AUTH-007",
  "UA-AUTH-008",
  "UA-AUTH-009",
  "UA-AUTH-010",
  "UA-AUTH-011",
  "UA-SEC-001",
  "UA-SEC-002",
  "UA-EML-001",
  "UA-EML-002",
  "UA-EML-003",
  "UA-PAR-001",
  "UA-PAR-002",
  "UA-PAR-003",
] as const;

export type UaErrorCode = (typeof UA_ERROR_CODES)[number];

const UA_ERROR_CODES_SET = new Set<string>(UA_ERROR_CODES);

export function isUaErrorCode(value: unknown): value is UaErrorCode {
  return typeof value === "string" && UA_ERROR_CODES_SET.has(value);
}

export function uaErrorKey(code: UaErrorCode): string {
  return `error.ua.${code}`;
}

const FAMILY_SERVER_KEY = "error.family.server";
const FAMILY_REQUEST_KEY = "error.family.request";
const GENERIC_MESSAGE_KEY = "error.genericMessage";

export function resolveApiErrorKey(code: string | null | undefined, status?: number): string {
  if (isUaErrorCode(code)) {
    return uaErrorKey(code);
  }

  if (status !== undefined && status >= 500) {
    return FAMILY_SERVER_KEY;
  }

  if (status !== undefined && status >= 400) {
    return FAMILY_REQUEST_KEY;
  }

  return GENERIC_MESSAGE_KEY;
}
