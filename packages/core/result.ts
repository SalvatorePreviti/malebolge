type ResultOk<T> = { ok: true; value: T };

type ResultFail<E> = { ok: false; error: E };

export type Result<T = unknown, E = unknown> = ResultOk<T> | ResultFail<E>;

export const result_ok = /*@__PURE__*/ <T>(value: T): ResultOk<T> => ({ ok: true, value });

export const result_error = /*@__PURE__*/ <E = unknown>(error: E): ResultFail<E> => ({ ok: false, error });
