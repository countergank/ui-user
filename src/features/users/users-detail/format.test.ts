import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime } from "./format";

const NOON_UTC = "2024-06-01T12:00:00.000Z";

describe("formatDate", () => {
  it("formats the date as dd/MM/yyyy in Spanish", () => {
    expect(formatDate(NOON_UTC, "es")).toBe("01/06/2024");
  });

  it("formats the date as MM/dd/yyyy in English", () => {
    expect(formatDate(NOON_UTC, "en")).toBe("06/01/2024");
  });
});

describe("formatDateTime", () => {
  it("formats the date as dd/MM/yyyy in Spanish", () => {
    expect(formatDateTime(NOON_UTC, "es")).toMatch(/^01\/06\/2024 · \d{2}:\d{2}$/);
  });

  it("formats the date as MM/dd/yyyy in English", () => {
    expect(formatDateTime(NOON_UTC, "en")).toMatch(/^06\/01\/2024 · \d{2}:\d{2}$/);
  });
});
