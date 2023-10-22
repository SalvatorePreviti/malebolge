// MIT license, https://github.com/SalvatorePreviti/malebolge

import type { HasChangeEmitter } from "../core/change-emitter";
import { ChangeEmitter, weakChangeHandler } from "../core/change-emitter";
import { fnEq } from "./fns";
import { EMPTY_OBJECT } from "./objects";
import { NodeInspectSymbol } from "./symbols";

export interface ObservableStateOptions<T = unknown> {
  /** A function that detect if the state has changed. */
  stateEquals?: ((a: T, b: T) => boolean) | undefined;
}

export abstract class ReadonlyObservableState<T> extends ChangeEmitter {
  #stateGetter: (() => T) | undefined;

  /** A function that detect if the state has changed. */
  public stateEquals: (a: T, b: T) => boolean;

  public constructor({ stateEquals = fnEq }: ObservableStateOptions<T> = EMPTY_OBJECT) {
    super();
    this.stateEquals = stateEquals;
  }

  /** Gets the current state, by invoking this.getState() */
  public get state(): T {
    return this.getState();
  }

  public getStateGetter(): () => T {
    return (this.#stateGetter ??= this.getState.bind(this));
  }

  /** Gets the current state. */
  public abstract getState(): T;

  public toJSON?(): unknown {
    return this.getState();
  }

  public override toString(): string {
    return String(this.getState());
  }

  public override valueOf(): T {
    return this.getState();
  }

  public [NodeInspectSymbol](): unknown {
    return this.getState();
  }
}

export abstract class WritableObservableState<T> extends ReadonlyObservableState<T> {
  #stateSetter: ((value: T) => void) | undefined;

  /** Sets the current state. */
  abstract setState(state: T): void | boolean;

  /** Gets or sets the current state, by invoking this.getState() or this.setState(value) */
  public override get state(): T {
    return this.getState();
  }

  public override set state(value: T) {
    this.setState(value);
  }

  public getStateSetter(): (value: T) => void {
    return (this.#stateSetter ??= (value: T) => {
      this.setState(value);
    });
  }
}

/**
 * A global state that can be used to share data between components.
 * @typeParam T The type of the state.
 * @example
 * ```ts
 * const myGlobalState = new IsolatedSingleton({ count: 0, x: 0, y: 0 });
 *
 * const App = () => {
 *  const [state, setState] = useGlobalState(myGlobalState);
 *  return <div>Count: {state.count}<button onClick={() => setState({ ...state, count: state.count + 1 })}></button></div>;
 * };
 *
 * ```
 *
 * Since the state is global, you can also get and update its value from outside a component:
 *
 * ```ts
 * myGlobalState.setState({ ...myGlobalState.value, count: myGlobalState.value.count + 1 });
 * ```
 *
 */
export class ObservableState<T> extends WritableObservableState<T> {
  #state: T;

  constructor(initialState: T, options?: ObservableStateOptions<T> | undefined) {
    super(options);
    this.#state = initialState;
  }

  public getState(): T {
    return this.#state;
  }

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
   * @param value The new state value.
   *
   * @example
   * ```ts
   * const myState = new ObservableState({ count: 0, x: 0, y: 0 });
   *
   * const increment = () => {
   *   const state = myState.getState();
   *   state.setState({ ...state, count: state.count + 1 });
   * }
   *
   * setInterval(increment, 100);
   * ```
   */
  public setState(state: T): boolean {
    if (this.stateEquals(this.#state, state)) {
      return false;
    }
    this.#state = state;
    this.emit();
    return true;
  }
}

export const newObservableState = <T>(
  initialState: T,
  options?: ObservableStateOptions<T> | undefined,
): ObservableState<T> => new ObservableState(initialState, options);

const _UNSET = /*@__PURE__*/ Symbol("UNSET");

/**
 * A global state that can be used to share data between components.
 * The initializer is called lazily the first time the state is accessed with getState.
 * Calling state.update() recomputes the state from the initializer.
 *
 * The initializer is called with an argument firstTime that is true only the first time the initializer is called,
 * this is useful to run one-time initialization code, for example, registering to a window event handler.
 */
export abstract class LazyObservableState<T> extends WritableObservableState<T> {
  #state: T | typeof _UNSET = _UNSET;
  #updater: (() => void) | undefined;

  public constructor(options?: ObservableStateOptions<T> | undefined) {
    super(options);
    this.#state = _UNSET;
  }

  public stateLoaded(): boolean {
    return this.#state !== _UNSET;
  }

  public override getState(): T {
    let result = this.#state;
    if (result === _UNSET) {
      result = this.stateFactory();
      this.#state = result;
    }
    return result;
  }

  public override setState(state: T): boolean {
    const oldState = this.#state;
    if (oldState === _UNSET) {
      this.#state = state;
      return false;
    }
    if (this.stateEquals(oldState, state)) {
      return false;
    }
    this.#state = state;
    this.emit();
    return true;
  }

  /** Recomputes the state from the initializer. */
  public update(): boolean {
    return this.#state !== _UNSET && this.setState(this.stateFactory());
  }

  public getUpdater(): () => void {
    return (this.#updater ??= this.update.bind(this));
  }

  /**
   * The initializer method, needs to be implemented by subclasses.
   * @returns The initial state.
   */
  protected abstract stateFactory(): T;
}

export const newLazyObservableState = <T>(
  stateFactory: (this: LazyObservableState<T>) => T,
  options?: ObservableStateOptions<T> | undefined,
): LazyObservableState<T> => {
  const instance = new (LazyObservableState as {
    new (_options?: ObservableStateOptions<T> | undefined): LazyObservableState<T> & {
      stateFactory: () => T;
    };
  })(options);
  instance.stateFactory = stateFactory;
  return instance;
};

export type ObservableStateDeriveFn<T> = (oldValue: T | undefined) => T;

export interface DerivedObservableStateOptions<T> extends ObservableStateOptions<T> {
  /** The list of dependencies to add, with a strong reference */
  deps?: readonly ChangeEmitter[] | undefined;

  /** The list of dependencies to add, with a weak reference */
  weakDeps?: readonly ChangeEmitter[] | undefined;
}

/**
 * A derived global state that can be used to share data between components.
 * The value of this state is derived from other states or other values.
 * The dependencies are registered in the constructor.
 */
export abstract class DerivedObservableState<T> extends WritableObservableState<T> {
  #state: T | typeof _UNSET = _UNSET;
  #updater: (() => void) | undefined;

  public constructor(options: DerivedObservableStateOptions<T> = EMPTY_OBJECT) {
    super(options);
    const { deps, weakDeps } = options;
    if (deps) {
      this.addDeps(deps);
    }
    if (weakDeps) {
      this.addWeakDeps(weakDeps);
    }
  }

  protected addDeps(deps: readonly HasChangeEmitter[]) {
    if (deps.length > 0) {
      const updater = this.getUpdater();
      for (const dependency of deps) {
        dependency.changeEmitter.subscribe(updater, {});
      }
    }
  }

  protected addWeakDeps(weakDeps: readonly HasChangeEmitter[]) {
    if (weakDeps.length > 0) {
      const weakUpdate = weakChangeHandler(this.getUpdater());
      for (const dependency of weakDeps) {
        dependency.changeEmitter.subscribe(weakUpdate, {});
      }
    }
  }

  public override getState(): T {
    let result = this.#state;
    if (result === _UNSET) {
      result = this.deriveState(undefined);
      this.#state = result;
    }
    return result;
  }

  public setState(state: T): void {
    const oldState = this.#state;
    if (oldState === _UNSET) {
      this.#state = state;
      return;
    }
    if (this.stateEquals(oldState, state)) {
      return;
    }
    this.#state = state;
    this.emit();
  }

  /**
   * Update the value of the state.
   * Notifies subscribers if the value was changed.
   */
  public update(): void {
    const oldValue = this.#state;
    const value = this.deriveState(oldValue === _UNSET ? undefined : oldValue);
    this.setState(value);
  }

  public getUpdater(): () => void {
    return (this.#updater ??= this.update.bind(this));
  }

  protected abstract deriveState(oldValue: T | undefined): T;
}

export const newDerivedObservableState = <T>(
  deriveState: (this: DerivedObservableState<T>, oldValue: T | undefined) => T,
  options?: DerivedObservableStateOptions<T> | undefined,
): DerivedObservableState<T> => {
  const instance = new (DerivedObservableState as {
    new (_options?: DerivedObservableStateOptions<T> | undefined): DerivedObservableState<T> & {
      deriveState: (oldValue: T | undefined) => T;
    };
  })(options);
  instance.deriveState = deriveState;
  return instance;
};
