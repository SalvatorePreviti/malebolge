import { describe, expect, it, vitest } from "vitest";

import {
  fnEmptyMap,
  fnObjGetter,
  fnEquals,
  fnNotEquals,
  fnCallCounter,
  fnMemoizeOnce,
  fnMemoizeTimed,
} from "../../core/fns";
import { UNSET } from "../../core";

describe("fnEmptyMap", () => {
  it("should return a new Map", () => {
    const map = fnEmptyMap();
    expect(map).toBeInstanceOf(Map);
  });
});

describe("fnObjGetter", () => {
  it("should return the value of the given key of the given object", () => {
    const obj = { key: 10 };
    const fnGet_key = fnObjGetter("key");
    expect(fnGet_key(obj)).toBe(10);
  });

  it("should return undefined if the object is null or undefined", () => {
    const obj = null;
    const fnGet_key = fnObjGetter("key");
    expect(fnGet_key(obj)).toBeUndefined();
  });
});

describe("fnEquals", () => {
  it("should return true if a === b", () => {
    const a = 10;
    const b = 10;
    expect(fnEquals(a, b)).toBe(true);
  });

  it("should return false if a !== b", () => {
    const a = 10;
    const b = 20;
    expect(fnEquals(a, b)).toBe(false);
  });
});

describe("fnNotEquals", () => {
  it("should return true if a !== b", () => {
    const a = 10;
    const b = 20;
    expect(fnNotEquals(a, b)).toBe(true);
  });

  it("should return false if a === b", () => {
    const a = 10;
    const b = 10;
    expect(fnNotEquals(a, b)).toBe(false);
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
