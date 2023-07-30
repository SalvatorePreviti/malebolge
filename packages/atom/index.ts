// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnsafeAny = any;

/** The type of a function that is called when the atom's value changes */
export type AtomListenerFn = () => void;

/** The type of a function that subscribes a listener to an atom */
export type AtomSubscribeFn = (listener: AtomListenerFn) => AtomUnsubsribeFn;

/** The type of a function that unsubscribes a listener from an atom */
export type AtomUnsubsribeFn = () => boolean;

/** The type of a function that initializes the atom's value */
export type AtomGetterFn<T> = () => T;

export interface AtomSubscribeable {
  sub: AtomSubscribeFn;
}

export interface ReadonlyAtomValue<T> {
  /** The current value of the atom */
  get value(): T;
}

/** The type of an object that can be subscribed to and has a value */
export interface ReadonlyAtom<T> extends AtomSubscribeable, ReadonlyAtomValue<T> {
  /** An unique version number, that changes every time the value of this atom changes */
  readonly v: number;

  /** True if the atom was disposed */
  readonly isDisposed?: boolean;

  readonly get: AtomGetterFn<T>;

  /** Adds a listener to the atom */
  readonly sub: AtomSubscribeFn;
}

export interface Atom<T> extends ReadonlyAtom<T> {
  /** True if the atom was disposed */
  readonly isDisposed: boolean;

  /** The current value of the atom */
  get value(): T;

  /** The current value of the atom */
  set value(value: T);

  /** The current value of the atom */
  readonly set: (newState: T) => boolean;

  readonly reset: () => boolean;

  readonly dispose: () => boolean;

  /** The serializer/deserializer associated to this atom. By default is JSON */
  serializer: AtomSerializer<T>;
}

export type AtomDependenciesOptions =
  | readonly (AtomSubscribeFn | AtomSubscribeable | null | undefined | false | 0 | "")[]
  | null
  | undefined
  | false;

export type AtomInitializer<TAtom> = (atom: TAtom) => AtomDisposer<TAtom> | void | null | undefined;

export type AtomDisposer<TAtom> = (atom: TAtom) => void;

export interface AtomOptions<T = UnsafeAny, TAtom = Atom<T>> {
  /**
   * If passed and not empty, the atom will call the atom.set(compute()) function every time one of the dependencies changes.
   * Used to created derived atoms.
   */
  dependencies?: AtomDependenciesOptions;

  /**
   * Function called upon initialization, the first time the value of the atom is read.
   * Can optionally return a destructor function that is invoked on dispose()
   */
  init?: AtomInitializer<TAtom> | null | undefined;

  /** Called before setting a value */
  adjust?: ((value: T, atom: TAtom) => T) | null | undefined | false;

  /** The serializer/deserializer associated to this atom. By default is JSON */
  serializer?: AtomSerializer<T> | undefined;
}

let _v = 0;
let _atomInLocalStoragePending: Set<() => void> | undefined;
let _atomInLocalStorageThrottle: ReturnType<typeof setTimeout> | undefined | null;
const _noAdjust = <T>(value: T) => value;
const _notInitialized = Symbol("_");

const _flushAtomLocalStorage = () => {
  if (_atomInLocalStorageThrottle) {
    clearTimeout(_atomInLocalStorageThrottle);
    _atomInLocalStorageThrottle = null;
  }
  if (_atomInLocalStoragePending) {
    for (const store of _atomInLocalStoragePending) {
      store();
    }
    _atomInLocalStoragePending.clear();
  }
};

export type ValueOfAtom<TAtom extends ReadonlyAtomValue<UnsafeAny>> = TAtom extends ReadonlyAtomValue<infer T>
  ? T
  : unknown;

/**
 * An atom is a simple object that has a value and a list of listeners.
 * When the value is changed, all listeners are notified.
 *
 * @example
 * const myAtom0 = atom(0);
 * const myAtom1 = atom(atomInitializer(() => { console.log('atom initialized'); return 0; }));
 *
 * const unsub0 = myAtom0.sub(() => console.log('myAtom0 changed'));
 * const unsub1 = myAtom1.sub(() => console.log('myAtom1 changed'));
 *
 * console.log(myAtom0.get()); // expects 0
 * console.log(myAtom1.get()); // expects 'atom initialized' and 0
 *
 * myAtom0.set(1); // expects 'myAtom0 changed'
 * myAtom1.set(1); // expects 'myAtom1 changed'
 *
 * unsub0();
 * unsub1();
 *
 * myAtom0.set(2); // expects nothing
 * myAtom1.set(2); // expects nothing
 *
 * console.log(myAtom0.get()); // expects 2
 * console.log(myAtom1.get()); // expects 2
 *
 * // This is useful especially for testing
 * myAtom0.reset();
 *
 */
export const atom = <T>(compute: (atom: Atom<T>) => T, options?: Readonly<AtomOptions<T>>): Atom<T> => {
  let state: T | typeof _notInitialized = _notInitialized;
  let self: Atom<T>;

  let init: AtomInitializer<Atom<T>> | null | undefined;
  let initDisposer: AtomDisposer<Atom<T>> | null | undefined;
  let adjust: (value: T, atom: Atom<T>) => T = _noAdjust;
  let unsubscribes: AtomUnsubsribeFn[] | undefined;

  // This implementation uses a doubly linked list for performance and memory efficiency
  // sub and unsub are O(1) and performs better than using an array from the benchmarks.
  // pub is O(n) obviously, but the performance of it is comparable to the array implementation (for 100000 subscribers, the difference is negligible).

  interface PubSubNode extends AtomUnsubsribeFn {
    f?: AtomListenerFn | null;
    p?: PubSubNode | null | undefined;
    n?: PubSubNode | null | undefined;
  }

  let head: PubSubNode | null | undefined;
  let tail: PubSubNode | null | undefined;

  let dispose: (() => boolean) | null = (): boolean => {
    if (!dispose) {
      return false;
    }

    dispose = null;
    (self as { isDisposed: boolean }).isDisposed = true;

    try {
      // Remove all subscriptions
      if (head) {
        let node: PubSubNode | null | undefined = head;
        if (node) {
          head = null;
          tail = null;
          do {
            const next: PubSubNode | null | undefined = node.n;
            node.f = null;
            node.p = null;
            node.n = null;
            node = next;
          } while (node);
        }
      }

      // Remove from all dependencies
      if (unsubscribes) {
        const array = unsubscribes;
        unsubscribes = undefined;
        for (let i = 0; i < array.length; ++i) {
          array[i]!();
        }
      }
    } finally {
      _flushAtomLocalStorage();
      const _disposer = initDisposer;
      if (_disposer) {
        initDisposer = null;
        _disposer(self);
      }
    }

    return true;
  };

  const sub: AtomSubscribeFn = (listener: AtomListenerFn | null | undefined | false): AtomUnsubsribeFn => {
    if (!listener || !dispose) {
      return () => false;
    }

    const unsub: PubSubNode = (): boolean => {
      const { f, p, n } = unsub;
      if (!f) {
        return false;
      }

      // Remove from the linked list

      unsub.f = null;

      if (p) {
        p.n = n;
        unsub.p = null;
      } else {
        head = n;
      }

      if (n) {
        n.p = p;
        unsub.n = null;
      } else {
        tail = p;
      }

      return true;
    };

    // Add to the linked list

    unsub.f = listener;
    unsub.p = tail;
    unsub.n = null;

    if (tail) {
      tail.n = unsub;
    } else {
      head = unsub;
    }
    tail = unsub;

    return unsub;
  };

  let doInit: (() => void) | null = () => {
    doInit = null;
    const _init = init;
    if (_init) {
      init = null;
      initDisposer = _init(self) || null;
    }
  };

  const set = (value: T): boolean => {
    value = adjust(value, self);
    if (state === value) {
      return false;
    }
    state = value;
    (self as { v: number }).v = ++_v;

    if (doInit) {
      doInit();
    }

    // Loop through the linked list and call all listeners
    let node = head;
    while (node) {
      const { f, n } = node;
      if (f) {
        node = n;
        f();
      } else {
        // List was modified while iterating, so we need to restart from the beginning
        node = head;
      }
    }

    return true;
  };

  const get = (): T => {
    if (state === _notInitialized) {
      if (doInit) {
        doInit();
      }
      state = compute(self);
    }
    return state;
  };

  const reset = () => self.set(compute(self));

  self = {
    isDisposed: false,
    v: ++_v,
    sub,
    get,
    set,
    reset,
    dispose,
    serializer: JSON as AtomSerializer<T>,
  } satisfies Omit<Atom<T>, "value"> as Atom<T>;

  Reflect.defineProperty(self, "value", { get, set });

  if (options) {
    const { dependencies, serializer, init: _init, adjust: _adjust } = options;

    if (_init) {
      init = _init;
    }

    if (_adjust) {
      adjust = _adjust;
    }

    if (serializer) {
      self.serializer = serializer;
    }

    if (dependencies) {
      for (const dep of dependencies) {
        if (dep) {
          if (!unsubscribes) {
            unsubscribes = [];
          }
          unsubscribes.push(
            (dep as AtomSubscribeable).sub ? (dep as AtomSubscribeable).sub(reset) : (dep as AtomSubscribeFn)(reset),
          );
        }
      }
    }
  }

  return self;
};

export interface AtomGenericStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AtomInLocalStorage<T> extends Atom<T> {
  /** The unique key of this atom in the local storage */
  readonly key: string;

  /** Remove the atom from local storage */
  remove(): void;

  /** Force reload from local storage */
  reload(): boolean;
}

export interface AtomSerializer<T> {
  stringify(value: T): string;

  parse(value: string): T;
}

/**
 *
 * Makes an atom persistent by storing its value in local storage.
 * The atom's value is stored as JSON.
 * The atom's value is loaded from local storage when the atom is created.
 *
 * @param key The key to use in local storage. It is prefixed with "ATOM-" in local storage.
 * Note that there is no check that a key is used multiple time, is left to the developer to not reuse keys.
 * @param atm The atom to store in local storage
 * @param storage The storage to use. If not specified, localStorage is used if available.
 * @returns The atom, with additional functions remove and reload
 */
export const atomInLocalStorage = <TAtom extends Atom<UnsafeAny>>({
  key,
  atom: atm,
  storage,
}: {
  key: string;
  atom: TAtom;
  storage?: AtomGenericStorage | null | undefined;
}): TAtom & { remove(): void; reload(): boolean } => {
  if (storage === undefined) {
    storage = typeof localStorage !== "undefined" ? localStorage : null;
  }

  if (typeof (atm as unknown as AtomInLocalStorage<TAtom>).remove === "function") {
    throw new TypeError(key);
  }

  (atm as unknown as { key: string }).key = key;

  key = `ATOM-${key}`;

  const reload = () => {
    if (!storage) {
      return false;
    }
    _flushAtomLocalStorage();
    const result = false;
    const value = storage.getItem(key);
    if (value) {
      atm.set(atm.serializer.parse(value));
    }
    return result;
  };

  const remove = () => {
    if (storage) {
      _flushAtomLocalStorage();
      storage.removeItem(key);
    }
  };

  if (storage) {
    const store = () => {
      const value = atm.get();
      if (value === undefined || (typeof value === "number" && isNaN(value))) {
        storage!.removeItem(key);
      } else {
        storage!.setItem(key, atm.serializer.stringify(value));
      }
    };

    atm.sub(() => {
      if (!_atomInLocalStoragePending) {
        _atomInLocalStoragePending = new Set();
      }
      _atomInLocalStoragePending.add(store);
      if (!_atomInLocalStorageThrottle) {
        _atomInLocalStorageThrottle = setTimeout(_flushAtomLocalStorage, atomInLocalStorage.throttle);
      }
    });
  }

  (atm as unknown as AtomInLocalStorage<TAtom>).remove = remove;
  (atm as unknown as AtomInLocalStorage<TAtom>).reload = reload;

  reload();

  return atm as TAtom & { remove(): void; reload(): boolean };
};

atomInLocalStorage.throttle = 150;

atomInLocalStorage.flush = _flushAtomLocalStorage;
