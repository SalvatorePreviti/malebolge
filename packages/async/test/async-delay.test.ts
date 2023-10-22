import { describe, it, expect } from "vitest";
import { asyncDelay } from "../async-delay";

describe("asyncDelay", () => {
  it("should resolve after the specified delay", async () => {
    const promise = asyncDelay(1);
    expect(promise.resolve).toBeInstanceOf(Function);
    expect(promise.reject).toBeInstanceOf(Function);
    expect(promise.timeout).toBeDefined();
    expect(await promise).toBeUndefined();
    expect(promise.timeout).toBeUndefined();
  });

  it("accepts a value", async () => {
    const promise = asyncDelay(1, "test");
    expect(await promise).toBe("test");
  });

  it("accepts an abortSignal", () => {
    const controller = new AbortController();
    const promise = asyncDelay(1000, undefined, controller.signal);
    controller.abort();
    return expect(promise).rejects.toThrow("aborted");
  });

  it("can be resolved on demand", () => {
    const promise = asyncDelay(1000, 123);
    expect(promise.resolve).toBeInstanceOf(Function);
    expect(promise.reject).toBeInstanceOf(Function);
    expect(promise.timeout).toBeDefined();
    promise.resolve(456);
    return expect(promise).resolves.toBe(456);
  });

  it("can be rejected on demand", () => {
    const promise = asyncDelay(1000, 123);
    expect(promise.resolve).toBeInstanceOf(Function);
    expect(promise.reject).toBeInstanceOf(Function);
    expect(promise.timeout).toBeDefined();
    promise.reject(new Error("test"));
    return expect(promise).rejects.toThrow("test");
  });
});
