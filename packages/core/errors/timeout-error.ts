export class TimeoutError extends Error {
  public static readonly message = "Time out";
  public static readonly code = "ETIMEDOUT";

  public code = TimeoutError.code;
  public constructor(message: string = TimeoutError.message, options?: ErrorOptions) {
    super(message, options);
    this.name = "TimeoutError";
  }
}
