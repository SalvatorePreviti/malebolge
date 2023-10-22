// MIT license, https://github.com/SalvatorePreviti/malebolge

import { AbortError } from "@malebolge/core";
import { describe, expect, it } from "vitest";

describe("AbortError", () => {
  it("should return an AbortError instance with the provided message and options", () => {
    const message = "An error occurred";
    const options = { cause: "Unknown", ok: false, reason: "Invalid input" };
    const error = new AbortError(message, options);
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe(message);
    expect(error.cause).toBe(options.cause);
    expect(error.ok).toBe(options.ok);
    expect(error.reason).toBe(options.reason);
  });

  it("should return an AbortError instance with the provided Error instance and options", () => {
    const originalError = new Error("An error occurred");
    const options = { cause: "Unknown", ok: false, reason: "Invalid input" };
    const error = new AbortError(originalError, options);
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe("This operation was aborted");
    expect(error.cause).toBe("Unknown");
    expect(error.ok).toBe(options.ok);
    expect(error.reason).toBe(options.reason);
  });

  it("should return an AbortError instance with the default message and options", () => {
    const error = new AbortError();
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe("This operation was aborted");
    expect(error.cause).toBeUndefined();
    expect(error.ok).toBeUndefined();
    expect(error.reason).toBeUndefined();
  });

  it("should return an AbortError instance with the default message and provided cause", () => {
    const cause = new Error("An error occurred");
    const error = new AbortError(undefined, { cause });
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe("This operation was aborted");
    expect(error.cause).toBe(cause);
    expect(error.ok).toBeUndefined();
    expect(error.reason).toBeUndefined();
  });

  it("should return an AbortError instance with the default message and provided cause as message", () => {
    const cause = new Error("An error occurred");
    const error = new AbortError(cause);
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe("This operation was aborted");
    expect(error.cause).toBe(cause);
    expect(error.ok).toBeUndefined();
    expect(error.reason).toBeUndefined();
  });

  it("should return an AbortError instance with the default message and provided ok value", () => {
    const ok = true;
    const error = new AbortError(undefined, { ok });
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe("This operation was aborted");
    expect(error.cause).toBeUndefined();
    expect(error.ok).toBe(ok);
    expect(error.reason).toBeUndefined();
  });

  it("should return an AbortError instance with the default message and provided reason", () => {
    const reason = "Invalid input";
    const error = new AbortError(undefined, { reason });
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe("This operation was aborted");
    expect(error.cause).toBeUndefined();
    expect(error.ok).toBeUndefined();
    expect(error.reason).toBe(reason);
  });
});

describe("AbortError as a function", () => {
  it("should return an AbortError instance with the provided message and options", () => {
    const message = "An error occurred";
    const options = { cause: "Unknown", ok: false, reason: "Invalid input" };
    const error = AbortError(message, options);
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe(message);
    expect(error.cause).toBe(options.cause);
    expect(error.ok).toBe(options.ok);
    expect(error.reason).toBe(options.reason);
  });

  it("should return the provided AbortError instance with updated options", () => {
    const message = "An error occurred";
    const options = { cause: "Unknown", ok: false, reason: "Invalid input" };
    const originalError = new AbortError(message);
    const updatedError = AbortError(originalError, options);
    expect(updatedError).toBe(originalError);
    expect(updatedError.cause).toBe(options.cause);
    expect(updatedError.ok).toBe(options.ok);
    expect(updatedError.reason).toBe(options.reason);
  });

  it("should return a new AbortError instance with the provided message and default options", () => {
    const message = "An error occurred";
    const error = AbortError(message);
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe(message);
    expect(error.cause).toBeUndefined();
    expect(error.ok).toBeUndefined();
    expect(error.reason).toBeUndefined();
  });

  it("should return a new AbortError instance with the provided Error instance and default options", () => {
    const originalError = new Error("An error occurred");
    const error = AbortError(originalError);
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe("This operation was aborted");
    expect(error.cause).toBe(originalError);
    expect(error.ok).toBeUndefined();
    expect(error.reason).toBeUndefined();
  });

  it("should return a new AbortError instance with the provided null value and default options", () => {
    const error = AbortError(null);
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe("This operation was aborted");
    expect(error.cause).toBeUndefined();
    expect(error.ok).toBeUndefined();
    expect(error.reason).toBeUndefined();
  });

  it("should return a new AbortError instance with the provided undefined value and default options", () => {
    const error = AbortError(undefined);
    expect(error).toBeInstanceOf(AbortError);
    expect(error.message).toBe("This operation was aborted");
    expect(error.cause).toBeUndefined();
    expect(error.ok).toBeUndefined();
    expect(error.reason).toBeUndefined();
  });
});
