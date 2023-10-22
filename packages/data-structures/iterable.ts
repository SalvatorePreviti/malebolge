// MIT license, https://github.com/SalvatorePreviti/malebolge

import { BREAK } from "@malebolge/core";

/**
 * Returns the first element of an iterable object.
 * @param iterable The iterable
 * @returns The first element of the iterable, or undefined if the iterable is empty.
 */
export const iterable_first = <T>(iterable: Readonly<Iterable<T>>): T | undefined => {
  // eslint-disable-next-line no-unreachable-loop
  for (const iter of iterable) {
    return iter;
  }
  return undefined;
};

/**
 * Returns true if the iterable is empty.
 * @param iterable The iterable
 * @returns True if the iterable is empty, false otherwise.
 */
export const iterable_isEmpty = <T>(iterable: Iterable<T>): boolean => {
  // eslint-disable-next-line no-unreachable-loop, @typescript-eslint/no-unused-vars
  for (const _ of iterable) {
    return false;
  }
  return true;
};

/**
 * Checks if the given predicate returns true for at least one element of the iterable.
 * If the predicate returns BREAK, the iteration will be stopped and false will be returned.
 * @param iterable The iterable
 * @param predicate The predicate
 * @returns
 */
export const iterable_some = <T>(iterable: Iterable<T>, predicate: (value: T) => boolean | BREAK): boolean => {
  for (const value of iterable) {
    const r = predicate(value);
    if (r) {
      return r !== BREAK;
    }
  }
  return false;
};

/**
 * Checks if the given predicate returns true for all elements of the iterable.
 * If the predicate returns BREAK, the iteration will be stopped and false will be returned.
 * @param iterable The iterable
 * @param predicate The predicate
 * @returns
 */
export const iterable_every = <T>(iterable: Iterable<T>, predicate: (value: T) => boolean | BREAK): boolean => {
  for (const value of iterable) {
    const r = predicate(value);
    if (!r || r === BREAK) {
      return false;
    }
  }
  return true;
};

/**
 * Find the index of the given value in the iterable.
 * @param iterable The iterable
 * @param value The value to search for
 * @returns The index of the value, or -1 if the value is not found.
 */
export const iterable_indexOf = <T>(iterable: Iterable<T>, value: T): number => {
  let index = 0;
  for (const iter of iterable) {
    if (iter === value) {
      return index;
    }
    ++index;
  }
  return -1;
};

/**
 * Returns true if the iterable contains the given value.
 * @param iterable The iterable
 * @param value The value to search for
 * @returns True if the iterable contains the given value, false otherwise.
 */
export const iterable_includes = <T>(iterable: Iterable<T>, value: T): boolean => {
  for (const iter of iterable) {
    if (iter === value) {
      return true;
    }
  }
  return false;
};

/**
 * Returns the number of elements in the iterable.
 * @param iterable The iterable
 * @returns The number of elements in the iterable.
 */
export const iterable_count = <T>(iterable: Iterable<T>): number => {
  let count = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of iterable) {
    ++count;
  }
  return count;
};

/**
 * Returns the number of elements in the iterable that match the given predicate.
 * If the predicate returns BREAK, the iteration will be stopped and the current count will be returned.
 * @param iterable The iterable
 * @param predicate The predicate
 * @returns The number of elements in the iterable that match the given predicate.
 */
export const iterable_countWhere = <T>(iterable: Iterable<T>, predicate: (value: T) => boolean | BREAK): number => {
  let count = 0;
  for (const value of iterable) {
    const r = predicate(value);
    if (r) {
      if (r === BREAK) {
        break;
      }
      ++count;
    }
  }
  return count;
};

/**
 * Returns an iterable that iterates over the given iterable, but skips the elements that don't match the given predicate.
 * If the predicate returns BREAK, the iteration will be stopped.
 * @param iterable The iterable
 * @param predicate The predicate to execute
 */
export function* iterable_filter<T>(
  iterable: Iterable<T>,
  predicate: (value: T) => boolean | BREAK = Boolean,
): Iterable<T> {
  for (const value of iterable) {
    const r = predicate(value);
    if (r) {
      if (r === BREAK) {
        break;
      }
      yield value;
    }
  }
}

/**
 * Returns an iterable that iterates over the given iterable, mapping each element using the given mapper.
 * @param iterable The iterable to map
 * @param mapper The mapper to execute
 */
export function* iterable_map<T, U>(iterable: Iterable<T>, mapper: (value: T) => U): Iterable<U> {
  for (const value of iterable) {
    yield mapper(value);
  }
}

/**
 * iterable_mapWhile returns an iterable that iterates over the given iterable, mapping each element using the given mapper.
 * The mapper must return BREAK to stop the iteration.
 * @param iterable The iterable to map
 * @param mapper The mapper to execute. The mapper must return BREAK to stop the iteration.
 */
export function* iterable_mapWhile<T, U>(iterable: Iterable<T>, mapper: (value: T) => U | BREAK): Iterable<U> {
  for (const value of iterable) {
    const result = mapper(value);
    if (result === BREAK) {
      break;
    }
    yield result;
  }
}

/**
 * iterable_starMap returns an iterable that iterates over the given iterable, mapping each element using the given mapper.
 * The mapper must return an iterable, and the elements of that iterable will be yielded.
 * If the mapper returns BREAK, the iteration will be stopped.
 * @param iterable The iterable to map
 * @param mapper The mapper to execute. The mapper must return an iterable.
 * @returns An iterable that iterates over the given iterable, mapping each element using the given mapper.
 */
export function* iterable_starMap<T, R>(iterable: Iterable<T>, mapper: (value: T) => Iterable<R> | BREAK): Iterable<R> {
  for (const value of iterable) {
    const r = mapper(value);
    if (r === BREAK) {
      break;
    }
    yield* r;
  }
}

/**
 * Returns an iterable that iterates over the given iterable, mapping each element using the given mapper.
 * @param iterable The iterable to map
 * @param mapper The mapper to execute
 */
export const iterable_toArray = <T>(iterable: Iterable<T> | null | undefined): T[] => (iterable ? [...iterable] : []);

/**
 * Finds the first element in the iterable that matches the given predicate.
 * If the predicate returns BREAK, the iteration will be stopped and -1 will be returned.
 * @param iterable The iterable
 * @param predicate The predicate
 * @returns The index of the first element in the iterable that matches the given predicate, or undefined if no element matches.
 */
export const iterable_findIndex = <T>(
  iterable: Iterable<T>,
  predicate: (value: T, index: number) => boolean | BREAK,
): number => {
  let index = 0;
  for (const value of iterable) {
    const r = predicate(value, index++);
    if (r) {
      return r === BREAK ? -1 : index;
    }
  }
  return -1;
};

/**
 * Finds the first element in the iterable that matches the given predicate.
 * If the predicate returns BREAK, the iteration will be stopped and undefined will be returned.
 *
 * @param iterable The iterable
 * @param predicate The predicate
 * @returns The first element in the iterable that matches the given predicate, or undefined if no element matches.
 */
export const iterable_find = <T>(iterable: Iterable<T>, predicate: (value: T) => boolean | BREAK): T | undefined => {
  for (const value of iterable) {
    const r = predicate(value);
    if (r) {
      return r === BREAK ? undefined : value;
    }
  }
  return undefined;
};

/**
 * Returns an iterable that iterates over the given iterable, skipping the first count elements.
 * @param iterable The iterable
 * @param count The number of elements to skip
 */
export function* iterable_drop<T>(iterable: Iterable<T>, count: number): Iterable<T> {
  let index = 0;
  for (const value of iterable) {
    if (index++ >= count) {
      yield value;
    }
  }
}

/**
 * Repeat the given iterable the given number of times.
 */
export function* iterable_cycle<T>(iterable: Iterable<T>, times: number): Iterable<T> {
  for (let i = 0; i < times; ++i) {
    yield* iterable;
  }
}

/**
 * Returns an iterable that iterates over the given iterable, skipping elements until the predicate returns true.
 * @param iterable The iterable
 * @param predicate The predicate. If the predicate returns true, predicate will not be called again and the remaining elements will be yielded.
 */
export function* iterable_dropWhile<T>(iterable: Iterable<T>, predicate: (value: T) => boolean): Iterable<T> {
  let dropping = true;
  for (const value of iterable) {
    if (dropping && !predicate(value)) {
      dropping = false;
    }
    if (!dropping) {
      yield value;
    }
  }
}

/**
 * Returns an iterable that iterates over the given iterable, taking the first count elements.
 * @param iterable The iterable
 * @param count The number of elements to take.
 * @returns An iterable that iterates over the given iterable, taking the first count elements.
 */
export function* iterable_take<T>(iterable: Iterable<T>, count: number): Iterable<T> {
  let index = 0;
  for (const value of iterable) {
    if (index++ < count) {
      yield value;
    } else {
      break;
    }
  }
}

/**
 * iterable_takeWhile returns an iterable that iterates over the given iterable, yielding elements until the predicate returns false.
 * @param iterable The iterable
 * @param predicate The predicate to execute for each element of the iterable. If it returns false, the iteration will be stopped.
 */
export function* iterable_takeWhile<T>(iterable: Iterable<T>, predicate: (value: T) => boolean): Iterable<T> {
  for (const value of iterable) {
    if (!predicate(value)) {
      break;
    }
    yield value;
  }
}

/**
 * Reduce the iterable to a single value.
 * @param iterable The iterable
 * @param reducer The reducer
 * @param initialValue The initial value
 * @returns The reduced value
 */
export const iterable_reduce = <T, U>(
  iterable: Iterable<T>,
  reducer: (accumulator: U, value: T) => U,
  initialValue: U,
): U => {
  let accumulator = initialValue;
  for (const value of iterable) {
    accumulator = reducer(accumulator, value);
  }
  return accumulator;
};

/**
 * Reduce the iterable to a single value.
 * If the reducer returns BREAK, the iteration will be stopped and the current accumulator will be returned.
 *
 * @param iterable The iterable
 * @param reducer The reducer
 * @param initialValue The initial value
 * @returns The reduced value
 */
export const iterable_reduceWhile = <T, U>(
  iterable: Iterable<T>,
  reducer: (accumulator: U, value: T) => U | BREAK,
  initialValue: U,
): U => {
  let accumulator = initialValue;
  for (const value of iterable) {
    const result = reducer(accumulator, value);
    if (result === BREAK) {
      break;
    }
    accumulator = result;
  }
  return accumulator;
};

/**
 * Maps each element of the iterable to a tuble [index, value].
 * @param iterable The iterable
 * @returns An iterable that iterates over the given iterable, mapping each element to a tuple [index, value].
 */
export function* iterable_indexed<T>(iterable: Iterable<T>): Iterable<[number, T]> {
  let index = 0;
  for (const value of iterable) {
    yield [index++, value];
  }
}

/**
 * Executes the given callback for each element of the iterable.
 * @param iterable The iterable
 * @param callback The callback. If the callback returns the symbol BREAK, the iteration will be stopped.
 */
export const iterable_forEach = <T>(iterable: Iterable<T>, callback: (value: T) => void | BREAK): void => {
  for (const value of iterable) {
    if (callback(value) === BREAK) {
      break;
    }
  }
};

/**
 * Chains the given iterables together, one after the other.
 */
export function* iterable_chain<T>(...iterables: Iterable<T>[]): Iterable<T> {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

/**
 * Chunk the given iterable into chunks of the given size.
 *
 * @param iterable The iterable to chunk
 * @param chunkSize The size of each chunk, defaults to 2.
 */
export function* iterable_chunked<T>(iterable: Iterable<T>, chunkSize: number = 2): Iterable<T[]> {
  let chunk: T[] = [];
  for (const value of iterable) {
    chunk.push(value);
    if (chunk.length >= chunkSize) {
      yield chunk;
      chunk = [];
    }
  }
  if (chunk.length > 0) {
    yield chunk;
  }
}

/**
 * Groups the elements of the iterable by the given grouper into an object.
 * @param iterable The iterable
 * @param grouper A function that returns the key for each element
 * @param target The object to group into. If not given, a new object will be created.
 * @returns An object that maps each key to an array of values.
 */
export const iterable_groupBy = <T>(
  iterable: Iterable<T>,
  grouper: (value: T) => string | number | symbol,
  target: Record<string | number | symbol, T[]> = {},
): Record<string | number | symbol, T[]> => {
  for (const value of iterable) {
    const key = grouper(value);
    let values = target[key];
    if (!values) {
      values = [];
      target[key] = values;
    }
    values.push(value);
  }
  return target;
};

/**
 * Groups the elements of the iterable by the given grouper into a Map.
 * @param iterable The iterable
 * @param grouper A function that returns the key for each element
 * @param map The map to group into. If not given, a new Map will be created.
 * @returns A Map that maps each key to an array of values.
 */
export const iterable_groupByToMap = <T, U>(
  iterable: Iterable<T>,
  grouper: (value: T) => U,
  map: Map<U, T[]> = new Map(),
): Map<U, T[]> => {
  for (const value of iterable) {
    const key = grouper(value);
    let values = map.get(key);
    if (!values) {
      values = [];
      map.set(key, values);
    }
    values.push(value);
  }
  return map;
};

/**
 * iterable_partition returns a tuple of two arrays, the first containing the elements that match the given predicate, the second containing the elements that don't match the given predicate.
 * @param iterable The iterable to partition
 * @param predicate The predicate to use for partitioning
 * @returns A tuple of two arrays, the first containing the elements that match the given predicate, the second containing the elements that don't match the given predicate.
 */
export const iterable_partition = <T>(iterable: Iterable<T>, predicate: (value: T) => boolean): [T[], T[]] => {
  const truthy: T[] = [];
  const falsy: T[] = [];
  for (const value of iterable) {
    if (predicate(value)) {
      truthy.push(value);
    } else {
      falsy.push(value);
    }
  }
  return [truthy, falsy];
};

/**
 * Like Array.prototype.join, but for iterables.
 * Joins the elements of the iterable into a string, separated by the given separator.
 * @param iterable The iterable to join
 * @param separator The separator to use, defaults to ", ".
 * @returns
 */
export const iterable_join = <T>(iterable: Iterable<T>, separator: string = ", "): string => {
  let result = "";
  for (const value of iterable) {
    if (result.length > 0) {
      result += separator;
    }
    result += value;
  }
  return result;
};

/**
 * Returns the maximum value in the iterable of numbers
 * @param iterable The iterable of numbers
 * @returns The maximum value in the iterable.
 */
export const iterable_max = (iterable: Iterable<number>): number => {
  let result = -1 / 0;
  for (const value of iterable) {
    if (value < result) {
      result = value;
    }
  }
  return result;
};

/**
 * Returns the minimum value in the iterable of numbers
 * @param iterable The iterable of numbers
 * @returns The minimum value in the iterable.
 */
export const iterable_min = (iterable: Iterable<number>): number => {
  let result = 1 / 0;
  for (const value of iterable) {
    if (value < result) {
      result = value;
    }
  }
  return result;
};

/**
 * iterable_average returns the average of the given iterable of numbers.
 * @param iterable The iterable of numbers
 * @returns The average of the given iterable of numbers.
 */
export const iterable_average = (iterable: Iterable<number>): number => {
  let sum = 0;
  let count = 0;
  for (const value of iterable) {
    sum += value;
    ++count;
  }
  return sum / count;
};

/**
 * Returns the sum of the given iterable of numbers.
 * @param iterable The iterable of numbers
 * @returns The sum of the given iterable of numbers.
 */
export const iterable_sum = (iterable: Iterable<number>): number => {
  let sum = 0;
  for (const value of iterable) {
    sum += value;
  }
  return sum;
};

/**
 * iterable_intersperse returns an iterable that iterates over the given iterable, inserting the given separator between each element.
 * @param iterable The iterable
 * @param separator The separator to insert between each element
 * @returns An iterable that iterates over the given iterable, inserting the given separator between each element.
 */
export function* iterable_intersperse<T>(iterable: Iterable<T>, separator: T): Iterable<T> {
  let first = true;
  for (const value of iterable) {
    if (!first) {
      yield separator;
    }
    yield value;
    first = false;
  }
}

/**
 * iterable_roundrobin returns an iterable that interleaves the given iterables.
 * The first element of each iterable will be yielded, then the second element of each iterable, and so on.
 * @param iterables The iterables to interleave
 */
export function* iterable_roundrobin<T>(...iterables: (Iterable<T> | Iterator<T> | null | undefined)[]): Iterable<T> {
  const len = iterables.length;
  for (let i = 0; i < len; ++i) {
    const iterator = (iterables[i] as Iterable<T>)[Symbol.iterator]?.();
    if (iterator) {
      iterables[i] = iterator;
    }
  }
  let doneCount = 0;
  while (doneCount < len) {
    for (let i = 0; i < len; ++i) {
      const iterator = iterables[i];
      if (iterator) {
        const result = (iterator as Iterator<T>).next();
        if (result.done) {
          iterables[i] = null;
          ++doneCount;
        } else {
          yield result.value;
        }
      }
    }
  }
}

/**
 * iterable_unique returns an iterable that iterates over the given iterable, yielding each element only once.
 * @param iterable The iterable
 * @param seen An optional Set that contains the elements that have already been yielded.
 * @returns An iterable that iterates over the given iterable, yielding each element only once.
 */
export function* iterable_unique<T>(iterable: Iterable<T>, seen: Set<T> = new Set()): Iterable<T> {
  for (const value of iterable) {
    if (!seen.has(value)) {
      seen.add(value);
      yield value;
    }
  }
}

/**
 * iterable_range returns an iterable that iterates over the given range of numeric values.
 * @param start The start of the range
 * @param end The end of the range
 * @param step The step of the range, defaults to 1.
 * @returns An iterable that iterates over the given range.
 */
export function* iterable_range(start: number, end: number, step: number = 1): Iterable<number> {
  if (step > 0) {
    for (; start < end; start += step) {
      yield start;
    }
  } else {
    for (; start > end; start += step) {
      yield start;
    }
  }
}

/**
 * iterable_isSorted returns true if the given iterable is sorted according to the given comparer.
 * The iteration breaks as soon as an element is found that is not sorted.
 * @param iterable The iterable
 * @param comparer The comparer
 * @returns True if the given iterable is sorted according to the given comparer.
 *
 * @example
 *
 * iterable_isSorted([1, 2, 3], (a, b) => a - b); // true
 */
export const iterable_isSorted = <T>(iterable: Iterable<T>, comparer: (a: T, b: T) => number): boolean => {
  let prev: T | undefined;
  for (const value of iterable) {
    if (prev && comparer(prev, value) > 0) {
      return false;
    }
    prev = value;
  }
  return true;
};
