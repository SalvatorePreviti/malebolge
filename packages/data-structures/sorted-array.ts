// MIT license, https://github.com/SalvatorePreviti/malebolge

import type { SimpleArray } from "@malebolge/core/types";

/**
 * Sorted array functions that return an index, can return a negative number.
 * This negative number can be converted to the index where the value should be inserted by using the function sortedArray_idx
 *
 * This function converts the result to the index where the value should be inserted.
 * It works both if the result is positive or negative or zero.
 * @param result The result of a sorted array function that return an index
 * @returns The index where the value should be inserted
 */
export const sortedArray_idx = (result: number): number => (result < 0 ? -result - 1 : result);

/**
 * Search for a value in a sorted array using binary search on O(log n)
 * It invokes the given comparer callback with the value at each index.
 * If the callback returns a negative number, it means the searched value is smaller than the value at the index.
 * If the callback returns a positive number, it means the searched value is greater than the value at the index.
 * If the callback returns 0, it means the searched value is equal to the value at the index.
 *
 * @param sortedArray The sorted array to search in
 * @param value The value to search for
 * @param comparer The comparer function to use
 * @param left The left index to start searching from, defaults to 0
 * @param right The right index to start searching from, defaults to sortedArray.length - 1
 * @returns The index of the value if found.
 * If not found, returns a negative number.
 * This negative number can be converted to the index where the value should be inserted by using the function sortedArray_idx
 */
export const sortedArray_indexOf = <TValue>(
  sortedArray: SimpleArray<TValue>,
  value: TValue,
  comparer: (left: TValue, right: TValue) => number,
  left: number = 0,
  right: number = sortedArray.length - 1,
): number => {
  while (left <= right) {
    const middle = (left + right) >>> 1;
    const comparison = comparer(value, sortedArray[middle]!);
    if (comparison === 0) {
      return middle;
    }
    if (comparison < 0) {
      right = middle - 1;
    } else {
      left = middle + 1;
    }
  }
  return -(left >>> 0) - 1;
};

/**
 * Search for the index where the given value should be inserted in the given sorted array using binary search.
 * Complexity is O(log n)
 *
 * @param sortedArray The array to search in
 * @param value The value to search for
 * @param comparer The comparer function to use
 * @param left The left index to start searching from, defaults to 0
 * @param right The right index to start searching from, defaults to sortedArray.length - 1
 * @returns The index where the value should be inserted.
 */
export const sortedArray_indexOfInsertion = <TValue>(
  sortedArray: SimpleArray<TValue>,
  value: TValue,
  comparer: (left: TValue, right: TValue) => number,
  left: number = 0,
  right: number = sortedArray.length - 1,
): number => {
  const r = sortedArray_indexOf(sortedArray, value, comparer, left, right);
  return r < 0 ? -r - 1 : r;
};

/**
 * Verifies if the given value is in the given sorted array using binary search.
 * Complexity is O(log n)
 *
 * @param sortedArray The array to search in
 * @param value The value to search for
 * @param comparer The comparer function to use
 * @param left The left index to start searching from, defaults to 0
 * @param right The right index to start searching from, defaults to sortedArray.length - 1
 * @returns True if the value is in the array, false otherwise
 */
export const sortedArray_includes = <TValue>(
  sortedArray: TValue[],
  value: TValue,
  comparer: (left: TValue, right: TValue) => number,
  left: number = 0,
  right: number = sortedArray.length - 1,
): boolean => sortedArray_indexOf(sortedArray, value, comparer, left, right) >= 0;

/**
 * Search for a value in a sorted array using binary search on O(log n)
 * It invokes the given getDirection callback with the value at each index.
 * If the callback returns a negative number, it means the searched value is smaller than the value at the index.
 * If the callback returns a positive number, it means the searched value is greater than the value at the index.
 * If the callback returns 0, it means the searched value is equal to the value at the index.
 *
 * @param sortedArray The sorted array to search in
 * @param value The value to search for
 * @param getDirection The comparer function to use
 * @param left The left index to start searching from, defaults to 0
 * @param right The right index to start searching from, defaults to sortedArray.length - 1
 * @returns The index of the value if found.
 * If not found, returns a negative number.
 * This negative number can be converted to the index where the value should be inserted by using the function sortedArray_idx
 */
export const sortedArray_binaryWalk = <TValue>(
  sortedArray: SimpleArray<TValue>,
  getDirection: (value: TValue) => number,
  left: number = 0,
  right: number = sortedArray.length - 1,
): number => {
  while (left <= right) {
    const middle = (left + right) >>> 1;
    const c = getDirection(sortedArray[middle]!);
    if (c < 0) {
      right = middle - 1;
    } else if (c > 0) {
      left = middle + 1;
    } else {
      return middle;
    }
  }
  return -(left >>> 0) - 1;
};

/**
 * Verifies if the given array is sorted using the given comparer function.
 * Complexity is O(n)
 *
 * @param sortedArray The array to verify
 * @param comparer The comparer function to use
 * @param left The left index to start verifying from, defaults to 0
 * @param right The right index to start verifying from, defaults to sortedArray.length - 1
 * @returns True if the array is sorted, false otherwise
 */
export const sortedArray_isSorted = <TValue>(
  sortedArray: SimpleArray<TValue>,
  comparer: (left: TValue, right: TValue) => number,
  left: number = 0,
  right: number = sortedArray.length - 1,
): boolean => {
  let prev = sortedArray[left++]!;
  while (left <= right) {
    const current = sortedArray[left++]!;
    if (comparer(prev, current) >= 0) {
      return false;
    }
    prev = current;
  }
  return true;
};

/**
 * Finds the index of the first duplicate value in the given sorted array.
 * If no duplicate is found, returns -1.
 * Complexity is O(n)
 *
 * @param sortedArray The array to verify
 * @param comparer The comparer function to use
 * @param left The left index to start verifying from, defaults to 0
 * @param right The right index to start verifying from, defaults to sortedArray.length - 1
 *
 * @example
 * sortedArray_isSorted([1, 2, 3, 4, 5, 5, 6, 7, 8, 9], (a, b) => a - b) === 5
 */
export const sortedArray_indexOfDuplicate = <TValue>(
  sortedArray: SimpleArray<TValue>,
  comparer: (left: TValue, right: TValue) => number | boolean,
  left: number = 0,
  right: number = sortedArray.length - 1,
): number => {
  let prev = sortedArray[left++]!;
  while (left <= right) {
    const current = sortedArray[left]!;
    const comparison = comparer(prev, current);
    if (comparison === 0 || comparison === true) {
      return left;
    }
    prev = current;
    ++left;
  }
  return -1;
};

/**
 * Iterates over the given sorted array and yields only the unique values.
 *
 * @param sortedArray The array to iterate over
 * @param comparer The comparer function to use
 * @returns A generator that yields the value that do not repeat
 */
export function* sortedArray_iterateUnique<TValue>(
  sortedArray: SimpleArray<TValue>,
  comparer: (left: TValue, right: TValue) => number | boolean,
  left: number = 0,
  right: number = sortedArray.length - 1,
): Generator<TValue> {
  let prev = sortedArray[left++]!;
  yield prev;
  while (left <= right) {
    const current = sortedArray[left++]!;
    const comparison = comparer(prev, current);
    if (comparison !== 0 && comparison !== true) {
      yield current;
    }
    prev = current;
  }
}

/**
 * Add the given value in the given sorted array using binary search.
 * If the value already exists in the array, it is not added.
 * Complexity is O(n) - O(log n) lookup and O(n) insertion
 *
 * @param sortedArray The array to insert the value in
 * @param value The value to insert
 * @param comparer The comparer function to use
 * @param left The left index to start searching from, defaults to 0
 * @param right The right index to start searching from, defaults to sortedArray.length - 1
 * @returns The index of the value if found, or a negative number if not found and added.
 * This negative number can be converted to the index where the value was inserted by using the function sortedArray_idx
 */
export const sortedArray_add = <TValue>(
  sortedArray: TValue[],
  value: TValue,
  comparer: (left: TValue, right: TValue) => number,
  left: number = 0,
  right: number = sortedArray.length - 1,
): number => {
  const index = sortedArray_indexOf(sortedArray, value, comparer, left, right);
  if (index < 0) {
    sortedArray.splice(-index - 1, 0, value);
  }
  return index;
};

/**
 * Removes the given value from the given sorted array using binary search.
 * Complexity is O(n) - O(log n) lookup and O(n) removal
 *
 * @param sortedArray The array to remove the value from
 * @param value The value to remove
 * @param comparer The comparer function to use
 * @param left The left index to start searching from, defaults to 0
 * @param right The right index to start searching from, defaults to sortedArray.length - 1
 * @returns The index of the value if found, or a negative number if not found.
 * This negative number can be converted to the index where the value was inserted by using the function sortedArray_idx
 */
export const sortedArray_remove = <TValue>(
  sortedArray: TValue[],
  value: TValue,
  comparer: (left: TValue, right: TValue) => number,
  left: number = 0,
  right: number = sortedArray.length - 1,
): number => {
  const index = sortedArray_indexOf(sortedArray, value, comparer, left, right);
  if (index >= 0) {
    sortedArray.splice(index, 1);
  }
  return index;
};

/**
 * Merges the given sorted arrays into a new sorted array.
 * It does insert duplicates if unique is false (default)
 *
 * Complexity is O(n)
 *
 * @param sortedArrayA The first sorted array
 * @param sortedArrayB The second sorted array
 * @param comparer The comparer function to use
 * @param duplicates If true, it does insert duplicates if they are present in both arrays, default is true
 * @returns A new sorted array with the values of the given sorted arrays
 */
export const sortedArray_merged = <TValue>(
  sortedArrayA: SimpleArray<TValue>,
  sortedArrayB: SimpleArray<TValue>,
  comparer: (left: TValue, right: TValue) => number,
  duplicates = true,
): TValue[] => {
  const result: TValue[] = [];
  const lengthA = sortedArrayA.length;
  const lengthB = sortedArrayB.length;
  let indexA = 0;
  let indexB = 0;
  while (indexA < lengthA && indexB < lengthB) {
    const valueA = sortedArrayA[indexA]!;
    const valueB = sortedArrayB[indexB]!;
    const comparison = comparer(valueA, valueB);
    if (comparison < 0) {
      result.push(valueA);
      ++indexA;
    } else if (comparison > 0) {
      result.push(valueB);
      ++indexB;
    } else {
      result.push(valueA);
      if (duplicates) {
        result.push(valueB);
      }
      ++indexA;
      ++indexB;
    }
  }
  while (indexA < lengthA) {
    result.push(sortedArrayA[indexA++]!);
  }
  while (indexB < lengthB) {
    result.push(sortedArrayB[indexB++]!);
  }
  return result;
};
