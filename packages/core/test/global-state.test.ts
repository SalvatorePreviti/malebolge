import { describe, expect, it } from "vitest";
import type { ReadonlyGlobalState, GlobalStateStore } from "../global-state";
import {
  newGlobalState,
  globalStaticStore,
  UNSET,
  LocalGlobalStateStore,
  newReadonlyGlobalState,
} from "../global-state";

describe("GlobalState", () => {
  it("should initialize with the initial value", () => {
    const globalState = newGlobalState({ count: 0 });
    expect(globalState.value).toEqual({ count: 0 });
  });

  it("should get the current value", () => {
    const globalState = newGlobalState({ count: 0 });
    expect(globalState.get()).toEqual({ count: 0 });
  });

  it("allow using functions", () => {
    const fn = () => 3;
    const globalState = newGlobalState(() => fn);
    expect(globalState.get()).toBe(fn);
  });

  it("should set the value and notify subscribers", () => {
    let emitCount = 0;
    const initial = { count: 0 };
    const globalState = newGlobalState(initial);

    const emit = (x: ReadonlyGlobalState<unknown>) => {
      ++emitCount;
      expect(x).toBe(globalState);
    };

    let unsub = globalState.sub(emit);

    expect(emitCount).toBe(0);

    expect(globalState.get()).toEqual({ count: 0 });

    globalState.set({ count: 1 });

    expect(emitCount).toBe(1);

    globalState.set({ count: 2 });

    expect(emitCount).toBe(2);

    unsub();
    unsub();

    globalState.set({ count: 3 });

    expect(emitCount).toBe(2);

    unsub = globalState.sub(emit);

    globalState.reset();

    expect(emitCount).toBe(3);

    expect(globalState.get()).toBe(initial);
  });

  it("should not notify subscribers if the value does not change", () => {
    const values: any[] = [];
    const globalState = newGlobalState(11);

    globalState.sub((value) => {
      values.push(value);
    });

    globalState.set(11); // Setting the same value

    expect(values).toEqual([]); // No notifications should have been sent
  });

  it("should call initial function only once", () => {
    let callCount = 0;
    const globalState = newGlobalState(() => {
      ++callCount;
      return "initial";
    });

    expect(globalState.value).toBe("initial");

    expect(callCount).toBe(1);

    globalState.set("new value");

    expect(callCount).toBe(1);
  });

  it("should recompute initial function when dependencies change", () => {
    let callCount = 0;
    const dependency = newGlobalState("dependency");

    const globalState = newGlobalState(() => {
      ++callCount;
      return `${dependency.value} computed`;
    }, [dependency]);

    expect(globalState.value).toBe("dependency computed");

    expect(callCount).toBe(1);

    dependency.set("new dependency");

    expect(globalState.value).toBe("new dependency computed");

    expect(callCount).toBe(2);
  });

  describe("initial property", () => {
    it("should be false when the initial value is used", () => {
      const globalState = newGlobalState("initial");
      expect(globalState.initial).toBe(true);
      expect(globalState.value).toBe("initial");
      expect(globalState.initial).toBe(false);
    });

    it("should be true when the initial value is not used", () => {
      const globalState = newGlobalState("initial");
      globalState.set("new value");
      expect(globalState.initial).toBe(true);
      expect(globalState.value).toBe("new value");
      expect(globalState.initial).toBe(true);
    });

    it("should be true when invoking the initial function", () => {
      let callCount = 0;
      const globalState = newGlobalState((state) => {
        expect(state).toBe(globalState);
        expect(globalState.initial).toBe(true);
        ++callCount;
        return "initial";
      });
      expect(globalState.value).toBe("initial");
      expect(callCount).toBe(1);
      expect(globalState.initial).toBe(false);
    });
  });
});

describe("ReadonlyGlobalState", () => {
  it("should expose a get that when invoked returns the current value", () => {
    let getterCount = 0;
    let eventCallCount = 0;
    const globalState = newReadonlyGlobalState(() => (getterCount < 3 ? ++getterCount : 3));
    globalState.sub(() => {
      ++eventCallCount;
    });
    expect(globalState.get()).toBe(1);
    expect(eventCallCount).toBe(0);
    expect(globalState.get()).toBe(2);
    expect(eventCallCount).toBe(1);
    expect(globalState.get()).toBe(3);
    expect(eventCallCount).toBe(2);
    expect(globalState.get()).toBe(3);
    expect(eventCallCount).toBe(2);
  });
});

describe("GlobalStateStore", () => {
  it("should store and retrieve values", () => {
    let initialCallCount = 0;
    const globalState = newGlobalState(() => {
      ++initialCallCount;
      return "initial";
    });

    const store: GlobalStateStore = globalStaticStore;

    expect(store.getValue(globalState)).toEqual(UNSET);

    expect(globalState.value).toBe("initial");

    expect(store.getValue(globalState)).toBe("initial");

    store.setValue(globalState, "new value");

    const retrievedValue = store.getValue(globalState);
    expect(retrievedValue).toBe("new value");

    expect(globalState.value).toBe("new value");

    expect(initialCallCount).toBe(1);

    // Try to reset

    globalState.reset();

    expect(globalState.get()).toBe("initial");

    expect(initialCallCount).toBe(2);
  });

  it("should return UNSET for non-existent values", () => {
    const globalState = newGlobalState("initial");

    const store: GlobalStateStore = globalStaticStore;

    const value = store.getValue(globalState);
    expect(value).toEqual(UNSET);
  });
});

describe("LocalGlobalStateStore", () => {
  it("should store values", () => {
    const store = new LocalGlobalStateStore();

    const stateA = newGlobalState("x");
    const stateB = newGlobalState("y");

    expect(store.getValue(stateA)).toBe(UNSET);
    store.setValue(stateA, "a");

    expect(store.getValue(stateB)).toBe(UNSET);
    store.setValue(stateB, "b");

    expect(store.getValue(stateA)).toBe("a");
    expect(store.getValue(stateB)).toBe("b");
  });

  it("should read properties from the parent if available", () => {
    const parent = new LocalGlobalStateStore();
    const child = new LocalGlobalStateStore(parent);

    const stateA = newGlobalState("x");
    const stateB = newGlobalState("y");

    parent.setValue(stateA, "a");
    child.setValue(stateB, "b");

    expect(child.getValue(stateA)).toBe("a");
    expect(child.getValue(stateB)).toBe("b");

    child.setValue(stateA, "c");

    expect(parent.getValue(stateA)).toBe("a");
    expect(parent.getValue(stateB)).toBe(UNSET);
    expect(child.getValue(stateA)).toBe("c");
    expect(child.getValue(stateB)).toBe("b");
  });
});
