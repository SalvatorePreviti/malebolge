// MIT license, https://github.com/SalvatorePreviti/malebolge

import type { HasChangeEmitter, TypedEventTarget, UnsafeAny } from "@malebolge/core";
import {
  AbortError,
  TimeoutError,
  ChangeEmitter,
  ClassFromThis,
  EMPTY_OBJECT,
  fnUndefined,
  isAbortError,
  isPromiseLike,
} from "@malebolge/core";
import { type RetryOptions, calculateRetryTimeout, defaultRetryOptions } from "./async-retry";

export interface AsyncStampedeOptions<T = unknown> {
  /** The ChangeEmitter that is notified when something changes. */
  changeEmitter?: ChangeEmitter | null | undefined;

  /** The retry options. If false or undefined, there is no retry. */
  retry?: RetryOptions | boolean | undefined;

  /** The amount of milliseconds after the promise will expire and will be aborted with a TimeoutError */
  timeout?: number | ((attempt: number, attempts: number) => number) | null | undefined;

  /** The amount of milliseconds to throttle the promise. */
  throttle?: number | ((attempt: number, attempts: number) => number) | null | undefined;

  /**
   * The amount of milliseconds to cache the promise.
   * If is true, the promise is cached forever.
   */
  cacheFor?: number | boolean | null | undefined;

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
  onSettled?: ((success: boolean) => void) | null | undefined;

  /** Called when abort(reason) is called. */
  onAbort?: ((reason: unknown) => void) | null | undefined;

  /** Called when the promise timed out. */
  onTimeout?: (() => void) | null | undefined;

  /** Called when the promise is throttled. */
  onThrottle?: ((delay: number) => void) | null | undefined;

  /**
   * Called when the promise is retried. An error thrown here will abort the retry. If this function returns false, the retry will be aborted.
   * @param reason The reason why the promise is retried.
   * @param attempt The current attempt number.
   * @param attempts The maximum amount of attempts until failure.
   * @param timeout The amount of milliseconds to the next attempt.
   */
  onRetry?:
    | ((reason: unknown, attempt: number, attempts: number, timeout: number) => void | boolean)
    | null
    | undefined;
}

export type AsyncStampedeStarter<T> = (() => PromiseLike<T> | T) | PromiseLike<T>;

const _NOT_ABORTED = Symbol("NOT_ABORTED");

let _AsyncStampedeAbortSignal: ReturnType<typeof defineAsyncStampedeAbortSignal> | undefined;
type AsyncStampedeAbortSignal = InstanceType<ReturnType<typeof defineAsyncStampedeAbortSignal>>;

/**
 * The events emitted by AsyncStampede.events
 */
export interface AsyncStampedeEvents<T = unknown, TSelf = AsyncStampede<T>> {
  beforeStart: Event & { self: TSelf; starting: boolean };
  start: Event & { self: TSelf; promise: Promise<T> };
  resolve: Event & { self: TSelf; value: T };
  reject: Event & { self: TSelf; reason: unknown };
  settled: Event & { self: TSelf; success: boolean };
  abort: Event & { self: TSelf; reason: unknown };
  timeout: Event & { self: TSelf };
  throttle: Event & { self: TSelf; delay: number };
  retry: Event & { self: TSelf; reason: unknown; attempt: number; attempts: number; timeout: number };
  lock: Event & { self: TSelf; locked: unknown };
  unlock: Event & { self: TSelf; signal: unknown | undefined };
}

/**
 * Allows to run a promise only once at a time.
 * This is a building block for various asynchronous behaviours.
 *
 * - If the promise is running, the promise is not started again.
 * - If the promise is running and abort(reason) is called, the promise is aborted and the promise is rejected with the abort reason.
 * - If resolve is called, the promise is resolved and the promise is started again when requested.
 * - If reject is called, the promise is rejected and the promise is started again when requested.
 * - It supports throttle, timeout and retry.
 * - It supports caching the promise with a time.
 * - It supports abort signals.
 * - It supports events.
 * - It supports change emitter.
 * - It supports cancelling the abort.
 */
export class AsyncStampede<T> extends ClassFromThis<() => Promise<T>> implements HasChangeEmitter, AbortController {
  #running: boolean = false;
  #runId = 0;
  #startTime: number = 0;
  #retryAttempt: number = 0;
  #cacheExpiry: number = 0;
  #cacheFor: number | true | undefined;
  #abortReason: unknown | typeof _NOT_ABORTED = _NOT_ABORTED;
  #starter: AsyncStampedeStarter<T> | null | undefined;
  #promise: Promise<T> | null = null;
  #promiseInitFn: ((resolve: (value: T) => void, reject: (reason: unknown) => void) => void) | undefined;
  #changeEmitter: ChangeEmitter | null | undefined;
  #reject: ((reason?: unknown) => void) | null | undefined;
  #resolve: ((value: T) => void) | null | undefined;
  #retryStarter: (() => PromiseLike<T> | T) | undefined;
  #onRetryTimeoutFn: (() => void) | undefined;
  #onTimeoutFn: (() => void) | undefined;
  #retryTimer: ReturnType<typeof setTimeout> | undefined;
  #timeoutTimer: ReturnType<typeof setTimeout> | undefined;
  #throttleTimer: ReturnType<typeof setTimeout> | undefined;
  #signal: AsyncStampedeAbortSignal | undefined;

  public readonly options: Readonly<AsyncStampedeOptions<T>>;

  /** The AbortSignal that is aborted when abort(reason) is called. */
  public get signal(): AbortSignal {
    return (this.#signal ??= new (_AsyncStampedeAbortSignal ??= defineAsyncStampedeAbortSignal())(this));
  }

  /** The EventTarget that is notified with events. */
  public get events(): TypedEventTarget<AsyncStampedeEvents<T>> {
    if (!this.dispatchEvent) {
      this.dispatchEvent = this.#dispatchEvent;
    }
    return this.signal;
  }

  /** The active promise. */
  public get promise(): Promise<T> | null {
    if (this.isCacheExpired()) {
      this.#promise = null;
      return null;
    }
    return this.#promise;
  }

  /** True if the promise is running, false otherwise. */
  public get running(): boolean {
    return this.#running;
  }

  /** True if the promise is aborted, false otherwise. */
  public get aborted(): boolean {
    return this.#abortReason !== _NOT_ABORTED;
  }

  /** The abort reason. */
  public get abortReason(): unknown {
    const result = this.#abortReason;
    return result === _NOT_ABORTED ? undefined : result;
  }

  /** True if a retry is pending, false otherwise. */
  public get retryPending(): boolean {
    return !!this.#retryTimer && !!this.#retryStarter;
  }

  /** The current number of retries. */
  public get retryAttempt(): number {
    const result = this.#retryAttempt;
    return result < 0 ? -result : result;
  }

  /** The maximum amount of attempts until failure. If retry is not enabled, is 0. */
  public get retryAttempts(): number {
    const retry = this.options.retry;
    return retry === false ? 0 : (retry === true ? null : retry?.attempts) ?? defaultRetryOptions.attempts;
  }

  /** The last time when the promise was started, Date. */
  public get startTime(): number {
    return this.#startTime;
  }

  /** Returns true if the promise is currently delayed by the throttle. */
  public get isThrottling(): boolean {
    return !!this.#throttleTimer;
  }

  /** The number of milliseconds to keep the last resolved promise valid. */
  public get cacheFor(): number | boolean {
    return this.#cacheFor ?? this.options.cacheFor ?? 0;
  }

  /** The number of milliseconds to keep the last resolved promise valid. */
  public set cacheFor(value: number | boolean | undefined) {
    this.#cacheFor = value !== false ? value : 0;
  }

  /** Returns true if the cache is expired, false otherwise. */
  public isCacheExpired(): boolean {
    const cacheExpiry = this.#cacheExpiry;
    return cacheExpiry > 0 && !this.#resolve && Date.now() > cacheExpiry;
  }

  public constructor(
    starter: AsyncStampedeStarter<T> | null | undefined,
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
  public start(starter: AsyncStampedeStarter<T> | null | undefined = this.#starter): Promise<T> {
    const promise = this.promise;
    if (!promise) {
      return this.restart(starter);
    }
    this.onBeforeStart(false);
    return promise;
  }

  /**
   * Start or restarts the promise, ignoring the result of the previously running promise.
   * @param starter The function to execute, or the promise to observe.
   * @returns The promise.
   */
  public restart(starter?: AsyncStampedeStarter<T> | null | undefined): Promise<T> {
    this.#retryAttempt = this.#retryAttempt < 0 ? -this.#retryAttempt : 0;
    let promise = this.#promise;
    this.#cacheExpiry = 0;
    try {
      this.#clearTimers();
      const options = this.options;
      if (options.retry) {
        this.#retryStarter = typeof starter === "function" ? starter : undefined;
      }
      if (!this.#running) {
        this.onBeforeStart(!this.#resolve);
        this.#running = true;
      }
      if (!this.#resolve) {
        promise = new Promise<T>((this.#promiseInitFn ??= this.#promiseInit.bind(this)));
        this.#promise = promise;
        this.onStart(promise);
      }

      const throttleDelay = options.throttle
        ? this.#startTime +
          (typeof options.throttle === "function"
            ? options.throttle(this.#retryAttempt, this.retryAttempts)
            : options.throttle) -
          Date.now()
        : 0;

      const runId = ++this.#runId;
      if (throttleDelay > 0 && this.onThrottle(throttleDelay)) {
        this.#throttleTimer = setTimeout(() => {
          this.#throttleTimer = undefined;
          if (this.#running) {
            this.#startPromiseStarter(starter, runId);
          }
        }, throttleDelay);
      } else {
        this.#startPromiseStarter(starter, runId);
      }

      this.onChange();
    } catch (error) {
      this.reject(error);
    }
    return this.#promise || promise!;
  }

  #startPromiseStarter(starter: AsyncStampedeStarter<T> | null | undefined, id: number) {
    this.#startTime = Date.now();
    this.restartTimeout();
    this.startPromise(starter || this.#starter).then(
      (value) => {
        if (id === this.#runId) {
          this.resolve(value);
        }
      },
      (reason) => {
        if (id === this.#runId) {
          this.#promiseRejected(reason);
        }
      },
    );
  }

  /** If property events was accessed, this method becomes available and can be called to dispatch events. */
  public dispatchEvent?(event: Event): boolean;

  /** Restarts the promise with the given value. */
  public restartSync(starter: AsyncStampedeStarter<T> | null | undefined = this.#starter): void {
    this.restart(starter).catch(fnUndefined);
  }

  /**
   * Forces the current active promise to resolve with the given value.
   * @param value The value to resolve the promise with.
   * @returns True if the promise was resolved, false otherwise.
   */
  public resolve(value: PromiseLike<T> | T): boolean {
    if (isPromiseLike(value)) {
      this.restartSync(value);
      return true;
    }
    if (!this.#resolve) {
      this.restartSync(Promise.resolve(value));
    }
    try {
      ++this.#runId;
      this.#running = false;
      this.#cacheExpiry = 0;
      this.#clearTimers();
      this.onResolve(value);
      if (this.#running) {
        return false; // restarted
      }
      this.onSettled(true);
      if (this.#running) {
        return false; // restarted
      }
      this.onChange();
      if (this.#running) {
        return false; // restarted
      }
      const cacheFor = this.cacheFor;
      if (cacheFor) {
        if (cacheFor === true) {
          this.#cacheExpiry = -1;
        } else if (cacheFor > 0) {
          this.#cacheExpiry = Date.now() + cacheFor;
        } else {
          this.#promise = null;
        }
      } else {
        this.#promise = null;
      }
      this.#resolve?.(value);
      this.#resolve = null;
      this.#reject = null;
      this.#retryStarter = undefined;
    } catch (error) {
      this.reject(error);
    }
    return true;
  }

  /**
   * Forces the current active promise to reject with the given reason.
   * @param reason The reason to reject the promise with.
   * @returns True if the promise was rejected, false otherwise.
   */
  public reject(reason: unknown): boolean {
    this.#clearTimers();

    if (!this.#reject) {
      try {
        this.onReject(reason);
      } catch {}
      return false; // Nothing to do, the promise is not running.
    }

    ++this.#runId;
    this.#retryStarter = undefined;
    this.#cacheExpiry = 0;
    this.#running = false;
    try {
      this.onReject(reason);
    } catch (e) {
      reason = e;
    }
    if (this.#running) {
      return false; // restarted
    }
    try {
      this.onSettled(false);
      if (this.#running) {
        return false; // restarted
      }
      this.onChange();
    } catch {}
    if (this.#running) {
      return false; // restarted
    }
    this.#promise = null;
    this.#reject?.(reason);
    this.#reject = null;
    this.#resolve = null;
    return true;
  }

  /**
   * Stops retrying.
   * The next failure will reject the promise.
   */
  public stopRetry(): boolean {
    if (this.#retryTimer) {
      clearTimeout(this.#retryTimer);
      this.#retryTimer = undefined;
    }
    if (!this.#retryStarter) {
      return false;
    }
    this.#retryStarter = undefined;
    return true;
  }

  /**
   * Triggers a retry before the time. If a retry is pending, this will trigger the retry immediately.
   * @returns True if the retry was triggered, false otherwise.
   */
  public triggerRetry(): boolean {
    if (!this.#retryTimer) {
      return false;
    }
    clearTimeout(this.#retryTimer);
    return this.#onRetryTimeout();
  }

  /**
   * Aborts with the given reason.
   * All promises from now on will be rejected with the abort reason.
   * Active promise will be rejected with the abort reason.
   * If already aborted, nothing happens and the reason doesn't change.
   * @param reason The error to abort the promise with. Please, use an Error instance here.
   */
  public abort(reason?: unknown): boolean {
    if (this.#abortReason !== _NOT_ABORTED) {
      return false; // Already aborted
    }
    this.#clearTimers();
    this.#retryStarter = undefined;
    if (reason === undefined) {
      reason = new AbortError();
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
    if (!this.aborted) {
      return false;
    }
    this.#abortReason = _NOT_ABORTED;
    this.onChange();
    return true;
  }

  /** Throws the abort reason if the promise is aborted. */
  public throwIfAborted(): void | never {
    if (this.aborted) {
      throw this.abortReason;
    }
  }

  /** If a timeout wad configured and the promise is running, this stops the timeout rejection from happening. */
  public stopTimeout(): boolean {
    if (this.#timeoutTimer) {
      clearTimeout(this.#timeoutTimer);
      this.#timeoutTimer = undefined;
      return true;
    }
    return false;
  }

  /** If a timeout was configured and the promise is running, this restarts the timeout. */
  public restartTimeout(): boolean {
    this.stopTimeout();
    const options = this.options;
    if (this.#running && options.timeout) {
      this.#timeoutTimer = setTimeout(
        (this.#onTimeoutFn ??= this.#onTimeout.bind(this)),
        typeof options.timeout === "function"
          ? options.timeout(this.#retryAttempt, this.retryAttempts)
          : options.timeout,
      );
      return true;
    }
    return false;
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

  /** Called every time when something changes. */
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

    this.dispatchEvent?.(Object.assign(new Event("beforeStart"), { self: this, starting }));
  }

  /**
   * Called every time when the promise is started.
   * @param promise The promise that was started.
   */
  protected onStart(promise: Promise<T>): void {
    this.options.onStart?.(promise);

    this.dispatchEvent?.(Object.assign(new Event("start"), { self: this, promise }));
  }

  /**
   * Called every time when the promise is resolved.
   * @param value The resolved value.
   * @returns A promise if the promise should be resolved with the returned promise.
   */
  protected onResolve(value: T): void {
    this.options.onResolve?.(value);

    this.dispatchEvent?.(Object.assign(new Event("resolve"), { self: this, value }));
  }

  /**
   * Called every time when the promise is rejected.
   * @param reason The rejected reason.
   * @returns A promise if the promise should be resolved with the returned promise.
   */
  protected onReject(reason: unknown): void {
    this.options.onReject?.(reason);

    this.dispatchEvent?.(Object.assign(new Event("reject"), { self: this, reason }));
  }

  /**
   * Called every time when the promise is resolved or rejected.
   * @param success True if the promise was resolved, false otherwise.
   */
  protected onSettled(success: boolean): void {
    this.options.onSettled?.(success);
    this.dispatchEvent?.(Object.assign(new Event("settled"), { self: this, success }));
  }

  /** Called when abort(reason) is called. */
  protected onAbort(reason: unknown): void {
    this.options.onAbort?.(reason);
    if (this.#signal) {
      this.#signal.dispatchEvent(Object.assign(new Event("abort"), { self: this, reason }));
    }
  }

  /** Called when the promise timed out. By default, it will throw a TimeoutError */
  protected onTimeout(): void {
    this.options?.onTimeout?.();
    this.dispatchEvent?.(new Event("timeout"));
    throw new TimeoutError();
  }

  /**
   * Called when the promise is going to be retried.
   * An error thrown here will abort the retry.
   * @param reason The reason why the promise is retried.
   * @param attempt The current attempt number.
   * @param attempts The maximum amount of attempts until failure.
   * @param timeout The amount of milliseconds to the next attempt.
   * @returns True if the retry should continue, false if the retry should be aborted.
   */
  protected onRetry(reason: unknown, attempt: number, attempts: number, timeout: number): boolean {
    if (this.options.onRetry?.(reason, attempt, attempts, timeout) === false) {
      return false;
    }
    this.dispatchEvent?.(Object.assign(new Event("retry"), { self: this, reason, attempt, attempts, timeout }));
    return !isAbortError(reason);
  }

  /**
   * Called when the promise is throttled.
   * @param delay The amount of milliseconds to wait before the promise can be started.
   * @returns True if the promise should be throttled, false otherwise.
   */
  protected onThrottle(delay: number): boolean {
    this.options.onThrottle?.(delay);
    this.dispatchEvent?.(Object.assign(new Event("throttle"), { self: this, delay }));
    return true;
  }

  /** Called when the promise need to be started */
  protected startPromise(starter: AsyncStampedeStarter<T> | null | undefined): Promise<T> {
    return Promise.resolve(typeof starter === "function" ? starter() : starter!);
  }

  #promiseInit(resolve: (value: T) => void, reject: (reason: unknown) => void): void {
    this.#reject = reject;
    this.#resolve = resolve;
    this.throwIfAborted();
  }

  #onTimeout() {
    this.#timeoutTimer = undefined;
    try {
      this.onTimeout();
    } catch (error) {
      this.reject(error);
    }
  }

  #clearTimers() {
    this.stopTimeout();
    if (this.#throttleTimer) {
      clearTimeout(this.#throttleTimer);
      this.#throttleTimer = undefined;
    }
    if (this.#retryTimer) {
      clearTimeout(this.#retryTimer);
      this.#retryTimer = undefined;
      return true;
    }
    return false;
  }

  #promiseRejected(reason: unknown) {
    const ms = this.#retryStarter ? calculateRetryTimeout(this.#retryAttempt, this.options.retry) : null;
    if (ms !== null) {
      try {
        if (this.onRetry(reason, this.#retryAttempt++, this.retryAttempts, ms)) {
          const changed = this.#clearTimers();
          this.#retryTimer = setTimeout((this.#onRetryTimeoutFn ??= this.#onRetryTimeout.bind(this)), ms);
          if (changed) {
            this.onChange();
          }
          return; // retry
        }
      } catch (error) {
        reason = error;
      }
    }
    this.reject(reason);
  }

  #onRetryTimeout() {
    this.#retryTimer = undefined;
    if (!this.#retryStarter) {
      return false;
    }
    this.#retryAttempt = -this.#retryAttempt;
    this.restartSync(this.#retryStarter);
    return true;
  }

  #dispatchEvent(event: Event): boolean {
    return this.#signal!.dispatchEvent(event);
  }
}

function defineAsyncStampedeAbortSignal() {
  class AsyncStampedeAbortSignal extends EventTarget implements AbortSignal {
    #stampede: AsyncStampede<UnsafeAny>;

    onabort: ((this: AbortSignal, ev: Event) => unknown) | null = null;

    public constructor(stampede: AsyncStampede<UnsafeAny>) {
      super();
      this.#stampede = stampede;
    }

    override dispatchEvent(event: Event): boolean {
      if (typeof this.onabort === "function") {
        this.onabort(event);
      }
      return super.dispatchEvent(event);
    }

    throwIfAborted(): void {
      return this.#stampede.throwIfAborted();
    }

    get reason(): unknown {
      return this.#stampede.abortReason;
    }

    get aborted(): boolean {
      return this.#stampede.aborted;
    }
  }

  Object.setPrototypeOf(AsyncStampedeAbortSignal.prototype, AbortSignal.prototype);

  return AsyncStampedeAbortSignal;
}
