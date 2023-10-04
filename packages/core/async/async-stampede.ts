import { EMPTY_OBJECT } from "../core";
import { notifierPubSub_new, type NotifierPubSub } from "../core/notifier-pub-sub";

export interface AsyncStampedeOptions {
  /**
   * The event handler to use when the value changes
   * Is useful to use the same handler for multiple observable values or to use a custom event handler.
   */
  sub?: NotifierPubSub | undefined;
}

export interface AsyncStampede<T> {
  (): Promise<T>;

  /** The current promise. Is null if is not running, is not null while is running. */
  readonly promise: Promise<T> | null;

  /**
   * Attaches an handler that gets notified every time the state changes. It returns an unsubscribe function.
   */
  readonly sub: NotifierPubSub;
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
 * @param options The options.
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
export const asyncStampede_new = /* @__PURE__ */ <T>(
  fn: () => Promise<T>,
  { sub = notifierPubSub_new() }: Readonly<AsyncStampedeOptions> = EMPTY_OBJECT,
): AsyncStampede<T> => {
  const stampede = (): Promise<T> => {
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
          sub();
        }
      };
      rejected = (error: unknown) => {
        if (rejected) {
          stampede.promise = null;
          resolved = undefined;
          rejected = undefined;
          reject(error);
          sub();
        }
      };
    });

    try {
      sub();
      void fn().then(resolved, rejected);
    } catch (e) {
      rejected?.(e);
    }

    return stampede.promise;
  };

  stampede.promise = null as Promise<T> | null;
  stampede.sub = sub;

  return stampede;
};
