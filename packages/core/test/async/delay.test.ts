import { describe, it, expect } from "vitest";
import { delay } from "../../async/delay";

describe("delay", () => {
  it("should resolve after the specified delay", async () => {
    await delay(1);
    expect(true).toBe(true);
  });

  it("should reject if the signal is aborted", async () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10);
    await expect(delay(1000, { signal: controller.signal })).rejects.toThrow("aborted");
  });
});
