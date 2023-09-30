/** false | 0 | "" | null | undefined */
export type Falsy = false | 0 | "" | null | undefined;

/**
 * any should not be used explicitly but sometimes is needed to use any.
 * UnsafeAny will easily show up in pull requests and helps the developer
 * realize that is unsafe to use it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnsafeAny = any;
