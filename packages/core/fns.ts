// MIT license, https://github.com/SalvatorePreviti/malebolge

import { UNSET } from "./symbols";
import type { UnsafeAny } from "./types";

/** Returns true if the given value is null or undefined. */
export const isNullOrUndefined = /*@__PURE__*/ (x: UnsafeAny): x is null | undefined => x === null || x === undefined;

/** A noop function that does nothing and returns void */
export const fnVoid = /*@__PURE__*/ (): void => {};

/** A pure function that returns always undefined */
export const fnUndefined = /*@__PURE__*/ (): undefined => {};

/** A pure function that returns always null */
export const fnNull = /*@__PURE__*/ (): null => null;

/** A pure function that returns always false */
export const fnFalse = /*@__PURE__*/ (): false => false;

/** A pure function that returns always true */
export const fnTrue = /*@__PURE__*/ (): true => true;

/** A pure function that returns always 0 */
export const fnZero = /*@__PURE__*/ (): 0 => 0;

/** A pure function that returns always 1 */
export const fnOne = /*@__PURE__*/ (): 1 => 1;

/** A pure function that returns always -1 */
export const fnMinusOne = /*@__PURE__*/ (): -1 => -1;

/** A pure function that returns always NaN */
export const fnNaN = /*@__PURE__*/ (): number => NaN;

/** A pure function that returns always Infinity */
export const fnInfinity = /*@__PURE__*/ (): number => Infinity;

/** A pure function that returns always -Infinity */
export const fnNegativeInfinity = /*@__PURE__*/ (): number => -Infinity;

/** A pure function that returns the first argument */
export const fnIdentity = /*@__PURE__*/ <T>(x: T): T => x;

/** A function that returns a new empty array */
export const fnEmptyArray = /*@__PURE__*/ <T = unknown>(): T[] => [];

/** A function that returns a new empty object */
export const fnEmptyObject = /*@__PURE__*/ (): {} => ({});

/** A function that returns always an empty string */
export const fnEmptyString = /*@__PURE__*/ (): "" => "";

/** A function that returns a new empty Set */
export const fnEmptySet = <T = unknown> /*@__PURE__*/(): Set<T> => new Set();

/** A function that returns a new Map */
export const fnEmptyMap = <K = unknown, V = unknown> /*@__PURE__*/(): Map<K, V> => new Map();

/** Returns a === b */
export const fnEq = /*@__PURE__*/ <T>(a: T, b: T): boolean => a === b;

/** Returns a !== b */
export const fnNeq = /*@__PURE__*/ <T>(a: T, b: T): boolean => a !== b;

export type ObjGetterResult<K extends keyof UnsafeAny> = {
  <T extends { readonly [P in K]: unknown }>(obj: T): T[K];
  <T extends { readonly [P in K]?: unknown }>(obj: T | null | undefined): T[K] | undefined;
  (obj: null | undefined): undefined;
};

const _WEAK_REF = /*@__PURE__*/ Symbol("WeakRef");

/**
 * Returns a weak reference to the given object.
 * The weak reference is cached on the object itself to avoid creating multiple weak references for the same object.
 * @param obj The object to get a weak reference to.
 * @returns A weak reference to the given object.
 */
export const getWeakRef = <T extends object>(obj: T): WeakRef<T> =>
  ((obj as { [_WEAK_REF]?: WeakRef<T> })[_WEAK_REF] ??= new WeakRef(obj));

/**
 * Higher order synchronous function that returns a function that calls the given function and counts the number of times it was called.
 * Useful for testing.
 *
 * The returned function has "count" as a property that contains the number of times the function was called.
 *
 * @param fn The function to call.
 * @returns A function that calls the given function and counts the number of times it was called.
 */
export const fnCallCounter = /*@__PURE__*/ <TFn extends (...args: unknown[]) => unknown>(
  fn: TFn,
): fnCallCounter<TFn> => {
  const callCounter = (...args: Parameters<TFn>): ReturnType<TFn> => {
    callCounter.value++;
    return fn(...args) as ReturnType<TFn>;
  };
  callCounter.value = 0;
  return callCounter;
};

export interface fnCallCounter<TFn extends (...args: unknown[]) => unknown> {
  (...args: Parameters<TFn>): ReturnType<TFn>;

  /** The number of times the function was called. */
  value: number;
}

/**
 * Higher order synchronous function that returns a function that calls the given function only once and caches the result.
 *
 * @param fn The function to call only once.
 * @returns A function that calls the given function only once and caches the result.
 */
export const fnMemoizeOnce = /*@__PURE__*/ <TFn extends () => unknown>(fn: TFn): fnMemoizeOnce<TFn> => {
  const once = (): ReturnType<TFn> => {
    const result = once.value;
    return result !== UNSET ? result : (once.value = fn() as ReturnType<TFn>);
  };
  once.value = UNSET as ReturnType<TFn> | UNSET;
  return once;
};

export interface fnMemoizeOnce<TFn extends () => unknown> {
  (): ReturnType<TFn>;

  /** The cached result of the function call. Can be overwritten to reset or change the cache. */
  value: ReturnType<TFn> | UNSET;
}

/**
 * Higher order synchronous function that returns a function that calls the given function only once and caches the result for the given timeout in milliseconds.
 *
 * It uses Date.now() to determine the current time.
 *
 * @param fn The function to cache
 * @param timeout The timeout in milliseconds
 * @returns A function that calls the given function only once and caches the result for the given timeout in milliseconds.
 */
export const fnMemoizeTimed = /*@__PURE__*/ <TFn extends (...args: unknown[]) => unknown>(
  fn: TFn,
  timeout: number,
): fnMemoizeTimed<TFn> => {
  const timedCache = (...args: Parameters<TFn>): ReturnType<TFn> => {
    const now = Date.now();
    const expiration = timedCache.expiration;
    let result = timedCache.value;
    if (result === UNSET || now >= expiration) {
      result = fn(...args) as ReturnType<TFn>;
      timedCache.value = result;
      timedCache.expiration = now + timedCache.timeout;
    }
    return result;
  };

  timedCache.value = UNSET as ReturnType<TFn> | UNSET;
  timedCache.expiration = 0;
  timedCache.timeout = timeout;

  timedCache.set = (value: ReturnType<TFn> | UNSET, newTimeout: number = timedCache.timeout): void => {
    timedCache.value = value;
    timedCache.expiration = Date.now() + (newTimeout || 0);
  };

  return timedCache;
};

export interface fnMemoizeTimed<TFn extends (...args: unknown[]) => unknown> {
  (...args: Parameters<TFn>): ReturnType<TFn>;

  /** The cached result of the function call. Can be overwritten to reset or change the cache. */
  value: ReturnType<TFn> | UNSET;

  /** The time in milliseconds after which the cache expires. */
  expiration: number;

  /** The timeout in milliseconds */
  timeout: number;

  /** Sets the result value and optionally the expiration time. */
  set(result: ReturnType<TFn> | UNSET, expiration?: number): void;
}
