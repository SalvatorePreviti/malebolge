import { ObservableState } from "@malebolge/core";

const SIZE = 2000000;

let events = 0;

const handler = () => {
  ++events;
};

const states = new Array<ObservableState<number>>(SIZE);

console.time("create");
for (let i = 0; i < SIZE; i++) {
  states[i] = new ObservableState(0);
}
console.timeEnd("create");

console.time("subscribe");
for (let i = 0; i < SIZE; i++) {
  states[i]!.stateChange.subUnsub(handler);
}
console.timeEnd("subscribe");

console.time("set");
for (let i = 0; i < SIZE; i++) {
  states[i]!.setState(i);
}
console.timeEnd("set");

console.time("get");
let sum = 0;
for (let i = 0; i < SIZE; i++) {
  sum += states[i]!.getState();
}
console.timeEnd("get");

console.time("set");
for (let i = 0; i < SIZE; i++) {
  states[i]!.setState(-i);
}
console.timeEnd("set");

console.log(events, sum);
