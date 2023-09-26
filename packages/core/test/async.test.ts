import { setTimeout } from "timers/promises";

import { describe, expect, it } from "vitest";
import { AsyncGate, asyncInitializer, asyncStampede } from "../async";
import { fnUndefined } from "../fns";

describe("asyncInitializer", () => {
  it("returns the same promise when called multiple times", async () => {
    let counter = 0;
    const fn = asyncInitializer(async () => {
      return ++counter;
    });
    expect(fn.resolved).toBe(false);
    expect(fn.running).toBe(false);
    const promise1 = fn();
    expect(fn.resolved).toBe(false);
    expect(fn.running).toBe(true);
    const promise2 = fn();
    expect(fn.resolved).toBe(false);
    expect(fn.running).toBe(true);
    expect(promise1).toBe(promise2);
    expect(await promise1).toBe(1);
    expect(fn.resolved).toBe(true);
    expect(fn.running).toBe(false);
    expect(await promise2).toBe(1);
    expect(fn.resolved).toBe(true);
    expect(fn.running).toBe(false);
    await fn();
    expect(counter).toBe(1);
  });

  it("retries on error", async () => {
    let initialized = 0;
    const fn = asyncInitializer(async () => {
      if (++initialized === 1) {
        throw new Error("test");
      }
      return initialized;
    });
    const promise1 = fn();
    const promise2 = fn();
    expect(promise1).toBe(promise2);

    let thrown = false;
    try {
      await promise1;
      expect(fn.resolved).toBe(false);
      expect(fn.running).toBe(false);
      await promise2;
    } catch (error) {
      thrown = true;
      expect((error as Error).message).toBe("test");
    }
    expect(thrown).toBe(true);

    expect(await fn()).toBe(2);

    expect(fn.resolved).toBe(true);
    expect(fn.running).toBe(false);

    expect(await fn()).toBe(2);

    expect(fn.resolved).toBe(true);
    expect(fn.running).toBe(false);
  });

  it("allows to invoke recursively", async () => {
    let counter = 0;

    const promises: Promise<number>[] = [];

    const fn = asyncInitializer(async () => {
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
    const fn = asyncInitializer(async () => 1);

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

    expect(onChangeInvoke).toBe(2);
  });

  it("invokes onChange in case of error and retry", async () => {
    let onChangeInvoke = 0;
    let initInvoke = 0;
    let onChangeError: unknown;
    const fn = asyncInitializer(async () => {
      if (++initInvoke === 1) {
        throw new Error("test");
      }
      return initInvoke;
    });

    fn.sub((e) => {
      onChangeError = e;
      ++onChangeInvoke;
    });

    expect(onChangeInvoke).toBe(0);

    const promise1 = fn();
    expect(onChangeInvoke).toBe(1);

    const promise2 = fn();
    expect(onChangeInvoke).toBe(1);

    expect(promise1).toBe(promise2);

    let thrown = false;
    try {
      await promise1;
    } catch (error) {
      thrown = true;
      expect((error as Error).message).toBe("test");
    }

    expect(thrown).toBe(true);
    expect((onChangeError as Error).message).toBe("test");
    expect(onChangeInvoke).toBe(2);

    expect(await fn()).toBe(2);
    expect(onChangeInvoke).toBe(4);

    expect(await fn()).toBe(2);
    expect(onChangeInvoke).toBe(4);
  });

  describe("reset", () => {
    it("can reset after the promise is resolved", async () => {
      let counter = 0;
      const fn = asyncInitializer(async () => {
        return ++counter;
      });
      expect(await fn()).toBe(1);

      fn.reset();

      expect(fn.resolved).toBe(false);
      expect(fn.running).toBe(false);

      await fn();

      expect(fn.resolved).toBe(true);
      expect(counter).toBe(2);

      await fn();

      expect(fn.resolved).toBe(true);
      expect(counter).toBe(2);
    });

    it("can reset while still loading, resetting after the promise is resolved", async () => {
      let counter = 0;
      const fn = asyncInitializer(async () => {
        return ++counter;
      });

      const promise = fn();
      expect(fn.resolved).toBe(false);
      expect(fn.running).toBe(true);

      fn.reset();

      expect(fn.resolved).toBe(false);
      expect(fn.running).toBe(true);

      await promise;

      expect(fn.resolved).toBe(true);
      expect(counter).toBe(2);

      await fn();

      expect(fn.resolved).toBe(true);
      expect(counter).toBe(2);
    });
  });
});

describe("promiseStampede", () => {
  it("returns a function that returns a promise", async () => {
    const fn = asyncStampede(async () => 1);
    expect(typeof fn).toBe("function");
    const promise = fn();
    expect(promise).toBeInstanceOf(Promise);
    expect(await promise).toBe(1);
  });

  it("returns the same promise when called multiple times", async () => {
    const fn = asyncStampede(async () => 1);
    const promise1 = fn();
    const promise2 = fn();
    expect(promise1).toBe(promise2);
    expect(await promise1).toBe(1);
    expect(await promise2).toBe(1);
  });

  it("returns a new promise when called multiple times after the first promise resolves", async () => {
    const fn = asyncStampede(async () => 1);
    const promise1 = fn();
    expect(await promise1).toBe(1);
    const promise2 = fn();
    expect(promise1).not.toBe(promise2);
    expect(await promise2).toBe(1);
  });

  it("returns a new promise when called multiple times after the first promise rejects", async () => {
    const fn = asyncStampede(async () => {
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

    const fn = asyncStampede(async () => {
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
    const fn = asyncStampede(async () => 1);

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

describe("AsyncGate", () => {
  it("constructs an unlocked lock", async () => {
    const lock = new AsyncGate();
    expect(lock.locked).toBe(false);
    await lock.enter();
    lock.locked = true;
    expect(lock.locked).toBe(true);
    lock.locked = false;
    expect(lock.locked).toBe(false);
    await lock.enter();
  });

  it("can lock and unlock and the promise resolves only when unlocked", async () => {
    const lock = new AsyncGate();
    expect(lock.locked).toBe(false);
    expect(await lock.enter()).toBeUndefined();
    lock.locked = true;
    expect(lock.locked).toBe(true);
    let unlocked = 0;
    const incrementUnlocked = () => ++unlocked;
    void lock.enter().then(incrementUnlocked).catch(fnUndefined);
    expect(unlocked).toBe(0);
    await setTimeout(1);
    lock.locked = false;
    void lock.enter().then(incrementUnlocked).catch(fnUndefined);
    await setTimeout(1);
    lock.locked = true;
    void lock.enter().then(incrementUnlocked).catch(fnUndefined);
    lock.locked = false;
    await setTimeout(1);
    await lock.enter();
    expect(unlocked).toBe(3);
  });

  it("does not trigger with false positives toggling locked property", async () => {
    const lock = new AsyncGate();
    lock.locked = true;
    lock.locked = false;
    lock.locked = true;
    let unlocked = 0;
    const promise = lock.enter().then(() => ++unlocked);
    await setTimeout(1);
    expect(unlocked).toBe(0);
    lock.locked = false;
    lock.locked = true;
    await setTimeout(1);
    expect(unlocked).toBe(0);
    lock.locked = false;
    expect(await promise).toBe(1);
    expect(unlocked).toBe(1);
  });
});
