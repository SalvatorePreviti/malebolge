// MIT license, https://github.com/SalvatorePreviti/malebolge

import { EMPTY_OBJECT } from "@malebolge/core";
import { asyncDelay } from "./async-delay";

export type AsyncRetryStartHandler = (attempt: number, attempts: number) => void;

export type AsyncRetryResolveHandler<T = unknown> = (value: T, attempt: number, attempts: number) => void;

export type AsyncRetryErrorHandler = (error: unknown, attempt: number, attempts: number) => void;

export interface RetryOptions {
  /** The maximum amount of attempts until failure. */
  attempts?: number;

  /** Exponential backoff multiplier. */
  backoff?: number;

  /** The initial and minimum amount of milliseconds between attempts. */
  minTimeout?: number;

  /** The maximum milliseconds between attempts. */
  maxTimeout?: number;

  /** Amount of jitter to introduce to the time between attempts, from 0 to 1. */
  jitter?: number;
}

export const defaultRetryOptions = {
  attempts: 3,
  backoff: 2,
  minTimeout: 150,
  maxTimeout: 10000,
  jitter: 0.1,
} satisfies RetryOptions;

export const getRetryOptions = (options: RetryOptions | boolean | null = defaultRetryOptions) => {
  if (!options) {
    return null;
  }
  let {
    attempts = defaultRetryOptions.attempts,
    minTimeout = defaultRetryOptions.minTimeout,
    maxTimeout = defaultRetryOptions.maxTimeout,
    backoff = defaultRetryOptions.backoff,
    jitter = defaultRetryOptions.jitter,
  } = options === true ? defaultRetryOptions : options;
  if (minTimeout > maxTimeout) {
    minTimeout = maxTimeout;
  }
  return { attempts, minTimeout, maxTimeout, backoff, jitter };
};

export const calculateRetryTimeout = (
  attempt: number,
  options: RetryOptions | boolean | null = defaultRetryOptions,
): number | null => {
  if (!options) {
    return null;
  }
  if (options === true) {
    options = defaultRetryOptions;
  }
  let {
    attempts = defaultRetryOptions.attempts,
    minTimeout = defaultRetryOptions.minTimeout,
    maxTimeout = defaultRetryOptions.maxTimeout,
    backoff = defaultRetryOptions.backoff,
    jitter = defaultRetryOptions.jitter,
  } = options;
  if (attempt + 1 >= attempts) {
    return null;
  }
  if (minTimeout > maxTimeout) {
    minTimeout = maxTimeout;
  }
  let ms = minTimeout * backoff ** attempt;
  if (maxTimeout < ms) {
    ms = maxTimeout;
  }
  ms = jitter ? (1 - jitter * Math.random()) * ms : ms;
  return ms;
};

export interface AsyncRetryOptions<T = unknown> extends RetryOptions {
  /** Signal used to abort the retry */
  signal?: AbortSignal | null | undefined;

  /**
   * Called every time when the promise is retried.
   */
  onStart?: AsyncRetryStartHandler | null | undefined;

  /**
   * Callback invoked when the operation succeeds.
   */
  onResolve?: AsyncRetryResolveHandler<T> | null | undefined;

  /**
   * Callback invoked when an attempt fails.
   * Throwing an error inside this callback will abort the retry.
   *
   * If specified, this overrides the default handling of the AbortError, that is, throwing it breaking the retry.
   *
   * @param error The error that caused the attempt to fail.
   * @param attempt The current attempt number.
   */
  onReject?: AsyncRetryErrorHandler | null | undefined;
}

export async function asyncRetry<T>(
  fn: (() => Promise<T>) | (() => T),
  options: Readonly<AsyncRetryOptions<T>> = EMPTY_OBJECT,
) {
  let attempt = 0;
  for (; ; ++attempt) {
    const { signal, attempts = defaultRetryOptions.attempts } = options;
    if (signal && signal.aborted) {
      throw signal.reason;
    }
    try {
      options.onStart?.(attempt, attempts);
      const result = await fn();
      options.onResolve?.(result, attempt, attempts);
      return result;
    } catch (error) {
      options.onReject?.(error, attempt, attempts);
      const ms = calculateRetryTimeout(attempt, options);
      if (ms === null) {
        throw error;
      }
      await asyncDelay(ms, undefined, signal);
    }
  }
}
