// This code is MIT license, see https://github.com/SalvatorePreviti/malebolge

import { EMPTY_OBJECT } from "../core";
import type { AsyncStampede, AsyncStampedeOptions } from "./async-stampede";
import { asyncStampede_new } from "./async-stampede";

export interface AsyncGateOptions extends AsyncStampedeOptions {
  /** If true, the gate will be locked when created. Default is false. */
  locked?: boolean | undefined;
}

export interface AsyncGate<T = void> extends AsyncStampede<T | undefined> {
  readonly locked: boolean;

  /**
   * Locks the gate.
   * @returns true if the gate was locked, false if the gate was already locked or was aborted via the AbortSignal.
   */
  lock(): boolean;

  /**
   * Unlocks the gate.
   * @param signal The signal to send to the waiting functions.
   * @returns true if the gate was unlocked, false if the gate was already unlocked.
   */
  unlock(signal?: T | undefined): boolean;
}

/**
 * An async gate stops the execution of a function until the gate is unlocked.
 *
 * It behaves similarly to a mutex, but it is not reentrant since it has just a single locked property.
 *
 */
export const asyncGate_new = <T = void>(options: Readonly<AsyncGateOptions> = EMPTY_OBJECT): AsyncGate<T> => {
  let awaker: Promise<T | undefined> | null | undefined;
  let wake: ((value: T | undefined) => void) | null | undefined;
  let instance: AsyncGate<T | undefined> & { locked: boolean };
  const abortSignal = options.signal;

  const initAwaker = (resolve: (value: T | undefined) => void) => {
    abortSignal?.throwIfAborted();
    wake = resolve;
  };

  const unlock = (signal?: T | undefined): boolean => {
    if (!instance.locked) {
      return false;
    }
    instance.locked = false;
    if (wake) {
      wake(signal);
      wake = null;
      awaker = null;
    }
    instance.sub();
    return true;
  };

  const lock = (): boolean => {
    if (instance.locked || abortSignal?.aborted) {
      return false;
    }
    instance.locked = true;
    instance.sub();
    return true;
  };

  const waitUnlocked = async (): Promise<T | undefined> => {
    let result: T | undefined;
    // We run a loop to be sure that the promise is not resolved before the locked state is set to true.
    for (;;) {
      if (!instance.locked) {
        return result;
      }
      result = await (awaker || (awaker = new Promise(initAwaker)));
    }
  };

  instance = asyncStampede_new(waitUnlocked, options as Readonly<AsyncStampedeOptions>) as typeof instance;
  instance.locked = false;
  instance.lock = lock;
  instance.unlock = unlock;

  if (options.locked) {
    lock();
  }

  if (abortSignal && !abortSignal.aborted) {
    abortSignal.addEventListener("abort", () => unlock(), { once: true });
  }

  return instance;
};
