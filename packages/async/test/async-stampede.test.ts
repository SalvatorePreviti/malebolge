import { describe, expect, it } from "vitest";
import { AsyncStampede, asyncDelay } from "@malebolge/async";
import { TimeoutError, AbortError, fnUndefined } from "@malebolge/core";

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

  it("invokes onChange", async () => {
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

  it("invokes callbacks", async () => {
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
        onSettled: (success) => {
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

  it("allow to resolve during a reject", async () => {
    const fn = new AsyncStampede<number>(async () => Promise.reject(new Error("test")), {
      onReject() {
        fn.resolve(100);
      },
    });
    const promise = fn();
    expect(fn.running).toBe(true);
    expect(fn.promise).not.toBeNull();
    expect(await promise).toBe(100);
  });

  it("allow to restart during a reject", async () => {
    let counter = 0;
    const fn = new AsyncStampede<number>(
      async () => {
        if (++counter < 3) {
          throw new Error("test");
        }
        return counter;
      },
      {
        onReject() {
          if (counter < 5) {
            fn.restartSync();
          }
        },
      },
    );
    const promise = fn();
    expect(fn.running).toBe(true);
    expect(fn.promise).not.toBeNull();
    expect(await promise).toBe(3);
  });

  describe("retry", () => {
    it("can retry a promise", async () => {
      let counter = 0;
      const fn = new AsyncStampede<number>(
        async () => {
          if (++counter < 3) {
            throw new Error("test");
          }
          return counter;
        },
        { retry: { attempts: 4, backoff: 1, jitter: 0, minTimeout: 1, maxTimeout: 5 } },
      );
      const promise = fn();
      expect(fn.retryAttempt).toBe(0);
      expect(fn.running).toBe(true);
      expect(fn.promise).not.toBeNull();
      expect(await promise).toBe(3);
      expect(fn.running).toBe(false);
      expect(fn.retryAttempt).toBe(2);
    });

    it("can abort a promise while is retrying", async () => {
      const deferred = asyncDelay(null);
      let counter = 0;
      const fn = new AsyncStampede<number>(
        async () => {
          await asyncDelay(5);
          if (++counter > 1) {
            deferred.resolve();
          }
          throw new Error("test");
        },
        { retry: { attempts: 4, backoff: 1000, jitter: 0, minTimeout: 1, maxTimeout: 50000 } },
      );
      const promise = fn();
      expect(fn.running).toBe(true);
      expect(fn.promise).not.toBeNull();
      await deferred;
      fn.abort(new Error("aborted"));
      await expect(promise).rejects.toThrow("aborted");
      expect(fn.retryAttempt).toBe(1);
      expect(counter).toBe(2);

      fn.clearAbort();
      expect(await fn.start(() => 412)).toBe(412);
      expect(fn.retryAttempt).toBe(0);
    });

    it('can trigger a retry with "triggerRetry" method', async () => {
      const deferred = asyncDelay(null);
      let counter = 0;
      const fn = new AsyncStampede<number>(
        async () => {
          if (++counter < 2) {
            deferred.resolve();
            throw new Error("test");
          }
          return counter;
        },
        { retry: { attempts: 4, backoff: 1, jitter: 0, minTimeout: 100000, maxTimeout: 100000 } },
      );
      const promise = fn();
      await deferred;
      fn.triggerRetry();
      expect(await promise).toBe(2);
      expect(fn.running).toBe(false);
      expect(fn.retryAttempt).toBe(1);
    });
  });

  describe("timeout", () => {
    it("resolve normally if timeout does not exceed", async () => {
      const fn = new AsyncStampede<number>(async () => asyncDelay(1, 1), { timeout: 1000 });
      const promise = fn();
      expect(fn.running).toBe(true);
      expect(await promise).toBe(1);
    });

    it("rejects the promise if timeout exceeds", async () => {
      const fn = new AsyncStampede<number>(async () => asyncDelay(1000, 1), { timeout: 1 });
      const promise = fn();
      expect(fn.running).toBe(true);
      await expect(promise).rejects.toThrow(TimeoutError.message);
    });
  });

  describe("throttle", () => {
    it("throttle the execution of the function", async () => {
      let counter = 0;
      const fn = new AsyncStampede<number>(async () => ++counter, { throttle: 100 });
      const promise1 = fn();
      const promise2 = fn();
      const promise3 = fn();
      expect(fn.running).toBe(true);
      expect(await promise1).toBe(1);
      expect(await promise2).toBe(1);
      expect(await promise3).toBe(1);
      expect(fn.running).toBe(false);
      expect(counter).toBe(1);
    });

    it("throttle the execution of the function with a custom throttle function", async () => {
      let counter = 0;
      const fn = new AsyncStampede<number>(async () => ++counter, {
        throttle: () => 100,
      });
      const promise1 = fn();
      const promise2 = fn();
      const promise3 = fn();
      expect(fn.running).toBe(true);
      expect(await promise1).toBe(1);
      expect(await promise2).toBe(1);
      expect(await promise3).toBe(1);
      expect(fn.running).toBe(false);
      expect(counter).toBe(1);
    });
  });

  describe("abort", () => {
    it("exposes a signal", async () => {
      const abortController = new AbortController();
      const fn = new AsyncStampede(async () => 1);
      fn.attachAbortSignal(abortController.signal);

      expect(fn.signal).toBeInstanceOf(AbortSignal);

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

    it("is aborted when the promise is aborted", async () => {
      const fn = new AsyncStampede<number>(async () => asyncDelay(1000, 1), { timeout: 1 });
      const promise = fn();
      expect(fn.running).toBe(true);
      expect(fn.signal.aborted).toBe(false);
      let abortCount = 0;
      fn.signal.addEventListener("abort", () => {
        ++abortCount;
      });
      fn.abort();
      expect(fn.signal.aborted).toBe(true);
      await expect(promise).rejects.toThrow(AbortError.message);
      expect(abortCount).toBe(1);
      fn.abort();
      expect(abortCount).toBe(1);
      fn.clearAbort();
      expect(fn.signal.aborted).toBe(false);
      expect(fn.abortReason).toBeUndefined();
      expect(abortCount).toBe(1);
      const error2 = new Error();
      fn.abort(error2);
      expect(abortCount).toBe(2);
      expect(fn.signal.aborted).toBe(true);
      expect(fn.abortReason).toBe(error2);
    });
  });

  describe("cacheFor", () => {
    it("should cache the value for the specified time", async () => {
      let counter = 0;
      const fn = new AsyncStampede<number>(async () => ++counter, { cacheFor: 70 });
      const promise1 = fn();
      const promise2 = fn();
      const promise3 = fn();
      expect(fn.running).toBe(true);
      expect(await promise1).toBe(1);
      expect(await promise2).toBe(1);
      expect(await promise3).toBe(1);
      expect(fn.running).toBe(false);
      expect(counter).toBe(1);
      expect(fn.isCacheExpired()).toBe(false);
      await asyncDelay(80);
      expect(fn.isCacheExpired()).toBe(true);
      expect(fn.promise).toBeNull();
      expect(await fn()).toBe(2);
      expect(counter).toBe(2);
    });
  });
});
