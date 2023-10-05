// This code is MIT license, see https://github.com/SalvatorePreviti/malebolge

import { fnEquals } from "./fns";
import { notifierPubSub_new } from "./notifier-pub-sub";
import type { NotifierPubSub, NotifierSubFn } from "./notifier-pub-sub";
import { EMPTY_OBJECT } from "./objects";
import { UNSET } from "./symbols";
import type { UnsafeAny } from "./types";

/**
 * An observable value is a function that returns the current value.
 *
 * The function has a property `sub` that is a function that accepts a handler that will be called when the value changes.
 *
 * @see observableValue_new
 * @see lazyObservableValue_new
 * @see derivedObservableValue_new
 * @see getterObservableValue_new
 * @see getterSetterObservableValue_new
 */
export interface ReadonlyObservableValue<T = unknown> {
  /** Gets the current value */
  (): T;

  /** Gets the current value */
  valueOf(): T;

  /**
   * Notification event handler.
   *
   * This property may be overridden by a custom store.
   * This is useful especially in react to implement SSR or during tests.
   */
  readonly sub: NotifierPubSub;

  /**
   * This is an internal property used to attach an observable value to a custom store.
   * This is useful especially in react to implement SSR or during tests.
   *
   * Do not use directly in the application logic.
   *
   */
  readonly _stored?: T | UNSET | undefined;
}

/**
 * An observable value is a function that returns the current value.
 *
 * The function has a property `sub` that is a function that accepts a handler that will be called when the value changes.
 *
 * The function has a property `set` that accepts a value.
 * If the value was changed, all subscribers will be notified.
 * If the value was not changed, no subscribers will be notified.
 *
 * By default this function uses reference equality to determine if the value was changed (===).
 * If the value is an object, it is recommended to use the spread operator to create a new object.
 * This will ensure that the value is changed and subscribers are notified.
 *
 * @see observableValue_new
 * @see lazyObservableValue_new
 * @see getterSetterObservableValue_new
 */
export interface ObservableValue<T = unknown, TSet extends T = T> extends ReadonlyObservableValue<T> {
  /**
   * Set the current value of the state.
   * If the value was changed, all subscribers will be notified.
   * If the value was not changed, no subscribers will be notified.
   * This function uses reference equality to determine if the value was changed (===).
   * If the value is an object, it is recommended to use the spread operator to create a new object.
   * This will ensure that the value is changed and subscribers are notified.
   *
   * @see observableValue_new
   * @see sub
   * @see ObservableValue
   *
   * @param value The new value.
   */
  set: (value: TSet | UNSET) => void;
}

/**
 * A derived observable value is a value that is derived from other observable values or when a dependency changes.
 *
 * The function has a property `sub` that is a function that accepts a handler that will be called when the value changes.
 * The function has a property `update` that forces a recomputation of the derived value.
 *
 * @see derivedObservableValue_new
 */
export interface DerivedObservableValue<T = unknown> extends ReadonlyObservableValue<T> {
  /**
   * Forces an update of the derived value
   *
   * @returns The new value
   */
  update(): T;
}

function valueOf<T>(this: () => T): T {
  return this();
}

function toString<T>(this: () => T): string {
  return String(this());
}

/**
 * Options to create an observable value.
 */
export interface ObservableValueOptions<T = unknown> {
  /**
   * The function to compare the old value with the new value.
   * Used to determine if the value was changed.
   *
   * @param a The old value
   * @param b The new value
   */
  equals?: ((a: T, b: T) => boolean) | undefined;

  /**
   * The event handler to use when the value changes
   * Is useful to use the same handler for multiple observable values or to use a custom event handler.
   */
  sub?: NotifierPubSub | undefined;
}

/**
 * Creates a new ObservableValue instance.
 *
 * An observable value is a function that returns the current value.
 * The function has a property `set` that accepts a value.
 * The function has a property `sub` that is a function that accepts a handler.
 * The handler will be called when the value changes.
 *
 * @param initial The initial value of the observable value.
 * @param options The options to create the observable value.
 *
 * @see ObservableValue
 * @returns A new ObservableValue instance.
 */
export const observableValue_new = /*@__PURE__*/ <T>(
  initial: T,
  { equals = fnEquals, sub = notifierPubSub_new() }: ObservableValueOptions<T> = EMPTY_OBJECT,
): ObservableValue<T> => {
  const get = (): T => {
    const current = get._stored;
    if (current === UNSET) {
      get._stored = initial;
      return initial;
    }
    return current;
  };

  const set = (value: T | UNSET): void => {
    const current = get._stored;
    if (current === UNSET) {
      get._stored = value;
    } else {
      if (value === UNSET) {
        value = initial;
      }
      if (!equals(current, value)) {
        get._stored = value;
        sub();
      }
    }
  };

  get.sub = sub;
  get.toJSON = valueOf;
  get.valueOf = valueOf;
  get.toString = toString;
  get.set = set;
  get._stored = initial as T | UNSET;

  return get;
};

export const lazyObservableValue_new = /*@__PURE__*/ <T>(
  /**
   * The function to initialize the observable value.
   *
   * @param observableValue The observable value that is being initialized.
   * @param counter The number of times the observable value was initialized.
   * Useful for testing, to create a unique value, or to initialize some system resources only once (if count === 0)
   *
   * @returns The initial value of the observable value.
   */
  initializer: (observableValue: ReadonlyObservableValue<T>, counter: number) => T,
  { equals = fnEquals, sub = notifierPubSub_new() }: ObservableValueOptions<T> = EMPTY_OBJECT,
): ObservableValue<T> => {
  const get = (): T => {
    let current = get._stored;
    if (current === UNSET) {
      if (initializer === get) {
        return (current === UNSET ? undefined : current) as T;
      }
      const init = initializer;
      initializer = get;
      try {
        current = init(get as unknown as ReadonlyObservableValue<T>, get.count++);
      } finally {
        initializer = init;
      }
      get._stored = current;
    }
    return current;
  };

  const set = (value: T | UNSET): void => {
    const current = get._stored;
    if (current === UNSET) {
      get._stored = value;
    } else {
      if (value === UNSET) {
        const init = initializer;
        initializer = get;
        try {
          value = init(get as unknown as ReadonlyObservableValue<T>, get.count++);
        } finally {
          initializer = init;
        }
      }
      if (!equals(current, value)) {
        get._stored = value;
        sub();
      }
    }
  };

  get.sub = sub;
  get.toJSON = valueOf;
  get.valueOf = valueOf;
  get.toString = toString;
  get.set = set;
  get.count = 0;
  get._stored = UNSET as T | UNSET;

  return get;
};

export const derivedObservableValue_new = <T>(
  /**
   * The function to derive the value.
   *
   * @param oldValue The previous value of the observable value.
   * @param observableValue The observable value that is being derived.
   * @returns The derived value of the observable value.
   */
  derive: (this: ReadonlyObservableValue<T>, oldValue: T | undefined, observableValue: DerivedObservableValue<T>) => T,
  dependencies:
    | Iterable<(NotifierSubFn | { readonly sub: NotifierSubFn }) | false | null | undefined>
    | false
    | null
    | undefined,
  { equals = fnEquals, sub = notifierPubSub_new() }: ObservableValueOptions<T> = EMPTY_OBJECT,
): DerivedObservableValue<T> => {
  const get = (): T => {
    let stored = get._stored;
    if (stored === UNSET) {
      stored = get._getter(undefined, get);
      get._stored = stored;
    }
    return stored;
  };

  const update = (): T => {
    const current = get._stored;
    if (current === UNSET) {
      const value = get._getter(undefined, get);
      get._stored = value;
      return value;
    }
    const value = get._getter(current, get);
    if (!equals(current, value)) {
      get._stored = value;
      sub();
    }
    return value;
  };

  get.sub = sub;
  get.toJSON = valueOf;
  get.valueOf = valueOf;
  get.toString = toString;
  get._stored = UNSET as T | UNSET;
  get._getter = derive;
  get.update = update;

  if (dependencies) {
    for (const dependency of dependencies) {
      if (dependency) {
        if ("sub" in dependency) {
          dependency.sub(update);
        } else {
          dependency(update);
        }
      }
    }
  }

  return get;
};

export const getterObservableValue_new = /*@__PURE__*/ <T>(
  getter: (this: ReadonlyObservableValue<T>, oldValue: T | undefined, observableValue: ReadonlyObservableValue<T>) => T,
  { equals = fnEquals, sub = notifierPubSub_new() }: ObservableValueOptions<T> = EMPTY_OBJECT,
): ReadonlyObservableValue<T> => {
  const get = (): T => {
    const stored = get._stored;
    let value: T;
    if (stored === UNSET) {
      value = get._getter(undefined, get);
      get._stored = value;
    } else {
      value = get._getter(stored, get);
      if (!equals(stored, value)) {
        get._stored = value;
        sub();
      }
    }
    return value;
  };

  get.sub = sub;
  get.toJSON = valueOf;
  get.valueOf = valueOf;
  get.toString = toString;
  get._stored = UNSET as T | UNSET;
  get._getter = getter;

  return get;
};

export const getterSetterObservableValue_new = /*@__PURE__*/ <T, TSet extends T = T>(
  getter: (
    this: ObservableValue<T>,
    oldValue: T | undefined,
    observableValue: ObservableValue<T>,
    counter: number,
  ) => T,
  setter: (this: ObservableValue<T>, value: TSet) => void,
  options: ObservableValueOptions = EMPTY_OBJECT,
): ObservableValue<T, TSet> => {
  const get = getterObservableValue_new<T>(getter as UnsafeAny, options) as ReadonlyObservableValue<T> & {
    set: (value: TSet) => void;
    _setter: (value: TSet) => void;
  };

  const set = (value: TSet): void => {
    get._setter(value);
    get();
  };

  get.set = set;
  get._setter = setter;

  return get as ObservableValue<T, TSet>;
};
