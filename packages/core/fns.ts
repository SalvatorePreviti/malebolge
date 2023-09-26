export const fnVoid = (): void => {};

export const fnUndefined = (): undefined => {};

export const fnNull = (): null => null;

export const fnFalse = (): false => false;

export const fnTrue = (): true => true;

export const fnZero = (): 0 => 0;

export const fnOne = (): 1 => 1;

export const fnMinusOne = (): -1 => -1;

export const fnNaN = (): number => NaN;

export const fnInfinity = (): number => Infinity;

export const fnNegativeInfinity = (): number => -Infinity;

export const fnIdentity = <T>(x: T): T => x;

export const fnEmptyArray = <T = unknown>(): T[] => [];

export const fnEmptyObject = (): {} => ({});

export const fnEmptyString = (): "" => "";

export const fnEmptySet = <T = unknown>(): Set<T> => new Set();

export const fnEmptyMap = <K = unknown, V = unknown>(): Map<K, V> => new Map();
