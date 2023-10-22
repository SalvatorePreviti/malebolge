// MIT license, https://github.com/SalvatorePreviti/malebolge

import type { AsyncStampedeOptions } from "./async-stampede";
import { AsyncStampede } from "./async-stampede";

export interface AsyncGateOptions<TSignal = void, TLockValue = boolean>
  extends AsyncStampedeOptions<TSignal | undefined> {
  /** Called when the gate is locked. */
  onLock?(lockValue: TLockValue): void;

  /** Called when the gate is unlocked. */
  onUnlock?(signal: TSignal | undefined): void;
}

/**
 * An asynchronous gate, who awaits for the promise will be blocked until the gate is unlocked.
 * An optional signal value can be passed to the unlock() method to resolve the promise with a value.
 */
export class AsyncGate<TSignal = void, TLockValue = boolean> extends AsyncStampede<TSignal | undefined> {
  #locked: TLockValue;
  #wakeUp: ((value: TSignal | undefined) => void) | null | undefined;
  #awaker: Promise<TSignal | undefined> | null | undefined;
  #initAwaker: ((resolve: (value: TSignal | undefined) => void) => void) | undefined;

  public declare readonly options: Readonly<AsyncGateOptions<TSignal, TLockValue>>;

  public get locked(): TLockValue {
    return this.#locked;
  }

  public set locked(value: TLockValue) {
    this.setLock(value);
  }

  public constructor(locked: TLockValue, options?: Readonly<AsyncGateOptions<TSignal, TLockValue>>) {
    super(() => this.waitUnlocked(), options as AsyncStampedeOptions<TSignal | undefined> | undefined);
    this.#locked = locked;
  }

  /**
   * Locks or unlocks the gate.
   * @param value The new locked value, if truthy the gate will be locked, if falsy the gate will be unlocked.
   * @param signal The signal value to resolve the promise with when the gate is unlocked. It is unused when locking.
   * @returns True if the locked value changed, false otherwise.
   */
  public setLock(value: TLockValue, signal?: TSignal | undefined): boolean {
    const oldValue = this.#locked;
    if (oldValue === value) {
      return false; // Nothing changed.
    }
    if (!oldValue === !value) {
      this.#locked = value; // Only the value changed, not the state.
      this.onChange();
      return true;
    }
    this.#locked = value;
    if (value) {
      this.onLock(value);
      this.onChange();
      return true;
    }
    if (this.#wakeUp) {
      this.#wakeUp(signal);
      this.#wakeUp = null;
      this.#awaker = null;
    }
    this.onUnlock(signal);
    this.onChange();
    return true;
  }

  /** Called when the gate is locked. */
  protected onLock(value: TLockValue): void {
    this.options?.onLock?.(value);
  }

  /** Called when the gate is unlocked. */
  protected onUnlock(signal: TSignal | undefined): void {
    this.options?.onUnlock?.(signal);
  }

  protected async waitUnlocked(): Promise<TSignal | undefined> {
    let result: TSignal | undefined;
    // We run a loop to be sure that the promise is not resolved before the locked state is set to true.
    for (;;) {
      this.throwIfAborted();
      if (!this.locked) {
        return result;
      }
      result = await (this.#awaker ??= new Promise((this.#initAwaker ??= this.#initAwakerFn.bind(this))));
    }
  }

  #initAwakerFn(resolve: (value: TSignal | undefined) => void): void {
    this.#wakeUp = resolve;
  }
}
