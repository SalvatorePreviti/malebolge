import type { SimpleEventSubFn } from "../simple-event";
import { type AsyncStampede, asyncStampede } from "./async-stampede";

/**
 * An async lock is a class that has a writable property `locked` that can be set to true or false
 * and a method `promise()` that returns a promise that resolves when `locked` is set to false.
 *
 * This code is based on https://github.com/SalvatorePreviti/malebolge - MIT license
 *
 */
export class AsyncGate {
  #locked: boolean;
  #notify: (() => void) | null;
  #notifier: Promise<void> | null;

  /** Attaches an handler that gets notified every time the state changes. It returns an unsubscribe function. */
  public get sub(): SimpleEventSubFn<Error | null> {
    return this.enter.sub;
  }

  /**
   * Notifies the subscribers of the current state registered with `sub`.
   * @param value The error to emit, or null if there was no error.
   */
  public get emit(): (value: Error | null) => void {
    return this.enter.emit;
  }

  /**
   * The current promise. Is null if enter() is not running, is not null while enter() is running.
   */
  public get promise(): Promise<void> | null {
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
  public readonly enter: AsyncStampede<void>;

  public constructor(locked?: boolean) {
    this.#locked = !!locked;
    this.#notify = null;
    this.#notifier = null;

    const executor = (resolve: () => void) => {
      this.#notify = resolve;
    };

    const asyncLock = async (): Promise<void> => {
      // We run a loop to be sure that the promise is not resolved before the locked state is set to true.
      while (this.locked) {
        await (this.#notifier || (this.#notifier = new Promise(executor)));
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
      this.#locked = true;
      this.emit(null);
    } else if (this.#locked) {
      this.#locked = false;
      if (this.#notify) {
        this.#notify();
        this.#notify = null;
        this.#notifier = null;
        this.emit(null);
      }
    }
  }
}
