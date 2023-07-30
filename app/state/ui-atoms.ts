import { atom, atomInLocalStorage } from "@gravitas/atom";
import { clamp } from "@gravitas/math";

const DEFAULT_LEFT_BAR_WIDTH = 152;
const DEFAULT_MAIN_TOOLBAR_HEIGHT = 100;

export const atom_leftToolbarWidth = atomInLocalStorage({
  key: "leftToolbarWidth",
  atom: atom(() => DEFAULT_LEFT_BAR_WIDTH, {
    adjust(value) {
      return clamp(value, DEFAULT_LEFT_BAR_WIDTH, 600);
    },
  }),
});

export const atom_mainToolbarHeight = atomInLocalStorage({
  key: "mainToolbarHeight",
  atom: atom(() => DEFAULT_MAIN_TOOLBAR_HEIGHT, {
    adjust(value) {
      return clamp(value, 10, 500);
    },
  }),
});
