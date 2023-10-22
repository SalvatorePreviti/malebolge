/* eslint-disable no-console */

import type { ChangeEmitterUnsubscribe } from "@malebolge/core";
import { ChangeEmitter } from "@malebolge/core";

const execute = (SIZE: number = 2000000) => {
  const notifiers: ChangeEmitter[] = new Array(SIZE);
  const unsubs: ChangeEmitterUnsubscribe[] = new Array(SIZE);

  let handlersCalled = 0;
  const myHandler = () => {
    ++handlersCalled;
  };

  console.time("create");
  for (let i = 0; i < SIZE; i++) {
    notifiers[i] = new ChangeEmitter();
  }
  console.timeEnd("create");

  console.time("subscribe");
  for (let i = 0, j = 0; i < SIZE; i++) {
    unsubs[j++] = notifiers[i]!.subscribe(myHandler);
  }
  console.timeEnd("subscribe");

  console.time("publish");
  for (let i = 0; i < SIZE; i++) {
    notifiers[i]!.getEmitter()();
    // notifiers[i]!.emitter();
  }
  console.timeEnd("publish");

  console.time("version");

  // let vv = 0;
  // for (let i = 0; i < SIZE; i++) {
  //   // vv += notifiers[i]!.getVersion();
  //   vv += notifiers[i]!.getState();
  // }

  console.timeEnd("version");

  console.time("unsubscribe");
  for (let i = 0; i < SIZE; i++) {
    unsubs[i]!();
  }
  console.timeEnd("unsubscribe");

  console.time("publish");
  for (let i = 0; i < SIZE; i++) {
    notifiers[i]!.emit();
    // notifiers[i]!.emitter();
  }
  console.timeEnd("publish");

  console.log(handlersCalled);
};

execute();
