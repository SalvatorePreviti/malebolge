import { describe, expect, it } from "vitest";
import { AsyncGate, asyncDelay } from "@malebolge/async";
import { fnUndefined } from "@malebolge/core";

describe("asyncGate", () => {
  it("constructs an unlocked lock", async () => {
    const gate = new AsyncGate(false);
    expect(gate.locked).toBe(false);
    await gate();
    gate.setLock(true);
    expect(gate.locked).toBe(true);
    gate.setLock(false);
    expect(gate.locked).toBe(false);
    await gate();
    expect(new AsyncGate(true).locked).toBe(true);
  });

  it("can lock and unlock and the promise resolves only when unlocked", async () => {
    const gate = new AsyncGate(false);
    expect(gate.locked).toBe(false);
    expect(await gate()).toBeUndefined();
    gate.setLock(true);
    expect(gate.locked).toBe(true);
    let unlocked = 0;
    const incrementUnlocked = () => ++unlocked;
    void gate().then(incrementUnlocked).catch(fnUndefined);
    expect(unlocked).toBe(0);
    await asyncDelay(1);
    gate.setLock(false);
    void gate().then(incrementUnlocked).catch(fnUndefined);
    await asyncDelay(1);
    gate.setLock(true);
    void gate().then(incrementUnlocked).catch(fnUndefined);
    gate.setLock(false);
    await asyncDelay(1);
    await gate();
    expect(unlocked).toBe(3);
  });

  it("does not trigger with false positives toggling lock", async () => {
    const gate = new AsyncGate(false);
    gate.setLock(true);
    gate.setLock(false);
    gate.setLock(true);
    let unlocked = 0;
    const promise = gate().then(() => ++unlocked);
    await asyncDelay(1);
    expect(unlocked).toBe(0);
    gate.setLock(false);
    gate.setLock(true);
    await asyncDelay(1);
    expect(unlocked).toBe(0);
    gate.setLock(false);
    expect(await promise).toBe(1);
    expect(unlocked).toBe(1);
  });

  it("allow passing a signal value while the gate is locked", async () => {
    const gate = new AsyncGate<string>(false);
    gate.setLock(true);
    let unlocked = 0;
    let raisedSignal: string | undefined = "";
    const onEnter = (signal: string | undefined) => {
      ++unlocked;
      raisedSignal = signal ? signal + unlocked : signal;
    };
    const promise = gate().then(onEnter);
    expect(unlocked).toBe(0);
    gate.setLock(false, "test");

    await promise;

    expect(unlocked).toBe(1);
    expect(raisedSignal).toBe("test1");

    gate.setLock(true);

    const promise2 = gate();

    gate.setLock(false);

    await promise2.then(onEnter);

    expect(unlocked).toBe(2);
    expect(raisedSignal).toBeUndefined();
  });

  it("invokes onLock and onUnlock", async () => {
    let locked = 0;
    let unlocked = 0;
    const gate = new AsyncGate(false, {
      onLock: () => ++locked,
      onUnlock: () => ++unlocked,
    });
    gate.setLock(true);
    expect(locked).toBe(1);
    expect(unlocked).toBe(0);
    gate.setLock(false);
    expect(locked).toBe(1);
    expect(unlocked).toBe(1);
    gate.setLock(true);
    gate.setLock(true);
    expect(locked).toBe(2);
    expect(unlocked).toBe(1);
    gate.setLock(false);
    gate.setLock(false);
    expect(unlocked).toBe(2);
  });

  it("allow using custom TLock type", async () => {
    enum MyLock {
      Unlocked = 0,
      Locked = 1,
      Special = 2,
    }

    const gate = new AsyncGate<string, MyLock>(MyLock.Unlocked);

    expect(gate.locked).toBe(MyLock.Unlocked);

    expect(gate.setLock(MyLock.Locked)).toBe(true);
    expect(gate.setLock(MyLock.Locked)).toBe(false);

    expect(gate.locked).toBe(MyLock.Locked);

    expect(gate.setLock(MyLock.Special)).toBe(true);
    expect(gate.setLock(MyLock.Special)).toBe(false);

    expect(gate.locked).toBe(MyLock.Special);

    const promise = gate.start();

    expect(gate.setLock(MyLock.Unlocked, "xxx")).toBe(true);
    expect(gate.setLock(MyLock.Unlocked)).toBe(false);

    expect(await promise).toBe("xxx");
  });
});
