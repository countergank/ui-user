import { describe, expect, it } from "vitest";

function createNodeAbortController(): AbortController | undefined {
  const nodeUtil = process.getBuiltinModule("node:util") as
    | { transferableAbortController?: () => AbortController }
    | undefined;

  return nodeUtil?.transferableAbortController?.();
}

describe("abort globals stay compatible with undici", () => {
  it("keeps AbortController and AbortSignal as Node's native classes", () => {
    const nodeController = createNodeAbortController();

    expect(nodeController).toBeDefined();
    expect(globalThis.AbortController).toBe(nodeController?.constructor);

    const nodeSignalPrototype = Object.getPrototypeOf(nodeController?.signal) as {
      constructor: typeof globalThis.AbortSignal;
    };
    expect(globalThis.AbortSignal).toBe(nodeSignalPrototype.constructor);
  });

  it("accepts an AbortController signal in the Request constructor", () => {
    const controller = new AbortController();

    expect(
      () =>
        new Request("http://localhost:3000/abort-globals", {
          signal: controller.signal,
        }),
    ).not.toThrow();
  });

  it("rejects fetch with an aborted signal as an AbortError", async () => {
    const controller = new AbortController();
    controller.abort();

    const rejection = await fetch("http://localhost:3000/abort-globals", {
      signal: controller.signal,
    }).then(
      () => null,
      (reason: unknown) => reason,
    );

    expect(rejection).toMatchObject({ name: "AbortError" });
  });
});
