// This code is MIT license, see https://github.com/SalvatorePreviti/malebolge

import type { UnsafeAny } from "../core";
import { EMPTY_OBJECT } from "../core";

export interface DelayOptions {
  /** Signal used to abort the delay. */
  signal?: AbortSignal | null | undefined;

  /**
   * Indicates whether the process should continue to run as long as the timer exists.
   * This makes sense only when running in NodeJS, is unused in browser.
   * @default {false}
   */
  unref?: boolean | null | undefined;
}

export const delay = (ms: number, { signal, unref }: Readonly<DelayOptions> = EMPTY_OBJECT): Promise<void> => {
  return new Promise((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (signal) {
      if (signal.aborted) {
        reject(signal.reason);
        return;
      }

      const abort = () => {
        clearTimeout(timeout);
        reject(signal?.reason);
        signal = null;
        timeout = undefined;
      };

      timeout = setTimeout(() => {
        resolve();
        signal?.removeEventListener("abort", abort);
        signal = null;
        timeout = undefined;
      }, +ms);

      signal.addEventListener("abort", abort, { once: true });
    } else {
      timeout = setTimeout(resolve, +ms);
    }

    if (unref) {
      (timeout as UnsafeAny)?.unref();
    }
  });
};
