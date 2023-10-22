// MIT license, https://github.com/SalvatorePreviti/malebolge

/** Symbol for custom object inspection in NodeJS - https://nodejs.org/api/util.html#custom-inspection-functions-on-objects */
export const NodeInspectSymbol = /*@__PURE__*/ Symbol.for("nodejs.util.inspect.custom");

/** Symbol for custom object inspection in NodeJS - https://nodejs.org/api/util.html#custom-inspection-functions-on-objects */
export type NodeInspectSymbol = typeof NodeInspectSymbol;

/** Used a return value to indicate that an handler should be unsubscribed */
export const UNSUBSCRIBE = /*@__PURE__*/ Symbol.for("⛧UNSUB");

/** Used a return value to indicate that an handler should be unsubscribed */
export type UNSUBSCRIBE = typeof UNSUBSCRIBE;

/** Used to indivate that a field is unset */
export const UNSET = /*@__PURE__*/ Symbol.for("⛧UNSET");

/** Used to indivate that a field is unset */
export type UNSET = typeof UNSET;

/** Used to indicate that a callback should stop iterating */
export const BREAK = /*@__PURE__*/ Symbol.for("⛧BREAK");

/** Used to indicate that a callback should stop iterating */
export type BREAK = typeof BREAK;

export const STORED_STATE = /*@__PURE__*/ Symbol.for("⛧STORED_STATE");

export type STORED_STATE = typeof STORED_STATE;
