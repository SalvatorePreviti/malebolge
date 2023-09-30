/** Symbol for custom object inspection in NodeJS - https://nodejs.org/api/util.html#custom-inspection-functions-on-objects */
export const NodeInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

/** Symbol for custom object inspection in NodeJS - https://nodejs.org/api/util.html#custom-inspection-functions-on-objects */
export type NodeInspectSymbol = typeof NodeInspectSymbol;

/** Used a return value to indicate that an handler should be unsubscribed */
export const UNSUBSCRIBE = Symbol.for("UNSUBSCRIBE");

/** Used a return value to indicate that an handler should be unsubscribed */
export type UNSUBSCRIBE = typeof UNSUBSCRIBE;

/** Used to indivate that a field is unset */
export const UNSET = Symbol.for("UNSET");

/** Used to indivate that a field is unset */
export type UNSET = typeof UNSET;

/** Used to indicate that a callback should stop iterating */
export const BREAK = Symbol.for("BREAK");

/** Used to indicate that a callback should stop iterating */
export type BREAK = typeof BREAK;
