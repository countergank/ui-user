import { describe, expect, it, vi } from "vitest";

describe("localStorage stays in the environment realm", () => {
  it("is an instance of the global Storage class", () => {
    expect(globalThis.localStorage).toBeInstanceOf(Storage);
  });

  it("is the same storage the environment window exposes", () => {
    expect(globalThis.localStorage).toBe(globalThis.frames.localStorage);
  });

  it("intercepts Storage prototype-level spies", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem");

    window.localStorage.getItem("countergank.ui.theme");

    expect(getItem).toHaveBeenCalledWith("countergank.ui.theme");
  });
});
