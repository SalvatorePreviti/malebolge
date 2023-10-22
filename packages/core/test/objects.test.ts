import { describe, expect, it, test } from "vitest";
import type { UnsafeAny } from "@malebolge/core";
import {
  object_findPropertyDescriptor,
  object_hasKeys,
  object_hasOwn,
  dto_equals,
  object_setOrDefineProperty,
  dto_clone,
  getFunctionName,
  setFunctionName,
  getClassName,
  object_getIntId,
  object_setIntId,
} from "@malebolge/core";

describe("object_hasOwn", () => {
  it("should return true if object has own property", () => {
    const obj = { a: 1 };
    expect(object_hasOwn(obj, "a")).toBe(true);
  });

  it("should return false if object does not have own property", () => {
    const obj = { a: 1 };
    expect(object_hasOwn(obj, "b")).toBe(false);
  });

  it("should return false if object is null or undefined", () => {
    expect(object_hasOwn(null, "a")).toBe(false);
    expect(object_hasOwn(undefined, "a")).toBe(false);
  });

  it('behaves for special properties like "constructor"', () => {
    const obj = { a: 1 };
    const obj1 = Object.create(obj);
    obj1.b = 1;
    expect(object_hasOwn(obj, "a")).toBe(true);
    expect(object_hasOwn(obj, "b")).toBe(false);
    expect(object_hasOwn(obj1, "a")).toBe(false);
    expect(object_hasOwn(obj1, "b")).toBe(true);
    expect(object_hasOwn(obj, "toString")).toBe(false);
    expect(object_hasOwn(obj, "constructor")).toBe(false);
    expect(object_hasOwn(obj, "prototype")).toBe(false);
    expect(object_hasOwn(obj, "__proto__")).toBe(false);
    expect(object_hasOwn(obj, "hasOwnProperty")).toBe(false);
    expect(object_hasOwn(obj, "valueOf")).toBe(false);
    expect(object_hasOwn(obj, "isPrototypeOf")).toBe(false);
    expect(object_hasOwn(obj, "propertyIsEnumerable")).toBe(false);
    expect(object_hasOwn(obj, "toLocaleString")).toBe(false);
  });
});

test("object_hasKeys", () => {
  const obj = { a: 1 };
  expect(object_hasKeys(obj)).toBe(true);
  expect(object_hasKeys(null)).toBe(false);
  expect(object_hasKeys(undefined)).toBe(false);
  expect(object_hasKeys(null)).toBe(false);
  expect(object_hasKeys("")).toBe(false);
  expect(object_hasKeys(false)).toBe(false);
  expect(object_hasKeys(true)).toBe(false);
  expect(object_hasKeys({})).toBe(false);
  expect(object_hasKeys({}, true)).toBe(false);
  expect(object_hasKeys(obj)).toBe(true);
  expect(object_hasKeys(obj, true)).toBe(true);
  expect(object_hasKeys(Object.create(obj))).toBe(false);
  expect(object_hasKeys(Object.create(obj), true)).toBe(true);
  expect(object_hasKeys({})).toBe(false);
  const inherhited = Object.create(obj);
  expect(object_hasKeys(inherhited, true)).toBe(true);
});

describe("object_plainEqual", () => {
  it("should return true if objects are equal", () => {
    expect(dto_equals({}, {})).toBe(true);
    expect(dto_equals({ a: 1, b: "2", c: [3] }, { a: 1, b: "2", c: [3] })).toBe(true);
    expect(dto_equals(null, null)).toBe(true);
    expect(dto_equals(undefined, undefined)).toBe(true);
    expect(dto_equals("1", "1")).toBe(true);
    expect(dto_equals(1, 1)).toBe(true);
    expect(dto_equals(NaN, NaN)).toBe(true);
    expect(dto_equals(true, true)).toBe(true);
    expect(dto_equals(false, false)).toBe(true);
    expect(dto_equals(Symbol.for("x"), Symbol.for("x"))).toBe(true);
    expect(dto_equals(Infinity, Infinity)).toBe(true);
    expect(dto_equals([1, { a: 2 }], [1, { a: 2 }])).toBe(true);
    expect(dto_equals([[1]], [[1]])).toBe(true);
    expect(dto_equals([[1], [2]], [[1], [2]])).toBe(true);
  });

  it("should return false if values are not equal", () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };
    expect(dto_equals(obj1, obj2)).toBe(false);
    expect(dto_equals(null, {})).toBe(false);
    expect(dto_equals(undefined, {})).toBe(false);
    expect(dto_equals({}, undefined)).toBe(false);
    expect(dto_equals({}, null)).toBe(false);
    expect(dto_equals(null, undefined)).toBe(false);
    expect(dto_equals({ a: null }, { a: undefined })).toBe(false);
    expect(dto_equals({ a: undefined }, { a: null })).toBe(false);
    expect(dto_equals(1, 2)).toBe(false);
    expect(dto_equals(1, "1")).toBe(false);
    expect(dto_equals([1, { a: 2 }], [1, { a: 3 }])).toBe(false);
    expect(dto_equals([1, 2], [1, 2, 3])).toBe(false);
    expect(dto_equals([1, 2, 3], [1, 2])).toBe(false);
    expect(dto_equals({}, [])).toBe(false);
    expect(dto_equals([], null)).toBe(false);
    expect(dto_equals([], {})).toBe(false);
    expect(dto_equals([], "")).toBe(false);
  });

  it("should handle circular references", () => {
    const obj1 = { a: 1 } as UnsafeAny;
    const obj2 = { a: 1 } as UnsafeAny;
    obj1.b = obj2;
    obj2.b = obj1;
    expect(dto_equals(obj1, obj2)).toBe(true);
    obj2.a = 2;
    expect(dto_equals(obj1, obj2)).toBe(false);
  });

  it("should handle complex circular references in objects and arrays", () => {
    const obj1 = { a: 1 } as UnsafeAny;
    const obj2 = { a: 1 } as UnsafeAny;
    obj1.b = [obj2, obj2];
    obj2.b = [obj1, obj1];
    expect(dto_equals(obj1, obj2)).toBe(true);
    obj2.a = 2;
    expect(dto_equals(obj1, obj2)).toBe(false);
  });
});

describe("object_findPropertyDescriptor", () => {
  it("should return property descriptor if property exists in object", () => {
    const obj = { a: 1 };
    const descriptor = object_findPropertyDescriptor(obj, "a");
    expect(descriptor).toEqual({
      configurable: true,
      enumerable: true,
      value: 1,
      writable: true,
    });
  });

  it("should return undefined if property does not exist in object", () => {
    const obj = { a: 1 };
    const descriptor = object_findPropertyDescriptor(obj, "b");
    expect(descriptor).toBeUndefined();
  });

  it("should return property descriptor from prototype chain", () => {
    const proto = { a: 1 };
    const obj = Object.create(proto);
    const descriptor = object_findPropertyDescriptor(obj, "a");
    expect(descriptor).toEqual({
      configurable: true,
      enumerable: true,
      value: 1,
      writable: true,
    });
  });

  test("object_findPropertyDescriptor", () => {
    expect(object_findPropertyDescriptor(null, "a")).toBeUndefined();
    expect(object_findPropertyDescriptor({ a: 1 }, "a")).toEqual({
      value: 1,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    expect(object_findPropertyDescriptor(Object.create({ a: 1 }), "a")).toEqual({
      value: 1,
      writable: true,
      enumerable: true,
      configurable: true,
    });

    class A {
      get a() {
        return 1;
      }
    }

    class B extends A {}

    const obj = Object.create(Object.create(new B()));
    expect(object_findPropertyDescriptor(obj, "a")).toEqual({
      get: expect.any(Function),
      enumerable: false,
      configurable: true,
    });
  });
});

describe("objectSetOrDefineProperty", () => {
  it("should return false for non-object input", () => {
    expect(object_setOrDefineProperty(null, "prop", "value")).toBe(false);
    expect(object_setOrDefineProperty(undefined, "prop", "value")).toBe(false);
    expect(object_setOrDefineProperty(123, "prop", "value")).toBe(false);
    expect(object_setOrDefineProperty("str", "prop", "value")).toBe(false);
  });

  it("should overwrite an object property with default options", () => {
    const obj = { prop1: "value1", prop2: "value2" };
    expect(object_setOrDefineProperty(obj, "prop1", "new value")).toBe(true);
    expect(obj.prop1).toBe("new value");
  });

  it("should overwrite an object property with custom options", () => {
    const obj = { prop1: "value1", prop2: "value2" };
    expect(object_setOrDefineProperty(obj, "prop2", "new value")).toBe(true);
    const prop2Descriptor = Object.getOwnPropertyDescriptor(obj, "prop2")!;
    expect(prop2Descriptor.value).toBe("new value");
    expect(prop2Descriptor.configurable).toBe(true);
    expect(prop2Descriptor.enumerable).toBe(true);
    expect(prop2Descriptor.writable).toBe(true);
  });

  it("should define a new object property with default options", () => {
    const obj = { prop1: "value1", prop2: "value2" } as Record<string, unknown>;
    expect(object_setOrDefineProperty(obj, "prop3", "value3")).toBe(true);
    expect(obj.prop3).toBe("value3");
  });

  it("should not overwrite a non-writable object property", () => {
    const nonWritableObj: Record<string, unknown> = {};
    Object.defineProperty(nonWritableObj, "prop", { value: "value", writable: false });
    expect(object_setOrDefineProperty(nonWritableObj, "prop", "new value")).toBe(false);
    expect(nonWritableObj.prop).toBe("value");
  });

  it("should not overwrite a non-configurable object property", () => {
    const nonConfigurableObj: Record<string, unknown> = {};
    Object.defineProperty(nonConfigurableObj, "prop", { value: "value", configurable: false });
    expect(object_setOrDefineProperty(nonConfigurableObj, "prop", "new value")).toBe(false);
    expect(nonConfigurableObj.prop).toBe("value");
  });
});

describe("getFunctionName", () => {
  it("should return the name of the function", () => {
    function fn() {}

    expect(getFunctionName(fn)).toBe("fn");
  });

  it("should return empty string if function is anonymous", () => {
    expect(getFunctionName(() => {})).toBe("");
  });

  it("should return undefined for null or undefined input", () => {
    expect(getFunctionName(null)).toBeUndefined();
    expect(getFunctionName(undefined)).toBeUndefined();
  });
});

describe("setFunctionName", () => {
  it("should set the name of the function", () => {
    function fn() {}

    setFunctionName(fn, "newName");
    expect(getFunctionName(fn)).toBe("newName");
    expect(fn.name).toBe("newName");
  });

  it("should accept another function as input and gets its name", () => {
    function fn() {}

    function fn2() {}

    setFunctionName(fn, fn2);
    expect(getFunctionName(fn)).toBe("fn2");
    expect(fn.name).toBe("fn2");
  });
});

describe("getClassName", () => {
  it("should return the name of the class", () => {
    class A {}

    expect(getClassName(A)).toBe("A");
  });

  it("should return empty string if class is anonymous", () => {
    expect(getClassName(class {})).toBe("");
  });

  it("should return undefined for null or undefined input", () => {
    expect(getClassName(null)).toBeUndefined();
    expect(getClassName(undefined)).toBeUndefined();
  });

  it("should return the name of the class for a new instance", () => {
    class A {}

    expect(getClassName(new A())).toBe("A");
  });
});

describe("getObjectIntId, setObjectIntId", () => {
  it("should return the same id for the same object", () => {
    const obj = {};
    const id = object_getIntId(obj);
    expect(object_getIntId(obj)).toBe(id);
  });

  it("should return different ids for different objects", () => {
    const obj1 = {};
    const obj2 = {};
    expect(object_getIntId(obj1)).not.toBe(object_getIntId(obj2));
  });

  it("should allow to override the id", () => {
    const obj = {};
    object_setIntId(obj, 1);
    expect(object_getIntId(obj)).toBe(1);
  });

  it('should allow to set the id to "undefined"', () => {
    const obj = {};
    const oldId = object_getIntId(obj);
    object_setIntId(obj, undefined);
    const newId = object_getIntId(obj);
    expect(newId).not.toBe(oldId);
    expect(newId).toBeGreaterThan(0);
  });
});

describe("plainObject_clone", () => {
  it("should clone an object", () => {
    const obj = { a: 1, b: { c: 2 }, e: [1, 2, 3] };
    const clone = dto_clone(obj);
    expect(clone).toEqual(obj);
    expect(clone).not.toBe(obj);
    expect(clone.b).not.toBe(obj.b);
    expect(clone.e).not.toBe(obj.e);
  });

  it("should return null and non object types", () => {
    expect(dto_clone(null)).toBeNull();
    expect(dto_clone(undefined)).toBeUndefined();
    expect(dto_clone(1)).toBe(1);
    expect(dto_clone("1")).toBe("1");
    expect(dto_clone(true)).toBe(true);
    expect(dto_clone(false)).toBe(false);
    expect(dto_clone(Symbol.for("x"))).toBe(Symbol.for("x"));
    expect(dto_clone(NaN)).toBeNaN();
  });

  it("supports circular references like", () => {
    const obj = { a: 1 } as UnsafeAny;
    obj.b = obj;
    const clone = dto_clone(obj);
    expect(clone).toEqual(obj);
    expect(clone).not.toBe(obj);
    expect(clone.b).toBe(clone);
  });

  it("supports circular references", () => {
    const obj = { a: 1 } as UnsafeAny;
    const t = { x: 1 };
    obj.obj = obj;
    obj.t1 = t;
    obj.t2 = t;
    const arr = [obj, obj];
    obj.arr = arr;
    const clone = dto_clone(arr);
    expect(clone).toEqual(arr);
    expect(clone).not.toBe(arr);
    expect(clone).toBe(clone[1].arr);
    expect(clone).toBe(clone[0].arr);
    expect(clone[0].arr).toBe(clone);
    expect(clone[0].obj.obj).toBe(clone[0].obj);
    expect(clone[0].t1).not.toBe(clone[0].t2);
  });

  it("does not use the same instance if is repeated, it is used only in case of circular references", () => {
    const obj = { a: 1 } as UnsafeAny;
    const arr = [obj, obj];
    const clone = dto_clone(arr);
    expect(clone).toEqual(arr);
    expect(clone).not.toBe(arr);
    expect(clone[0]).not.toBe(clone[1]);
  });
});
