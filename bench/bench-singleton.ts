import { Singleton } from "@malebolge/core";

let globalCounter = 0;

// const functions = new Array(100).fill(0).map((_, i) => () => i);

let counter = 0;

class MyClass {
  value: number = ++counter;
}

const makeSingletonAndTest = () => {
  for (let i = 0; i < 1000; ++i) {
    const singleton = new Singleton(() => new MyClass());
    globalCounter += singleton().value;
  }
};

console.time("singleton");
for (let i = 0; i < 10000; ++i) {
  makeSingletonAndTest();
}
console.timeEnd("singleton");
console.log(globalCounter);
