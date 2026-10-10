// Unit tests for the extracted greeting hook (comp-003, renderHook pattern).
// Greeting expectations are resource-driven (COU-253): they read the expected
// copy from the i18n resources instead of hardcoded literals.
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { useGreeting } from "./use-greeting";

function dateAt(hour: number, minute = 0): Date {
  return new Date(2026, 0, 1, hour, minute);
}

describe("useGreeting", () => {
  it("greets with the morning copy before noon", () => {
    const { result } = renderHook(() => useGreeting(dateAt(9)));
    expect(result.current).toBe(i18n.t("home.greeting.morning"));
  });

  it("greets with the afternoon copy between noon and 18:00", () => {
    const { result } = renderHook(() => useGreeting(dateAt(14, 30)));
    expect(result.current).toBe(i18n.t("home.greeting.afternoon"));
  });

  it("greets with the evening copy at and after 18:00", () => {
    const { result } = renderHook(() => useGreeting(dateAt(20)));
    expect(result.current).toBe(i18n.t("home.greeting.evening"));
  });

  it("uses the current time when no date is provided", () => {
    const { result } = renderHook(() => useGreeting());
    expect([
      i18n.t("home.greeting.morning"),
      i18n.t("home.greeting.afternoon"),
      i18n.t("home.greeting.evening"),
    ]).toContain(result.current);
  });
});
