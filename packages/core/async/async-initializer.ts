import { newSimpleEvent, type SimpleEventSubFn } from "../simple-event";

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
  readonly sub: SimpleEventSubFn<Error | null>;

  /**
   * Notifies the subscribers of the current state registered with `sub`.
   * @param value The error to emit, or null if there was no error.
   */
  readonly emit: (value: Error | null) => void;
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
  const { sub, emit } = newSimpleEvent<Error | null>();

  let resetPending = false;

  const initializer = ((): Promise<T> => {
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
            emit(null);
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
          emit(error as Error);
        }
      };
    });

    initializer.running = true;
    try {
      emit(null);
      void fn().then(resolved, rejected);
    } catch (e) {
      rejected?.(e);
    }

    return initializer.promise;
  }) as {
    (): Promise<T>;
    promise: Promise<T> | null;
    running: boolean;
    resolved: boolean;
    value?: T | undefined;
    sub: SimpleEventSubFn<Error | null>;
    emit: (value: Error | null) => void;
    reset: () => boolean;
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
    emit(null);

    return true;
  };

  initializer.promise = null;
  initializer.running = false;
  initializer.resolved = false;
  initializer.reset = reset;
  initializer.sub = sub;

  return initializer;
};
