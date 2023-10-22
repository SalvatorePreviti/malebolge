// MIT license, https://github.com/SalvatorePreviti/malebolge

/** false | 0 | "" | null | undefined */
export type Falsy = false | 0 | "" | null | undefined;

/**
 * any should not be used explicitly but sometimes is needed to use any.
 * UnsafeAny will easily show up in pull requests and helps the developer
 * realize that is unsafe to use it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnsafeAny = any;

/**
 * Used to indicate a promise is uninitialized and not started.
 * @see LazyPromiseState
 */
export const PROMISE_UNINITIALIZED = -1 as const;

/**
 * Used to indicate a promise is pending
 * @see PromiseState
 */
export const PROMISE_PENDING = 1 as const;

/**
 * Used to indicate a promise is resolved
 * @see PromiseState
 */
export const PROMISE_RESOLVED = 2 as const;

/**
 * Used to indicate a promise is rejected
 * @see PromiseState
 */
export const PROMISE_REJECTED = 3 as const;

/**
 * The state of a promise. Can be one of:
 * - PROMISE_PENDING
 * - PROMISE_RESOLVED
 * - PROMISE_REJECTED
 */
export type PromiseState = typeof PROMISE_PENDING | typeof PROMISE_RESOLVED | typeof PROMISE_REJECTED;

/**
 * The state of a promise. Can be one of:
 * - PROMISE_UNINITIALIZED
 * - PROMISE_PENDING
 * - PROMISE_RESOLVED
 * - PROMISE_REJECTED
 */
export type LazyPromiseState = typeof PROMISE_UNINITIALIZED | PromiseState;

/**
 * Returns true if the value is a PromiseLike.
 * A PromiseLike is a non null object that has a then method.
 * @param value The value to check.
 * @returns True if the value is a PromiseLike.
 */
export const isPromiseLike = /*@__PURE__*/ <T = unknown>(value: unknown): value is PromiseLike<T> =>
  typeof value === "object" && value !== null && typeof (value as PromiseLike<T>).then === "function";

/**
 * Returns true if the value is a Promise.
 * A Promise is a non null object that has a then and catch method.
 * @param value The value to check.
 * @returns True if the value is a Promise.
 */
export const isPromise = /*@__PURE__*/ <T = unknown>(value: unknown): value is Promise<T> =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Promise<T>).then === "function" &&
  typeof (value as Promise<T>).catch === "function";

export interface SimpleArray<T = unknown> {
  readonly length: number;
  readonly [index: number]: T;
}

/**
 * Returns true if the value is an iterable.
 * A value is iterable if it is not null or undefined and has a Symbol.iterator method.
 * @param iterable The value to check.
 * @returns True if the value is an iterable.
 */
export const isIterable = /*@__PURE__*/ <T = unknown>(iterable: unknown): iterable is Iterable<T> =>
  iterable !== undefined && iterable !== null && typeof (iterable as Iterable<T>)[Symbol.iterator] === "function";
