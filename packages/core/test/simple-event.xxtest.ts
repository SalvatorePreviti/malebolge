import { UNSUBSCRIBE, newSimpleEvent } from "../../core/simple-event"; // Replace with the actual module path
import { describe, expect, it } from "vitest";

describe("SimpleEvent", () => {
  it("should subscribe and emit values", () => {
    const simpleEvent = newSimpleEvent<number>();
    const values: number[] = [];
    const unsub = simpleEvent.sub((value) => {
      values.push(value);
    });

    simpleEvent.emit(1);
    simpleEvent.emit(2);

    expect(values).toEqual([1, 2]);

    unsub(); // Unsubscribe
    simpleEvent.emit(3);

    expect(values).toEqual([1, 2]); // Should not have been called after unsubscribing
  });

  it("should handle multiple subscriptions", () => {
    const simpleEvent = newSimpleEvent<number>();

    expect(simpleEvent.sub.subscribers).toBe(0);

    const values1: number[] = [];
    const values2: number[] = [];

    const unsub1 = simpleEvent.sub((value) => {
      values1.push(value);
    });

    expect(simpleEvent.sub.subscribers).toBe(1);

    const unsub2 = simpleEvent.sub((value) => {
      values2.push(value);
    });

    expect(simpleEvent.sub.subscribers).toBe(2);

    simpleEvent.emit(1);

    expect(values1).toEqual([1]);
    expect(values2).toEqual([1]);

    unsub1(); // Unsubscribe the first handler

    expect(simpleEvent.sub.subscribers).toBe(1);

    unsub1(); // this should be a no-op

    expect(simpleEvent.sub.subscribers).toBe(1);

    simpleEvent.emit(2);

    expect(values1).toEqual([1]); // First handler should not have been called
    expect(values2).toEqual([1, 2]);

    unsub2(); // Unsubscribe the second handler

    expect(simpleEvent.sub.subscribers).toBe(0);

    simpleEvent.emit(3);

    expect(values1).toEqual([1]); // First handler should still not have been called
    expect(values2).toEqual([1, 2]); // Second handler should still not have been called

    unsub2();
    unsub2();

    expect(simpleEvent.sub.subscribers).toBe(0);
  });

  it("should unsubscribe if the handler returns UNSUBSCRIBE", () => {
    const simpleEvent = newSimpleEvent<number>();
    const values: number[] = [];

    simpleEvent.sub((value) => {
      values.push(value);
      return UNSUBSCRIBE;
    });

    simpleEvent.emit(1);

    expect(values).toEqual([1]);

    simpleEvent.emit(2);

    expect(values).toEqual([1]);
  });

  it("restart from the beginning if a handler after the current node is deleted while iterating", () => {
    const simpleEvent = newSimpleEvent<number>();

    let unsub1calls = 0;
    let unsub2calls = 0;

    let unsub2: () => void;

    const unsub1 = simpleEvent.sub(() => {
      ++unsub1calls;
      unsub2();
    });

    unsub2 = simpleEvent.sub(() => {
      ++unsub2calls;
    });

    simpleEvent.emit(1);

    expect(unsub1calls).toBe(2);
    expect(unsub2calls).toBe(0);

    unsub1();

    simpleEvent.emit(2);

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

      const simpleEvent = newSimpleEvent<number>();

      let unsub0called = false;
      let unsub1called = false;
      let unsub2called = false;
      let unsub3called = false;

      const unsub0 = simpleEvent.sub(() => {
        unsub0called = true;
      });

      const unsub1 = simpleEvent.sub(() => {
        unsub1called = true;
      });

      const unsub2 = simpleEvent.sub(() => {
        unsub2called = true;
      });

      const unsub3 = simpleEvent.sub(() => {
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

      simpleEvent.emit(1);

      expect(unsub0called).toBe(!bit0);
      expect(unsub1called).toBe(!bit1);
      expect(unsub2called).toBe(!bit2);
      expect(unsub3called).toBe(!bit3);

      expect(simpleEvent.sub.subscribers).toBe(expectedSubsCount);
    }
  });
});
