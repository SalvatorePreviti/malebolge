import { atom, atomInLocalStorage } from "@gravitas/atom";
import { clamp } from "@gravitas/math";

const DEFAULT_LEFT_BAR_WIDTH = 152;

export const atom_leftToolbarWidth = atomInLocalStorage({
  key: "leftBarWidth",
  atom: atom(() => DEFAULT_LEFT_BAR_WIDTH, {
    adjust(value) {
      return clamp(value, DEFAULT_LEFT_BAR_WIDTH, 1000);
    },
  }),
});
