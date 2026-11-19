interface NodeUtilModule {
  transferableAbortController?: () => AbortController;
}

function createNodeAbortController(): AbortController | undefined {
  const nodeUtil = process.getBuiltinModule("node:util") as NodeUtilModule | undefined;

  return nodeUtil?.transferableAbortController?.();
}

function restoreNodeAbortClassesWhenJsdomReplacedThem() {
  const nodeController = createNodeAbortController();

  if (nodeController === undefined) {
    return;
  }

  const nodeAbortController = nodeController.constructor as typeof globalThis.AbortController;
  const nodeSignalPrototype = Object.getPrototypeOf(nodeController.signal) as {
    constructor: typeof globalThis.AbortSignal;
  };
  const nodeAbortSignal = nodeSignalPrototype.constructor;

  if (
    globalThis.AbortController === nodeAbortController &&
    globalThis.AbortSignal === nodeAbortSignal
  ) {
    return;
  }

  Object.defineProperty(globalThis, "AbortController", {
    value: nodeAbortController,
    configurable: true,
  });
  Object.defineProperty(globalThis, "AbortSignal", {
    value: nodeAbortSignal,
    configurable: true,
  });
}

restoreNodeAbortClassesWhenJsdomReplacedThem();
