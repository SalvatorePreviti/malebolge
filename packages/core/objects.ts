// MIT license, https://github.com/SalvatorePreviti/malebolge

import type { UnsafeAny } from "./types";

/**
 * A frozen empty object that can be used as a default value for function parameters.
 */
export const EMPTY_OBJECT = /*@__PURE__*/ Object.freeze({}) as {};

/**
 * Defines a class from an instance.
 * This is useful to create derived classes from object or function instances.
 * @param value The instance to use as this for the class.
 */
export const ClassFromThis: {
  new <T>(_this_: T): T;
} = /*@__PURE__*/ (() => {
  const setPrototypeOf = Reflect.setPrototypeOf;

  function Class(_this_: object) {
    setPrototypeOf(_this_, new.target.prototype);
    return _this_;
  }

  Class.prototype = null;
  return Class;
})() as UnsafeAny;

/**
 * Gets the name of the given function
 * @param fn The function to get the name of
 * @returns The name of the given function
 */
export const getFunctionName: {
  (fn: Function): string;
  (fn: null | undefined): undefined;
  (fn: Function | null | undefined): string | undefined;
} = /*@__PURE__*/ (fn: UnsafeAny) => fn?.name;

/** Sets the name of the given function */
export const setFunctionName = <TFn extends Function>(fn: TFn, name: string | Function | null | undefined): TFn => {
  if (typeof name !== "string") {
    if (typeof name === "function") {
      name = name.name;
    }
    name = name === null || name === undefined ? "" : `${name}`;
  }
  Reflect.defineProperty(fn, "name", { value: name, configurable: true });
  return fn;
};

/**
 * Gets the name of the given object
 *
 * @param obj The object to get the name of
 * @returns The name of the given object
 */
export const getClassName = /*@__PURE__*/ (obj: unknown): string | undefined => {
  if (typeof obj === "function") {
    return obj.name;
  }
  if (obj !== null && obj !== undefined) {
    const fn = obj.constructor;
    if (typeof fn === "function") {
      return fn.name;
    }
  }
  return undefined;
};

/**
 * Cross browser implementation of Object.hasOwn
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
 */
export const object_hasOwn: /*@__PURE__*/ (obj: unknown, key: PropertyKey) => boolean = /*@__PURE__*/ (() => {
  const hasOwn = (Object as { hasOwn?: (obj: unknown, key: PropertyKey) => boolean }).hasOwn;
  if (hasOwn) {
    return (obj: unknown, key: PropertyKey) => obj !== null && obj !== undefined && hasOwn(obj, key);
  }
  const protoHasOwn = Object.prototype.hasOwnProperty;
  return (obj: unknown, key: PropertyKey) => protoHasOwn.call(obj, key);
})();

/**
 * Returns true if the given object has at least one enumerable key and is not null, undefined or an empty object
 * @param obj The object to check
 * @param recursePrototype If true, the prototype chain will be traversed, default is false.
 * @returns true if the given object has at least one enumerable key
 * @example objectHasKeys({}) === false
 * @example objectHasKeys({ a: 1 }) === true
 */
export const object_hasKeys = /*@__PURE__*/ (obj: unknown, recursePrototype?: boolean): obj is object => {
  if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      if (recursePrototype || object_hasOwn(obj, key)) {
        return true;
      }
    }
  }
  return false;
};

/** Finds a property descriptor in an object or its prototypes */
export const object_findPropertyDescriptor = /*@__PURE__*/ (
  obj: unknown,
  key: PropertyKey,
): PropertyDescriptor | undefined => {
  let descriptor: PropertyDescriptor | undefined;
  if (obj !== undefined) {
    try {
      for (let o: unknown = obj; o !== null && o !== undefined; o = Reflect.getPrototypeOf(o)) {
        descriptor = Reflect.getOwnPropertyDescriptor(o, key);
        if (descriptor) {
          break;
        }
      }
    } catch {}
  }
  return descriptor;
};

/** Change an object property, maintaining its original configurable, writable, enumerable settings if possible */
export const object_setOrDefineProperty = (obj: unknown, key: PropertyKey, value: unknown): boolean => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  try {
    if ((obj as UnsafeAny)[key] !== value) {
      const d = object_findPropertyDescriptor(obj, key);
      if (!d || !("value" in d) || !Reflect.defineProperty(obj, key, { ...d, value })) {
        (obj as UnsafeAny)[key] = value;
      }
    }
    return true;
  } catch {}
  return false;
};

type _DTOEqualsSet = /*@__PURE__*/ Set<UnsafeAny> & { x: typeof _dtoEquals };

function _dtoEquals(this: _DTOEqualsSet, a: UnsafeAny, b: UnsafeAny) {
  if (a === b) {
    return true;
  }
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    // eslint-disable-next-line no-self-compare
    return a !== a && b !== b;
  }
  if (this.has(a) || this.has(b)) {
    return true;
  }
  const aIsArray = Array.isArray(a);
  if (aIsArray !== Array.isArray(b)) {
    return false;
  }

  this.add(a);
  this.add(b);

  if (aIsArray) {
    const len = a.length;
    if (len !== b.length) {
      return false;
    }
    for (let i = 0; i < len; i++) {
      if (!this.x(a[i], b[i])) {
        return false;
      }
    }
  }
  if (a instanceof Set) {
    if (!(b instanceof Set)) {
      return false;
    }
    if (a.size !== b.size) {
      return false;
    }
    for (const value of a) {
      if (!b.has(value)) {
        return false;
      }
    }
    this.delete(a);
    this.delete(b);
    return true;
  }
  if (a instanceof Map) {
    if (!(b instanceof Map)) {
      return false;
    }
    if (a.size !== b.size) {
      return false;
    }
    for (const [key, value] of a) {
      if (!b.has(key) || !this.x(value, b.get(key))) {
        return false;
      }
    }
    this.delete(a);
    this.delete(b);
    return true;
  }
  if (a instanceof Date) {
    if (b instanceof Date && a.getTime() === b.getTime()) {
      this.delete(a);
      this.delete(b);
      return true;
    }
    return false;
  }
  const ka = Object.keys(a);
  const len = ka.length;
  if (len !== Object.keys(b).length) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    const key = ka[i]!;
    if ((!(key in b) && !object_hasOwn(b, key)) || !this.x(a[key], b[key])) {
      return false;
    }
  }

  this.delete(a);
  this.delete(b);

  return true;
}

/**
 * Simple comparison of two DTOs plain objects. It supports circular references.
 */
export const dto_equals = /*@__PURE__*/ (obj1: UnsafeAny, obj2: UnsafeAny): boolean => {
  const visited = new Set() as _DTOEqualsSet;
  visited.x = _dtoEquals;
  return visited.x(obj1, obj2);
};

type _DTOCloneMap = /*@__PURE__*/ Map<UnsafeAny, UnsafeAny> & { x: typeof _dtoClone };

function _dtoClone(this: _DTOCloneMap, obj: UnsafeAny) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  const r = this.get(obj);
  if (r !== undefined || this.has(r)) {
    return r;
  }
  if (Array.isArray(obj)) {
    const clone: UnsafeAny[] = [];
    this.set(obj, clone);
    for (let i = 0, len = obj.length; i < len; i++) {
      clone.push(this.x(obj[i]));
    }
    this.delete(obj);
    return clone;
  }
  if (obj instanceof Set) {
    const clone = new Set();
    this.set(obj, clone);
    for (const value of obj) {
      clone.add(this.x(value));
    }
    this.delete(obj);
    return clone;
  }
  if (obj instanceof Map) {
    const clone = new Map();
    this.set(obj, clone);
    for (const [key, value] of obj) {
      clone.set(this.x(key), this.x(value));
    }
    this.delete(obj);
    return clone;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  const clone: UnsafeAny = {};
  this.set(obj, clone);
  for (const key in obj) {
    if (object_hasOwn(obj, key)) {
      const value = this.x(obj[key]);
      if (value !== undefined) {
        clone[key] = value;
      }
    }
  }
  this.delete(obj);
  return clone;
}

/**
 * Simple clone of a DTOs plain object. It supports circular references.
 * Note: undefined properties are not cloned.
 *
 * For simple objects can be faster than structuredClone
 * See https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
 *
 * @param obj The object to clone
 * @returns A clone of the given object
 */
export const dto_clone = /*@__PURE__*/ (obj: UnsafeAny): UnsafeAny => {
  const map = new Map() as _DTOCloneMap;
  map.x = _dtoClone;
  return map.x(obj);
};

let _objectIdCounter = 0;
const _objectIdWeakMap = /*@__PURE__*/ new WeakMap<object, number | undefined>();

/**
 * Returns a unique number (unique in the running worker thread) for the given object.
 * @param obj The object to get the id for.
 * @returns A unique number for the given object.
 */
export const object_getIntId = /*@__PURE__*/ (obj: object | null | undefined): number => {
  if (obj === undefined || obj === null) {
    return 0;
  }
  if (typeof obj !== "object") {
    return 0;
  }
  let result = _objectIdWeakMap.get(obj);
  if (result === undefined) {
    result = ++_objectIdCounter;
    _objectIdWeakMap.set(obj, result);
  }
  return result;
};

/**
 * Sets a unique number (unique in the running worker thread) for the given object.
 * @param obj The object to set the id for.
 * @param id The id to set.
 */
export const object_setIntId = (obj: object, id: number | undefined): void => {
  if (typeof obj === "object") {
    _objectIdWeakMap.set(obj, id);
  }
};
