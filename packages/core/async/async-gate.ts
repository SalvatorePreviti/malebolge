import type { AsyncStampede, AsyncStampedeOptions } from "./async-stampede";
import { asyncStampede_new } from "./async-stampede";

export interface AsyncGateOptions extends AsyncStampedeOptions {
  /** If true, the gate will be locked when created. Default is false. */
  locked?: boolean | undefined;
}

export interface AsyncGate<T = void> extends AsyncStampede<T | undefined> {
  readonly locked: boolean;

  lock(): boolean;

  unlock(signal?: T | undefined): boolean;
}

/**
 * An async gate stops the execution of a function until the gate is unlocked.
 *
 * It behaves similarly to a mutex, but it is not reentrant since it has just a single locked property.
 *
 * This code is based on https://github.com/SalvatorePreviti/malebolge - MIT license
 *
 */
export const asyncGate_new = <T = void>(options: Readonly<AsyncGateOptions> | boolean = false): AsyncGate<T> => {
  let notifier: Promise<T | undefined> | null | undefined;
  let notify: ((value: T | undefined) => void) | null | undefined;

  let instance: AsyncGate<T | undefined> & { locked: boolean };

  const initNotifier = (resolve: (value: T | undefined) => void) => {
    notify = resolve;
  };

  const waitUnlocked = async (): Promise<T | undefined> => {
    let result: T | undefined;
    // We run a loop to be sure that the promise is not resolved before the locked state is set to true.
    for (;;) {
      if (!instance.locked) {
        return result;
      }
      result = await (notifier || (notifier = new Promise(initNotifier)));
    }
  };

  const lock = (): boolean => {
    if (instance.locked) {
      return false;
    }
    instance.locked = true;
    instance.sub.emit();
    return true;
  };

  const unlock = (signal?: T | undefined): boolean => {
    if (!instance.locked) {
      return false;
    }
    instance.locked = false;
    if (notify) {
      notify(signal);
      notify = null;
      notifier = null;
    }
    instance.sub.emit();
    return true;
  };

  instance = asyncStampede_new(waitUnlocked, options as Readonly<AsyncStampedeOptions>) as typeof instance;
  instance.locked = options === false || options === true ? options : !!options.locked;
  instance.lock = lock;
  instance.unlock = unlock;

  return instance;
};
