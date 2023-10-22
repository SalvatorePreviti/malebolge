// MIT license, https://github.com/SalvatorePreviti/malebolge

import type { AsyncStampedeOptions, AsyncStampedeStarter } from "./async-stampede";
import { AsyncStampede } from "./async-stampede";

export interface AsyncInitializerOptions<T = void> extends AsyncStampedeOptions<T> {}

/**
 * Allows to lazily initialize a value asynchronously.
 * The value will be initialized only once, and the promise can be reset, overridden or restarted when needed.
 */
export class AsyncInitializer<T> extends AsyncStampede<T> {
  #value: T | undefined;
  #error: unknown | null | undefined;

  public declare readonly options: Readonly<AsyncInitializerOptions<T>>;

  public constructor(starter?: AsyncStampedeStarter<T> | undefined, options?: Readonly<AsyncInitializerOptions<T>>) {
    super(starter, options as AsyncStampedeOptions<T>);
  }

  /** The resolved value of the promise. Is undefined if the promise is not resolved. */
  public get value(): T | undefined {
    return this.#value;
  }

  /** The rejected error of the promise. Is null if the promise is not rejected. */
  public get error(): unknown | null {
    return this.#error;
  }

  public override reject(reason: unknown): boolean {
    return this.promise ? super.reject(reason) : this.resolve(Promise.reject(reason));
  }

  protected override onStart(promise: Promise<T>): void {
    super.onStart(promise);
  }

  protected override onResolve(value: T): void {
    this.#value = value;
    this.#error = null;
    super.onResolve(value);
  }

  protected override onReject(reason: unknown): void {
    this.#value = undefined;
    this.#error = reason;
    super.onReject(reason);
  }

  protected override onFinally(success: boolean): boolean {
    super.onFinally(false);
    return !success;
  }
}
