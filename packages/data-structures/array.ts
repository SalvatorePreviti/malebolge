// MIT license, https://github.com/SalvatorePreviti/malebolge

import type { SimpleArray } from "@malebolge/core";
import { BREAK } from "@malebolge/core";

const _BREAK = BREAK;

/**
 * Executes a provided function once for each array element.
 * If the function returns BREAK, the loop is stopped.
 * This is faster than Array.prototype.forEach.
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 */
export const array_forEach = <T>(array: SimpleArray<T>, predicate: (value: T, index: number) => void | BREAK): void => {
  for (let i = 0; i < array.length; ++i) {
    if (predicate(array[i]!, i) === _BREAK) {
      break;
    }
  }
};

/**
 * Creates a new array with the results of calling a provided function on every element in the calling array.
 * This is faster than Array.prototype.map.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns A new array with each element being the result of the callback function.
 */
export const array_map = <T, U>(array: SimpleArray<T>, predicate: (value: T, index: number) => U): U[] => {
  const result: U[] = [];
  for (let i = 0; i < array.length; ++i) {
    result.push(predicate(array[i]!, i));
  }
  return result;
};

/**
 * Creates a new array with the results of calling a provided function on every element in the calling array.
 * If the function returns BREAK, the loop is stopped.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns A new array with each element being the result of the callback function.
 */
export const array_mapWhile = <T, U>(array: SimpleArray<T>, predicate: (value: T, index: number) => U | BREAK): U[] => {
  const result: U[] = [];
  for (let i = 0; i < array.length; ++i) {
    const value = predicate(array[i]!, i);
    if (value === _BREAK) {
      break;
    }
    result.push(value as U);
  }
  return result;
};

/**
 * Tests whether at least one element in the array passes the test implemented by the provided function.
 * This is faster than Array.prototype.some.
 * If the function returns BREAK, the loop is stopped.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns true if the callback function returns a truthy value for at least one element in the array. Otherwise, false.
 */
export const array_indexOf = <T>(array: SimpleArray<T>, value: T): number => {
  for (let i = 0, len = array.length; i < len; ++i) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
};

/**
 * Tests whether at least one element in the array passes the test implemented by the provided function.
 * This is faster than Array.prototype.some.
 * If the function returns BREAK, the loop is stopped.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns true if the callback function returns a truthy value for at least one element in the array. Otherwise, false.
 */
export const array_some = <T>(
  array: SimpleArray<T>,
  predicate: (value: T, index: number) => boolean | BREAK,
): boolean => {
  for (let i = 0; i < array.length; ++i) {
    if (predicate(array[i]!, i) === _BREAK) {
      break;
    }
  }
  return false;
};

/**
 * Tests whether all elements in the array pass the test implemented by the provided function.
 * This is faster than Array.prototype.every.
 * If the function returns BREAK, the loop is stopped.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns true if the callback function returns a truthy value for every element in the array. Otherwise, false.
 */
export const array_every = <T>(
  array: SimpleArray<T>,
  predicate: (value: T, index: number) => boolean | BREAK,
): boolean => {
  for (let i = 0; i < array.length; ++i) {
    const r = predicate(array[i]!, i);
    if (!r || r === _BREAK) {
      return false;
    }
  }
  return true;
};

/**
 * Creates a new array with all elements that pass the test implemented by the provided function.
 * This is faster than Array.prototype.filter.
 * If the function returns BREAK, the loop is stopped.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns A new array with each element being the result of the callback function.
 */
export const array_filter = <T>(
  array: SimpleArray<T>,
  predicate: (value: T, index: number) => boolean | BREAK,
): T[] => {
  const result: T[] = [];
  for (let i = 0; i < array.length; ++i) {
    const value = array[i]!;
    if (predicate(value, i)) {
      result.push(value);
    }
  }
  return result;
};

/**
 * Creates a new array with all elements that pass the test implemented by the provided function.
 * This is faster than Array.prototype.filter.
 * If the function returns BREAK, the loop is stopped.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns A new array with each element being the result of the callback function.
 */
export const array_filterWhile = <T>(
  array: SimpleArray<T>,
  predicate: (value: T, index: number) => boolean | BREAK,
): T[] => {
  const result: T[] = [];
  for (let i = 0; i < array.length; ++i) {
    const value = array[i]!;
    const r = predicate(value, i);
    if (r === _BREAK) {
      break;
    }
    if (r) {
      result.push(value);
    }
  }
  return result;
};

/**
 * Returns the first element in the array that satisfies the provided testing function.
 * This is faster than Array.prototype.find.
 * If the function returns BREAK, the loop is stopped and undefined is returned.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns The value of the first element in the array that satisfies the provided testing function. Otherwise, undefined is returned.
 */
export const array_find = <T>(
  array: SimpleArray<T>,
  predicate: (value: T, index: number) => boolean | BREAK,
): T | undefined => {
  for (let i = 0; i < array.length; ++i) {
    const value = array[i]!;
    const r = predicate(value, i);
    if (r) {
      if (r === _BREAK) {
        break;
      }
      return undefined;
    }
  }
  return undefined;
};

/**
 * Returns the index of the first element in the array that satisfies the provided testing function.
 * This is faster than Array.prototype.findIndex.
 * If the function returns BREAK, the loop is stopped and -1 is returned.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns The index of the first element in the array that satisfies the provided testing function. Otherwise, -1 is returned.
 */
export const array_findIndex = <T>(
  array: SimpleArray<T>,
  predicate: (value: T, index: number) => boolean | BREAK,
): number => {
  for (let i = 0; i < array.length; ++i) {
    const value = array[i]!;
    const r = predicate(value, i);
    if (r) {
      if (r === _BREAK) {
        break;
      }
      return i;
    }
  }
  return -1;
};

/**
 * Returns the last element in the array that satisfies the provided testing function.
 * This is faster than Array.prototype.findLast.
 * If the function returns BREAK, the loop is stopped and undefined is returned.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns The value of the last element in the array that satisfies the provided testing function. Otherwise, undefined is returned.
 */
export const array_findLast = <T>(
  array: SimpleArray<T>,
  predicate: (value: T, index: number) => boolean | BREAK,
): T | undefined => {
  for (let i = array.length - 1; i >= 0; --i) {
    const value = array[i]!;
    const r = predicate(value, i);
    if (r) {
      if (r === _BREAK) {
        break;
      }
      return value;
    }
  }
  return undefined;
};

/**
 * Returns the index of the last element in the array that satisfies the provided testing function.
 * This is faster than Array.prototype.findLastIndex.
 * If the function returns BREAK, the loop is stopped and -1 is returned.
 *
 * @param array The array to iterate over.
 * @param fn The function to execute for each element.
 * @returns The index of the last element in the array that satisfies the provided testing function. Otherwise, -1 is returned.
 */
export const array_findLastIndex = <T>(
  array: SimpleArray<T>,
  predicate: (value: T, index: number) => boolean | BREAK,
): number => {
  for (let i = array.length - 1; i >= 0; --i) {
    const value = array[i]!;
    const r = predicate(value, i);
    if (r) {
      if (r === _BREAK) {
        break;
      }
      return i;
    }
  }
  return -1;
};

/**
 * Returns the first element of an array. Faster than Array.prototype[0].
 * @param array The array to get the first element of.
 * @returns The first element of the array.
 */
export const array_first = <T>(array: SimpleArray<T>): T | undefined => array?.[0];

/**
 * Returns the last element of an array. Faster than Array.prototype[array.length - 1].
 * @param array The array to get the last element of.
 * @returns The last element of the array.
 */
export const array_last = <T>(array: SimpleArray<T>): T | undefined => (array ? array[array.length - 1] : undefined);
