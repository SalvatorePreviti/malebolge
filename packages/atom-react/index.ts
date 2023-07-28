import { useRef, useSyncExternalStore } from "react";
import type { ConsumerProps, FC, ReactNode } from "react";

export interface ReactAtom<T> {
  readonly get: () => T;
  readonly sub: (listener: () => void) => () => void;
}

/**
 * Hook: Use an atom value in a react component.
 * @param atom The atom instance to use, created with atom or derivedAtom
 */
export const useAtom = <T>({ sub, get }: ReactAtom<T>): T => useSyncExternalStore(sub, get);

/**
 * Hook: Use an atom value in a react component, with a selector function.
 * @param atom The atom instance to use, created with atom or derivedAtom
 * @param selector A function that takes the atom value and returns a derived value
 * @returns The derived value
 * @example
 * const myAtom = atom(() => ({ x:1, y:2}));
 *
 * // this component will be re-rendered only when myAtom.x changes
 * export const MyComponent: FC = () => {
 *  const x = useAtomSelector(myAtom, (value) => value.x);
 *  return <div>x is: {x}</div>;
 * };
 */
export const useAtomSelector = <T, U>(atom: ReactAtom<T>, selector: (value: T) => U): U =>
  useSyncExternalStore(atom.sub, () => selector(atom.get()));

export interface AtomSelectorHook<U> {
  (): U;
  get: () => U;
}

/**
 * Higher order hook: Creates a react selector hook from an atom and a selector function.
 *
 * This can have better performance than useAtomSelector,
 * because it doesn't need to create a new function on every render.
 *
 * @param atom The atom instance to use, created with atom or derivedAtom
 * @param selector A function that takes the atom value and returns a derived value
 * @returns A react selector hook
 * @example
 * const myAtom = atom(() => ({ x:1, y:2}));
 *
 * const useMyAtomX = newAtomSelectorHook(myAtom, (value) => value.x);
 *
 * // this component will be re-rendered only when myAtom.x changes
 * export const MyComponent: FC = () => {
 *   const x = useMyAtomX();
 *   return <div>x is: {x}</div>;
 * };
 */
export const newAtomSelectorHook = <T, U>(
  { sub, get: getter }: ReactAtom<T>,
  selector: (value: T) => U,
): AtomSelectorHook<U> => {
  const get = () => selector(getter());
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const self = () => useSyncExternalStore(sub, get);
  self.get = get;
  return self;
};

export interface AtomConsumerProps<T> extends ConsumerProps<T> {
  atom: ReactAtom<T>;
}

export type AtomConsumer<T> = FC<AtomConsumerProps<T>>;

/**
 * Component: Use an atom value in a react component.
 * @param atom The atom instance to use, created with atom or derivedAtom
 *
 * @example
 *
 * const myCounterAtom = atom(() => 123);
 *
 * const MyComponent: FC = () => {
 *   return (
 *     <AtomConsumer atom={myCounterAtom}>
 *       {(count) => <div>counter is: {count}</div>}
 *     </AtomConsumer>
 *   );
 * };
 *
 * const MyWrapper: FC = () => {
 *   return (
 *     <div>
 *       <MyComponent />
 *       <button onClick={() => ++myCounterAtom.value}>count/button>
 *     </div>
 *   );
 * };
 */
export const AtomConsumer = <T>({ atom, children }: AtomConsumerProps<T>): ReactNode => children(useAtom(atom));

export interface AtomSelectorConsumerProps<T, U> extends ConsumerProps<U> {
  atom: ReactAtom<T>;
  selector: (value: T) => U;
}

export type AtomSelectorConsumer<T, U> = FC<AtomSelectorConsumerProps<T, U>>;

/**
 * Component: Use an atom value in a react component, with a selector function.
 *
 * @param atom The atom instance to use, created with atom or derivedAtom
 * @param selector A function that takes the atom value and returns a derived value
 * @returns The derived value
 *
 * @example
 * const myAtom = atom(() => ({ x:1, y:2}));
 *
 * // this component will be re-rendered only when myAtom.x changes
 * export const MyComponent: FC = () => {
 *   return (
 *     <AtomSelectorConsumer atom={myAtom} selector={(value) => value.x}>
 *       {(x) => <div>x is: {x}</div>}
 *     </AtomSelectorConsumer>
 *   );
 * };
 */
export const AtomSelectorConsumer = <T, U>({ atom, selector, children }: AtomSelectorConsumerProps<T, U>): ReactNode =>
  children(useAtomSelector(atom, selector));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnsafeAny = any;

export const useMemoedFn = <TFn extends (...args: UnsafeAny[]) => UnsafeAny>(fn: TFn): TFn => {
  const ref = useRef<UnsafeAny>(null);
  let memoedFn = ref.current;
  if (!memoedFn) {
    memoedFn = ((...args: UnsafeAny[]) => ref.current.fn(...args)) as UnsafeAny;
    memoedFn.fn = fn;
    ref.current = memoedFn;
  }
  return memoedFn;
};
