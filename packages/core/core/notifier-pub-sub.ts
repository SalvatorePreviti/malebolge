// This code is MIT license, see https://github.com/SalvatorePreviti/malebolge

import { fnUndefined } from "./fns";
import { UNSUBSCRIBE } from "./symbols";

/** The type of a function that can be used as subscriber in a NotifierPubSub instance. */
export type NotifierHandler = (sender?: NotifierPubSub) => void | UNSUBSCRIBE | unknown;

/** The type of the publish function for a NotifierPubSub */
export type NotifierPubFn = () => void;

/**
 * The type of the unsubscribe function returned by NotifierSubFn
 * @returns True if the handler was unsubscribed, false if it was already unsubscribed.
 */
export type NotifierUnsubFn = () => boolean;

/** The type of the subscribe function for a NotifierPubSub */
export type NotifierSubFn = (handler: NotifierHandler) => NotifierUnsubFn;

export type NotifierPubSubFn = NotifierPubFn & NotifierSubFn;

export interface NotifierUnsubNode extends NotifierUnsubFn {
  /** The function to be invoked when the event is emitted. Is null if the handler was unsubscribed. */
  readonly value: NotifierHandler | null;

  /** The previous node in the linked list */
  readonly prev: this | null;

  /** The next node in the linked list */
  readonly next: this | null;
}

export interface NotifierPubSub extends NotifierPubSubFn {
  /**
   * Register a subscriber
   * @param handler The handler to be invoked when the event is emitted.
   * @returns A function to unsubscribe the handler.
   */
  (handler: NotifierHandler): NotifierUnsubNode;

  /** Emit the notification to all subscribers */
  (): void;

  /** The first subscriber in the linked list, or null if empty. */
  readonly head: NotifierUnsubNode | null;

  /** The last subscriber in the linked list, or null if empty. */
  readonly tail: NotifierUnsubNode | null;

  /** The number of subscribers. */
  readonly size: number;

  /**
   * Emit the event to all subscribers.
   * This method is used internally by NotifierPubSub instances, and is exposed for extensibility.
   * Should not be called directly in a NotifierPubSub, you should just call notifier();
   */
  _pub(this: this): void;

  /**
   * Subscribe the given handler, creating a new node and inserting it in the linked list.
   * This method is used internally by NotifierPubSub instances, and is exposed for extensibility.
   * Should not be called directly in a NotifierPubSub
   */
  _sub(this: this, handler: NotifierHandler): NotifierUnsubNode;

  /**
   * Unsubscribes the given node.
   * This method is used internally by NotifierPubSub instances, and is exposed for extensibility.
   * Should not be called directly in a NotifierPubSub
   */
  _unsub(this: this, node: NotifierUnsubNode): boolean;
}

interface NotifierUnsubWritableNode extends NotifierUnsubNode {
  /** The function to be invoked when the event is emitted. Is null if the handler was unsubscribed. */
  value: NotifierHandler | null;

  /** The previous node in the linked list */
  prev: this | null;

  /** The next node in the linked list */
  next: this | null;
}

interface NotifierPubSubWritable extends NotifierPubSub {
  /** The first NotifierPubSub instance in the linked list, or null if empty */
  head: NotifierUnsubWritableNode | null;

  /** The last NotifierPubSub instance in the linked list, or null if empty */
  tail: NotifierUnsubWritableNode | null;

  size: number;
}

const _UNSUBSCRIBE = UNSUBSCRIBE;
const _EMIT_NEXT = Symbol("emitNext");
const _EMITTER = Symbol("emitter");

interface PubQueueNode extends NotifierPubSubWritable {
  [_EMIT_NEXT]?: PubQueueNode | false | null;
  _pub(): void;
}

/** The current notifier being iterated during a publish */
let _pubList: NotifierPubSub | null = null;

/** The current node being iterated during a publish */
let _pubIter: NotifierUnsubNode | null = null;

/** The previous handler being iterated during a publish */
let _pubValue: NotifierHandler | null | undefined;

/** The head of the publisher enqueued for later processing */
let _pubHead: PubQueueNode | null = null;

/** The tail of the publisher enqueued for later processing */
let _pubTail: PubQueueNode | null = null;

/** True while flushing the pub queue */
let _pubFlush = false;

/** A counter that keep track if publish is temporarily delayed until unlocked */
let _pubLock = 0;

/** Flushes tue pub queue */
const flush = (): void => {
  if (_pubFlush) {
    return; // Another flushing already in progress
  }
  _pubFlush = true;
  try {
    for (;;) {
      const node = _pubHead;
      if (!node || _pubLock) {
        break; // Iteration terminated or emit is locked
      }
      const next = node[_EMIT_NEXT];
      node[_EMIT_NEXT] = null;
      if (!next) {
        _pubTail = null;
        _pubHead = null;
      } else {
        _pubHead = next;
      }
      node._pub();
    }
  } finally {
    _pubFlush = false;
  }
};

/** Enqueues the given subscriber for later processing */
const enqueue = (sub: PubQueueNode) => {
  if (_pubList === sub) {
    // We are already emitting this subscriber, we need to reset the iteration to the beginning.
    _pubValue = null;
    _pubIter = sub.head;
  } else if (sub.head) {
    // Another emit is in progress and this subscriber is not empty, we need to enqueue this emit.
    const next = sub[_EMIT_NEXT];
    if (!next && next !== false) {
      sub[_EMIT_NEXT] = false;
      if (_pubTail) {
        _pubTail[_EMIT_NEXT] = sub;
      } else {
        _pubHead = sub;
      }
      _pubTail = sub;
    }
  }
};

/** Publishes the event to all subscribers */
function publish<TSelf extends NotifierPubSub>(this: TSelf) {
  if (_pubList || _pubLock) {
    /*@__NOINLINE__*/ enqueue(this);
  } else {
    _pubIter = this.head;
    if (_pubIter) {
      _pubList = this;
      try {
        do {
          const iter: NotifierUnsubNode = _pubIter;
          const value = iter.value;
          if (!value) {
            // Edge case: a node that is after the current node was deleted inside an handler while iterating.
            // We need to restart from the beginning to ensure all handlers are notified.
            _pubIter = this.head;
          } else {
            _pubIter = iter.next; // Advance the iterator

            // We avoid emitting if the previous handler was the same, a small optimization
            // if the same handler was registered multiple times one after the other.
            if (value !== _pubValue) {
              _pubValue = value;

              // Invoke the listener.
              if (value(this) === _UNSUBSCRIBE) {
                iter(); // Remove the node
              }
            }
          }
        } while (_pubIter);
      } finally {
        _pubList = null;
        _pubIter = null;
        _pubValue = null;
      }
    }

    if (_pubHead) {
      /*@__NOINLINE__*/ flush();
    }
  }

  return undefined;
}

/** Unsubscribes the given node */
function unsubscribe<TSelf extends NotifierPubSubWritable>(this: TSelf, node: NotifierUnsubWritableNode): boolean {
  const { value, prev, next } = node;
  if (!value) {
    return false; // Already unsubscribed
  }

  // Remove from the linked list
  if (prev) {
    prev.next = next;
  } else {
    this.head = next;
  }
  if (next) {
    next.prev = prev;
  } else {
    this.tail = prev;
  }
  node.prev = null;
  node.next = null;
  node.value = null;
  --this.size;
  return true;
}

/** Subscribes the given handler, creating a new node and inserting it in the linked list */
function subscribe<TSelf extends NotifierPubSubWritable>(this: TSelf, handler: NotifierHandler): NotifierUnsubNode {
  const unsub = (): boolean => this._unsub(unsub);

  const tail = this.tail;

  unsub.prev = tail;
  unsub.next = null as typeof unsub.prev;
  unsub.value = handler as NotifierHandler | null;

  this.tail = unsub;
  if (tail) {
    tail.next = unsub;
  } else {
    this.head = unsub;
  }
  ++this.size;

  return unsub;
}

/**
 * Creates a new NotifierPubSub instance.
 * @returns A new NotifierPubSub instance.
 *
 * @example
 *
 * const notifier = notifierPubSub_new();
 *
 * const unsubscribe = notifier(()=>{
 *  console.log("Hello world!");
 * });
 *
 * notifier(); // Prints "Hello world!"
 *
 * unsubscribe();
 *
 * notifier(); // Nothing happens
 */
export const notifierPubSub_new = (): NotifierPubSub => {
  const notifier = (handler?: NotifierHandler) => (handler ? notifier._sub(handler) : notifier._pub());
  notifier.head = null;
  notifier.tail = null;
  notifier.size = 0;
  notifier._pub = publish;
  notifier._sub = subscribe;
  notifier._unsub = unsubscribe;
  return notifier as NotifierPubSub;
};

/**
 * Gets a ()=>void function that invokes an emit on the given NotifierPubSub instance.
 * This is needed sometimes when you need an emit that does not have any parameter.
 * We do not create an additional emit() property to reduce the memory footprint.
 *
 * The function is cached.
 *
 * @param notifier The NotifierPubSub instance. If null or undefined or false, returns a function that does nothing.
 * @returns A function that invokes an emit on the given NotifierPubSub instance.
 * If notifier is null or undefined or false, returns a function that does nothing.
 */
export const notifierPubSub_emitter = (notifier: NotifierPubSubFn | null | undefined | false): (() => void) =>
  (notifier as { [_EMITTER]?: () => void })?.[_EMITTER] ||
  (notifier ? ((notifier as { [_EMITTER]?: () => void })[_EMITTER] = () => notifier()) : fnUndefined);

/**
 * Removes all subscribers from a NotifierPubSub instance.
 * @param notifier
 * @returns
 */
export const notifierPubSub_clear = (notifier: NotifierPubSub | null | undefined): boolean => {
  for (let node = notifier?.head, next; node; node = next) {
    next = node.next;
    node();
  }
  return true;
};

/**
 * Returns an iterator that iterates over all nodes of a NotifierPubSub instance.
 * @param self The NotifierPubSub instance.
 */
export function* notifierPubSub_iterate(self: NotifierPubSub | null | undefined): IterableIterator<NotifierUnsubNode> {
  for (let node = self?.head, next; node; node = next) {
    next = node.next;
    yield node;
  }
}

/**
 * Checks if the given handler is subscribed.
 * Complexity is O(n).
 *
 * @param notifier The NotifierPubSub instance.
 * @param handler The handler to check, or, the unsubscribe function to check.
 * @returns
 */
export const notifierPubSub_includes = (
  notifier: NotifierPubSub | null | undefined,
  handler: NotifierHandler | NotifierUnsubFn,
): boolean => {
  for (let node = notifier?.head; node; node = node.next) {
    if (node === handler || node.value === handler) {
      return true;
    }
  }
  return false;
};

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
    --_pubLock;
    if (_pubHead) {
      /*@__NOINLINE__*/ flush();
    }
    return true;
  };
  ++_pubLock;
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
  ++_pubLock;
  try {
    result = fn();
  } finally {
    --_pubLock;
  }
  if (_pubHead) {
    /*@__NOINLINE__*/ flush();
  }
  return result;
};

/**
 * Returns true if an emit is in progress.
 * If no sub is passed it returns true if any emit is in progress.
 * @param sub The NotifierPubSub instance to check.
 * @returns True if an emit is in progress.
 */
export const notifierPubSub_isEmitting = (sub?: NotifierPubSub): boolean =>
  !!_pubList && (sub === undefined || _pubList === sub);

/**
 * Returns true if an emit is in progress or is locked.
 * The lock is global and shared between all NotifierPubSub instances.
 *
 * @returns True if an emit is in progress.
 *
 * @see notifierPubSub_lock
 * @see notifierPubSub_batch
 */
export const notifierPubSub_isLocked = (): boolean => _pubLock !== 0;
