import { describe, expect, it } from "vitest";
import { asyncStampede_new } from "../../async/async-stampede";

describe("asyncStampede", () => {
  it("returns a function that returns a promise", async () => {
    const fn = asyncStampede_new(async () => 1);
    expect(typeof fn).toBe("function");
    const promise = fn();
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toBe(1);
  });

  it("returns the same promise when called multiple times", async () => {
    const fn = asyncStampede_new(async () => 1);
    const promise1 = fn();
    const promise2 = fn();
    expect(promise1).toBe(promise2);
    expect(await promise1).toBe(1);
    expect(await promise2).toBe(1);
  });

  it("returns a new promise when called multiple times after the first promise resolves", async () => {
    const fn = asyncStampede_new(async () => 1);
    const promise1 = fn();
    expect(await promise1).toBe(1);
    const promise2 = fn();
    expect(promise1).not.toBe(promise2);
    expect(await promise2).toBe(1);
  });

  it("returns a new promise when called multiple times after the first promise rejects", async () => {
    const fn = asyncStampede_new(async () => {
      throw new Error("test");
    });
    const promise1 = fn();
    await expect(promise1).rejects.toThrow("test");
    const promise2 = fn();
    expect(promise1).not.toBe(promise2);
    await expect(promise2).rejects.toThrow("test");
  });

  it("allows to invoke recursively", async () => {
    let counter = 0;

    const promises: Promise<number>[] = [];

    const fn = asyncStampede_new(async () => {
      if (++counter < 3) {
        promises.push(fn());
        promises.push(fn());
        promises.push(fn());
      }
      return counter;
    });

    expect(await fn()).toBe(1);

    expect(await Promise.all(promises)).toEqual([1, 1, 1]);

    expect(counter).toBe(1);
  });

  it("invokes onChange in all possible status changes", async () => {
    let onChangeInvoke = 0;
    const fn = asyncStampede_new(async () => 1);

    fn.sub(() => {
      ++onChangeInvoke;
    });

    expect(onChangeInvoke).toBe(0);

    const promise1 = fn();
    expect(onChangeInvoke).toBe(1);

    const promise2 = fn();
    expect(onChangeInvoke).toBe(1);

    expect(promise1).toBe(promise2);

    expect(await promise1).toBe(1);
    expect(onChangeInvoke).toBe(2);

    expect(await promise2).toBe(1);
    expect(onChangeInvoke).toBe(2);

    await fn();

    expect(onChangeInvoke).toBe(4);

    await Promise.all([fn(), fn()]);

    expect(onChangeInvoke).toBe(6);
  });
});
