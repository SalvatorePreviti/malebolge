// MIT license, https://github.com/SalvatorePreviti/malebolge

import type { UnsafeAny } from "@malebolge/core";

export interface AsyncDelayPromise<T = void> extends Promise<T> {
  /**
   * The timeout used to resolve the promise.
   * If undefined, the timer is resolved or rejected.
   * If null, there is no timeout (forever).
   */
  timeout: ReturnType<typeof setTimeout> | null | undefined;

  /** Force the timeout to be resolved. If already settled, does nothing and returns false. */
  resolve: (value: T) => boolean;

  /** Force the timeout to be rejected. If already settled, does nothing and returns false. */
  reject: (reason: unknown) => boolean;
}

export const asyncDelay: {
  (ms: number | null): AsyncDelayPromise<void>;
  <T>(ms: number | null, value: T, abortSignal?: AbortSignal | null | undefined): AsyncDelayPromise<T>;
} = <T>(ms: number | null, value?: T, abortSignal?: AbortSignal | null | undefined): AsyncDelayPromise<T> => {
  let resolve!: (value: T) => boolean;
  let reject!: (reason: unknown) => boolean;
  let abort: (() => void) | undefined;

  const promise = new Promise<T>((res, rej) => {
    resolve = (v) => {
      if (!res) {
        return false;
      }
      if (promise.timeout) {
        clearTimeout(promise.timeout);
      }
      promise.timeout = undefined;
      res(v);
      rej = null!;
      res = null!;
      if (abortSignal) {
        abortSignal.removeEventListener("abort", abort!);
        abort = undefined;
      }
      return true;
    };

    reject = (reason) => {
      if (!rej) {
        return false;
      }
      if (promise.timeout) {
        clearTimeout(promise.timeout);
      }
      promise.timeout = undefined;
      rej(reason);
      res = null!;
      rej = null!;
      if (abortSignal) {
        abortSignal.removeEventListener("abort", abort!);
        abort = undefined;
      }
      return true;
    };
  }) as AsyncDelayPromise<T>;

  promise.resolve = resolve;
  promise.reject = reject;
  promise.timeout =
    ms === null
      ? null
      : ((value !== undefined ? setTimeout(resolve, +ms, value) : setTimeout(resolve, +ms)) as UnsafeAny);

  if (abortSignal) {
    if (abortSignal.aborted) {
      reject(abortSignal.reason);
    } else {
      abort = () => {
        reject(abortSignal.reason);
      };
      abortSignal.addEventListener("abort", abort, { once: true });
    }
  }

  return promise;
};

export const unrefTimer = (timeout: ReturnType<typeof setTimeout> | null | undefined): boolean => {
  node: if (timeout && timeout.unref) {
    timeout.unref();
    return true;
  }
  return false;
};

export const refTimer = (timeout: ReturnType<typeof setTimeout> | null | undefined): boolean => {
  node: if (timeout && timeout.ref) {
    timeout.ref();
    return true;
  }
  return false;
};
