import { describe, expect, it } from "vitest";
import { UNSUBSCRIBE, weakEventHandler } from "../../core";

interface MyEventPayload {
  value: number;
}

describe("weakEventHandler", () => {
  it("should call the handler", () => {
    const calls = [] as number[];
    const handler = (value: MyEventPayload) => {
      calls.push(value.value);
      return calls.length > 3 ? UNSUBSCRIBE : value.value;
    };

    const weakHandler = weakEventHandler(handler);

    expect(weakHandler({ value: 1 })).toBe(1);
    expect(weakHandler({ value: 2 })).toBe(2);
    expect(weakHandler({ value: 3 })).toBe(3);

    expect(calls).toEqual([1, 2, 3]);

    expect(weakHandler({ value: 4 })).toBe(UNSUBSCRIBE);

    expect(calls).toEqual([1, 2, 3, 4]);

    expect(weakEventHandler(handler), "it should always return the same instance").toBe(weakHandler);
  });
});
