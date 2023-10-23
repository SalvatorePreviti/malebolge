// MIT license, https://github.com/SalvatorePreviti/malebolge

import type { Falsy, UnsafeAny } from "../types";
import { EMPTY_OBJECT } from "../objects";

/** Returns true if the given value is an AbortError. */
export const isAbortError = (value: unknown): value is AbortError =>
  value instanceof DOMException && (value.name === "AbortError" || value.code === 20);

/**
 * Throws if the given value it is an AbortError or if it is an AbortSignal that is aborted.
 * @param value The value to check.
 * @throws If the value is an AbortError or if it is an AbortSignal that is aborted.
 */
export const throwIfAborted: {
  (value: AbortError): never;
  (value: AbortSignal | null | undefined): void | never;
  (value: unknown): void | never;
} = ((value: unknown) => {
  if (value) {
    if (isAbortError(value)) {
      throw value;
    }
    if (typeof (value as AbortSignal).throwIfAborted === "function") {
      (value as AbortSignal).throwIfAborted();
    }
  }
}) as UnsafeAny;

export interface AbortErrorOptions extends ErrorOptions {
  /** Can be used to mark this abort error as a successful abort. */
  ok?: boolean | undefined;

  /** The reason why this abort error was created. */
  reason?: unknown;

  /** The cause of this abort error. */
  cause?: unknown;

  /** Additional data for this abort error. */
  data?: unknown;
}

export interface AbortError extends DOMException {
  /** The cause of this abort error. */
  cause?: unknown;

  /** Can be used to mark this abort error as a successful abort. */
  ok?: boolean | undefined;

  /** The reason why this abort error was created. */
  reason?: unknown | undefined;

  /** Additional data for this error */
  data?: unknown;
}

export interface AbortErrorConstructor {
  /**
   * Creates an AbortError.
   *
   * @param message The message of the AbortError.
   * @param options Additional options for the AbortError.
   * @param caller The optional caller function, used to capture the stack trace.
   */
  new (
    message?: string | Error | null | undefined,
    options?: Readonly<AbortErrorOptions>,
    caller?: Function | Falsy,
  ): AbortError;

  /**
   * AbortError used as a function (without new) converts the given error to an AbortError.
   * If the given message is already an AbortError, it returns it and overrides the options.
   * Otherwise it creates a new AbortError with the given message and options.
   * @param error The error to convert to an AbortError.
   * @param options Additional options for the AbortError.
   * @param caller The optional caller function, used to capture the stack trace if a new AbortError is created.
   */
  (
    error?: string | Error | AbortError | null | undefined,
    options?: Readonly<AbortErrorOptions>,
    caller?: Function | Falsy,
  ): AbortError;

  /** The AbortError prototype. */
  readonly prototype: AbortError;

  /** The default message for the AbortError. */
  readonly message: "This operation was aborted";
}

export const AbortError = /*@__PURE__*/ (() => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  function AbortError(
    message?: Error | string | null | undefined,
    { cause, ok, reason, data }: Readonly<AbortErrorOptions> = EMPTY_OBJECT,
    caller?: Function | Falsy,
  ) {
    if (message && typeof message !== "string") {
      if (message instanceof AbortSignal) {
        message = message.reason;
      }

      if (!new.target && isAbortError(message)) {
        if (cause) {
          message.cause = cause;
        }
        if (ok !== undefined) {
          message.ok = ok;
        }
        if (reason !== undefined) {
          message.reason = reason;
        }
        return message;
      }

      if (message instanceof Error) {
        cause = cause || message;
        message = "";
      }
    }

    const result = new DOMException(message || AbortError.message, "AbortError") as AbortError;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(result, caller || new.target || AbortError);
    }
    if (cause !== undefined) {
      result.cause = cause;
    }
    if (ok !== undefined) {
      result.ok = !!ok;
    }
    if (reason !== undefined) {
      result.reason = reason;
    }
    if (data !== undefined) {
      result.data = data;
    }
    return result;
  }

  AbortError.message = "This operation was aborted";
  AbortError.prototype = DOMException.prototype;

  Object.defineProperty(AbortError, Symbol.hasInstance, { value: isAbortError, configurable: true, writable: true });
  Object.defineProperty(AbortError, "AbortError", { value: AbortError, configurable: true });

  return AbortError as unknown as AbortErrorConstructor;
})();
