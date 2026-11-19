import { describe, expect, it, vi } from "vitest";

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

  it("keeps the current classes when the node signal fails the Request acceptance", async () => {
    const nodeController = createNodeAbortController();
    expect(nodeController).toBeDefined();

    const nodeSignalPrototype = Object.getPrototypeOf(nodeController?.signal) as {
      constructor: typeof globalThis.AbortSignal;
    };
    const nodeAbortSignal = nodeSignalPrototype.constructor;

    class StubAbortController {
      readonly signal = {} as AbortSignal;
    }

    class StubAbortSignal {
      readonly stub = true;
    }

    class RejectingRequest {
      readonly signal: AbortSignal | null;

      constructor(_input: string, init?: { signal?: AbortSignal | null }) {
        this.signal = init?.signal ?? null;

        const prototype =
          this.signal === null
            ? null
            : (Object.getPrototypeOf(this.signal) as { constructor: unknown } | null);
        if (prototype?.constructor === nodeAbortSignal) {
          throw new TypeError("unsupported signal");
        }
      }
    }

    const realRequest = globalThis.Request;
    const realController = globalThis.AbortController;
    const realSignal = globalThis.AbortSignal;

    Object.defineProperty(globalThis, "Request", { value: RejectingRequest, configurable: true });
    Object.defineProperty(globalThis, "AbortController", {
      value: StubAbortController,
      configurable: true,
    });
    Object.defineProperty(globalThis, "AbortSignal", {
      value: StubAbortSignal,
      configurable: true,
    });

    try {
      vi.resetModules();
      await import("./abort-globals");

      expect(globalThis.AbortController).toBe(StubAbortController);
      expect(globalThis.AbortSignal).toBe(StubAbortSignal);
    } finally {
      Object.defineProperty(globalThis, "Request", { value: realRequest, configurable: true });
      Object.defineProperty(globalThis, "AbortController", {
        value: realController,
        configurable: true,
      });
      Object.defineProperty(globalThis, "AbortSignal", { value: realSignal, configurable: true });
      vi.resetModules();
    }
  });
});
