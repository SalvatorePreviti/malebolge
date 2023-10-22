// MIT license, https://github.com/SalvatorePreviti/malebolge

import { describe, expect, it } from "vitest";
import { ObservableState, newDerivedObservableState, newLazyObservableState } from "@malebolge/core";

describe("ObservableState", () => {
  it("should initialize with the initial value", () => {
    const state = new ObservableState({ count: 0 });
    expect(state.getState()).toEqual({ count: 0 });
  });

  it("should get the current value", () => {
    const state = new ObservableState({ count: 0 });
    expect(state.getState()).toEqual({ count: 0 });
  });

  it("should set the value and notify subscribers", () => {
    let emitCount = 0;
    const initial = { count: 0 };
    const state = new ObservableState(initial);

    const emit = () => ++emitCount;
    let unsub = state.subscribe(emit);

    expect(emitCount).toBe(0);

    expect(state.getState()).toEqual({ count: 0 });

    state.setState({ count: 1 });

    expect(emitCount).toBe(1);

    state.setState({ count: 2 });

    expect(emitCount).toBe(2);

    unsub();
    unsub();

    state.setState({ count: 3 });

    expect(emitCount).toBe(2);

    unsub = state.subscribe(emit);

    expect(emitCount).toBe(2);

    state.setState(initial);

    expect(state.getState()).toBe(initial);
  });

  it("should not notify subscribers if the value does not change", () => {
    let emits = 0;
    const state = new ObservableState(11);
    state.subscribe(() => ++emits);
    state.setState(11); // Setting the same value
    expect(emits).toBe(0); // No notifications should have been sent
    state.setState(11); // Setting the same value
    expect(emits).toBe(0); // No notifications should have been sent
  });
});

describe("LazyObservableState", () => {
  it("should initialize with the initial value", () => {
    const state = newLazyObservableState(() => ({ count: 0 }));
    expect(state.getState()).toEqual({ count: 0 });
  });

  it("should get the current value", () => {
    const state = newLazyObservableState(() => ({ count: 0 }));
    expect(state.getState()).toEqual({ count: 0 });
  });

  it("should set the value and notify subscribers", () => {
    let emitCount = 0;
    const initial = { count: 0 };
    const state = newLazyObservableState(() => initial);

    const emit = () => ++emitCount;
    let unsub = state.subscribe(emit);

    expect(emitCount).toBe(0);

    expect(state.getState()).toEqual({ count: 0 });

    state.setState({ count: 1 });

    expect(emitCount).toBe(1);

    state.setState({ count: 2 });

    expect(emitCount).toBe(2);

    unsub();
    unsub();

    state.setState({ count: 3 });

    expect(emitCount).toBe(2);

    unsub = state.subscribe(emit);

    state.setState(initial);

    expect(emitCount).toBe(3);

    expect(state.getState()).toBe(initial);
  });

  it("should not notify subscribers if the value does not change", () => {
    let emits = 0;
    const state = newLazyObservableState(() => 11);
    state.subscribe(() => ++emits);
    state.setState(11); // Setting the same value
    expect(emits).toBe(0); // No notifications should have been sent
    state.setState(11); // Setting the same value
    expect(emits).toBe(0); // No notifications should have been sent
  });

  it("should reset", () => {
    let callCount = 0;
    const state = newLazyObservableState(() => {
      ++callCount;
      return { count: callCount };
    });

    expect(state.getState()).toEqual({ count: 1 });
    expect(callCount).toBe(1);

    state.update();

    expect(state.getState()).toEqual({ count: 2 });
    expect(callCount).toBe(2);

    state.update();

    expect(state.getState()).toEqual({ count: 3 });
    expect(callCount).toBe(3);
  });
});

describe("DerivedObservableState", () => {
  it("should recompute initial function when dependencies change", () => {
    let callCount = 0;
    let emits = 0;
    const dependency1 = new ObservableState("dependency1");
    const dependency2 = new ObservableState("dependency2");

    const state = newDerivedObservableState(
      () => (++callCount > 3 ? "FINAL" : `${dependency1} ${dependency2} computed`),
      { deps: [dependency1], weakDeps: [dependency2] },
    );

    state.subscribe(() => ++emits);

    expect(state.getState()).toBe("dependency1 dependency2 computed");

    expect(callCount).toBe(1);
    expect(emits).toBe(0);

    dependency1.setState("X1");

    expect(callCount).toBe(2);

    expect(state.getState()).toBe("X1 dependency2 computed");
    expect(emits).toBe(1);

    dependency2.setState("X2");

    expect(callCount).toBe(3);

    dependency2.setState("X2");

    expect(callCount).toBe(3);

    expect(state.getState()).toBe("X1 X2 computed");
    expect(emits).toBe(2);

    dependency1.setState("X3");

    expect(callCount).toBe(4);

    expect(state.getState()).toBe("FINAL");

    dependency1.setState("X4");

    expect(callCount).toBe(5);

    expect(state.getState()).toBe("FINAL");

    expect(emits).toBe(3);
  });
});
