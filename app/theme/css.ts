import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "./main.css";

import type { CSSObject } from "@emotion/styled";

import { ThemeColors } from "./colors";
import { ThemeTypo } from "./fonts";

export const buildCssVars = (values: Record<string, unknown>): CSSObject => {
  const stack = Object.entries(values).reverse();
  const target: CSSObject = {};
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

export const themeCssVars = buildCssVars({
  color: ThemeColors,
  font: ThemeTypo,
});
