import { getWeakRef } from "./fns";
import { UNSUBSCRIBE } from "./symbols";

export interface HasChangeEmitter {
  readonly changeEmitter: ChangeEmitter;
}

export type ChangeHandler = () => void | UNSUBSCRIBE | unknown;

export interface ChangeEmitterSubscription {
  /** The function to be invoked when the event is emitted */
  handler: ChangeHandler | null;

  /** The change emitter that contains this node. Is null if the handler was unsubscribed. */
  readonly changeEmitter: ChangeEmitter | null;
}

export interface ChangeEmitterUnsubscribe extends ChangeEmitterSubscription {
  /** Unsubscribe the handler */
  (): void;
}

const PREV = /*@__PURE__*/ Symbol("prev");
const NEXT = /*@__PURE__*/ Symbol("next");
const WEAK_HANDLER = /*@__PURE__*/ Symbol("weak");

interface Node extends ChangeEmitterSubscription {
  /** The change emitter that contains this node */
  changeEmitter: ChangeEmitter | null;

  /** The previous node in the linked list */
  [PREV]: Node | null | undefined;

  /** The next node in the linked list */
  [NEXT]: Node | null;
}

/**
 * Returns true if the given object is a ChangeEmitterSubscription created by ChangeEmitter.subscribe
 * @param obj The object to check
 * @returns true if the given object is a ChangeEmitterSubscription created by ChangeEmitter.subscribe
 */
export const isChangeEmitterSubscription = (obj: unknown): obj is ChangeEmitterSubscription =>
  typeof obj === "object" && obj !== null && NEXT in obj !== undefined;

export type ChangeEmitterSubscriber = {
  (handler: ChangeHandler): ChangeEmitterUnsubscribe;
  <TNode extends Partial<ChangeEmitterSubscription> & object>(
    handler: ChangeHandler,
    node: TNode,
  ): TNode & ChangeEmitterSubscription;
};

/**
 * Returns a weak version of the given handler.
 * The handler will be automatically unsubscribed during an emit() if it is garbage collected.
 * If the handler is already weak, it will be returned as is.
 * @example
 * ```ts
 * const emitter = new ChangeEmitter();
 * const handler = () => console.log('hello');
 * const weakHandler = weakChangeHandler(handler);
 * emitter.subscribe(weakHandler);
 * emitter.emit(); // logs 'hello'
 *
 * handler = null;
 * gc.collect(); // force Garbage Collection ... theoretically ...
 *
 * emitter.emit(); // nothing happens
 * ```
 *
 * @param handlerFn The handler to make weak.
 * @returns A weak version of the given handler. If the handler is already weak, it will be returned as is.
 */
export const weakChangeHandler = (handlerFn: ChangeHandler): ChangeHandler => {
  const weakRef = getWeakRef(handlerFn);
  return ((weakRef as { [WEAK_HANDLER]?: ChangeHandler })[WEAK_HANDLER] ??= _weakChangeHandler.bind(weakRef));
};

function _weakChangeHandler(this: WeakRef<ChangeHandler>): unknown {
  const ref = this.deref();
  return ref ? ref() : UNSUBSCRIBE;
}

/**
 * A simple notification pub-sub mechanism.
 *
 * We use a linked list here to optimize for speed and memory.
 * Subscription and unsubscription are O(1).
 * This implementation was benchmarked against the use of Array and Set (outside of the topic of this project).
 * We use the ubsub function itself as node in the linked list to reduce memory consumption and reduce dereferencing overhead.
 *
 */
export class ChangeEmitter implements HasChangeEmitter {
  #head: Node | null | undefined;
  #tail: Node | null | undefined;
  #emitter: (() => void) | undefined;
  #subscriber: ((handler: ChangeHandler) => ChangeEmitterUnsubscribe) | undefined;
  #emitId = 0;

  /** Gets a number that changes every time if the change event is emitted. */
  public get emitId(): number {
    let result = this.#emitId;
    if (result <= 0) {
      result = 1 - (this.#emitId || 0);
      this.#emitId = result;
    }
    return result;
  }

  /** Returns always `this`. Implementation of HasChangeEmitter. */
  public get changeEmitter(): this {
    return this;
  }

  /**
   * Method: emits the event to all listeners.
   * If an handler returns UNSUBSCRIBE, it will be automatically unsubscribed.
   *
   * @see getEmitter if you need a bound function instead of a method.
   *
   * @example
   * ```ts
   * const emitter = new ChangeEmitter();
   * emitter.emit(); // nothing happens
   * emitter.subscribeNode(() => console.log('hello'));
   * emitter.emit(); // logs 'hello'
   * ```
   */
  public emit(): void {
    const changeId = this.#emitId;
    if (changeId > 0) {
      this.#emitId = -changeId;
    }
    // Loop through the linked list and call all listeners
    let lastHandler: ChangeHandler | null | undefined;
    let node = this.#head;
    while (node) {
      const { changeEmitter, handler, [NEXT]: next } = node;
      if (changeEmitter !== this) {
        // Edge case: a node that is after the current node was deleted inside an handler while iterating.
        // We need to restart from the beginning to ensure all handlers are notified.
        node = this.#head;
        lastHandler = null;
      } else if (handler && lastHandler !== handler) {
        if (handler() === UNSUBSCRIBE) {
          // The handler unsubscribed itself
          this.unsubscribe(node);
        } else {
          // We keep track of the last handler to avoid calling it twice if
          // it is present multiple times in the linked list one after the other.
          lastHandler = handler;
        }
        node = next;
      }
    }
  }

  /**
   * Gets a bound function that calls this.emit().
   * @example
   * ```ts
   * const emitter = new ChangeEmitter();
   * const emit = emitter.emitter;
   * emitter.subscribe(() => console.log('hello'));
   * emit(); // logs 'hello'
   * ```
   */
  public getEmitter(): () => void {
    return (this.#emitter ??= this.emit.bind(this));
  }

  /**
   * Subscribes an handler function to the event.
   * Returns a function that can be used to unsubscribe the handler.
   *
   * If you don't need a function to unsubscribe, you can pass an object or a function as second argument to reuse memory.
   *
   * @param handlerFn The function to be invoked when the event is emitted.
   * @param node An optional object that will be used to store the handler and the changeEmitter, to reuse memory.
   * @returns A function that can be used to unsubscribe the handler.
   *
   * @see weakChangeHandler if you need a weak ref handler.
   *
   * @example
   * ```ts
   * const emitter = new ChangeEmitter();
   * const unsub = emitter.subscribe(() => console.log('hello'));
   * emitter.emit(); // logs 'hello'
   * unsub();
   * emitter.emit(); // nothing happens
   * ```
   *
   * @example
   * ```ts
   * const emitter = new ChangeEmitter();
   * const node = emitter.subscribe(() => console.log('hello'), {});
   * emitter.emit(); // logs 'hello'
   * emitter.unsubscribe(node);
   * emitter.emit(); // nothing happens
   * ```
   *
   * @example
   * ```ts
   * const emitter = new ChangeEmitter();
   * const addConsoleLogger = (changeEmitter: ChangeEmitter) => {
   *   const handler = () => console.log('hello');
   *   return changeEmitter.subscribe(handler, handler);
   * }
   * const node = addConsoleLogger();
   * emitter.emit(); // logs 'hello'
   * emitter.unsubscribe(node);
   * emitter.emit(); // nothing happens
   * ```
   *
   * @see getSubscriber if you need a bound function instead of a method.
   */
  public subscribe(handlerFn: ChangeHandler): ChangeEmitterUnsubscribe;

  public subscribe<TNode extends Partial<ChangeEmitterSubscription> & object>(
    handlerFn: ChangeHandler,
    node: TNode,
  ): TNode & ChangeEmitterSubscription;

  public subscribe(
    handlerFn: ChangeHandler,
    node?: Partial<ChangeEmitterSubscription>,
  ): ChangeEmitterSubscription | ChangeEmitterUnsubscribe;

  public subscribe(
    handlerFn: ChangeHandler,
    node?: Partial<ChangeEmitterSubscription>,
  ): ChangeEmitterSubscription | ChangeEmitterUnsubscribe {
    if (!node) {
      const unsubscribe = (): void => {
        this.unsubscribe(node as ChangeEmitterSubscription);
      };
      node = unsubscribe as ChangeEmitterUnsubscribe;
    } else if (node.changeEmitter) {
      node.changeEmitter.unsubscribe(node as ChangeEmitterSubscription);
    }
    // Add to the linked list.
    node.handler = handlerFn as ChangeHandler | null;
    (node as Node).changeEmitter = this;
    (node as Node)[PREV] = this.#tail;
    (node as Node)[NEXT] = null;
    if (this.#tail) {
      this.#tail[NEXT] = node as Node;
    } else {
      this.#head = node as Node;
    }
    this.#tail = node as Node;
    return node as Node;
  }

  /**
   * Gets a bound function that calls this.subscribe(handler, node).
   * @example
   * ```ts
   * const emitter = new ChangeEmitter();
   * const subscriber = emitter.subscriber;
   * const unsub = subscriber(() => console.log('hello))
   * emitter.emit(); // logs 'hello'
   * unsub();
   * emitter.emit(); // nothing happens
   * ```
   */
  public getSubscriber(): ChangeEmitterSubscriber {
    return (this.#subscriber ??= this.subscribe.bind(this));
  }

  /**
   * Unsubscribes an handler function from the event.
   * @param node The node returned by subscribe.
   * @returns true if the handler was unsubscribed, false if it was already unsubscribed or not the right type.
   * @example
   * ```ts
   * const emitter = new ChangeEmitter();
   * const node = emitter.subscribe(() => console.log('hello'), {});
   * emitter.emit(); // logs 'hello'
   * emitter.unsubscribe(node);
   * emitter.emit(); // nothing happens
   */
  public unsubscribe(node: ChangeEmitterSubscription): boolean {
    const { changeEmitter, [PREV]: prev, [NEXT]: next } = node as Node;
    if (!changeEmitter || next === undefined) {
      return false; // Already unsubscribed or not the right type
    }
    // Remove from the linked list
    (node as Node).handler = null;
    (node as Node).changeEmitter = null;
    if (prev) {
      prev[NEXT] = next;
      (node as Node)[PREV] = null;
    } else {
      this.#head = next;
    }
    if (next) {
      next[PREV] = prev;
      (node as Node)[NEXT] = null;
    } else {
      this.#tail = prev;
    }
    return true;
  }

  /**
   * Finds the node in the linked list that contains the given handler.
   * Complexity is O(n).
   *
   * @param handler The handler to find.
   * @returns The node that contains the given handler, or undefined if not found.
   */
  public findHandler(
    handler: ChangeHandler | ChangeEmitterSubscription | null | undefined,
  ): ChangeEmitterSubscription | undefined {
    if (!handler) {
      return undefined;
    }
    if (NEXT in handler) {
      return (handler as ChangeEmitterSubscription).changeEmitter === this
        ? (handler as ChangeEmitterSubscription)
        : undefined;
    }
    for (let node = this.#head; node; node = node[NEXT]) {
      if (node.handler === handler) {
        return node;
      }
    }
    return undefined;
  }
}
