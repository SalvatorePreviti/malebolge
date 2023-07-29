import type { CSSProperties } from "@linaria/core";
import { css } from "@linaria/core";
import { ThemeColors } from "./colors";
import { XXX } from "./xxx";

const buildCssVars = (values: Record<string, unknown>): CSSProperties => {
  const stack = Object.entries(values).reverse();
  const target: CSSProperties = {};
  while (stack.length > 0) {
    const [k, v] = stack.pop()!;
    if (typeof v === "object" && v !== null) {
      for (const [a, b] of Array.isArray(v) ? v.map((item, i) => [i, item]) : Object.entries(v)) {
        const compositeKey = `${k}-${a}`;
        stack.push([a === "main" && !(compositeKey in target) ? k : compositeKey, b]);
      }
    } else if (typeof v === "string" || typeof v === "number") {
      target[`--${k}`] = v;
    }
  }
  return target;
};

const xThemeColors = {
  XXX,
  // ...ThemeColors,
};

const cssVars = buildCssVars({
  color: xThemeColors,
});

export const themeCssVariables = css`
  :global() {
    :root {
      ${cssVars}
    }
  }
`;
