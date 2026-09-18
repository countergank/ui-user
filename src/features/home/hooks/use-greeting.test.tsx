// Unit tests for the extracted greeting hook (comp-003, renderHook pattern).
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useGreeting } from "./use-greeting";

function dateAt(hour: number, minute = 0): Date {
  return new Date(2026, 0, 1, hour, minute);
}

describe("useGreeting", () => {
  it("greets 'Good morning' before noon", () => {
    const { result } = renderHook(() => useGreeting(dateAt(9)));
    expect(result.current).toBe("Good morning");
  });

  it("greets 'Good afternoon' between noon and 18:00", () => {
    const { result } = renderHook(() => useGreeting(dateAt(14, 30)));
    expect(result.current).toBe("Good afternoon");
  });

  it("greets 'Good evening' at and after 18:00", () => {
    const { result } = renderHook(() => useGreeting(dateAt(20)));
    expect(result.current).toBe("Good evening");
  });

  it("uses the current time when no date is provided", () => {
    const { result } = renderHook(() => useGreeting());
    expect(["Good morning", "Good afternoon", "Good evening"]).toContain(result.current);
  });
});
