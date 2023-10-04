import { linkedList_includesValue, linkedList_isEmpty, linkedList_size } from "../data-structures";
import { UNSUBSCRIBE } from "./symbols";

export type NotifierHandler = (sender?: NotifierEmitFn) => void | UNSUBSCRIBE | unknown;

export type NotifierEmitFn = () => void;

export type NotifierEmit = NotifierEmitFn;

export type NotifierUnsubFn = () => boolean;

export type NotifierSubFn = (handler: NotifierHandler) => NotifierUnsubFn;

export interface NotifierUnsub extends NotifierUnsubFn {
  /** The function to be invoked when the event is emitted. Is null if the handler was unsubscribed. */
  readonly value: NotifierHandler | null;

  /** The previous node in the linked list */
  readonly prev: this | null;

  /** The next node in the linked list */
  readonly next: this | null;
}

export interface NotifierSub extends NotifierSubFn {
  (handler: NotifierHandler): NotifierUnsub;

  /** The first ubsubscriber in the linked list of subscribers, or null if empty */
  readonly head: NotifierUnsub | null;

  /** The last ubsubscriber in the linked list of subscribers, or null if empty */
  readonly tail: NotifierUnsub | null;
}

export interface NotifierPubSub extends NotifierSub, NotifierEmitFn {
  /** Register a new subscriber. */
  (handler: NotifierHandler): NotifierUnsub;

  /** Emit the event to all subscribers. */
  (): void;
}

const _UNSUBSCRIBE = UNSUBSCRIBE;
const _EMIT_QUEUE_NEXT = Symbol("emitQueueNext");

interface NotifierUnsubNode extends NotifierUnsub {
  value: NotifierHandler | null;
  prev: this | null;
  next: this | null;
}

interface Notifier extends NotifierPubSub {
  head: NotifierUnsubNode | null;
  tail: NotifierUnsubNode | null;
  [_EMIT_QUEUE_NEXT]: EmitQueueNode | false | null;
}

interface EmitQueueNode extends NotifierEmitFn {
  [_EMIT_QUEUE_NEXT]: EmitQueueNode | false | null;
}

let _iter: NotifierUnsub | null = null;
let _iterSub: NotifierSub | null = null;
let _iterHandler: NotifierHandler | null | undefined;
let _emitHead: EmitQueueNode | null = null;
let _emitTail: EmitQueueNode | null = null;
let _emitFlushing = false;
let _emitLock = 0;

const _emitFlush = () => {
  if (_emitFlushing) {
    return; // Another flushing already in progress
  }
  _emitFlushing = true;
  try {
    for (;;) {
      const emit = _emitHead;
      if (!emit || _emitLock) {
        break; // Iteration terminated or emit is locked
      }
      const next = emit[_EMIT_QUEUE_NEXT];
      emit[_EMIT_QUEUE_NEXT] = null;
      if (!next) {
        _emitTail = null;
        _emitHead = null;
      } else {
        _emitHead = next;
      }
      emit();
    }
  } finally {
    _emitFlushing = false;
  }
};

const _emitEnqueue = (sub: Notifier) => {
  if (_iterSub === sub) {
    // We are already emitting this subscriber, we need to reset the iteration to the beginning.
    _iterHandler = null;
    _iter = sub.head;
  } else if (sub.head) {
    // Another emit is in progress and this subscriber is not empty, we need to enqueue this emit.
    const next = sub[_EMIT_QUEUE_NEXT];
    if (!next && next !== false) {
      sub[_EMIT_QUEUE_NEXT] = false;
      if (_emitTail) {
        _emitTail[_EMIT_QUEUE_NEXT] = sub;
      } else {
        _emitHead = sub;
      }
      _emitTail = sub;
    }
  }
};

const _subscribe = (sub: Notifier, handler: NotifierHandler) => {
  const unsub = (): boolean => {
    const { value, prev, next } = unsub;

    if (!value) {
      return false; // Already unsubscribed
    }

    // Remove from the linked list

    if (prev) {
      prev.next = next;
    } else {
      sub.head = next;
    }
    if (next) {
      next.prev = prev;
    } else {
      sub.tail = prev;
    }
    unsub.prev = null;
    unsub.next = null;
    unsub.value = null;

    if (_iter === unsub) {
      _iter = next; // We are currently iterating this subscriber, we need to advance the iterator.
    }

    return true;
  };

  const tail = sub.tail;

  unsub.prev = tail;
  unsub.next = null as typeof unsub.prev;
  unsub.value = handler as NotifierHandler | null;

  sub.tail = unsub;
  if (tail) {
    tail.next = unsub;
  } else {
    sub.head = unsub;
  }

  return unsub;
};

/**
 * Creates a new NotifierPubSub instance.
 *
 * Simple event is a function that accepts a subscriber.
 * The subscriber is a function that will be called when the event is emitted.
 * The subscriber can return the special symbol UNSUBSCRIBE to automatically unsubscribe after invoked.
 *
 * This implementation is optimized and was benchmarked for speed and memory, it uses a linked list internally so that subscription and unsubscription are O(1).
 * The order of emits is preserved, the order of handlers is preserved, the order of unsubscription is preserved.
 *
 * This function tries to not emit the same handler twice in a row, but it is not guaranteed.
 *
 * If another emit happens during an emit, the second emit will be queued and executed after the first emit is finished,
 * this ensures that the order of emits is predictable also in recursive and stacked scenarios.
 *
 * @see NotifierPubSub
 * @see UNSUBSCRIBE
 *
 * This code is based on https://github.com/SalvatorePreviti/malebolge - MIT license
 *
 * @returns A new NotifierPubSub instance.
 */
export const notifierPubSub_new = /* @__PURE__ */ (): NotifierPubSub => {
  const sub = ((handler?: NotifierHandler) => {
    if (handler) {
      // Add to the linked list.
      return _subscribe(sub, handler);
    }

    // Emit the event

    if (_iterSub || _emitLock) {
      return _emitEnqueue(sub);
    }

    _iter = sub.head;
    if (_iter) {
      _iterSub = sub;
      try {
        do {
          const iter: NotifierUnsubNode = _iter;
          const value = iter.value;
          if (!value) {
            // Edge case: a node that is after the current node was deleted inside an handler while iterating.
            // We need to restart from the beginning to ensure all handlers are notified.
            _iter = sub.head;
          } else {
            _iter = iter.next; // Advance the iterator

            // We avoid emitting if the previous handler was the same, a small optimization
            // if the same handler was registered multiple times.
            if (value !== _iterHandler) {
              _iterHandler = value;

              // Invoke the listener.
              if (value(sub) === _UNSUBSCRIBE) {
                iter(); // Remove the node
              }
            }
          }
        } while (_iter);
      } finally {
        _iterSub = null;
        _iter = null;
        _iterHandler = null;
      }
    }

    if (_emitHead) {
      _emitFlush();
    }

    return undefined;
  }) as Notifier;

  sub.head = null;
  sub.tail = null;
  sub[_EMIT_QUEUE_NEXT] = null;

  return sub;
};

/**
 * In case of exception the queue of emits might not be flushed, this function flushes the queue.
 * Normally you don't need to call this function, but if for some reason an exception is thrown and not catched this function can be used to flush the queue.
 */
export const notifierPubSub_flush = (): boolean => {
  if (!_emitHead) {
    return false;
  }
  _emitFlush();
  return true;
};

/**
 * Clears all subscribers from a NotifierPubSub instance.
 *
 * @param sub The NotifierPubSub instance.
 */
export const notifierPubSub_clear = (sub: NotifierSub): void => {
  for (let node = sub.head as NotifierUnsubNode | null, next: NotifierUnsubNode | null; node; node = next) {
    next = node.next;
    if (node === _iter) {
      _iter = null;
      _iterHandler = null;
    }
    node.value = null;
    node.prev = null;
    node.next = null;
  }
  (sub as { head: null }).head = null;
  (sub as { tail: null }).tail = null;
};

/**
 * Returns true if the NotifierPubSub instance is empty.
 * Complexity is O(1).
 *
 * @param sub The NotifierPubSub instance.
 * @returns True if the NotifierPubSub instance is empty.
 */
export const notifierPubSub_isEmpty: (sub: NotifierSub | null | undefined) => boolean = linkedList_isEmpty;

/**
 * Returns the number of subscribers of a NotifierPubSub instance.
 * This function is useful only during tests. To see if a pub sub is empty just check for the head property that is not null
 * Complexity is O(n).
 *
 * @see notifierPubSub_isEmpty
 *
 * @param sub The NotifierPubSub instance.
 * @returns The number of subscribers.
 */
export const notifierPubSub_size: (sub: NotifierSub | null | undefined) => number = linkedList_size;

/**
 * Returns true if the given handler is subscribed.
 * Complexity is O(n).
 *
 * @param sub The NotifierPubSub instance.
 * @param value The handler to check, or, the unsubscribe function to check.
 * @returns True if the given handler is subscribed.
 */
export const notifierPubSub_includes: (sub: NotifierSub | null | undefined, handler: NotifierHandler) => boolean =
  linkedList_includesValue;

/**
 * Returns true if an emit is in progress or is locked.
 * The lock is global and shared between all NotifierPubSub instances.
 *
 * @returns True if an emit is in progress.
 *
 * @see notifierPubSub_lock
 * @see notifierPubSub_batch
 */
export const notifierPubSub_isLocked = (): boolean => _emitLock > 0;

/**
 * Returns true if an emit is in progress.
 * If no sub is passed it returns true if any emit is in progress.
 * @param sub The NotifierPubSub instance to check.
 * @returns True if an emit is in progress.
 */
export const notifierPubSub_isEmitting = (sub?: NotifierSub): boolean => (sub ? _iterSub === sub : !!_iterSub);

/**
 * Batch emits, they will be executed after the returned dispose function is called.
 * Try to limit locking the emit to avoid blocking other events or breaking application logic.
 * It makes sense only for batching multiple emits in a single unit of work and should not be abused.
 *
 * The lock is global and shared between all NotifierPubSub instances.
 *
 * @returns A dispose function that will execute the batched emits.
 */
export const notifierPubSub_lock = (): (() => boolean) => {
  let unlock = () => {
    if (!unlock) {
      return false;
    }
    unlock = null!;
    --_emitLock;
    if (_emitHead) {
      _emitFlush();
    }
    return true;
  };
  ++_emitLock;
  return unlock;
};

/**
 * Batch emits generated during the execution of the given function.
 *
 * The lock is global and shared between all NotifierPubSub instances.
 *
 * @param fn The function to execute.
 * @returns The result of the given function.
 */
export const notifierPubSub_batch = <R = void>(fn: () => R): R => {
  let result: R;
  ++_emitLock;
  try {
    result = fn();
  } finally {
    --_emitLock;
  }
  if (_emitHead) {
    _emitFlush();
  }
  return result;
};
