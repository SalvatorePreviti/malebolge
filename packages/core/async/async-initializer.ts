// This code is MIT license, see https://github.com/SalvatorePreviti/malebolge

import { EMPTY_OBJECT } from "../core";
import { notifierPubSub_new, type NotifierPubSub } from "../core/notifier-pub-sub";

export interface AsyncInitializerOptions<T = unknown> {
  /**
   * The event handler to use when the value changes
   * Is useful to use the same handler for multiple observable values or to use a custom event handler.
   */
  sub?: NotifierPubSub | undefined;

  /**
   * Called when an error happens.
   * @param error The error.
   */
  onError?: ((error: unknown) => void) | null | undefined;

  /**
   * Called when the promise is resolved.
   * @param value The value.
   */
  onResolve?: ((value: T) => void) | null | undefined;
}

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
  readonly sub: NotifierPubSub;

  /** Returns the value of the promise when resolved. Is undefined if the promise is not yet resolved. */
  valueOf(this: this): T | undefined;

  toString(): string;
}

function valueOf<T>(this: AsyncInitializer<T>): T | undefined {
  return this.value;
}

function toString<T>(this: AsyncInitializer<T>): string {
  return String(this.value);
}

/**
 * Higher order function that prevents a function returning a promise that gets initialized only once.
 * It also ensures the initializer can be called inside the initializer itself without unexpected behavior.
 * In case of error, the function will be called again.
 *
 * @param fn The function to execute. The function will be executed only once if is successful.
 * On error it will be retried on next invocation.
 * @param options The options.
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
export const asyncInitializer_new = /*@__PURE__*/ <T>(
  fn: () => Promise<T>,
  { sub = notifierPubSub_new(), onResolve, onError }: Readonly<AsyncInitializerOptions<T>> = EMPTY_OBJECT,
): AsyncInitializer<T> => {
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
            initializer.sub();
            onResolve?.(value);
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
          initializer.sub();
          onError?.(error);
        }
      };
    });

    initializer.running = true;
    try {
      initializer.sub();
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
    initializer.sub();

    return true;
  };

  initializer.promise = null as Promise<T> | null;
  initializer.running = false;
  initializer.resolved = false;
  initializer.reset = reset;
  initializer.sub = sub;
  initializer.value = undefined as T | undefined;
  initializer.valueOf = valueOf;
  initializer.toJSON = valueOf;
  initializer.toString = toString;

  return initializer;
};
