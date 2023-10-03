import { describe, expect, it } from "vitest";
import { asyncInitializer_new } from "../../async/async-initializer";

describe("asyncInitializer", () => {
  it("returns the same promise when called multiple times", async () => {
    let counter = 0;
    const fn = asyncInitializer_new(async () => {
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
    const fn = asyncInitializer_new(async () => {
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

    const fn = asyncInitializer_new(async () => {
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
    const fn = asyncInitializer_new(async () => 1);

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
    const fn = asyncInitializer_new(async () => {
      if (++initInvoke === 1) {
        throw new Error("test");
      }
      return initInvoke;
    });

    fn.sub(() => ++onChangeInvoke);

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
    expect(onChangeInvoke).toBe(2);

    expect(await fn()).toBe(2);
    expect(onChangeInvoke).toBe(4);

    expect(await fn()).toBe(2);
    expect(onChangeInvoke).toBe(4);
  });

  describe("reset", () => {
    it("can reset after the promise is resolved", async () => {
      let counter = 0;
      const fn = asyncInitializer_new(async () => {
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
      const fn = asyncInitializer_new(async () => {
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
