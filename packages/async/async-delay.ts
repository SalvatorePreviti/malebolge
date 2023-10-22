// MIT license, https://github.com/SalvatorePreviti/malebolge

export interface DelayPromise<T = void> extends Promise<T> {
  /** The timeout used to resolve the promise. If undefined, the timer is resolved or rejected. */
  timeout: ReturnType<typeof setTimeout> | undefined;

  /** Force the timeout to be resolved. If already settled, does nothing and returns false. */
  resolve: (value: T) => boolean;

  /** Force the timeout to be rejected. If already settled, does nothing and returns false. */
  reject: (reason: unknown) => boolean;
}

export const asyncDelay: {
  (ms: number): DelayPromise<void>;
  <T>(ms: number, value: T, abortSignal?: AbortSignal | null | undefined): DelayPromise<T>;
} = <T>(ms: number, value?: T, abortSignal?: AbortSignal | null | undefined): DelayPromise<T> => {
  let resolve!: (value: T) => boolean;
  let reject!: (reason: unknown) => boolean;
  let abort: (() => void) | undefined;

  const promise = new Promise<T>((res, rej) => {
    resolve = (v) => {
      if (!res) {
        return false;
      }
      clearTimeout(promise.timeout);
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
      clearTimeout(promise.timeout);
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
  }) as DelayPromise<T>;

  promise.resolve = resolve;
  promise.reject = reject;
  promise.timeout = (value !== undefined
    ? setTimeout(resolve, +ms, value)
    : setTimeout(resolve, +ms)) as unknown as ReturnType<typeof setTimeout>;
  value = null!;

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

export const unrefTimeout = (timeout: ReturnType<typeof setTimeout> | null | undefined): boolean => {
  node: if (timeout && timeout.unref) {
    timeout.unref();
    return true;
  }
  return false;
};

export const refTimeout = (timeout: ReturnType<typeof setTimeout> | null | undefined): boolean => {
  node: if (timeout && timeout.ref) {
    timeout.ref();
    return true;
  }
  return false;
};
