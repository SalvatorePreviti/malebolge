import type { UnsafeAny } from "../core";
import { EMPTY_OBJECT } from "../core";
import { isAbortError } from "./abort-error";
import { delay } from "./delay";

export type AsyncRetryErrorHandler = (error: unknown, attempt: number, attempts: number) => void;

export const RETRY_BACKOFF = 2;

export const RETRY_ATTEMPTS = 5;

export const RETRY_MIN_TIMEOUT = 250;

export const RETRY_MAX_TIMEOUT = 10000;

export const RETRY_JITTER = 0.1;

export interface AsyncRetryOptions {
  /** Exponential backoff multiplier. Default is 2. */
  backoff?: number;

  /** The maximum amount of attempts until failure. Default is 5. */
  attempts?: number;

  /** The initial and minimum amount of milliseconds between attempts. */
  minTimeout?: number;

  /** The maximum milliseconds between attempts. */
  maxTimeout?: number;

  /** Amount of jitter to introduce to the time between attempts, from 0 to 1. */
  jitter?: number;

  /**
   * Callback invoked when an attempt fails.
   * Throwing an error inside this callback will abort the retry.
   *
   * @param error The error that caused the attempt to fail.
   * @param attempt The current attempt number.
   */
  onError?: AsyncRetryErrorHandler | null | undefined;

  /** Signal used to abort the retry */
  signal?: AbortSignal | null | undefined;
}

const _throwIfAborted = (error: unknown) => {
  if (isAbortError(error)) {
    throw error;
  }
};

export async function asyncRetry<T>(
  fn: (() => Promise<T>) | (() => T),
  {
    backoff = RETRY_BACKOFF,
    attempts = RETRY_ATTEMPTS,
    minTimeout = RETRY_MIN_TIMEOUT,
    maxTimeout = RETRY_MAX_TIMEOUT,
    jitter = RETRY_JITTER,
    onError = _throwIfAborted,
    signal,
  }: Readonly<AsyncRetryOptions> = EMPTY_OBJECT,
) {
  if (minTimeout > maxTimeout) {
    minTimeout = maxTimeout;
  }

  let attempt = 0;
  for (; ; ++attempt) {
    if (signal?.aborted) {
      throw signal.reason;
    }
    try {
      return await fn();
    } catch (error) {
      if (error) {
        try {
          (error as UnsafeAny).retry_attempt = attempt;
          (error as UnsafeAny).retry_attempts = attempts;
        } catch {}
      }

      onError?.(error, attempt, attempts);

      if (attempt + 1 >= attempts) {
        throw error;
      }

      let ms = minTimeout * backoff ** attempt;
      if (maxTimeout < ms) {
        ms = maxTimeout;
      }
      ms = jitter ? (1 - jitter * Math.random()) * ms : ms;

      await delay(ms, signal ? { signal } : undefined);
    }
  }
}
