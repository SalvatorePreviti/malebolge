// MIT license, https://github.com/SalvatorePreviti/malebolge

import { test, expect } from "vitest";
import { IsolatedSingleton, Singleton } from "@malebolge/core";

test("Singleton", () => {
  let _counter = 0;

  class MyClass {
    static singleton = new Singleton(() => new this());

    public myValue = ++_counter;
  }

  expect(_counter).toBe(0);

  expect(MyClass.singleton.get().myValue).toBe(1);
  expect(MyClass.singleton().myValue).toBe(1);
  expect(MyClass.singleton().myValue).toBe(1);
  expect(MyClass.singleton().myValue).toBe(1);

  // Allow resetting

  MyClass.singleton.set(MyClass.singleton.factory());

  expect(MyClass.singleton().myValue).toBe(2);
  expect(MyClass.singleton().myValue).toBe(2);

  // Allow setting

  MyClass.singleton.instance = new MyClass();

  expect(MyClass.singleton().myValue).toBe(3);
  expect(MyClass.singleton().myValue).toBe(3);
});

test("IsolatedSingleton", () => {
  let _counter = 0;

  class MyClass {
    static singleton = new IsolatedSingleton(() => new this());

    public myValue = ++_counter;
  }

  expect(_counter).toBe(0);

  expect(MyClass.singleton()).toBeInstanceOf(MyClass);

  expect(MyClass.singleton().myValue).toBe(1);
  expect(MyClass.singleton().myValue).toBe(1);

  // Allow resetting

  MyClass.singleton.set(MyClass.singleton.factory());

  expect(MyClass.singleton().myValue).toBe(2);
  expect(MyClass.singleton().myValue).toBe(2);

  // Allow setting

  MyClass.singleton.instance = new MyClass();

  expect(MyClass.singleton().myValue).toBe(3);
  expect(MyClass.singleton().myValue).toBe(3);
});
