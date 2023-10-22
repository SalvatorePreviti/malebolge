import { describe, expect, it, vitest, test } from "vitest";

import {
  UNSET,
  fnEmptyMap,
  fnCallCounter,
  fnMemoizeOnce,
  fnMemoizeTimed,
  fnEmptyArray,
  fnEmptyObject,
  fnEmptySet,
  fnEmptyString,
  fnEq,
  fnFalse,
  fnIdentity,
  fnInfinity,
  fnMinusOne,
  fnNaN,
  fnNegativeInfinity,
  fnNeq,
  fnNull,
  fnOne,
  fnTrue,
  fnUndefined,
  fnVoid,
  fnZero,
  getWeakRef,
  isNullOrUndefined,
} from "@malebolge/core";

describe("fns", () => {
  test("fnEmptyMap", () => {
    expect(fnEmptyMap()).toBeInstanceOf(Map);
  });

  test("fnEmptySet", () => {
    expect(fnEmptySet()).toBeInstanceOf(Set);
  });

  test("fnEmptyArray", () => {
    expect(fnEmptyArray()).toEqual([]);
  });

  test("fnEq", () => {
    expect(fnEq(10, 10)).toBe(true);
    expect(fnEq({}, {})).toBe(false);
  });

  test("fnNeq", () => {
    expect(fnNeq({}, {})).toBe(true);
    expect(fnNeq(12, 13)).toBe(true);
  });

  test("fnEmptyObject", () => {
    expect(fnEmptyObject()).toEqual({});
  });

  test("fnEmptyString", () => {
    expect(fnEmptyString()).toBe("");
  });

  test("fnVoid", () => {
    expect(fnVoid()).toBeUndefined();
  });

  test("fnUndefined", () => {
    expect(fnUndefined()).toBeUndefined();
  });

  test("fnNull", () => {
    expect(fnNull()).toBeNull();
  });

  test("fnFalse", () => {
    expect(fnFalse()).toBe(false);
  });

  test("fnTrue", () => {
    expect(fnTrue()).toBe(true);
  });

  test("fnZero", () => {
    expect(fnZero()).toBe(0);
  });

  test("fnOne", () => {
    expect(fnOne()).toBe(1);
  });

  test("fnMinusOne", () => {
    expect(fnMinusOne()).toBe(-1);
  });

  test("fnNaN", () => {
    expect(fnNaN()).toBeNaN();
  });

  test("fnInfinity", () => {
    expect(fnInfinity()).toBe(Infinity);
  });

  test("fnNegativeInfinity", () => {
    expect(fnNegativeInfinity()).toBe(-Infinity);
  });

  test("fnIdentity", () => {
    expect(fnIdentity(10)).toBe(10);
  });

  test("isNullOrUndefined", () => {
    expect(isNullOrUndefined(null)).toBe(true);
    expect(isNullOrUndefined(undefined)).toBe(true);
    expect(isNullOrUndefined(0)).toBe(false);
    expect(isNullOrUndefined(false)).toBe(false);
    expect(isNullOrUndefined(NaN)).toBe(false);
    expect(isNullOrUndefined(Infinity)).toBe(false);
    expect(isNullOrUndefined(-Infinity)).toBe(false);
    expect(isNullOrUndefined("")).toBe(false);
    expect(isNullOrUndefined([])).toBe(false);
    expect(isNullOrUndefined({})).toBe(false);
    expect(isNullOrUndefined(new Map())).toBe(false);
    expect(isNullOrUndefined(new Set())).toBe(false);
  });

  test("getWeakRef", () => {
    const obj = {};
    const ref = getWeakRef(obj);
    expect(ref.deref()).toBe(obj);
    expect(getWeakRef(obj)).toBe(ref);
    expect(getWeakRef(obj)).toBe(ref);
  });

  describe("fnCallOnce", () => {
    it("should call the given function only once and cache the result", () => {
      let counter = 0;
      const fn = fnMemoizeOnce(() => ++counter);
      expect(fn()).toBe(1);
      expect(fn()).toBe(1);
      expect(fn()).toBe(1);
      fn.value = UNSET;
      expect(fn()).toBe(2);
      expect(fn()).toBe(2);
      fn.value = 10;
      expect(fn()).toBe(10);
      expect(fn()).toBe(10);
    });
  });

  describe("fnCallCounter", () => {
    it("should count the number of times the function was called", () => {
      let counter = 0;
      const fn = fnCallCounter(() => ++counter);
      expect(fn()).toBe(1);
      expect(fn()).toBe(2);
      expect(fn.value).toBe(2);

      fn.value = 0;

      expect(fn()).toBe(3);
      expect(fn.value).toBe(1);
    });
  });

  describe("fnMemoizeOnce", () => {
    it("should call the given function only once and cache the result", () => {
      let counter = 0;
      const fn = fnMemoizeOnce(() => ++counter);
      expect(fn()).toBe(1);
      expect(fn()).toBe(1);
      expect(fn()).toBe(1);

      fn.value = 100;

      expect(fn()).toBe(100);
      expect(fn()).toBe(100);

      fn.value = UNSET;

      expect(fn()).toBe(2);
      expect(fn()).toBe(2);
    });
  });

  describe("fnMemoizeTimed", () => {
    it("should call the given function only once and cache the result for the given timeout in milliseconds", async () => {
      vitest.useFakeTimers();
      let counter = 0;
      const fn = fnMemoizeTimed(() => ++counter, 1000);
      expect(fn()).toBe(1);
      expect(fn()).toBe(1);
      vitest.advanceTimersByTime(500);
      expect(fn()).toBe(1);
      expect(fn()).toBe(1);
      vitest.advanceTimersByTime(600);
      expect(fn()).toBe(2);
      expect(fn()).toBe(2);

      fn.set(10);
      expect(fn()).toBe(10);
      expect(fn()).toBe(10);

      vitest.advanceTimersByTime(500);
      expect(fn()).toBe(10);
      expect(fn()).toBe(10);

      vitest.advanceTimersByTime(600);
      expect(fn()).toBe(3);
    });
  });
});
