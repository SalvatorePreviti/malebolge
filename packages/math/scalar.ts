const { sqrt } = /* #__PURE__ */ Math;

export const abs = /* #__PURE__ */ (value: number) => (value < 0 ? -value : value);

export const max = /* #__PURE__ */ (a: number, b: number) => (a > b ? a : b);

export const min = /* #__PURE__ */ (a: number, b: number) => (a < b ? a : b);

export const clamp = /* #__PURE__ */ (value: number, minValue: number = 0, maxValue: number = 1) =>
  value < minValue ? minValue : value > maxValue ? maxValue : value;

export const sqr = /* #__PURE__ */ (value: number) => value * value;

export const sqrHypot2 = /* #__PURE__ */ (x: number, y: number) => x * x + y * y;

export const sqrHypot3 = /* #__PURE__ */ (x: number, y: number, z: number) => x * x + y * y + z * z;

export const sqrHypot4 = /* #__PURE__ */ (x: number, y: number, z: number, w: number) => x * x + y * y + z * z + w * w;

export const hypot2 = /* #__PURE__ */ (x: number, y: number) => sqrt(x * x + y * y);

export const hypot3 = /* #__PURE__ */ (x: number, y: number, z: number) => sqrt(x * x + y * y + z * z);

export const hypot4 = /* #__PURE__ */ (x: number, y: number, z: number, w: number) =>
  sqrt(x * x + y * y + z * z + w * w);
