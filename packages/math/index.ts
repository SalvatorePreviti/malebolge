export const max = /* #__PURE__ */ (a: number, b: number) => (a > b ? a : b);

export const min = /* #__PURE__ */ (a: number, b: number) => (a < b ? a : b);

export const clamp = /* #__PURE__ */ (value: number, minValue: number = 0, maxValue: number = 1) =>
  value < minValue ? minValue : value > maxValue ? maxValue : value;
