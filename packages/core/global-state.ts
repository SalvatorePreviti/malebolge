import type { SimpleEventSubscribable } from "../core/simple-event";
import { newSimpleEvent, UNSUBSCRIBE } from "../core/simple-event";

export type ReadonlyGlobalStateHandlerFn<T = unknown> = (globalState: ReadonlyGlobalState<T>) => void;

export type GlobalStateHandlerFn<T> = (globalState: GlobalState<T>) => void;

export type GlobalStateUnsubFn = () => void;

/**
 * A global state that can be used to share data between components.
 * @typeParam T The type of the state.
 * @example
 * ```ts
 * const myGlobalState = newGlobalState({ count: 0, x: 0, y: 0 });
 *
 * const App = () => {
 *  const [value, setValue] = useGlobalState(myGlobalState);
 *  return <div>Count: {value.count}<button onClick={() => setValue({ ...value, count: value.count + 1 })}></button></div>;
 * };
 *
 * ```
 *
 * Since the state is global, you can also get and update its value from outside a component:
 *
 * ```ts
 * myGlobalState.set({ ...myGlobalState.value, count: myGlobalState.value.count + 1 });
 * ```
 *
 * On the server, and during tests, the globalState is bound to the current AsyncCtx, so multiple requests can have different values for the same global state.
 *
 */
export interface GlobalState<T> extends ReadonlyGlobalState<T> {
  /**
   * Is true if this is the first time the initializer function has been called.
   * Useful to execute code only once when the state is initialized for the first time.
   */
  initial: boolean;

  /**
   * The current value of the state.
   * Is a property that invokes get() or set() internally.
   * If you want to use this inside a react component, is advisable to instead use or call first useGlobalState() hook.
   * If not, the component will not be re-rendered when the state changes.
   *
   * @see get
   * @see set
   */
  value: T;

  /**
   * Get the current value of the state.
   * If you want to use this inside a react component, is advisable to instead use or call first useGlobalState() hook.
   * If not, the component will not be re-rendered when the state changes.
   */
  get: () => T;

  /**
   * Set the current value of the state.
   * If the value was changed, all subscribers will be notified.
   * If the value was not changed, no subscribers will be notified.
   * This function uses reference equality to determine if the value was changed (===).
   * This is useful for avoiding unnecessary re-renders.
   * If the value is an object, it is recommended to use the spread operator to create a new object.
   * This will ensure that the value is changed and subscribers are notified.
   *
   * @see sub
   *
   * @param value The new value of the state.
   * @example
   * ```ts
   * const state = newGlobalState({ count: 0, x: 0, y: 0 });
   * const increment = () => state.set({ ...state.value, count: state.value.count + 1 });
   * ```
   */
  set: (value: T) => void;

  /**
   * Reset the state to the initial value.
   *
   * @example ```ts
   *
   * const state = newGlobalState(() => 10);
   *
   * state.set(20);
   *
   * console.log(state.value); // 20
   *
   * state.reset();
   *
   * console.log(state.value); // 10
   * ```
   */
  reset: () => void;

  /**
   * Subscribe to changes in the state.
   * @param handler A function that will be called when the state changes.
   * @returns A function that can be called to unsubscribe the handler.
   *
   * @example
   * ```ts
   * const state = newGlobalState({ count: 0, x: 0, y: 0 });
   * const unsub = state.sub((value) => console.log(value));
   * state.set({ ...state.value, count: state.value.count + 1 });
   * unsub();
   * ```
   */
  sub: (handler: GlobalStateHandlerFn<T>) => GlobalStateUnsubFn;
}

export interface ReadonlyGlobalState<T> {
  readonly value: T;
  get: () => T;
  sub: (handler: ReadonlyGlobalStateHandlerFn<T>) => GlobalStateUnsubFn;
}

/**
 * A store that can be used to store global state.
 * A global state store is required to allow storing state in a server environment or during tests.
 * By default, a static store is used that stores the state in the state object itself as an hidden property.
 *
 * @see newGlobalState
 */
export interface GlobalStateStore {
  getValue<T = unknown>(state: ReadonlyGlobalState<T>): T | UNSET;
  setValue<T = unknown>(state: ReadonlyGlobalState<T>, value: T | UNSET): void;
}

const K: unique symbol = Symbol("K");

/** Indicates an unset value in a globnal state store */
export const UNSET: unique symbol = Symbol("UNSET");

/** Indicates an unset value in a globnal state store */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type UNSET = typeof UNSET;

interface InlineStore<T> extends GlobalState<T> {
  [K]: T | UNSET;
}

/**
 * Creates a new GlobalState instance.
 *
 * @see GlobalState
 *
 * @param initial The initial value of the state. If is a function, it will be called with the state as argument the first time the state is accessed.
 * @param dependencies An optional list of GlobalState instances that will force the initial function to be called again when they change.
 *
 * @returns A new GlobalState instance.
 */
export const newGlobalState: {
  <T>(
    initial: (state: GlobalState<T>) => T,
    dependencies?: readonly SimpleEventSubscribable<unknown>[] | null | undefined,
  ): GlobalState<T>;

  <T>(initial: T): GlobalState<T>;

  /**
   * Overridable and mockable method to get the global state store.
   *
   * This will return a store inside an AgnosticCtx, or AsyncCtx in the backend to have an isolated store.
   * In frontend, by default this will return the static store.
   * This can be overridden during tests to return a different store.
   */
  getStore(globalState: ReadonlyGlobalState<unknown>): GlobalStateStore;
} = /* @__PURE__ */ <T>(
  initial: T extends Function ? (state: GlobalState<T>) => T : ((state: GlobalState<T>) => T) | T,
  dependencies?: readonly SimpleEventSubscribable<unknown>[] | null | undefined,
) => {
  const { sub, emit } = newSimpleEvent<GlobalState<T>>();

  let instance: GlobalState<T>;

  const get = (): T => {
    const store = newGlobalState.getStore(instance);
    let value = store.getValue<T>(instance);
    if (value === UNSET) {
      value = typeof initial === "function" ? initial(instance) : initial;
      instance.initial = false;
      store.setValue<T>(instance, value);
    }
    return value as T;
  };

  const set = (value: T): void => {
    const store = newGlobalState.getStore(instance);
    const oldValue = store.getValue<T>(instance);
    if (oldValue !== value) {
      store.setValue<T>(instance, value);
      if (oldValue !== UNSET) {
        emit(instance);
      }
    }
  };

  const reset = (): void => {
    const store = newGlobalState.getStore(instance);
    const oldValue = store.getValue<T>(instance);
    if (oldValue !== UNSET) {
      const value = typeof initial === "function" ? initial(instance) : initial;
      instance.initial = false;
      set(value);
    }
  };

  instance = { [K]: UNSET, initial: true, get, set, reset, sub } satisfies Omit<
    InlineStore<T>,
    "value"
  > as unknown as GlobalState<T>;

  Reflect.defineProperty(instance, "value", { get, set });

  if (dependencies) {
    // Use a weak reference to avoid memory leaks
    const weakref = new WeakRef(instance);
    const update = () => {
      const self = weakref.deref();
      return self ? self.reset() : UNSUBSCRIBE;
    };
    for (const dependency of dependencies) {
      dependency.sub(update);
    }
  }

  return instance;
};

/**
 * The default global static store used in the frontend.
 *
 * A store that can be used to store global state.
 * A global state store is required to allow storing state in a server environment or during tests.
 * By default, a static store is used that stores the state in the state object itself as an hidden property.
 *
 * The store can be overridden by replacing the getStore function
 */
export const globalStaticStore: GlobalStateStore = {
  getValue<T>(state: GlobalState<T>) {
    return (state as InlineStore<T>)[K];
  },

  setValue<T>(state: GlobalState<T>, value: T | UNSET): void {
    (state as InlineStore<T>)[K] = value;
  },
};

newGlobalState.getStore = /* @__PURE__ */ (): GlobalStateStore => globalStaticStore;

/**
 * A basic implementation of GlobalStateStore that uses a weak map.
 * Useful in the backend (for server side rendering) or during tests to isolate the state.
 * @see AgnosticCtx.globalStateStore
 */
export class LocalGlobalStateStore implements GlobalStateStore {
  readonly #map: WeakMap<ReadonlyGlobalState<unknown>, unknown>;
  public readonly parent: GlobalStateStore | null;

  constructor(parent: GlobalStateStore | null = null) {
    this.#map = new WeakMap();
    this.parent = parent;
  }

  public getValue<T>(state: ReadonlyGlobalState<T>): T | UNSET {
    const map = this.#map;
    if (map.has(state)) {
      return map.get(state) as T;
    }
    const parent = this.parent;
    return parent ? parent.getValue(state) : UNSET;
  }

  public setValue<T>(state: ReadonlyGlobalState<T>, value: T | UNSET): void {
    this.#map.set(state, value);
  }
}
