import { UNSUBSCRIBE } from "./symbols";
import type { UnsafeAny } from "./types";

const _WEAK_HANDLER = Symbol("WEAK_HANDLER");

function _weakHandler(this: WeakRef<(payload: UnsafeAny) => UnsafeAny>, payload: UnsafeAny): UnsafeAny | UNSUBSCRIBE {
  const handler = this.deref();
  return handler ? handler(payload) : UNSUBSCRIBE;
}

/**
 * Higher order function that makes the given handler a weak handler using WeakRef.
 * The returning function returns UNSUBSCRIBE if the original handler is garbage collected.
 *
 * It always returns the same function for the same handler.
 *
 * @see WeakRef
 *
 * @param handler The handler to make weak.
 * @returns A weak handler that will be unsubscribed automatically if the original handler is garbage collected.
 */
export const weakEventHandler = /* @__PURE__ */ <TPayload = unknown, TResult = void | UNSUBSCRIBE>(
  handler: (payload: TPayload) => TResult,
): ((value: TPayload) => TResult | UNSUBSCRIBE) => {
  let weakHandler = (handler as UnsafeAny)[_WEAK_HANDLER];
  if (!weakHandler) {
    weakHandler = _weakHandler.bind(new WeakRef(handler));
    weakHandler[_WEAK_HANDLER] = weakHandler;
    (handler as UnsafeAny)[_WEAK_HANDLER] = weakHandler;
  }
  return weakHandler;
};
