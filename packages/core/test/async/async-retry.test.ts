import type { AsyncRetryErrorHandler } from "../../async/async-retry";
import { asyncRetry } from "../../async/async-retry";
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
    const onError: AsyncRetryErrorHandler = (error, attempt, attempts) => {
      onErrorCalls.push({ error: error as Error, attempt, attempts });
    };
    let failCount = 0;
    await expect(
      asyncRetry(() => Promise.reject(new Error(`failed${failCount++}`)), {
        attempts: 3,
        onCatch: onError,
        minTimeout: 1,
        maxTimeout: 9,
      }),
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
