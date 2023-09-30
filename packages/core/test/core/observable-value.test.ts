import { describe, it, expect } from "vitest";
import { newObservableValue } from "../../core/observable-value";
import type { UnsafeAny } from "../../core/types";

describe("newObservableValue", () => {
  it("creates an observable value with the initial value", () => {
    const value = newObservableValue(10);
    expect(value()).toBe(10);
    expect(value()).toBe(10);
  });

  it("creates an observable value with the initial value and the given options", () => {
    const value = newObservableValue(10, { equals: (a, b) => a === b });
    expect(value()).toBe(10);
    expect(value()).toBe(10);
  });

  it("notifies the subscribers when the value changes", () => {
    const value = newObservableValue(10);
    let notified = 0;
    const unsub = value.sub(() => {
      ++notified;
    });
    value.set(20);
    expect(notified).toBe(1);
    value.set(20);
    expect(notified).toBe(1);

    value.set(30);
    expect(value()).toBe(30);
    expect(notified).toBe(2);

    expect(unsub()).toBe(true);
    expect(unsub()).toBe(false);

    value.set(40);
    expect(notified).toBe(2);

    expect(value()).toBe(40);
  });

  it("supports toString, toJSON, valueOf", () => {
    const objValue = newObservableValue({ x: 10 });
    expect(JSON.stringify(objValue)).toBe('{"x":10}');
    expect(JSON.stringify({ v: objValue })).toBe('{"v":{"x":10}}');
    expect(newObservableValue(Symbol.for("xxx")).toString()).toBe("Symbol(xxx)");

    const numValue = newObservableValue(10);
    expect(numValue.valueOf()).toBe(10);
    expect(+numValue).toBe(10);
    expect((numValue as UnsafeAny) + 10).toBe(20);
    expect((numValue as UnsafeAny) * 10).toBe(100);
    expect((numValue as UnsafeAny) / 10).toBe(1);
    expect((numValue as UnsafeAny) - 8).toBe(2);
    expect(numValue.toString()).toBe("10");
    expect(`${numValue}`).toBe("10");
  });
});
