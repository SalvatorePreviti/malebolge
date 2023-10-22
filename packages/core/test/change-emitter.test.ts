import { ChangeEmitter, UNSUBSCRIBE } from "@malebolge/core";
import { describe, expect, it, test } from "vitest";

describe("ChangeEmitter", () => {
  it("should subscribe and emit values", () => {
    const changed = new ChangeEmitter();
    let calls = 0;
    const unsub = changed.subscribe(() => ++calls);

    changed.emit();
    changed.emit();

    expect(calls).toBe(2);

    unsub(); // Unsubscribe
    changed.emit();

    expect(calls).toBe(2);
  });

  it("should handle multiple subscriptions", () => {
    const changed = new ChangeEmitter();
    let calls1 = 0;
    let calls2 = 0;

    const unsub1 = changed.subscribe(() => ++calls1);
    const unsub2 = changed.subscribe(() => ++calls2);

    expect(calls1).toBe(0);
    expect(calls2).toBe(0);

    changed.emit();

    expect(calls1).toBe(1);
    expect(calls2).toBe(1);

    unsub1(); // Unsubscribe the first handler
    unsub1(); // this should be a no-op

    changed.emit();

    expect(calls1).toBe(1);
    expect(calls2).toBe(2);

    unsub2(); // Unsubscribe the second handler

    changed.emit();

    expect(calls1).toBe(1);
    expect(calls2).toBe(2);
  });

  it("should unsubscribe if the handler returns UNSUBSCRIBE", () => {
    const changed = new ChangeEmitter();
    let calls = 0;

    changed.subscribe(() => {
      ++calls;
      return UNSUBSCRIBE;
    });

    changed.emit();

    expect(calls).toBe(1);

    changed.emit();

    expect(calls).toBe(1);
  });

  it("restart from the beginning if a handler after the current node is deleted while iterating", () => {
    const changed = new ChangeEmitter();

    let unsub1calls = 0;
    let unsub2calls = 0;

    let unsub2: () => void;

    const unsub1 = changed.subscribe(() => {
      ++unsub1calls;
      unsub2();
    });

    unsub2 = changed.subscribe(() => {
      ++unsub2calls;
    });

    changed.emit();

    expect(unsub1calls).toBe(2);
    expect(unsub2calls).toBe(0);

    unsub1();

    changed.emit();

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

      const changed = new ChangeEmitter();

      let unsub0called = false;
      let unsub1called = false;
      let unsub2called = false;
      let unsub3called = false;

      const handler0 = () => {
        unsub0called = true;
      };

      const handler1 = () => {
        unsub1called = true;
      };

      const handler2 = () => {
        unsub2called = true;
      };

      const handler3 = () => {
        unsub3called = true;
      };

      const unsub0 = changed.subscribe(handler0);
      const unsub1 = changed.subscribe(handler1);
      const unsub2 = changed.subscribe(handler2);
      const unsub3 = changed.subscribe(handler3);

      expect(changed.findHandler(unsub0)).toBe(unsub0);
      expect(changed.findHandler(handler0)).toBe(unsub0);

      expect(changed.findHandler(unsub1)).toBe(unsub1);
      expect(changed.findHandler(handler1)).toBe(unsub1);

      expect(changed.findHandler(unsub2)).toBe(unsub2);
      expect(changed.findHandler(handler2)).toBe(unsub2);

      expect(changed.findHandler(unsub3)).toBe(unsub3);
      expect(changed.findHandler(handler3)).toBe(unsub3);

      if (bit0) {
        unsub0();
      }

      if (bit1) {
        expect(changed.unsubscribe(unsub1)).toBe(true);
      }

      if (bit2) {
        unsub2();
      }

      if (bit3) {
        unsub3();
      }

      if (bit0) {
        expect(changed.findHandler(unsub0)).toBeUndefined();
        expect(changed.findHandler(handler0)).toBeUndefined();
      } else {
        expect(changed.findHandler(unsub0)).toBe(unsub0);
        expect(changed.findHandler(handler0)).toBe(unsub0);
      }

      if (bit1) {
        expect(changed.findHandler(unsub1)).toBeUndefined();
        expect(changed.findHandler(handler1)).toBeUndefined();
      } else {
        expect(changed.findHandler(unsub1)).toBe(unsub1);
        expect(changed.findHandler(handler1)).toBe(unsub1);
      }

      if (bit2) {
        expect(changed.findHandler(unsub2)).toBeUndefined();
        expect(changed.findHandler(handler2)).toBeUndefined();
      } else {
        expect(changed.findHandler(unsub2)).toBe(unsub2);
        expect(changed.findHandler(handler2)).toBe(unsub2);
      }

      if (bit3) {
        expect(changed.findHandler(unsub3)).toBeUndefined();
        expect(changed.findHandler(handler3)).toBeUndefined();
      } else {
        expect(changed.findHandler(unsub3)).toBe(unsub3);
        expect(changed.findHandler(handler3)).toBe(unsub3);
      }

      changed.emit();

      expect(unsub0called).toBe(!bit0);
      expect(unsub1called).toBe(!bit1);
      expect(unsub2called).toBe(!bit2);
      expect(unsub3called).toBe(!bit3);
    }
  });

  test("getSubscriber, getEmitter", () => {
    const emitter = new ChangeEmitter();
    const subscriber = emitter.getSubscriber();
    let called = 0;
    const emit = emitter.getEmitter();
    const handler = () => ++called;
    const unsub = subscriber(handler);
    emit();
    expect(called).toBe(1);
    unsub();
    emit();
    expect(called).toBe(1);

    const node = emitter.subscribe(handler, handler);
    expect(node).toBe(handler);
    emit();
    expect(called).toBe(2);
    expect(emitter.unsubscribe(node)).toBe(true);
    emit();
    expect(emitter.unsubscribe(node)).toBe(false);
    emit();
    expect(called).toBe(2);
  });

  test("emitId", () => {
    const emitter = new ChangeEmitter();
    expect(emitter.emitId).toBe(1);
    expect(emitter.emitId).toBe(1);

    emitter.emit();
    expect(emitter.emitId).toBe(2);

    emitter.emit();
    emitter.emit();
    emitter.emit();
    expect(emitter.emitId).toBe(3);

    let receivedId = 0;
    emitter.subscribe(() => (receivedId = emitter.emitId));

    expect(receivedId).toBe(0);
    expect(emitter.emitId).toBe(3);

    emitter.emit();
    expect(receivedId).toBe(4);

    emitter.emit();
    expect(receivedId).toBe(5);
  });
});
