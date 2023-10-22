import { AsyncInitializer } from "@malebolge/async";
import { describe, expect, it } from "vitest";

describe("AsyncInitializer", () => {
  it("initializes only once, allow reset", async () => {
    let restarts = 0;
    const initializer = new AsyncInitializer(async () => `x${++restarts}`);
    expect(initializer.value).toBeUndefined();
    expect(await initializer()).toBe("x1");
    expect(initializer.value).toBe("x1");
    expect(initializer.error).toBeNull();
    expect(await initializer()).toBe("x1");
    expect(initializer.value).toBe("x1");
    expect(initializer.error).toBeNull();

    expect(await initializer.restart()).toBe("x2");
    expect(initializer.value).toBe("x2");

    initializer.resolve("x1000");

    expect(await initializer()).toBe("x1000");
    expect(await initializer()).toBe("x1000");
    expect(initializer.value).toBe("x1000");

    initializer.restartSync();
    expect(initializer.value).toBe("x1000");

    const promise = initializer();
    expect(initializer.running).toBe(true);

    expect(await promise).toBe("x3");
    expect(initializer.value).toBe("x3");
    expect(initializer.running).toBe(false);

    expect(await initializer()).toBe("x3");
    expect(initializer.value).toBe("x3");
    expect(initializer.running).toBe(false);

    expect(restarts).toBe(3);
  });

  it("should execute the initializer once", async () => {
    let counter = 0;
    let changes = 0;
    const initializer = new AsyncInitializer(() => Promise.resolve(`success${++counter}`));
    initializer.changeEmitter.subscribe(() => ++changes);

    expect(initializer.promise).toBeNull();
    expect(initializer.value).toBeUndefined();

    const promise = initializer();
    expect(initializer.promise).toBe(promise);
    expect(initializer.value).toBeUndefined();

    expect(await promise).toBe("success1");

    expect(initializer.promise).toBe(promise);

    expect(await initializer()).toBe("success1");
    expect(await initializer()).toBe("success1");
    expect(await initializer()).toBe("success1");

    expect(initializer.promise).toBe(promise);
    expect(initializer.value).toBe("success1");

    expect(counter).toBe(1);
    expect(changes).toBe(2);
  });

  it("should reject and retry on error", async () => {
    let counter = 0;
    let changes = 0;
    const initializer = new AsyncInitializer(() => {
      if (++counter === 1) {
        return Promise.reject(new Error("failed"));
      }
      return Promise.resolve(`success${counter}`);
    });
    initializer.changeEmitter.subscribe(() => ++changes);

    expect(initializer.promise).toBeNull();
    expect(initializer.value).toBeUndefined();

    let promise = initializer();
    expect(initializer.promise).toBe(promise);
    expect(initializer.value).toBeUndefined();

    await expect(promise).rejects.toThrow("failed");

    expect(initializer.promise).toBeNull();

    promise = initializer();
    expect(await promise).toBe("success2");

    expect(await initializer()).toBe("success2");
    expect(await initializer()).toBe("success2");

    expect(initializer.promise).toBe(promise);
    expect(initializer.value).toBe("success2");

    expect(counter).toBe(2);
    expect(changes).toBe(4);
  });

  it("should invoke onStart, onResolve", async () => {
    const startCalls: Promise<unknown>[] = [];
    const resolveCalls: unknown[] = [];
    const rejectCalls: unknown[] = [];

    const onStart = (promise: Promise<unknown>) => {
      startCalls.push(promise);
    };

    const onResolve = (value: unknown) => {
      resolveCalls.push(value);
    };

    const onReject = (reason: unknown) => {
      rejectCalls.push(reason);
    };

    const initializer = new AsyncInitializer(() => Promise.resolve("success"), { onStart, onResolve, onReject });

    expect(initializer.promise).toBeNull();
    expect(initializer.value).toBeUndefined();

    const promise = initializer();

    expect(initializer.promise).toBe(promise);
    expect(initializer.value).toBeUndefined();

    expect(startCalls).toEqual([promise]);
    expect(resolveCalls).toEqual([]);
    expect(rejectCalls).toEqual([]);

    expect(await promise).toBe("success");

    expect(startCalls).toEqual([promise]);
    expect(resolveCalls).toEqual(["success"]);
    expect(rejectCalls).toEqual([]);

    expect(initializer.promise).toBe(promise);
    expect(initializer.value).toBe("success");
  });

  it("should invoke onReject", async () => {
    const startCalls: Promise<unknown>[] = [];
    const resolveCalls: unknown[] = [];
    const rejectCalls: unknown[] = [];

    const error = new Error("failed");

    const onStart = (promise: Promise<unknown>) => {
      startCalls.push(promise);
    };

    const onResolve = (value: unknown) => {
      resolveCalls.push(value);
    };

    const onReject = (reason: unknown) => {
      rejectCalls.push(reason);
    };

    const initializer = new AsyncInitializer(() => Promise.reject(error), {
      onStart,
      onResolve,
      onReject,
    });

    expect(initializer.promise).toBeNull();
    expect(initializer.value).toBeUndefined();

    const promise = initializer();

    expect(initializer.promise).toBe(promise);
    expect(initializer.value).toBeUndefined();

    expect(startCalls).toEqual([promise]);
    expect(resolveCalls).toEqual([]);
    expect(rejectCalls).toEqual([]);

    await expect(promise).rejects.toThrow("failed");

    expect(startCalls).toEqual([promise]);
    expect(resolveCalls).toEqual([]);
    expect(rejectCalls).toEqual([error]);

    expect(initializer.promise).toBeNull();
    expect(initializer.value).toBeUndefined();
  });

  it("allow resolve", async () => {
    const initializer = new AsyncInitializer(async () => "x");
    initializer.resolve("y");
    expect(initializer.value).toBe("y");
    expect(initializer.error).toBeNull();
    expect(initializer.running).toBe(false);
    expect(await initializer()).toBe("y");
    initializer.resolve(Promise.resolve("z"));
    expect(await initializer()).toBe("z");
    expect(await initializer()).toBe("z");

    initializer.reject(new Error("test"));
    expect(initializer.value).toBeUndefined();
  });
});
