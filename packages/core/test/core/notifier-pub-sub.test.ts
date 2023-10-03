import { UNSUBSCRIBE, notifierPubSub_new } from "../../core"; // Replace with the actual module path
import { describe, expect, it } from "vitest";
import { linkedList_size } from "../../data-structures";

describe("notifierPubSub", () => {
  it("should subscribe and publish", () => {
    const onChange = notifierPubSub_new();
    let called = 0;
    const unsub = onChange(() => ++called);

    onChange.emit();

    expect(called).toBe(1);

    onChange.emit();

    expect(called).toBe(2);

    unsub(); // Unsubscribe

    onChange.emit();
    onChange.emit();

    expect(called).toBe(2); // Should not have been called after unsubscribing
  });

  it("should handle multiple subscriptions", () => {
    const onChange = notifierPubSub_new();

    expect(linkedList_size(onChange)).toBe(0);

    let calls1 = 0;
    let calls2 = 0;

    const unsub1 = onChange(() => ++calls1);

    expect(linkedList_size(onChange)).toBe(1);

    const unsub2 = onChange(() => ++calls2);

    expect(linkedList_size(onChange)).toBe(2);

    onChange.emit();

    expect(calls1).toBe(1);
    expect(calls2).toBe(1);

    unsub1(); // Unsubscribe the first handler

    expect(linkedList_size(onChange)).toBe(1);

    unsub1(); // this should be a no-op

    expect(linkedList_size(onChange)).toBe(1);

    onChange.emit();

    expect(calls1).toBe(1); // First handler should not have been called
    expect(calls2).toBe(2);

    unsub2(); // Unsubscribe the second handler

    expect(linkedList_size(onChange)).toBe(0);

    onChange.emit();

    expect(calls1).toBe(1); // First handler should still not have been called
    expect(calls2).toBe(2); // Second handler should still not have been called

    unsub2();
    unsub2();

    onChange.emit();

    expect(calls1).toBe(1);
    expect(calls2).toBe(2);

    expect(linkedList_size(onChange)).toBe(0);
  });

  it("should unsubscribe if the handler returns UNSUBSCRIBE", () => {
    const onChange = notifierPubSub_new();
    let calls = 0;

    onChange(() => {
      ++calls;
      return UNSUBSCRIBE;
    });

    onChange.emit();

    expect(calls).toBe(1);

    onChange.emit();

    expect(calls).toBe(1);
  });

  it("allows unsubscribing nodes during emit", () => {
    const onChange = notifierPubSub_new();

    let evt1 = 0;
    let evt2 = 0;

    let unsub2: () => void;

    const unsub1 = onChange(() => {
      ++evt1;
      unsub2();
    });

    unsub2 = onChange(() => {
      ++evt2;
    });

    expect(evt1).toBe(0);
    expect(evt2).toBe(0);

    onChange.emit();

    expect(evt1).toBe(1);
    expect(evt2).toBe(0);

    unsub1();

    onChange.emit();

    expect(evt1).toBe(1);
    expect(evt2).toBe(0);

    onChange.emit();

    expect(evt1).toBe(1);
    expect(evt2).toBe(0);
  });

  it("should handle all possible combinations of unsub of 4 handlers", () => {
    // This is used to verify that the linked list works as expected deleting items at the edges or in the middle
    for (let i = 0; i < 0xf; ++i) {
      const bit0 = (i & 1) !== 0;
      const bit1 = (i & 2) !== 0;
      const bit2 = (i & 4) !== 0;
      const bit3 = (i & 8) !== 0;

      const onChange = notifierPubSub_new();

      let unsub0called = false;
      let unsub1called = false;
      let unsub2called = false;
      let unsub3called = false;

      const unsub0 = onChange(() => {
        unsub0called = true;
      });

      const unsub1 = onChange(() => {
        unsub1called = true;
      });

      const unsub2 = onChange(() => {
        unsub2called = true;
      });

      const unsub3 = onChange(() => {
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

      onChange.emit();

      expect(unsub0called).toBe(!bit0);
      expect(unsub1called).toBe(!bit1);
      expect(unsub2called).toBe(!bit2);
      expect(unsub3called).toBe(!bit3);

      expect(linkedList_size(onChange)).toBe(expectedSubsCount);
    }
  });

  describe("nested emits", () => {
    it("can re-emit", () => {
      const onChange = notifierPubSub_new();
      let calls = 0;
      onChange(() => {
        if (++calls < 5) {
          onChange.emit();
        }
      });
      onChange.emit();
      expect(calls).toBe(5);
    });

    it("should handle nested emits", () => {
      const onChange1 = notifierPubSub_new();
      const onChange2 = notifierPubSub_new();
      const onChange3 = notifierPubSub_new();

      let calls1 = 0;
      let calls2 = 0;
      let calls3 = 0;

      onChange3(() => {
        if (++calls3 < 5) {
          onChange1.emit();
        }
      });

      onChange2(() => {
        if (calls2++ < 5) {
          onChange1.emit();
        }
      });

      onChange1(() => {
        if (++calls1 < 5) {
          onChange2.emit();
        }
      });

      onChange3.emit();

      expect(calls3).toBe(1);
      expect(calls2).toBe(4);
      expect(calls1).toBe(5);
    });
  });
});
