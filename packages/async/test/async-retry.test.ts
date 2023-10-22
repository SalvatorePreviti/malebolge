import type { AsyncRetryErrorHandler, AsyncRetryResolveHandler, AsyncRetryStartHandler } from "@malebolge/async";
import { asyncRetry } from "@malebolge/async";
import { describe, expect, it } from "vitest";

describe("asyncRetry", () => {
  it("should return the result of the function if it succeeds on the first attempt", async () => {
    const result = await asyncRetry(() => Promise.resolve("success"));
    expect(result).toBe("success");
  });

  it("should retry the function until it succeeds", async () => {
    let attempts = 0;
    const result = await asyncRetry(
      () => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error("failed"));
        }
        return Promise.resolve("success");
      },
      {
        minTimeout: 1,
        maxTimeout: 9,
      },
    );
    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });

  it("should throw an error if the function fails on all attempts", async () => {
    await expect(
      asyncRetry(() => Promise.reject(new Error("failed")), { attempts: 3, minTimeout: 1, maxTimeout: 9 }),
    ).rejects.toThrow("failed");
  });

  it("should call the onError callback if provided when the function fails", async () => {
    const onErrorCalls: {
      error: Error;
      attempt: number;
      attempts: number;
    }[] = [];
    const onStartCalls: { attempt: number; attempts: number }[] = [];
    const onResolveCalls: { value: unknown; attempt: number; attempts: number }[] = [];
    const onStart: AsyncRetryStartHandler = (attempt, attempts) => {
      onStartCalls.push({ attempt, attempts });
    };
    const onResolve: AsyncRetryResolveHandler = (value, attempt, attempts) => {
      onResolveCalls.push({ value, attempt, attempts });
    };
    const onReject: AsyncRetryErrorHandler = (error, attempt, attempts) => {
      onErrorCalls.push({ error: error as Error, attempt, attempts });
    };
    let failCount = 0;
    await expect(
      asyncRetry(
        () => {
          if (failCount < 3) {
            throw new Error(`failed${failCount++}`);
          }
          return 999;
        },
        {
          attempts: 3,
          onStart,
          onResolve,
          onReject,
          minTimeout: 1,
          maxTimeout: 9,
        },
      ),
    ).rejects.toThrow("failed");

    expect(onErrorCalls.length).toBe(3);

    expect(onErrorCalls[0]!.error.message).toBe("failed0");
    expect(onErrorCalls[1]!.error.message).toBe("failed1");
    expect(onErrorCalls[2]!.error.message).toBe("failed2");

    expect(onErrorCalls[0]!.attempt).toBe(0);
    expect(onErrorCalls[1]!.attempt).toBe(1);
    expect(onErrorCalls[2]!.attempt).toBe(2);

    expect(onErrorCalls[0]!.attempts).toBe(3);
    expect(onErrorCalls[1]!.attempts).toBe(3);
    expect(onErrorCalls[2]!.attempts).toBe(3);

    expect(onResolveCalls.length).toBe(0);
    expect(onStartCalls[0]!.attempt).toBe(0);
    expect(onStartCalls[1]!.attempt).toBe(1);
    expect(onStartCalls[2]!.attempt).toBe(2);

    expect(onStartCalls[0]!.attempts).toBe(3);
    expect(onStartCalls[1]!.attempts).toBe(3);
    expect(onStartCalls[2]!.attempts).toBe(3);

    await expect(
      asyncRetry(() => 999, {
        attempts: 3,
        onStart,
        onResolve,
        onReject,
        minTimeout: 1,
        maxTimeout: 2,
      }),
    ).resolves.toBe(999);

    expect(onErrorCalls.length).toBe(3);
    expect(onResolveCalls.length).toBe(1);
    expect(onStartCalls.length).toBe(4);

    expect(onResolveCalls[0]).toEqual({ value: 999, attempt: 0, attempts: 3 });
  });

  it("should stop retrying if the signal is aborted", async () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 1);
    await expect(
      asyncRetry(() => Promise.reject(new Error("failed")), {
        signal: controller.signal,
        minTimeout: 50,
        maxTimeout: 50,
      }),
    ).rejects.toThrow("This operation was aborted");
  });
});
