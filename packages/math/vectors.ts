import { abs, clamp, max, min } from "./scalar";

const { sqrt, floor, round, ceil, sin, cos } = /* #__PURE__ */ Math;

export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec2In {
  readonly x: number;
  readonly y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec3In {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Vec4In {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface QuatIn {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

export const vec2 = (x: number = 0, y: number = 0): Vec2 => ({ x, y });

export const vec3 = (x: number = 0, y: number = 0, z: number = 0): Vec3 => ({ x, y, z });

export const vec4 = (x: number = 0, y: number = 0, z: number = 0, w: number = 0): Vec4 => ({ x, y, z, w });

export const vec2_set = (out: Vec2, x: number, y: number): Vec2 => {
  out.x = x;
  out.y = y;
  return out;
};

export const vec3_set = (out: Vec3, x: number, y: number, z: number): Vec3 => {
  out.x = x;
  out.y = y;
  out.z = z;
  return out;
};

export const vec4_set = (out: Vec4, x: number, y: number, z: number, w: number): Vec4 => {
  out.x = x;
  out.y = y;
  out.z = z;
  out.w = w;
  return out;
};

export const vec2_copy = (out: Vec2, a: Vec2In): Vec2 => {
  out.x = a.x;
  out.y = a.y;
  return out;
};

export const vec3_copy = (out: Vec3, a: Vec3In): Vec3 => {
  out.x = a.x;
  out.y = a.y;
  out.z = a.z;
  return out;
};

export const vec4_copy = (out: Vec4, a: Vec4In): Vec4 => {
  out.x = a.x;
  out.y = a.y;
  out.z = a.z;
  out.w = a.w;
  return out;
};

export const vec2_add = (out: Vec2, a: Vec2In, b: Vec2In): Vec2 => {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  return out;
};

export const vec3_add = (out: Vec3, a: Vec3In, b: Vec3In): Vec3 => {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  out.z = a.z + b.z;
  return out;
};

export const vec4_add = (out: Vec4, a: Vec4In, b: Vec4In): Vec4 => {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  out.z = a.z + b.z;
  out.w = a.w + b.w;
  return out;
};

export const vec2_sub = (out: Vec2, a: Vec2In, b: Vec2In): Vec2 => {
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  return out;
};

export const vec3_sub = (out: Vec3, a: Vec3In, b: Vec3In): Vec3 => {
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  out.z = a.z - b.z;
  return out;
};

export const vec4_sub = (out: Vec4, a: Vec4In, b: Vec4In): Vec4 => {
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  out.z = a.z - b.z;
  out.w = a.w - b.w;
  return out;
};

export const vec2_mul = (out: Vec2, a: Vec2In, b: Vec2In): Vec2 => {
  out.x = a.x * b.x;
  out.y = a.y * b.y;
  return out;
};

export const vec3_mul = (out: Vec3, a: Vec3In, b: Vec3In): Vec3 => {
  out.x = a.x * b.x;
  out.y = a.y * b.y;
  out.z = a.z * b.z;
  return out;
};

export const vec4_mul = (out: Vec4, a: Vec4In, b: Vec4In): Vec4 => {
  out.x = a.x * b.x;
  out.y = a.y * b.y;
  out.z = a.z * b.z;
  out.w = a.w * b.w;
  return out;
};

export const vec2_div = (out: Vec2, a: Vec2In, b: Vec2In): Vec2 => {
  out.x = a.x / b.x;
  out.y = a.y / b.y;
  return out;
};

export const vec3_div = (out: Vec3, a: Vec3In, b: Vec3In): Vec3 => {
  out.x = a.x / b.x;
  out.y = a.y / b.y;
  out.z = a.z / b.z;
  return out;
};

export const vec4_div = (out: Vec4, a: Vec4In, b: Vec4In): Vec4 => {
  out.x = a.x / b.x;
  out.y = a.y / b.y;
  out.z = a.z / b.z;
  out.w = a.w / b.w;
  return out;
};

export const vec2_scale = (out: Vec2, a: Vec2In, b: number): Vec2 => {
  out.x = a.x * b;
  out.y = a.y * b;
  return out;
};

export const vec3_scale = (out: Vec3, a: Vec3In, b: number): Vec3 => {
  out.x = a.x * b;
  out.y = a.y * b;
  out.z = a.z * b;
  return out;
};

export const vec4_scale = (out: Vec4, a: Vec4In, b: number): Vec4 => {
  out.x = a.x * b;
  out.y = a.y * b;
  out.z = a.z * b;
  out.w = a.w * b;
  return out;
};

export const vec2_dot = (a: Vec2, b: Vec2In): number => a.x * b.x + a.y * b.y;

export const vec3_dot = (a: Vec3, b: Vec3In): number => a.x * b.x + a.y * b.y + a.z * b.z;

export const vec4_dot = (a: Vec4, b: Vec4In): number => a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;

export const vec2_length = ({ x, y }: Vec2In): number => Math.sqrt(x * x + y * y);

export const vec3_length = ({ x, y, z }: Vec3In): number => Math.sqrt(x * x + y * y + z * z);

export const vec4_length = ({ x, y, z, w }: Vec4In): number => Math.sqrt(x * x + y * y + z * z + w * w);

export const vec2_normalize = (out: Vec2, a: Vec2In): Vec2 => {
  const length = vec2_length(a);
  out.x = a.x / length;
  out.y = a.y / length;
  return out;
};

export const vec3_normalize = (out: Vec3, a: Vec3In): Vec3 => {
  const length = vec3_length(a);
  out.x = a.x / length;
  out.y = a.y / length;
  out.z = a.z / length;
  return out;
};

export const vec4_normalize = (out: Vec4, a: Vec4In): Vec4 => {
  const length = vec4_length(a);
  out.x = a.x / length;
  out.y = a.y / length;
  out.z = a.z / length;
  out.w = a.w / length;
  return out;
};

export const vec2_distance = ({ x, y }: Vec2In, b: Vec2In): number => {
  x -= b.x;
  y -= b.y;
  return sqrt(x * x + y * y);
};

export const vec3_distance = ({ x, y, z }: Vec3In, b: Vec3In): number => {
  x -= b.x;
  y -= b.y;
  z -= b.z;
  return sqrt(x * x + y * y + z * z);
};

export const vec4_distance = ({ x, y, z, w }: Vec4In, b: Vec4In): number => {
  x -= b.x;
  y -= b.y;
  z -= b.z;
  w -= b.w;
  return sqrt(x * x + y * y + z * z + w * w);
};

export const vec2_distanceSq = ({ x, y }: Vec2In, b: Vec2In): number => {
  x -= b.x;
  y -= b.y;
  return x * x + y * y;
};

export const vec3_distanceSq = ({ x, y, z }: Vec3In, b: Vec3In): number => {
  x -= b.x;
  y -= b.y;
  z -= b.z;
  return x * x + y * y + z * z;
};

export const vec4_distanceSq = ({ x, y, z, w }: Vec4In, b: Vec4In): number => {
  x -= b.x;
  y -= b.y;
  z -= b.z;
  w -= b.w;
  return x * x + y * y + z * z + w * w;
};

export const vec2_lerp = (out: Vec2, { x, y }: Vec2In, b: Vec2In, t: number): Vec2 => {
  out.x = x + t * (b.x - x);
  out.y = y + t * (b.y - y);
  return out;
};

export const vec3_lerp = (out: Vec3, { x, y, z }: Vec3In, b: Vec3In, t: number): Vec3 => {
  out.x = x + t * (b.x - x);
  out.y = y + t * (b.y - y);
  out.z = z + t * (b.z - z);
  return out;
};

export const vec4_lerp = (out: Vec4, { x, y, z, w }: Vec4In, b: Vec4In, t: number): Vec4 => {
  out.x = x + t * (b.x - x);
  out.y = y + t * (b.y - y);
  out.z = z + t * (b.z - z);
  out.w = w + t * (b.w - w);
  return out;
};

export const vec2_min = (out: Vec2, a: Vec2In, b: Vec2In): Vec2 => {
  out.x = min(a.x, b.x);
  out.y = min(a.y, b.y);
  return out;
};

export const vec3_min = (out: Vec3, a: Vec3In, b: Vec3In): Vec3 => {
  out.x = min(a.x, b.x);
  out.y = min(a.y, b.y);
  out.z = min(a.z, b.z);
  return out;
};

export const vec4_min = (out: Vec4, a: Vec4In, b: Vec4In): Vec4 => {
  out.x = min(a.x, b.x);
  out.y = min(a.y, b.y);
  out.z = min(a.z, b.z);
  out.w = min(a.w, b.w);
  return out;
};

export const vec2_max = (out: Vec2, a: Vec2In, b: Vec2In): Vec2 => {
  out.x = max(a.x, b.x);
  out.y = max(a.y, b.y);
  return out;
};

export const vec3_max = (out: Vec3, a: Vec3In, b: Vec3In): Vec3 => {
  out.x = max(a.x, b.x);
  out.y = max(a.y, b.y);
  out.z = max(a.z, b.z);
  return out;
};

export const vec4_max = (out: Vec4, a: Vec4In, b: Vec4In): Vec4 => {
  out.x = max(a.x, b.x);
  out.y = max(a.y, b.y);
  out.z = max(a.z, b.z);
  out.w = max(a.w, b.w);
  return out;
};

export const vec2_clamp = (out: Vec2, a: Vec2, minValue: Vec2In, maxValue: Vec2In): Vec2 => {
  out.x = clamp(a.x, minValue.x, maxValue.x);
  out.y = clamp(a.y, minValue.y, maxValue.y);
  return out;
};

export const vec3_clamp = (out: Vec3, a: Vec3, minValue: Vec3In, maxValue: Vec3In): Vec3 => {
  out.x = clamp(a.x, minValue.x, maxValue.x);
  out.y = clamp(a.y, minValue.y, maxValue.y);
  out.z = clamp(a.z, minValue.z, maxValue.z);
  return out;
};

export const vec4_clamp = (out: Vec4, a: Vec4, minValue: Vec4In, maxValue: Vec4In): Vec4 => {
  out.x = clamp(a.x, minValue.x, maxValue.x);
  out.y = clamp(a.y, minValue.y, maxValue.y);
  out.z = clamp(a.z, minValue.z, maxValue.z);
  out.w = clamp(a.w, minValue.w, maxValue.w);
  return out;
};

export const vec2_negate = (out: Vec2, { x, y }: Vec2In): Vec2 => {
  out.x = -x;
  out.y = -y;
  return out;
};

export const vec3_negate = (out: Vec3, { x, y, z }: Vec3In): Vec3 => {
  out.x = -x;
  out.y = -y;
  out.z = -z;
  return out;
};

export const vec4_negate = (out: Vec4, { x, y, z, w }: Vec4In): Vec4 => {
  out.x = -x;
  out.y = -y;
  out.z = -z;
  out.w = -w;
  return out;
};

export const vec2_inverse = (out: Vec2, { x, y }: Vec2In): Vec2 => {
  out.x = 1 / x;
  out.y = 1 / y;
  return out;
};

export const vec3_inverse = (out: Vec3, { x, y, z }: Vec3In): Vec3 => {
  out.x = 1 / x;
  out.y = 1 / y;
  out.z = 1 / z;
  return out;
};

export const vec4_inverse = (out: Vec4, { x, y, z, w }: Vec4In): Vec4 => {
  out.x = 1 / x;
  out.y = 1 / y;
  out.z = 1 / z;
  out.w = 1 / w;
  return out;
};

export const vec2_abs = (out: Vec2, { x, y }: Vec2In): Vec2 => {
  out.x = abs(x);
  out.y = abs(y);
  return out;
};

export const vec3_abs = (out: Vec3, { x, y, z }: Vec3In): Vec3 => {
  out.x = abs(x);
  out.y = abs(y);
  out.z = abs(z);
  return out;
};

export const vec4_abs = (out: Vec4, { x, y, z, w }: Vec4In): Vec4 => {
  out.x = abs(x);
  out.y = abs(y);
  out.z = abs(z);
  out.w = abs(w);
  return out;
};

export const vec2_floor = (out: Vec2, { x, y }: Vec2In): Vec2 => {
  out.x = floor(x);
  out.y = floor(y);
  return out;
};

export const vec3_floor = (out: Vec3, { x, y, z }: Vec3In): Vec3 => {
  out.x = floor(x);
  out.y = floor(y);
  out.z = floor(z);
  return out;
};

export const vec4_floor = (out: Vec4, { x, y, z, w }: Vec4In): Vec4 => {
  out.x = floor(x);
  out.y = floor(y);
  out.z = floor(z);
  out.w = floor(w);
  return out;
};

export const vec2_round = (out: Vec2, { x, y }: Vec2In): Vec2 => {
  out.x = round(x);
  out.y = round(y);
  return out;
};

export const vec3_round = (out: Vec3, { x, y, z }: Vec3In): Vec3 => {
  out.x = round(x);
  out.y = round(y);
  out.z = round(z);
  return out;
};

export const vec4_round = (out: Vec4, { x, y, z, w }: Vec4In): Vec4 => {
  out.x = round(x);
  out.y = round(y);
  out.z = round(z);
  out.w = round(w);
  return out;
};

export const vec2_ceil = (out: Vec2, { x, y }: Vec2In): Vec2 => {
  out.x = ceil(x);
  out.y = ceil(y);
  return out;
};

export const vec3_ceil = (out: Vec3, { x, y, z }: Vec3In): Vec3 => {
  out.x = ceil(x);
  out.y = ceil(y);
  out.z = ceil(z);
  return out;
};

export const vec4_ceil = (out: Vec4, { x, y, z, w }: Vec4In): Vec4 => {
  out.x = ceil(x);
  out.y = ceil(y);
  out.z = ceil(z);
  out.w = ceil(w);
  return out;
};

export const vec2_clampLength = (out: Vec2, a: Vec2In, minLength: number, maxLength: number): Vec2 => {
  const length = vec2_length(a);
  out.x = (a.x / length) * clamp(length, minLength, maxLength);
  out.y = (a.y / length) * clamp(length, minLength, maxLength);
  return out;
};

export const vec3_clampLength = (out: Vec3, a: Vec3In, minLength: number, maxLength: number): Vec3 => {
  const length = vec3_length(a);
  out.x = (a.x / length) * clamp(length, minLength, maxLength);
  out.y = (a.y / length) * clamp(length, minLength, maxLength);
  out.z = (a.z / length) * clamp(length, minLength, maxLength);
  return out;
};

export const vec4_clampLength = (out: Vec4, a: Vec4In, minLength: number, maxLength: number): Vec4 => {
  const length = vec4_length(a);
  out.x = (a.x / length) * clamp(length, minLength, maxLength);
  out.y = (a.y / length) * clamp(length, minLength, maxLength);
  out.z = (a.z / length) * clamp(length, minLength, maxLength);
  out.w = (a.w / length) * clamp(length, minLength, maxLength);
  return out;
};

export const vec2_clampLengthSq = (out: Vec2, a: Vec2In, minLength: number, maxLength: number): Vec2 => {
  const lengthSq = vec2_length(a);
  out.x = (a.x / lengthSq) * clamp(lengthSq, minLength, maxLength);
  out.y = (a.y / lengthSq) * clamp(lengthSq, minLength, maxLength);
  return out;
};

export const vec3_clampLengthSq = (out: Vec3, a: Vec3In, minLength: number, maxLength: number): Vec3 => {
  const lengthSq = vec3_length(a);
  out.x = (a.x / lengthSq) * clamp(lengthSq, minLength, maxLength);
  out.y = (a.y / lengthSq) * clamp(lengthSq, minLength, maxLength);
  out.z = (a.z / lengthSq) * clamp(lengthSq, minLength, maxLength);
  return out;
};

export const vec4_clampLengthSq = (out: Vec4, a: Vec4In, minLength: number, maxLength: number): Vec4 => {
  const lengthSq = vec4_length(a);
  out.x = (a.x / lengthSq) * clamp(lengthSq, minLength, maxLength);
  out.y = (a.y / lengthSq) * clamp(lengthSq, minLength, maxLength);
  out.z = (a.z / lengthSq) * clamp(lengthSq, minLength, maxLength);
  out.w = (a.w / lengthSq) * clamp(lengthSq, minLength, maxLength);
  return out;
};

export const vec2_mix = (out: Vec2, a: Vec2In, b: Vec2In, t: number): Vec2 => {
  out.x = a.x + t * (b.x - a.x);
  out.y = a.y + t * (b.y - a.y);
  return out;
};

export const vec3_mix = (out: Vec3, a: Vec3In, b: Vec3In, t: number): Vec3 => {
  out.x = a.x + t * (b.x - a.x);
  out.y = a.y + t * (b.y - a.y);
  out.z = a.z + t * (b.z - a.z);
  return out;
};

export const vec4_mix = (out: Vec4, a: Vec4In, b: Vec4In, t: number): Vec4 => {
  out.x = a.x + t * (b.x - a.x);
  out.y = a.y + t * (b.y - a.y);
  out.z = a.z + t * (b.z - a.z);
  out.w = a.w + t * (b.w - a.w);
  return out;
};

export const vec2_step = (out: Vec2, edge: number, { x, y }: Vec2In): Vec2 => {
  out.x = x < edge ? 0 : 1;
  out.y = y < edge ? 0 : 1;
  return out;
};

export const vec3_step = (out: Vec3, edge: number, { x, y, z }: Vec3In): Vec3 => {
  out.x = x < edge ? 0 : 1;
  out.y = y < edge ? 0 : 1;
  out.z = z < edge ? 0 : 1;
  return out;
};

export const vec4_step = (out: Vec4, edge: number, { x, y, z, w }: Vec4In): Vec4 => {
  out.x = x < edge ? 0 : 1;
  out.y = y < edge ? 0 : 1;
  out.z = z < edge ? 0 : 1;
  out.w = w < edge ? 0 : 1;
  return out;
};

export const vec2_reflect = (out: Vec2, { x, y }: Vec2In, { x: nx, y: ny }: Vec2In): Vec2 => {
  const dot = x * nx + y * ny;
  out.x = x - 2 * dot * nx;
  out.y = y - 2 * dot * ny;
  return out;
};

export const vec3_reflect = (out: Vec3, { x, y, z }: Vec3In, { x: nx, y: ny, z: nz }: Vec3In): Vec3 => {
  const dot = x * nx + y * ny + z * nz;
  out.x = x - 2 * dot * nx;
  out.y = y - 2 * dot * ny;
  out.z = z - 2 * dot * nz;
  return out;
};

export const vec4_reflect = (out: Vec4, { x, y, z, w }: Vec4In, { x: nx, y: ny, z: nz, w: nw }: Vec4In): Vec4 => {
  const dot = x * nx + y * ny + z * nz + w * nw;
  out.x = x - 2 * dot * nx;
  out.y = y - 2 * dot * ny;
  out.z = z - 2 * dot * nz;
  out.w = w - 2 * dot * nw;
  return out;
};

export const vec2_refract = (out: Vec2, { x, y }: Vec2In, { x: nx, y: ny }: Vec2In, eta: number): Vec2 => {
  const dot = x * nx + y * ny;
  const k = 1 - eta * eta * (1 - dot * dot);
  out.x = k < 0 ? 0 : eta * x - (eta * dot + sqrt(k)) * nx;
  out.y = k < 0 ? 0 : eta * y - (eta * dot + sqrt(k)) * ny;
  return out;
};

export const vec3_refract = (out: Vec3, { x, y, z }: Vec3In, { x: nx, y: ny, z: nz }: Vec3In, eta: number): Vec3 => {
  const dot = x * nx + y * ny + z * nz;
  const k = 1 - eta * eta * (1 - dot * dot);
  out.x = k < 0 ? 0 : eta * x - (eta * dot + sqrt(k)) * nx;
  out.y = k < 0 ? 0 : eta * y - (eta * dot + sqrt(k)) * ny;
  out.z = k < 0 ? 0 : eta * z - (eta * dot + sqrt(k)) * nz;
  return out;
};

export const vec4_refract = (
  out: Vec4,
  { x, y, z, w }: Vec4,
  { x: nx, y: ny, z: nz, w: nw }: Vec4,
  eta: number,
): Vec4 => {
  const dot = x * nx + y * ny + z * nz + w * nw;
  const k = 1 - eta * eta * (1 - dot * dot);
  out.x = k < 0 ? 0 : eta * x - (eta * dot + sqrt(k)) * nx;
  out.y = k < 0 ? 0 : eta * y - (eta * dot + sqrt(k)) * ny;
  out.z = k < 0 ? 0 : eta * z - (eta * dot + sqrt(k)) * nz;
  out.w = k < 0 ? 0 : eta * w - (eta * dot + sqrt(k)) * nw;
  return out;
};

export const vec2_rotate = (out: Vec2, { x, y }: Vec2In, angle: number): Vec2 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = x * c - y * s;
  out.y = x * s + y * c;
  return out;
};

export const vec3_rotate = (out: Vec3, { x, y, z }: Vec3In, angle: number, axis: Vec3In): Vec3 => {
  let x1 = axis.x;
  let y1 = axis.y;
  let z1 = axis.z;
  const invLen = 1 / sqrt(x1 * x1 + y1 * y1 + z1 * z1);
  if (!invLen) {
    return vec3_copy(out, { x, y, z });
  }
  x1 *= invLen;
  y1 *= invLen;
  z1 *= invLen;
  const c = cos(angle);
  const s = sin(angle);
  const t = 1 - c;
  const tx = t * x1;
  const ty = t * y1;
  out.x = x * (tx * x1 + c) + y * (tx * y1 - s * z1) + z * (tx * z1 + s * y1);
  out.y = x * (ty * x1 + s * z1) + y * (ty * y1 + c) + z * (ty * z1 - s * x1);
  out.z = x * (tx * z1 - s * y1) + y * (ty * z1 + s * x1) + z * (t * z1 * z1 + c);
  return out;
};

export const vec4_rotate = (out: Vec4, { x, y, z, w }: Vec4In, angle: number, axis: Vec3In): Vec4 => {
  let x1 = axis.x;
  let y1 = axis.y;
  let z1 = axis.z;
  const invLen = 1 / sqrt(x1 * x1 + y1 * y1 + z1 * z1);
  if (!invLen) {
    return vec4_copy(out, { x, y, z, w });
  }
  x1 *= invLen;
  y1 *= invLen;
  z1 *= invLen;
  const c = cos(angle);
  const s = sin(angle);
  const t = 1 - c;
  const tx = t * x1;
  const ty = t * y1;
  out.x = x * (tx * x1 + c) + y * (tx * y1 - s * z1) + z * (tx * z1 + s * y1);
  out.y = x * (ty * x1 + s * z1) + y * (ty * y1 + c) + z * (ty * z1 - s * x1);
  out.z = x * (tx * z1 - s * y1) + y * (ty * z1 + s * x1) + z * (t * z1 * z1 + c);
  out.w = w;
  return out;
};

export const vec2_transformQuat = (out: Vec2, { x, y }: Vec2In, { x: qx, y: qy, z: qz, w: qw }: QuatIn): Vec2 => {
  const ix = qw * x + qy * y;
  const iy = qw * y + qz * x;
  const iw = -qx * x - qy * y;
  out.x = ix * qw + iw * -qx + iy * -qz;
  out.y = iy * qw + iw * -qz + ix * -qy;
  return out;
};

export const vec3_transformQuat = (out: Vec3, { x, y, z }: Vec3In, { x: qx, y: qy, z: qz, w: qw }: QuatIn): Vec3 => {
  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;
  out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  return out;
};

export const vec4_transformQuat = (out: Vec4, v: Vec4, q: Quat): Vec4 => {
  vec3_transformQuat(out, v, q);
  out.w = v.w;
  return out;
};

export const vec2_rotateAround = (out: Vec2, { x, y }: Vec2In, { x: cx, y: cy }: Vec2In, angle: number): Vec2 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = cx + c * (x - cx) - s * (y - cy);
  out.y = cy + s * (x - cx) + c * (y - cy);
  return out;
};

export const vec3_rotateAround = (
  out: Vec3,
  { x, y, z }: Vec3In,
  { x: cx, y: cy, z: cz }: Vec3In,
  angle: number,
): Vec3 => {
  const c = cos(angle);
  const s = sin(angle);
  const x1 = x - cx;
  const y1 = y - cy;
  const z1 = z - cz;
  const x2 = x1 * c - z1 * s;
  const y2 = y1;
  const z2 = x1 * s + z1 * c;
  out.x = cx + x2 * c - y2 * s;
  out.y = cy + y2;
  out.z = cz + x2 * s + z2 * c;
  return out;
};

export const vec2_rotateX = (out: Vec2, { x, y }: Vec2In, angle: number): Vec2 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = x * c - y * s;
  out.y = x * s + y * c;
  return out;
};

export const vec3_rotateX = (out: Vec3, { x, y, z }: Vec3In, angle: number): Vec3 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = x * c - y * s;
  out.y = x * s + y * c;
  out.z = z;
  return out;
};

export const vec4_rotateX = (out: Vec4, { x, y, z, w }: Vec4In, angle: number): Vec4 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = x * c - y * s;
  out.y = x * s + y * c;
  out.z = z;
  out.w = w;
  return out;
};

export const vec2_rotateY = (out: Vec2, { x, y }: Vec2In, angle: number): Vec2 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = x * c + y * s;
  out.y = -x * s + y * c;
  return out;
};

export const vec3_rotateY = (out: Vec3, { x, y, z }: Vec3In, angle: number): Vec3 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = x * c + z * s;
  out.y = y;
  out.z = -x * s + z * c;
  return out;
};

export const vec4_rotateY = (out: Vec4, { x, y, z, w }: Vec4In, angle: number): Vec4 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = x * c + z * s;
  out.y = y;
  out.z = -x * s + z * c;
  out.w = w;
  return out;
};

export const vec2_rotateZ = (out: Vec2, { x, y }: Vec2In, angle: number): Vec2 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = x * c - y * s;
  out.y = x * s + y * c;
  return out;
};

export const vec3_rotateZ = (out: Vec3, { x, y, z }: Vec3In, angle: number): Vec3 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = x * c - y * s;
  out.y = x * s + y * c;
  out.z = z;
  return out;
};

export const vec4_rotateZ = (out: Vec4, { x, y, z, w }: Vec4In, angle: number): Vec4 => {
  const c = cos(angle);
  const s = sin(angle);
  out.x = x * c - y * s;
  out.y = x * s + y * c;
  out.z = z;
  out.w = w;
  return out;
};
