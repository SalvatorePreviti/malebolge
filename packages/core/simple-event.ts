export const UNSUBSCRIBE = Symbol("UNSUBSCRIBE");

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type UNSUBSCRIBE = typeof UNSUBSCRIBE;

export type SimpleEventHandlerFn<T = void> = (value: T) => void | UNSUBSCRIBE;

export type SimpleEventUnsubFn = () => void;

export type SimpleEventSubFn<T = void> = {
  (handler: SimpleEventHandlerFn<T>): SimpleEventUnsubFn;

  /** The number of subscribers */
  readonly subscribers: number;
};

export interface SimpleEventSubscribable<T = void> {
  /**
   * Subscribe to the event.
   * If the event return the special symbol UNSUBSCRIBE, the handler will be automatically unsubscribed after invoked.
   *
   * @param handler The handler to call when the event is emitted.
   * @returns A function that can be called to unsubscribe.
   */
  sub: SimpleEventSubFn<T>;
}

export interface SimpleEvent<T = void> extends SimpleEventSubscribable<T> {
  emit: (value: T) => void;
}

interface StateNode<T> extends SimpleEventUnsubFn {
  /** The function to be invoked when the event is emitted */
  handler?: SimpleEventHandlerFn<T> | null | undefined;

  /** The previous node in the linked list */
  prev?: StateNode<T> | null | undefined;

  /** The next node in the linked list */
  next?: StateNode<T> | null | undefined;
}

/**
 * Creates a new SimpleEvent instance.
 *
 * Simple events have only two methods: sub and emit.
 * This implementation is optimized for speed and memory, it uses a linked list internally so that subscription and unsubscription are O(1).
 *
 * @see SimpleEvent
 *
 * This code is based on https://github.com/SalvatorePreviti/malebolge - MIT license
 *
 * @returns A new SimpleEvent instance.
 */
export const newSimpleEvent = /* @__PURE__ */ <T = void>(): SimpleEvent<T> => {
  let head: StateNode<T> | null | undefined;
  let tail: StateNode<T> | null | undefined;

  // We use a linked list here to optimize for speed and memory.
  // Subscription and unsubscription are O(1).
  // This implementation was benchmarked against the use of Array and Set (outside of the topic of this project).
  // We use the ubsub function itself as node in the linked list to reduce memory consumption and reduce dereferencing overhead.

  const sub = ((handlerFn) => {
    const unsub: StateNode<T> = (): void => {
      const { handler, prev, next } = unsub;
      if (!handler) {
        return; // Already unsubscribed
      }

      // Remove from the linked list

      --(sub as { subscribers: number }).subscribers;
      unsub.handler = null;
      if (prev) {
        prev.next = next;
        unsub.prev = null;
      } else {
        head = next;
      }
      if (next) {
        next.prev = prev;
        unsub.next = null;
      } else {
        tail = prev;
      }
    };

    // Add to the linked list.

    unsub.handler = handlerFn;
    unsub.prev = tail;
    unsub.next = null;
    if (tail) {
      tail.next = unsub;
    } else {
      head = unsub;
    }
    tail = unsub;
    ++(sub as { subscribers: number }).subscribers;

    return unsub;
  }) as SimpleEventSubFn<T>;

  (sub as { subscribers: number }).subscribers = 0;

  const emit = (value: T) => {
    // Loop through the linked list and call all listeners
    let node = head;
    while (node) {
      const { handler, next } = node;
      if (handler) {
        // Invoke the listener
        if (handler(value) === UNSUBSCRIBE) {
          // Remove the listener
          node();
        }
        node = next;
      } else if (handler === null) {
        // Edge case: a node that is after the current node was deleted inside an handler while iterating.
        // We need to restart from the beginning to ensure all handlers are notified.
        node = head;
      }
    }
  };

  return { sub, emit };
};
