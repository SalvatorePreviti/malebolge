// MIT license, https://github.com/SalvatorePreviti/malebolge

import type { HasChangeEmitter } from "@malebolge/core";
import { ChangeEmitter, ClassFromThis, EMPTY_OBJECT, fnUndefined, isPromiseLike } from "@malebolge/core";

export interface AsyncStampedeOptions<T = unknown> {
  /** The ChangeEmitter that is notified when something changes. */
  changeEmitter?: ChangeEmitter | null | undefined;

  /** Called when something changes. */
  onChange?: (() => void) | null | undefined;

  /** Called before the promise starts, also if the promise is already running. */
  onBeforeStart?: ((starting: boolean) => void) | null | undefined;

  /** Called every time when the promise is started. */
  onStart?: ((promise: Promise<T>) => void) | null | undefined;

  /** Called every time when the promise is resolved. */
  onResolve?: ((value: T) => void) | null | undefined;

  /** Called every time when the promise is rejected. */
  onReject?: ((reason: unknown) => void) | null | undefined;

  /** Called every time when the promise is resolved or rejected. */
  onFinally?: ((success: boolean) => void) | null | undefined;

  /** Called when abort(reason) is called. */
  onAbort?: ((reason: unknown) => void) | null | undefined;
}

export type AsyncStampedeStarter<T> = (() => PromiseLike<T> | T) | PromiseLike<T>;

const noStarter = () => {
  throw new TypeError("not implemented");
};

const _NOT_ABORTED = Symbol("NOT_ABORTED");

/**
 * Allows to run a promise only once at a time.
 * This is a building block for various asynchronous behaviours.
 */
export class AsyncStampede<T> extends ClassFromThis<() => Promise<T>> implements HasChangeEmitter {
  #starter: AsyncStampedeStarter<T>;
  #running: boolean = false;
  #promise: Promise<T> | null = null;
  #reject: ((reason?: unknown) => void) | null | undefined;
  #resolve: ((value: T) => void) | null | undefined;
  #pendingPromise: PromiseLike<T> | null | undefined;
  #startedPromise: PromiseLike<T> | null | undefined;
  #promiseInitFn: ((resolve: (value: T) => void, reject: (reason: unknown) => void) => void) | undefined;
  #promiseResolveFn: ((r: T) => void) | null | undefined;
  #promiseRejectFn: ((r: unknown) => void) | null | undefined;
  #changeEmitter: ChangeEmitter | null | undefined;
  #abortReason: unknown | typeof _NOT_ABORTED = _NOT_ABORTED;

  public readonly options: Readonly<AsyncStampedeOptions<T>>;

  /** True if the promise is aborted, false otherwise. */
  public get aborted(): boolean {
    return this.#abortReason !== _NOT_ABORTED;
  }

  /** The abort reason. */
  public get abortReason(): unknown {
    const result = this.#abortReason;
    return result === _NOT_ABORTED ? undefined : result;
  }

  /** The active promise. */
  public get promise(): Promise<T> | null {
    return this.#promise;
  }

  /** True if the promise is running, false otherwise. */
  public get running(): boolean {
    return this.#running;
  }

  public constructor(
    starter: AsyncStampedeStarter<T> = noStarter,
    options: Readonly<AsyncStampedeOptions<T>> = EMPTY_OBJECT,
  ) {
    super(() => this.start());
    this.options = options;
    this.#starter = starter;
  }

  /** The ChangeEmitter that is notified when something changes. */
  public get changeEmitter(): ChangeEmitter {
    return (this.#changeEmitter ??= this.options.changeEmitter ?? new ChangeEmitter());
  }

  /**
   * Starts the promise, executing the given function if no promise is running.
   * @param starter The function to execute, or the promise to observe.
   * @returns The promise. If a promise was already running, returns the current promise.
   */
  public start(starter: AsyncStampedeStarter<T> = this.#starter): Promise<T> {
    const promise = this.promise;
    if (promise) {
      this.onBeforeStart(false);
      return promise;
    }
    return this.restart(starter);
  }

  /**
   * Start or restarts the promise, ignoring the result of the previously running promise.
   * @param starter The function to execute, or the promise to observe.
   * @returns The promise.
   */
  public restart(starter: AsyncStampedeStarter<T> = this.#starter): Promise<T> {
    try {
      if (!this.#running) {
        this.onBeforeStart(true);
        this.onStart((this.#promise = new Promise<T>((this.#promiseInitFn ??= this.#promiseInit.bind(this)))));
        this.onChange();
      }
      this.resolve(typeof starter === "function" ? starter() : starter);
    } catch (error) {
      const rejection = Promise.reject(error);
      this.resolve(rejection);
      return this.promise || rejection;
    }
    return this.promise || this.restart(starter);
  }

  public restartSync(): this {
    this.restart().catch(fnUndefined);
    return this;
  }

  /**
   * Forces the current active promise to resolve with the given value.
   * @param value The value to resolve the promise with.
   * @returns True if the promise was resolved, false otherwise.
   */
  public resolve(value: PromiseLike<T> | T): boolean {
    this.#pendingPromise = null;
    try {
      if (!this.#resolve) {
        this.#promise = new Promise<T>((this.#promiseInitFn ??= this.#promiseInit.bind(this)));
        this.#promise.catch(fnUndefined);
        this.onBeforeStart(true);
        this.onStart(this.#promise);
        this.onChange();
      }
      if (isPromiseLike(value)) {
        if (this.#pendingPromise === value && this.#startedPromise === value) {
          return false;
        }
        this.#startedPromise = value;
        if (this.#pendingPromise !== value) {
          this.#pendingPromise = value;
          value.then(
            (this.#promiseResolveFn ??= this.#promiseResolve.bind(this)),
            (this.#promiseRejectFn ??= this.#promiseReject.bind(this)),
          );
        }
        return true;
      }
      this.#running = false;
      this.onResolve(value);
      if (this.onFinally(true)) {
        this.#promise = null;
      }
      this.onChange();
      this.#resolve?.(value);
      this.#resolve = null;
      this.#reject = null;
    } catch (error) {
      return this.reject(error);
    }
    return true;
  }

  /**
   * Forces the current active promise to reject with the given reason.
   * @param reason The reason to reject the promise with.
   * @returns True if the promise was rejected, false otherwise.
   */
  public reject(reason: unknown): boolean {
    this.#pendingPromise = null;
    if (!this.#promise) {
      this.onBeforeStart(false);
    }
    try {
      this.onReject(reason);
    } catch (e) {
      reason = e;
    }
    this.#running = false;
    try {
      if (this.onFinally(false)) {
        this.#promise = null;
      }
      this.onChange();
    } catch {}
    if (!this.#reject) {
      return false; // Nothing to reject.
    }
    this.#reject?.(reason);
    this.#reject = null;
    this.#resolve = null;
    return true;
  }

  /**
   * Aborts with the given reason.
   * All promises from now on will be rejected with the abort reason.
   * Active promise will be rejected with the abort reason.
   * If already aborted, nothing happens and the reason doesn't change.
   * @param reason The error to abort the promise with. Please, use an Error instance here.
   */
  public abort(reason: unknown): boolean {
    if (this.#abortReason !== _NOT_ABORTED) {
      return false;
    }
    this.#abortReason = reason;
    try {
      this.onAbort(reason);
    } catch (error) {
      reason = error;
      this.#abortReason = reason;
    }
    if (!this.promise || !this.reject(reason)) {
      this.onChange();
    }
    return true;
  }

  /**
   * If abort(reason) was called before, this clears the abort state
   * and resume normal operations.
   * @returns True if the promise was aborted, false otherwise.
   */
  public clearAbort(): boolean {
    if (this.aborted) {
      return false;
    }
    this.#abortReason = _NOT_ABORTED;
    this.onChange();
    return true;
  }

  /**
   * Aborts when the given signal is aborted.
   * @param signal The signal to observe.
   * @returns This instance.
   */
  public attachAbortSignal(signal: AbortSignal): this {
    if (signal.aborted) {
      this.abort(signal);
    } else {
      signal.addEventListener("abort", () => this.abort(signal.reason), { once: true });
    }
    return this;
  }

  public throwIfAborted(): void {
    if (this.aborted) {
      throw this.abortReason;
    }
  }

  /**
   * Called every time when something changes.
   */
  public onChange(): void {
    this.options.onChange?.();
    this.#changeEmitter?.emit();
  }

  /**
   * Called before the promise starts, also if the promise is already running.
   * @param starting True if the promise is starting, false if the promise is already running.
   */
  protected onBeforeStart(starting: boolean): void {
    this.options.onBeforeStart?.(starting);
  }

  /**
   * Called every time when the promise is started.
   * @param promise The promise that was started.
   */
  protected onStart(promise: Promise<T>): void {
    this.options.onStart?.(promise);
  }

  /**
   * Called every time when the promise is resolved.
   * @param value The resolved value.
   * @returns A promise if the promise should be resolved with the returned promise.
   */
  protected onResolve(value: T): void {
    this.options.onResolve?.(value);
  }

  /**
   * Called every time when the promise is rejected.
   * @param reason The rejected reason.
   * @returns A promise if the promise should be resolved with the returned promise.
   */
  protected onReject(reason: unknown): void {
    this.options.onReject?.(reason);
  }

  /**
   * Called every time when the promise is resolved or rejected.
   * @param success True if the promise was resolved, false otherwise.
   * @returns true if the promise can be reset. If this function return false the promise will not be reset to null.
   */
  protected onFinally(success: boolean): boolean {
    this.options.onFinally?.(success);
    return true;
  }

  /**
   * Called when abort(reason) is called.
   * @param reason The abort reason.
   */
  protected onAbort(reason: unknown): void {
    this.options.onAbort?.(reason);
  }

  #promiseInit(resolve: (value: T) => void, reject: (reason: unknown) => void): void {
    this.#running = true;
    this.#reject = reject;
    this.#resolve = resolve;
    this.throwIfAborted();
  }

  #promiseResolve(r: T) {
    if (this.#pendingPromise && this.#pendingPromise === this.#startedPromise) {
      this.#startedPromise = null;
      this.resolve(r);
    }
  }

  #promiseReject(r: unknown) {
    if (this.#pendingPromise && this.#pendingPromise === this.#startedPromise) {
      this.#startedPromise = null;
      this.reject(r);
    }
  }
}
