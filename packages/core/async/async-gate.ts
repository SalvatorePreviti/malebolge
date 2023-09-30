import type { SimpleEvent } from "../core/simple-event";
import type { AsyncStampede } from "./async-stampede";
import { asyncStampede } from "./async-stampede";

/**
 * An async lock is a class that has a writable property `locked` that can be set to true or false
 * and a method `enter()` that returns a promise that resolves when `locked` is set to false.
 *
 * It behaves similarly to a mutex, but it is not reentrant since it has just a single locked property.
 *
 * This code is based on https://github.com/SalvatorePreviti/malebolge - MIT license
 *
 */
export class AsyncGate<T = void> {
  #locked: boolean;
  #notify: ((value: T | undefined) => void) | null;
  #notifier: Promise<T | undefined> | null;

  /** Attaches an handler that gets notified every time the state changes. It returns an unsubscribe function. */
  public get sub(): SimpleEvent {
    return this.enter.sub;
  }

  /**
   * The current promise. Is null if enter() is not running, is not null while enter() is running.
   */
  public get promise(): Promise<T | undefined> | null {
    return this.enter.promise;
  }

  /**
   * When called, returns a promise that resolves when `locked` is set to false.
   * The promise is pending while `locked` is true.
   * Temporarily setting synchronously locked=true, locked=false, locked=true does not trigger the promise.
   *
   * @param locked The initial locked state.
   * @returns {AsyncStampede<void>} A promise that resolves when `locked` is set to false. It never rejects.
   */
  public readonly enter: AsyncStampede<T | undefined>;

  public constructor(locked?: boolean) {
    this.#locked = !!locked;
    this.#notify = null;
    this.#notifier = null;

    const initNotifier = (resolve: (value: T | undefined) => void) => {
      this.#notify = resolve;
    };

    const asyncLock = async (): Promise<T | undefined> => {
      if (!this.#locked) {
        return undefined; // Not locked, return immediately.
      }
      // We run a loop to be sure that the promise is not resolved before the locked state is set to true.
      for (;;) {
        const result = await (this.#notifier || (this.#notifier = new Promise(initNotifier)));
        if (!this.#locked) {
          return result;
        }
      }
    };

    this.enter = asyncStampede(asyncLock);
  }

  /**
   * Gets or sets the locked state.
   * When true, the promise returned by `promise()` is pending.
   * When false, the promise returned by `promise()` is resolved.
   */
  public get locked(): boolean {
    return this.#locked;
  }

  public set locked(value: boolean) {
    if (value) {
      this.lock();
    } else {
      this.unlock();
    }
  }

  public lock(): boolean {
    if (this.#locked) {
      return false;
    }
    this.#locked = true;
    this.sub.emit();
    return true;
  }

  public unlock(signal?: T | undefined): boolean {
    if (!this.#locked) {
      return false;
    }
    this.#locked = false;
    if (this.#notify) {
      this.#notify(signal);
      this.#notify = null;
      this.#notifier = null;
    }
    this.sub.emit(null);
    return true;
  }
}
