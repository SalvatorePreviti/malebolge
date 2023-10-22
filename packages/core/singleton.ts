// MIT license, https://github.com/SalvatorePreviti/malebolge

import { ClassFromThis } from "./objects";
import { NodeInspectSymbol } from "./symbols";

const _UNSET = Symbol("unset");

export class Singleton<T> extends ClassFromThis<() => T> {
  #instance: T | typeof _UNSET = _UNSET;

  public constructor(factory: ((this: Singleton<T>) => T) | undefined) {
    super(() => this.get());
    if (factory) {
      this.factory = factory;
    }
  }

  /** Returns true if the singleton instance has been created. */
  public get created(): boolean {
    return this.#instance !== _UNSET;
  }

  /**
   * Returns the singleton instance if it has been instantiated.
   * If it has not been instantiated, returns undefined.
   */
  public get instantiated(): T | undefined {
    const result = this.#instance;
    return result === _UNSET ? undefined : result;
  }

  /** Gets the singleton instance, and creates it if it has not been instantiated. */
  public get instance(): T {
    return this.get();
  }

  /** Sets the singleton instance. */
  public set instance(value: T) {
    this.set(value);
  }

  /** Gets the singleton instance, and creates it if it has not been instantiated. */
  public get(): T {
    let result = this.#instance;
    if (result === _UNSET) {
      result = this.factory();
      this.#instance = result;
    }
    return result;
  }

  /** Sets the singleton instance. */
  public set(value: T): void {
    this.#instance = value;
  }

  public toJSON?(): unknown {
    return this.get();
  }

  public override toString(): string {
    return String(this.get());
  }

  public override valueOf(): T {
    return this.get();
  }

  public [NodeInspectSymbol](): unknown {
    return this.get();
  }

  public factory(): T {
    throw new Error("Not implemented.");
  }
}
