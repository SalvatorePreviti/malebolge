import { describe, expect, it } from "vitest";
import { asyncGate_new } from "../../async/async-gate";
import { fnUndefined } from "../../core/fns";
import { delay } from "../../async/delay";

describe("asyncGate", () => {
  it("constructs an unlocked lock", async () => {
    const gate = asyncGate_new();
    expect(gate.locked).toBe(false);
    await gate();
    gate.lock();
    expect(gate.locked).toBe(true);
    gate.unlock();
    expect(gate.locked).toBe(false);
    await gate();

    expect(asyncGate_new({ locked: true }).locked).toBe(true);
    expect(asyncGate_new({ locked: false }).locked).toBe(false);
  });

  it("can lock and unlock and the promise resolves only when unlocked", async () => {
    const gate = asyncGate_new();
    expect(gate.locked).toBe(false);
    expect(await gate()).toBeUndefined();
    gate.lock();
    expect(gate.locked).toBe(true);
    let unlocked = 0;
    const incrementUnlocked = () => ++unlocked;
    void gate().then(incrementUnlocked).catch(fnUndefined);
    expect(unlocked).toBe(0);
    await delay(1);
    gate.unlock();
    void gate().then(incrementUnlocked).catch(fnUndefined);
    await delay(1);
    gate.lock();
    void gate().then(incrementUnlocked).catch(fnUndefined);
    gate.unlock();
    await delay(1);
    await gate();
    expect(unlocked).toBe(3);
  });

  it("does not trigger with false positives toggling locked property", async () => {
    const gate = asyncGate_new();
    gate.lock();
    gate.unlock();
    gate.lock();
    let unlocked = 0;
    const promise = gate().then(() => ++unlocked);
    await delay(1);
    expect(unlocked).toBe(0);
    gate.unlock();
    gate.lock();
    await delay(1);
    expect(unlocked).toBe(0);
    gate.unlock();
    expect(await promise).toBe(1);
    expect(unlocked).toBe(1);
  });

  it("allow passing a signal value to unlock() while the gate is locked", async () => {
    const gate = asyncGate_new<string>();
    gate.lock();
    let unlocked = 0;
    let raisedSignal: string | undefined = "";
    const onEnter = (signal: string | undefined) => {
      ++unlocked;
      raisedSignal = signal ? signal + unlocked : signal;
    };
    const promise = gate().then(onEnter);
    expect(unlocked).toBe(0);
    gate.unlock("test");

    await promise;

    expect(unlocked).toBe(1);
    expect(raisedSignal).toBe("test1");

    gate.lock();

    const promise2 = gate();

    gate.unlock();

    await promise2.then(onEnter);

    expect(unlocked).toBe(2);
    expect(raisedSignal).toBeUndefined();
  });
});
