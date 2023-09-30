import { newSimpleEvent } from "../core/simple-event";
import type { SimpleEvent } from "../core/simple-event";

export interface AsyncInitializer<T> {
  (): Promise<T>;

  /** The current promise. Is null if the initializer was never called or if the initializer failed, is not null after the first call. */
  readonly promise: Promise<T> | null;

  /** Whether the promise is currently running and pending. */
  readonly running: boolean;

  /** Whether the promise was resolved. */
  readonly resolved: boolean;

  /** The value of the promise when resolved. */
  readonly value?: T | undefined;

  /** Resets the initializer so the promise will be started again on next invocation. */
  readonly reset: () => boolean;

  /** Attaches an handler that gets notified every time the state changes. It returns an unsubscribe function. */
  readonly sub: SimpleEvent;
}

/**
 * Higher order function that prevents a function returning a promise that gets initialized only once.
 * It also ensures the initializer can be called inside the initializer itself without unexpected behavior.
 * In case of error, the function will be called again.
 *
 * @param fn The function to execute. The function will be executed only once if is successful.
 * On error it will be retried on next invocation.
 * @returns A function that returns a promise.
 *
 * @example
 *
 * const fn = promiseInitializer(async () => {
 *  await sleep(300);
 *  console.log('initialized');
 * });
 *
 * await Promise.all([fn(), fn(), fn()]); // 'initialized' only once
 *
 * console.log('done');
 */
export const asyncInitializer = /* @__PURE__ */ <T>(fn: () => Promise<T>): AsyncInitializer<T> => {
  const sub = newSimpleEvent();

  let resetPending = false;

  const initializer = (): Promise<T> => {
    if (initializer.promise) {
      return initializer.promise;
    }

    let resolved: ((value: T) => void) | undefined | null;
    let rejected: ((error: unknown) => void) | undefined | null;
    initializer.promise = new Promise<T>((resolve, reject) => {
      resolved = (value: T) => {
        if (resolved) {
          resolved = null;
          rejected = null;
          initializer.running = false;
          if (resetPending) {
            resetPending = false;
            initializer.promise = null;
            initializer().then(resolve, reject);
          } else {
            initializer.resolved = true;
            initializer.value = value;
            resolve(value);
            sub.emit();
          }
        }
      };
      rejected = (error: unknown) => {
        if (rejected) {
          resolved = null;
          rejected = null;
          initializer.running = false;
          initializer.promise = null;
          resetPending = false;
          reject(error);
          sub.emit(error);
        }
      };
    });

    initializer.running = true;
    try {
      sub.emit();
      void fn().then(resolved, rejected);
    } catch (e) {
      rejected?.(e);
    }

    return initializer.promise;
  };

  const reset = (): boolean => {
    const { promise, running, resolved } = initializer;
    if (!promise) {
      return false;
    }

    if (running) {
      resetPending = true;
      return true;
    }

    resetPending = false;

    if (!resolved) {
      return false;
    }

    initializer.resolved = false;
    initializer.promise = null;
    initializer.value = undefined;
    sub.emit();

    return true;
  };

  initializer.promise = null as Promise<T> | null;
  initializer.running = false;
  initializer.resolved = false;
  initializer.reset = reset;
  initializer.sub = sub;
  initializer.value = undefined as T | undefined;

  return initializer;
};
