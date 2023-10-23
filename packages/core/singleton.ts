// MIT license, https://github.com/SalvatorePreviti/malebolge

import { fnUndefined } from "./fns";
import { ClassFromThis } from "./objects";
import { NodeInspectSymbol } from "./symbols";
import type { UnsafeAny } from "./types";

const _UNSET = Symbol("unset");
const _ISOLATED_SINGLETONS = /*@__PURE__*/ Symbol("ISOLATED_SINGLETONS");

export class Singleton<T> extends ClassFromThis<() => T> {
  #instance: T | typeof _UNSET = _UNSET;

  public constructor(factory: ((this: Singleton<T>) => T) | undefined) {
    super(() => this.get());
    if (factory) {
      this.factory = factory;
    }
  }

  /** Returns true if the singleton instance has been created. */
  public get created(): boolean {
    return this.#instance !== _UNSET;
  }

  /**
   * Returns the singleton instance if it has been instantiated.
   * If it has not been instantiated, returns undefined.
   */
  public get instantiated(): T | undefined {
    const result = this.#instance;
    return result === _UNSET ? undefined : result;
  }

  /** Gets the singleton instance, and creates it if it has not been instantiated. */
  public get instance(): T {
    return this.get();
  }

  /** Sets the singleton instance. */
  public set instance(value: T) {
    this.set(value);
  }

  /** Gets the singleton instance, and creates it if it has not been instantiated. */
  public get(): T {
    let result = this.#instance;
    if (result === _UNSET) {
      result = this.factory();
      this.#instance = result;
    }
    return result;
  }

  /** Sets the singleton instance. */
  public set(value: T): void {
    this.#instance = value;
  }

  public toJSON?(): unknown {
    return this.get();
  }

  public override toString(): string {
    return String(this.get());
  }

  public override valueOf(): T {
    return this.get();
  }

  public [NodeInspectSymbol](): unknown {
    return this.get();
  }

  public factory(): T {
    throw new Error("Not implemented.");
  }

  public reset(): boolean {
    if (this.#instance === _UNSET) {
      return false;
    }
    this.#instance = _UNSET;
    return true;
  }
}

/**
 * A singleton that when running in NodeJS can be isolated in an async context.
 * If running in the frontend, it behaves exactly as Singleton.
 * If not running in an async context, it behaves like a normal singleton but
 * it can be resetted by calling IsolatedSingleton.resetAll()
 * Every RequestCtx running will hold its own instance of the singleton.
 */
export class IsolatedSingleton<T = unknown> extends Singleton<T> {
  public static get isolated(): boolean {
    return false;
  }

  public static resetAll(): boolean {
    return false;
  }
}

let _globalIsolatedSingletons: WeakMap<IsolatedSingleton<UnsafeAny>, { value: UnsafeAny }> | undefined;
let _getContext: () =>
  | {
      resetAllSingletons?: () => void;
      [_ISOLATED_SINGLETONS]?: WeakMap<IsolatedSingleton<UnsafeAny>, { value: UnsafeAny }>;
    }
  | undefined
  | null;

/**
 * Initializes the IsolatedSingleton contextual isolation.
 * @param getContext A function that returns the current context.
 * @returns True if the isolation has been initialized, false if it was already initialized.
 */
export const initializeSingletonIsolation = (
  getContext: (() => object | null | undefined) | null | undefined,
): boolean => {
  if (!getContext) {
    getContext = fnUndefined;
  }

  if (_getContext === getContext) {
    return false;
  }

  _getContext = getContext;

  if (IsolatedSingleton.isolated) {
    return true;
  }

  Object.defineProperty(IsolatedSingleton, "isolated", { value: true, configurable: true, writable: false });

  IsolatedSingleton.resetAll = (): boolean => {
    const context = _getContext!();
    if (context) {
      (context as UnsafeAny)[_ISOLATED_SINGLETONS] = undefined;
      context.resetAllSingletons?.();
    }
    _globalIsolatedSingletons = undefined;
    return true;
  };

  IsolatedSingleton.prototype.get = function get<T>(this: IsolatedSingleton<T>): T {
    const context = _getContext!();
    const map = context
      ? ((context as UnsafeAny)[_ISOLATED_SINGLETONS] ??= new WeakMap())
      : (_globalIsolatedSingletons ??= new WeakMap());
    let result = map.get(this);
    if (!result) {
      result = { value: _UNSET };
      map.set(this, result);
    }
    let value = result.value;
    if (value === _UNSET) {
      value = this.factory();
      result.value = value;
    }
    return value;
  };

  IsolatedSingleton.prototype.set = function set<T>(this: IsolatedSingleton<T>, value: T): void {
    const context = _getContext!();
    const map = context
      ? ((context as UnsafeAny)[_ISOLATED_SINGLETONS] ??= new WeakMap())
      : (_globalIsolatedSingletons ??= new WeakMap());
    const entry = map.get(this);
    if (!entry) {
      map.set(this, { value });
    } else {
      entry.value = value;
    }
  };

  IsolatedSingleton.prototype.reset = function reset<T>(this: IsolatedSingleton<T>): boolean {
    const context = _getContext!();
    const map = context
      ? ((context as UnsafeAny)[_ISOLATED_SINGLETONS] ??= new WeakMap())
      : (_globalIsolatedSingletons ??= new WeakMap());
    const entry = map.get(this);
    if (!entry) {
      return false;
    }
    entry.value = _UNSET;
    return true;
  };

  Object.defineProperty(IsolatedSingleton.prototype, "instantiated", {
    get(this: IsolatedSingleton<UnsafeAny>): UnsafeAny {
      const context = _getContext!();
      const map = context ? (context as UnsafeAny)[_ISOLATED_SINGLETONS] : _globalIsolatedSingletons;
      if (map) {
        const entry = map.get(this);
        if (entry) {
          const value = entry.value;
          if (value !== _UNSET) {
            return value;
          }
        }
      }
      return undefined;
    },
    configurable: true,
  });

  return true;
};
