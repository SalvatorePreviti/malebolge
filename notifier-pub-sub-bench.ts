/* eslint-disable no-console */
import type { NotifierPubSub, NotifierUnsub } from "./packages/core/core";
import { notifierPubSub_new } from "./packages/core/core";

const SIZE = 2000000;

const notifiers: NotifierPubSub[] = new Array(SIZE);
const unsubs: NotifierUnsub[] = [];

let handlersCalled = 0;
const myHandler = () => {
  ++handlersCalled;
};

console.time("create");
for (let i = 0; i < SIZE; i++) {
  notifiers[i] = notifierPubSub_new();
}
console.timeEnd("create");

console.time("subscribe");
for (let i = 0; i < SIZE; i++) {
  if ((i & 0xf) === 0xf) {
    unsubs.push(notifiers[i]!(myHandler));
  }
  unsubs.push(notifiers[i]!(myHandler));
}
console.timeEnd("subscribe");

console.time("publish");
for (let i = 0; i < SIZE; i++) {
  notifiers[i]!();
}
console.timeEnd("publish");

console.time("unsubscribe");
for (let i = 0; i < SIZE; i++) {
  unsubs[i]!();
}
console.timeEnd("unsubscribe");

console.log(handlersCalled);
