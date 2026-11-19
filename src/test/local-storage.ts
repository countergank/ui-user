function resolveEnvironmentWindow(): Window | undefined {
  const frames = globalThis.frames;

  if (!(frames instanceof Window) || Object.is(frames, globalThis)) {
    return undefined;
  }

  return frames;
}

function storageFromEnvironmentWindow(): Storage | undefined {
  const storage = resolveEnvironmentWindow()?.localStorage;

  return storage instanceof Storage ? storage : undefined;
}

async function createIsolatedStorage(): Promise<Storage> {
  const { JSDOM } = await import("jsdom");

  return new JSDOM("", { url: "http://localhost/" }).window.localStorage;
}

async function installLocalStorageWhenTheGlobalLacksIt() {
  if (typeof globalThis.localStorage !== "undefined") {
    return;
  }

  const storage = storageFromEnvironmentWindow() ?? (await createIsolatedStorage());

  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  });
}

await installLocalStorageWhenTheGlobalLacksIt();
