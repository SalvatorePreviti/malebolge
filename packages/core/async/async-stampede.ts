import { newSimpleEvent, type SimpleEventSubFn } from "../simple-event";

export interface AsyncStampede<T> {
  (): Promise<T>;

  /** The current promise. Is null if is not running, is not null while is running. */
  readonly promise: Promise<T> | null;

  /**
   * Attaches an handler that gets notified every time the state changes. It returns an unsubscribe function.
   * The argument if not null is an Error due to a reject.
   */
  readonly sub: SimpleEventSubFn<Error | null>;

  /**
   * Notifies the subscribers of the current state registered with `sub`.
   * @param value The error to emit, or null if there was no error.
   */
  readonly emit: (value: Error | null) => void;
}

/**
 * Higher order function that prevents a function returning a promise
 * from being executed more than once at the same time.
 * This to avoid the stampede effect.
 *
 * While the function is executing, subsequent calls to the function
 * will return the same promise.
 *
 * @param fn The function to execute.
 * @returns A function that returns a promise.
 *
 * @example
 *
 * let counter = 0;
 *
 * const fn = promiseStampede(async () => {
 *  await sleep(300);
 *  return ++counter;
 * });
 *
 * await Promise.all([fn(), fn(), fn()]);
 *
 * console.log(counter); // 1
 */
export const asyncStampede = /* @__PURE__ */ <T>(fn: () => Promise<T>): AsyncStampede<T> => {
  const { sub, emit } = newSimpleEvent<Error | null>();

  const stampede = ((): Promise<T> => {
    if (stampede.promise) {
      return stampede.promise;
    }

    let resolved: ((value: T) => void) | undefined;
    let rejected: ((error: unknown) => void) | undefined;
    stampede.promise = new Promise<T>((resolve, reject) => {
      resolved = (value: T) => {
        if (resolved) {
          stampede.promise = null;
          resolved = undefined;
          rejected = undefined;
          resolve(value);
          emit(null);
        }
      };
      rejected = (error: unknown) => {
        if (rejected) {
          stampede.promise = null;
          resolved = undefined;
          rejected = undefined;
          reject(error);
          emit(error as Error);
        }
      };
    });

    try {
      emit(null);
      void fn().then(resolved, rejected);
    } catch (e) {
      rejected?.(e);
    }

    return stampede.promise;
  }) as {
    (): Promise<T>;
    promise: Promise<T> | null;
    sub: SimpleEventSubFn<Error | null>;
    emit: (value: Error | null) => void;
  };

  stampede.promise = null;
  stampede.sub = sub;
  stampede.emit = emit;

  return stampede;
};