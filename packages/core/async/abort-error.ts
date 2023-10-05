// This code is MIT license, see https://github.com/SalvatorePreviti/malebolge

import { EMPTY_OBJECT, setFunctionName } from "../core";

/** Returns true if the given value is an AbortError. */
export const isAbortError = (value: unknown): value is AbortError =>
  value instanceof DOMException && (value.name === "AbortError" || value.code === 20);

export interface AbortErrorOptions<TReason = unknown> extends ErrorOptions {
  /** Can be used to mark this abort error as a successful abort. */
  ok?: boolean | undefined;

  /** The reason why this abort error was created. */
  reason?: TReason | undefined;
}

export interface AbortError<TReason = unknown> extends DOMException {
  /** Can be used to mark this abort error as a successful abort. */
  ok?: boolean | undefined;

  /** The reason why this abort error was created. */
  reason?: TReason | undefined;
}

export interface AbortErrorConstructor {
  new <TReason = unknown>(
    message?: string | null | undefined,
    options?: Readonly<AbortErrorOptions<TReason>>,
  ): AbortError;
  readonly prototype: AbortError;
}

function _AbortError(
  message?: string | null | undefined,
  { cause, ok, reason }: Readonly<AbortErrorOptions> = EMPTY_OBJECT,
) {
  const result = new DOMException(message || "This operation was aborted", "AbortError") as AbortError;
  Error.captureStackTrace?.(result, AbortError);
  if (cause !== undefined) {
    result.cause = cause;
  }
  if (ok !== undefined) {
    result.ok = !!ok;
  }
  if (reason !== undefined) {
    result.reason = reason;
  }
  return result;
}

_AbortError.prototype = /*@__PURE__*/ DOMException.prototype;

/*@__PURE__*/ Object.defineProperty(_AbortError, Symbol.hasInstance, {
  value: isAbortError,
  configurable: true,
  writable: true,
});

/*@__PURE__*/ setFunctionName(_AbortError, "AbortError");

export const AbortError = /*@__PURE__*/ _AbortError as unknown as AbortErrorConstructor;
