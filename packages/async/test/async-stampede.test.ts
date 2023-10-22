import { describe, expect, it } from "vitest";
import { AsyncStampede } from "@malebolge/async";
import { fnUndefined } from "@malebolge/core";

describe("asyncStampede", () => {
  it("returns a function that returns a promise", async () => {
    const fn = new AsyncStampede(async () => 1);
    expect(typeof fn).toBe("function");
    const promise = fn();
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toBe(1);
  });

  it("returns the same promise when called multiple times", async () => {
    const fn = new AsyncStampede(async () => 1);
    const promise1 = fn();
    const promise2 = fn();
    expect(promise1).toBe(promise2);
    expect(await promise1).toBe(1);
    expect(await promise2).toBe(1);
  });

  it("returns a new promise when called multiple times after the first promise resolves", async () => {
    const fn = new AsyncStampede(async () => 1);
    const promise1 = fn();
    expect(await promise1).toBe(1);
    const promise2 = fn();
    expect(promise1).not.toBe(promise2);
    expect(await promise2).toBe(1);
  });

  it("returns a new promise when called multiple times after the first promise rejects", async () => {
    const fn = new AsyncStampede(async () => {
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

    const fn = new AsyncStampede(async () => {
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
    const fn = new AsyncStampede(async () => 1);

    fn.onChange = () => ++onChangeInvoke;

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

  it("aborts with abort signals", async () => {
    const abortController = new AbortController();
    const fn = new AsyncStampede(async () => 1);
    fn.attachAbortSignal(abortController.signal);

    expect(await fn()).toBe(1);

    abortController.abort();

    let error1: unknown;
    let error2: unknown;
    try {
      await fn();
    } catch (e) {
      error1 = e;
    }

    try {
      await fn();
    } catch (e) {
      error2 = e;
    }

    expect(error1).toBeInstanceOf(DOMException);
    expect(error1).toBe(error2);
  });

  it("invokes onStart, onResolve and onReject", async () => {
    let changeCount = 0;
    let invokeCount = 0;
    let onBeforeStartInvoke = 0;
    let onStartInvoke = 0;
    let onResolveInvoke = 0;
    let onRejectInvoke = 0;
    let onFinallyInvoke = 0;
    let onFinallySuccess = 0;
    let onFinallyFail = 0;
    const resolvedValues: number[] = [];
    const abortedReasons: unknown[] = [];

    const fn = new AsyncStampede(
      async () => {
        if (++invokeCount > 1) {
          throw new Error("test");
        }
        return invokeCount;
      },
      {
        onChange: () => ++changeCount,
        onBeforeStart: () => {
          ++onBeforeStartInvoke;
        },
        onStart: (promise) => {
          expect(promise).toBe(fn.promise);
          ++onStartInvoke;
        },
        onResolve: (value) => {
          resolvedValues.push(value);
          ++onResolveInvoke;
        },
        onReject: (reason) => {
          expect(reason).toBeInstanceOf(Error);
          ++onRejectInvoke;
        },
        onAbort: (reason) => {
          abortedReasons.push(reason);
        },
        onFinally: (success) => {
          if (success) {
            ++onFinallySuccess;
          } else {
            ++onFinallyFail;
          }
          ++onFinallyInvoke;
        },
      },
    );

    expect(onStartInvoke).toBe(0);
    expect(changeCount).toBe(0);
    expect(onBeforeStartInvoke).toBe(0);

    const promise1 = fn();
    expect(onBeforeStartInvoke).toBe(1);
    expect(onStartInvoke).toBe(1);
    expect(onResolveInvoke).toBe(0);
    expect(onRejectInvoke).toBe(0);
    expect(onFinallyInvoke).toBe(0);
    expect(changeCount).toBe(1);

    fn().catch(fnUndefined);
    expect(onBeforeStartInvoke).toBe(2);
    expect(onStartInvoke).toBe(1);

    expect(await promise1).toBe(1);
    expect(onStartInvoke).toBe(1);
    expect(onResolveInvoke).toBe(1);
    expect(onRejectInvoke).toBe(0);
    expect(onFinallyInvoke).toBe(1);
    expect(onFinallySuccess).toBe(1);
    expect(changeCount).toBe(2);

    await expect(fn()).rejects.toThrow();
    expect(onStartInvoke).toBe(2);
    expect(onResolveInvoke).toBe(1);
    expect(onRejectInvoke).toBe(1);
    expect(onFinallyInvoke).toBe(2);
    expect(onFinallySuccess).toBe(1);
    expect(onFinallyFail).toBe(1);
    expect(changeCount).toBe(4);

    await expect(fn()).rejects.toThrow();
    expect(onStartInvoke).toBe(3);
    expect(onResolveInvoke).toBe(1);
    expect(onRejectInvoke).toBe(2);
    expect(onFinallyInvoke).toBe(3);
    expect(onFinallySuccess).toBe(1);
    expect(onFinallyFail).toBe(2);
    expect(changeCount).toBe(6);

    expect(onBeforeStartInvoke).toBe(4);
    expect(abortedReasons).toHaveLength(0);

    let resolve!: (value: number) => void;
    const lockedPromise = new Promise<number>((res) => (resolve = res));

    expect(fn.running).toBe(false);
    expect(fn.promise).toBeNull();

    fn.throwIfAborted();

    const abortedPromise = fn.start(lockedPromise);

    expect(fn.running).toBe(true);
    expect(fn.promise).toBe(abortedPromise);

    const abortReason = new Error("abort");
    expect(fn.abort(abortReason)).toBe(true);

    let failError: unknown;
    try {
      await abortedPromise;
    } catch (e) {
      failError = e;
    }
    resolve(123);
    expect(failError).toBe(abortReason);
    failError = null;
    try {
      fn.throwIfAborted();
    } catch (e) {
      failError = e;
    }
    expect(failError).toBe(abortReason);

    expect(fn.aborted).toBe(true);
    expect(abortedReasons).toHaveLength(1);
    expect(fn.abortReason).toBe(abortReason);

    expect(fn.abort(new Error("xxx"))).toBe(false);
    expect(fn.aborted).toBe(true);
    expect(abortedReasons).toHaveLength(1);
    expect(fn.abortReason).toBe(abortReason);

    expect(resolvedValues).toEqual([1]);
    expect(abortedReasons).toEqual([abortReason]);
  });

  it("forwards errors thrown in onResolve", async () => {
    const fn = new AsyncStampede(async () => 1, {
      onResolve: () => {
        throw new Error("test");
      },
    });

    let subCount = 0;
    fn.onChange = () => ++subCount;

    const promise = fn();
    expect(subCount).toBe(1);

    await expect(promise).rejects.toThrow("test");

    expect(subCount).toBe(2);
  });

  it("allow to override a promise in flight if resolve is called", async () => {
    let myResolve!: (value: number) => void;
    const myPromise = new Promise<number>((res) => (myResolve = res));
    let counter = 0;

    const fn = new AsyncStampede(async () => {
      return ++counter === 1 ? myPromise : counter;
    });

    const promise = fn();

    expect(fn.running).toBe(true);
    expect(fn.promise).not.toBeNull();

    fn.resolve(100);

    fn.resolve(200);
    fn.reject(new Error());

    expect(fn.running).toBe(false);
    expect(fn.promise).toBeNull();

    expect(await promise).toBe(100);

    myResolve(10);

    expect(await fn()).toBe(2);
  });

  it("allow to override a promise in flight if reject is called", async () => {
    let myResolve!: (value: number) => void;
    const myPromise = new Promise<number>((res) => (myResolve = res));
    let counter = 0;

    const fn = new AsyncStampede(async () => {
      return ++counter === 1 ? myPromise : counter;
    });

    const promise = fn();

    expect(fn.running).toBe(true);
    expect(fn.promise).not.toBeNull();

    fn.reject(new Error("test1"));

    myResolve(10);

    await expect(promise).rejects.toThrow("test1");

    await expect(fn()).resolves.toBe(2);
  });
});
