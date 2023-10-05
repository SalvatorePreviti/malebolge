// This code is MIT license, see https://github.com/SalvatorePreviti/malebolge

import { EMPTY_OBJECT } from "../core";
import { notifierPubSub_new, type NotifierPubSub } from "../core/notifier-pub-sub";

export interface AsyncStampedeOptions {
  /**
   * The event handler to use when the value changes
   * Is useful to use the same handler for multiple observable values or to use a custom event handler.
   */
  sub?: NotifierPubSub | undefined;

  /** AbortSignal. If the signal is aborted subsequent calls to this function will fail. */
  signal?: AbortSignal | null | undefined;
}

export interface AsyncStampede<T> {
  (): Promise<T>;

  /** The current promise. Is null if is not running, is not null while is running. */
  readonly promise: Promise<T> | null;

  /** Notification pub-sub when something changes. */
  sub: NotifierPubSub;
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
export const asyncStampede_new = /*@__PURE__*/ <T>(
  fn: () => Promise<T>,
  options: Readonly<AsyncStampedeOptions> = EMPTY_OBJECT,
): AsyncStampede<T> => {
  let _resolve: ((value: T) => void) | undefined | null;
  let _reject: ((error: unknown) => void) | undefined | null;
  let resolved: (value: T) => void;
  let rejected: (error: unknown) => void;

  let abortSignalRegistered = false;
  const abortSignal = options.signal;

  const promiseInit = (resolve: (value: T) => void, reject: (error: unknown) => void) => {
    _reject = reject;
    if (abortSignal) {
      abortSignal.throwIfAborted();
      if (!abortSignalRegistered) {
        abortSignalRegistered = true;
        abortSignal.addEventListener("abort", () => rejected(abortSignal.reason), { once: true });
      }
    }
    _resolve = resolve;
  };

  const stampede = (): Promise<T> => {
    if (!stampede.promise) {
      stampede.promise = new Promise<T>(promiseInit);
      try {
        stampede.sub();
        void fn().then(resolved, rejected);
      } catch (e) {
        rejected?.(e);
      }
    }
    return stampede.promise;
  };

  resolved = (value: T) => {
    if (stampede.promise) {
      stampede.promise = null;
      try {
        stampede.sub();
      } catch (error) {
        _reject?.(error);
        try {
          stampede.sub();
        } catch {}
        return;
      }
      _resolve?.(value);
      _reject = null;
      _resolve = null;
    }
  };

  rejected = (error: unknown) => {
    if (stampede.promise) {
      stampede.promise = null;
      _reject?.(error);
      _reject = null;
      _resolve = null;
      stampede.sub();
    }
  };

  stampede.promise = null as Promise<T> | null;
  stampede.sub = options.sub || notifierPubSub_new();

  return stampede;
};
