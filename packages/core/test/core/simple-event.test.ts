import { newSimpleEvent, weakSimpleEventHandler } from "../../core/simple-event"; // Replace with the actual module path
import { describe, expect, it, test } from "vitest";
import { linkedList_size } from "../../data-structures";
import { UNSUBSCRIBE } from "../../core/symbols";

interface MyEventPayload {
  value: number;
}

describe("SimpleEvent", () => {
  it("should subscribe and emit values", () => {
    const simpleEvent = newSimpleEvent<MyEventPayload>();
    const values: MyEventPayload[] = [];
    const unsub = simpleEvent((payload) => {
      values.push(payload);
    });

    simpleEvent.emit({ value: 1 });
    simpleEvent.emit({ value: 2 });

    expect(values).toEqual([{ value: 1 }, { value: 2 }]);

    unsub(); // Unsubscribe
    simpleEvent.emit({ value: 3 });

    expect(values).toEqual([{ value: 1 }, { value: 2 }]); // Should not have been called after unsubscribing
  });

  it("should handle multiple subscriptions", () => {
    const simpleEvent = newSimpleEvent<MyEventPayload>();

    expect(linkedList_size(simpleEvent)).toBe(0);

    const values1: MyEventPayload[] = [];
    const values2: MyEventPayload[] = [];

    const unsub1 = simpleEvent((payload) => {
      values1.push(payload);
    });

    expect(linkedList_size(simpleEvent)).toBe(1);

    const unsub2 = simpleEvent((value) => {
      values2.push(value);
    });

    expect(linkedList_size(simpleEvent)).toBe(2);

    simpleEvent.emit({ value: 1 });

    expect(values1).toEqual([{ value: 1 }]);
    expect(values2).toEqual([{ value: 1 }]);

    unsub1(); // Unsubscribe the first handler

    expect(linkedList_size(simpleEvent)).toBe(1);

    unsub1(); // this should be a no-op

    expect(linkedList_size(simpleEvent)).toBe(1);

    simpleEvent.emit({ value: 2 });

    expect(values1).toEqual([{ value: 1 }]); // First handler should not have been called
    expect(values2).toEqual([{ value: 1 }, { value: 2 }]);

    unsub2(); // Unsubscribe the second handler

    expect(linkedList_size(simpleEvent)).toBe(0);

    simpleEvent.emit({ value: 3 });

    expect(values1).toEqual([{ value: 1 }]); // First handler should still not have been called
    expect(values2).toEqual([{ value: 1 }, { value: 2 }]); // Second handler should still not have been called

    unsub2();
    unsub2();

    expect(linkedList_size(simpleEvent)).toBe(0);
  });

  it("should unsubscribe if the handler returns UNSUBSCRIBE", () => {
    const simpleEvent = newSimpleEvent<MyEventPayload>();
    const values: MyEventPayload[] = [];

    simpleEvent((value) => {
      values.push(value);
      return UNSUBSCRIBE;
    });

    simpleEvent.emit({ value: 1 });

    expect(values).toEqual([{ value: 1 }]);

    simpleEvent.emit({ value: 2 });

    expect(values).toEqual([{ value: 1 }]);
  });

  it("restart from the beginning if a handler after the current node is deleted while iterating", () => {
    const simpleEvent = newSimpleEvent<MyEventPayload>();

    let unsub1calls = 0;
    let unsub2calls = 0;

    let unsub2: () => void;

    const unsub1 = simpleEvent(() => {
      ++unsub1calls;
      unsub2();
    });

    unsub2 = simpleEvent(() => {
      ++unsub2calls;
    });

    simpleEvent.emit({ value: 1 });

    expect(unsub1calls).toBe(2);
    expect(unsub2calls).toBe(0);

    unsub1();

    simpleEvent.emit({ value: 2 });

    expect(unsub1calls).toBe(2);
    expect(unsub2calls).toBe(0);
  });

  it("should handle all possible combinations of unsub of 4 handlers", () => {
    // This is used to verify that the linked list works as expected deleting items at the edges or in the middle
    for (let i = 0; i < 0xf; ++i) {
      const bit0 = (i & 1) !== 0;
      const bit1 = (i & 2) !== 0;
      const bit2 = (i & 4) !== 0;
      const bit3 = (i & 8) !== 0;

      const simpleEvent = newSimpleEvent<MyEventPayload>();

      let unsub0called = false;
      let unsub1called = false;
      let unsub2called = false;
      let unsub3called = false;

      const unsub0 = simpleEvent(() => {
        unsub0called = true;
      });

      const unsub1 = simpleEvent(() => {
        unsub1called = true;
      });

      const unsub2 = simpleEvent(() => {
        unsub2called = true;
      });

      const unsub3 = simpleEvent(() => {
        unsub3called = true;
      });

      let expectedSubsCount = 4;

      if (bit0) {
        unsub0();
        --expectedSubsCount;
      }

      if (bit1) {
        unsub1();
        --expectedSubsCount;
      }

      if (bit2) {
        unsub2();
        --expectedSubsCount;
      }

      if (bit3) {
        unsub3();
        --expectedSubsCount;
      }

      simpleEvent.emit({ value: i });

      expect(unsub0called).toBe(!bit0);
      expect(unsub1called).toBe(!bit1);
      expect(unsub2called).toBe(!bit2);
      expect(unsub3called).toBe(!bit3);

      expect(linkedList_size(simpleEvent)).toBe(expectedSubsCount);
    }
  });

  test("weakSimpleEventHandler", () => {
    const calls = [] as number[];
    const handler = (value: MyEventPayload) => {
      calls.push(value.value);
      return calls.length > 3 ? UNSUBSCRIBE : value.value;
    };

    const weakHandler = weakSimpleEventHandler(handler);

    expect(weakHandler({ value: 1 })).toBe(1);
    expect(weakHandler({ value: 2 })).toBe(2);
    expect(weakHandler({ value: 3 })).toBe(3);

    expect(calls).toEqual([1, 2, 3]);

    expect(weakHandler({ value: 4 })).toBe(UNSUBSCRIBE);

    expect(calls).toEqual([1, 2, 3, 4]);

    expect(weakSimpleEventHandler(handler), "it should always return the same instance").toBe(weakHandler);
  });
});
