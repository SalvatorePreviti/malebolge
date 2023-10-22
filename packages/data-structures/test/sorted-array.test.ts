import { describe, expect, it } from "vitest";
import {
  sortedArray_binaryWalk,
  sortedArray_indexOf,
  sortedArray_indexOfInsertion,
  sortedArray_idx,
  sortedArray_add,
  sortedArray_includes,
  sortedArray_indexOfDuplicate,
  sortedArray_isSorted,
  sortedArray_iterateUnique,
  sortedArray_merged,
  sortedArray_remove,
} from "../sorted-array";

describe("sortedArray functions", () => {
  const sortedArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  describe("sortedArray_idx", () => {
    it("should return the index where the value should be inserted", () => {
      expect(sortedArray_idx(0)).toBe(0);
      expect(sortedArray_idx(1)).toBe(1);
      expect(sortedArray_idx(0xffffffff >>> 0)).toBe(0xffffffff >>> 0);
      expect(sortedArray_idx(-1)).toBe(0);
      expect(sortedArray_idx(-2)).toBe(1);
      expect(sortedArray_idx(-10)).toBe(9);
      expect(sortedArray_idx(-11)).toBe(10);
    });
  });

  describe("sortedArray_indexOf", () => {
    it("should return the index of the value if found", () => {
      expect(sortedArray_indexOf(sortedArray, 1, (a, b) => a - b)).toBe(0);
      expect(sortedArray_indexOf(sortedArray, 10, (a, b) => a - b)).toBe(9);
      expect(sortedArray_indexOf(sortedArray, 5, (a, b) => a - b)).toBe(4);
    });

    it("should return a negative number if not found", () => {
      expect(sortedArray_indexOf(sortedArray, 0, (a, b) => a - b)).toBe(-1);
      expect(sortedArray_indexOf(sortedArray, 11, (a, b) => a - b)).toBe(-11);
      expect(sortedArray_indexOf(sortedArray, 15, (a, b) => a - b)).toBe(-11);
    });
  });

  describe("sortedArray_indexOfInsertion", () => {
    it("should return the index where the value should be inserted", () => {
      expect(sortedArray_indexOfInsertion(sortedArray, 0, (a, b) => a - b)).toBe(0);
      expect(sortedArray_indexOfInsertion(sortedArray, 1, (a, b) => a - b)).toBe(0);
      expect(sortedArray_indexOfInsertion(sortedArray, 5, (a, b) => a - b)).toBe(4);
      expect(sortedArray_indexOfInsertion(sortedArray, 10, (a, b) => a - b)).toBe(9);
      expect(sortedArray_indexOfInsertion(sortedArray, 11, (a, b) => a - b)).toBe(10);
    });
  });

  describe("sortedArray_binaryWalk", () => {
    it("should return the index of the value if found", () => {
      expect(sortedArray_binaryWalk(sortedArray, (a) => 1 - a)).toBe(0);
      expect(sortedArray_binaryWalk(sortedArray, (a) => 10 - a)).toBe(9);
      expect(sortedArray_binaryWalk(sortedArray, (a) => 5 - a)).toBe(4);
    });

    it("should return a negative number if not found", () => {
      expect(sortedArray_binaryWalk(sortedArray, (a) => -a)).toBe(-1);
      expect(sortedArray_binaryWalk(sortedArray, (a) => 11 - a)).toBe(-11);
      expect(sortedArray_binaryWalk(sortedArray, (a) => 15 - a)).toBe(-11);
    });
  });

  describe("sortedArray_add", () => {
    it("should add the value to the array if not already present", () => {
      const arr = [1, 1, 3, 4, 5];
      expect(sortedArray_add(arr, 6, (a, b) => a - b)).toBe(-6);
      expect(arr).toEqual([1, 1, 3, 4, 5, 6]);
    });

    it("should not add the value to the array if already present", () => {
      const arr = [1, 2, 2, 4, 5];
      expect(sortedArray_add(arr, 5, (a, b) => a - b)).toBe(4);
      expect(arr).toEqual([1, 2, 2, 4, 5]);
    });
  });

  describe("sortedArray_includes", () => {
    it("should return true if the value is present", () => {
      expect(sortedArray_includes(sortedArray, 1, (a, b) => a - b)).toBe(true);
      expect(sortedArray_includes(sortedArray, 10, (a, b) => a - b)).toBe(true);
      expect(sortedArray_includes(sortedArray, 5, (a, b) => a - b)).toBe(true);
    });

    it("should return false if the value is not present", () => {
      expect(sortedArray_includes(sortedArray, 0, (a, b) => a - b)).toBe(false);
      expect(sortedArray_includes(sortedArray, 11, (a, b) => a - b)).toBe(false);
      expect(sortedArray_includes(sortedArray, 15, (a, b) => a - b)).toBe(false);
    });
  });

  describe("sortedArray_indexOfDuplicate", () => {
    it("should return the index of the first duplicate", () => {
      const arr = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
      expect(sortedArray_indexOfDuplicate(arr, (a, b) => a - b)).toBe(5);
    });

    it("should return -1 if no duplicates", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      expect(sortedArray_indexOfDuplicate(arr, (a, b) => a - b)).toBe(-1);
    });
  });

  describe("sortedArray_isSorted", () => {
    it("should return true if the array is sorted", () => {
      expect(sortedArray_isSorted(sortedArray, (a, b) => a - b)).toBe(true);
    });

    it("should return false if the array is not sorted", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      expect(sortedArray_isSorted(arr, (a, b) => a - b)).toBe(false);
    });
  });

  describe("sortedArray_iterateUnique", () => {
    it("should iterate over the unique values", () => {
      const arr = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
      const result = Array.from(sortedArray_iterateUnique(arr, (a, b) => a - b));
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe("sortedArray_merged", () => {
    it("should merge two sorted arrays", () => {
      const arr1 = [1, 2, 3, 4, 5];
      const arr2 = [6, 7, 8, 9, 10];
      expect(sortedArray_merged(arr1, arr2, (a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should merge two sorted arrays with duplicates disabled", () => {
      const arr1 = [1, 2, 3, 4, 5, 6, 8];
      const arr2 = [5, 6, 7, 8, 8, 9, 10];
      expect(sortedArray_merged(arr1, arr2, (a, b) => a - b, false)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 10]);
    });

    it("should merge two sorted arrays with duplicates enabled", () => {
      const arr1 = [1, 2, 3, 4, 5, 6, 8];
      const arr2 = [5, 6, 7, 8, 8, 9, 10];
      expect(sortedArray_merged(arr1, arr2, (a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 8, 9, 10]);
    });
  });

  describe("sortedArray_remove", () => {
    it("should remove the value from the array if present", () => {
      const arr = [1, 2, 3, 4, 5];
      expect(sortedArray_remove(arr, 5, (a, b) => a - b)).toBe(4);
      expect(arr).toEqual([1, 2, 3, 4]);
    });

    it("should not remove the value from the array if not present", () => {
      const arr = [1, 2, 3, 4, 5];
      expect(sortedArray_remove(arr, 6, (a, b) => a - b)).toBe(-6);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
