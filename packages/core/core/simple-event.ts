import { UNSUBSCRIBE } from "./symbols";
import type { UnsafeAny } from "./types";

export type SimpleEventHandlerFn<TPayload = unknown> = unknown extends TPayload
  ? (payload?: TPayload) => void | UNSUBSCRIBE | unknown
  : TPayload extends undefined | void
  ? (payload?: TPayload) => void | UNSUBSCRIBE | unknown
  : (payload: TPayload) => void | UNSUBSCRIBE | unknown;

export type SimpleEventEmitFn<TPayload = unknown> = unknown extends TPayload
  ? (payload?: TPayload) => void
  : TPayload extends undefined | void
  ? (payload?: TPayload) => void
  : (payload: TPayload) => void;

export type SimpleEventUnsubFn = () => boolean;

/**
 * Subscribe to the event.
 * If the event return the special symbol UNSUBSCRIBE, the handler will be automatically unsubscribed after invoked.
 *
 * @param handler The handler to call when the event is emitted.
 * @returns A function that can be called to unsubscribe.
 */
export type SimpleEventSubscribeFn<TPayload = unknown> = (
  handler: SimpleEventHandlerFn<TPayload>,
) => SimpleEventUnsubFn;

export interface SimpleEventNode<TPayload = unknown> extends SimpleEventUnsubFn {
  /** The function to be invoked when the event is emitted. Is null if the handler was unsubscribed. */
  readonly value: SimpleEventHandlerFn<TPayload> | null;

  /** The previous node in the linked list */
  readonly prev: this | null;

  /** The next node in the linked list */
  readonly next: this | null;
}

export interface SimpleEventSubscribe<TPayload = unknown> extends SimpleEventSubscribeFn<TPayload> {
  /** The first ubsubscriber in the linked list of subscribers, or null if empty */
  readonly head: SimpleEventNode<TPayload> | null;

  /** The last ubsubscriber in the linked list of subscribers, or null if empty */
  readonly tail: SimpleEventNode<TPayload> | null;

  /** The number of subscribers */
  readonly size: number;
}

export interface SimpleEvent<TPayload = unknown> extends SimpleEventSubscribe<TPayload> {
  /**
   * Emit the event.
   *
   * @param data The data to emit.
   */
  emit: SimpleEventEmitFn<TPayload>;
}

/**
 * Creates a new SimpleEvent instance.
 *
 * Simple event is a function that accepts a subscriber.
 * The subscriber is a function that will be called when the event is emitted.
 * The subscriber can return the special symbol UNSUBSCRIBE to automatically unsubscribe after invoked.
 *
 * This implementation is optimized for speed and memory, it uses a linked list internally so that subscription and unsubscription are O(1).
 *
 * @see SimpleEvent
 *
 * This code is based on https://github.com/SalvatorePreviti/malebolge - MIT license
 *
 * @returns A new SimpleEvent instance.
 */
export const newSimpleEvent = /* @__PURE__ */ <TPayload = unknown>(): SimpleEvent<TPayload> => {
  // We use a linked list here to optimize for speed and memory.
  // Subscription and unsubscription are O(1).
  // This implementation was benchmarked against the use of Array and Set (outside of the topic of this project).
  // We use the ubsub function itself as node in the linked list to reduce memory consumption and reduce dereferencing overhead.

  const sub = (handlerFn: SimpleEventHandlerFn<TPayload>) => {
    const unsub = (): boolean => {
      const { value, prev, next } = unsub;
      if (!value) {
        return false; // Already unsubscribed
      }

      // Remove from the linked list

      unsub.value = null;
      if (prev) {
        unsub.prev = null;
        prev.next = next;
      } else {
        sub.head = next;
      }
      if (next) {
        unsub.next = null;
        next.prev = prev;
      } else {
        sub.tail = prev;
      }
      --sub.size;

      return true;
    };

    // Add to the linked list.

    unsub.prev = sub.tail;
    unsub.next = null as typeof unsub.prev;
    unsub.value = handlerFn as SimpleEventHandlerFn<TPayload> | null;

    const tail = sub.tail;
    if (tail) {
      tail.next = unsub;
    } else {
      sub.head = unsub;
    }
    sub.tail = unsub;
    ++sub.size;

    return unsub;
  };

  const emit = ((payload: TPayload): void => {
    // Loop through the linked list and call all listeners
    let node = sub.head;
    while (node) {
      const { value, next } = node;
      if (value) {
        // Invoke the listener
        if (value(payload) === UNSUBSCRIBE) {
          // Remove the listener
          node();
        }
        node = next;
      } else if (value === null) {
        // Edge case: a node that is after the current node was deleted inside an handler while iterating.
        // We need to restart from the beginning to ensure all handlers are notified.
        node = sub.head;
      }
    }
  }) as SimpleEventEmitFn<TPayload>;

  sub.head = null as ReturnType<typeof sub> | null;
  sub.tail = null as ReturnType<typeof sub> | null;
  sub.size = 0;
  sub.emit = emit;

  return sub;
};

const _WEAK_HANDLER = Symbol("WEAK_HANDLER");

function _weakHandler(this: WeakRef<(payload: UnsafeAny) => UnsafeAny>, payload: UnsafeAny): UnsafeAny | UNSUBSCRIBE {
  const handler = this.deref();
  return handler ? handler(payload) : UNSUBSCRIBE;
}

/**
 * Higher order function that makes the given handler a weak handler using WeakRef.
 * The returning function returns UNSUBSCRIBE if the original handler is garbage collected.
 *
 * It always returns the same function for the same handler.
 *
 * @see WeakRef
 *
 * @param handler The handler to make weak.
 * @returns A weak handler that will be unsubscribed automatically if the original handler is garbage collected.
 */
export const weakSimpleEventHandler = /* @__PURE__ */ <TPayload = unknown, TResult = void | UNSUBSCRIBE>(
  handler: (payload: TPayload) => TResult,
): ((value: TPayload) => TResult | UNSUBSCRIBE) => {
  let weakHandler = (handler as UnsafeAny)[_WEAK_HANDLER];
  if (!weakHandler) {
    weakHandler = _weakHandler.bind(new WeakRef(handler));
    weakHandler[_WEAK_HANDLER] = weakHandler;
    (handler as UnsafeAny)[_WEAK_HANDLER] = weakHandler;
  }
  return weakHandler;
};
