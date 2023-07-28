import { atom, atomInLocalStorage } from "@gravitas/atom";

export const atom_leftToolbarWidth = atomInLocalStorage({ key: "leftBarWidth", atom: atom(() => 300) });
