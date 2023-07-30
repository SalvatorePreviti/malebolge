export interface Shade {
  x10: string;
  x25: string;
  x50: string;
  x100: string;
  x200: string;
  x300: string;
  x400: string;
  x500: string;
  x600: string;
  x700: string;
  x800: string;
  x900: string;
  x999: string;
}

export const Shades = {
  neutral: {
    x10: "#F9F9FA",
    x25: "#FCFCFD",
    x50: "#F9FAFB",
    x100: "#F2F4F7",
    x200: "#E4E7EC",
    x300: "#D0D5DD",
    x400: "#98A2B3",
    x500: "#667085",
    x600: "#475467",
    x700: "#344054",
    x800: "#1D2939",
    x900: "#101828",
    x999: "#0A0F1A",
  },

  primary: {
    x10: "#F6F6FE",
    x25: "#FBFBFF",
    x50: "#F6F6FE",
    x100: "#ECECFD",
    x200: "#DEDEFF",
    x300: "#CCCCFA",
    x400: "#B7B7FF",
    x500: "#A0A0F5",
    x600: "#8080F2",
    x700: "#6358D4",
    x800: "#4B32C3",
    x900: "#341BAB",
    x999: "#2A0F9A",
  },

  indigo: {
    x10: "#F6F6FE",
    x50: "#e8eaf6",
    x100: "#c5cae9",
    x200: "#9fa8da",
    x300: "#7986cb",
    x400: "#5c6bc0",
    x500: "#3f51b5",
    x600: "#3949ab",
    x700: "#303f9f",
    x800: "#283593",
    x900: "#1a237e",
    x999: "#2A0F9A",

    a100: "#8c9eff",
    a200: "#536dfe",
    a400: "#3d5afe",
    a700: "#304ffe",
  },

  purple: {
    x50: "#f3e5f5",
    x100: "#e1bee7",
    x200: "#ce93d8",
    x300: "#ba68c8",
    x400: "#ab47bc",
    x500: "#9c27b0",
    x600: "#8e24aa",
    x700: "#7b1fa2",
    x800: "#6a1b9a",
    x900: "#4a148c",

    a100: "#ea80fc",
    a200: "#e040fb",
    a400: "#d500f9",
    a700: "#aa00ff",
  },

  deepPurple: {
    x50: "#ede7f6",
    x100: "#d1c4e9",
    x200: "#b39ddb",
    x300: "#9575cd",
    x400: "#7e57c2",
    x500: "#673ab7",
    x600: "#5e35b1",
    x700: "#512da8",
    x800: "#4527a0",
    x900: "#311b92",

    a100: "#b388ff",
    a200: "#7c4dff",
    a400: "#651fff",
    a700: "#6200ea",
  },

  yellow: {
    x10: "#FFFEF5",
    x25: "#FFFEF5",
    x50: "#fffde7",
    x100: "#fff9c4",
    x200: "#fff59d",
    x300: "#fff176",
    x400: "#ffee58",
    x500: "#ffeb3b",
    x600: "#fdd835",
    x700: "#fbc02d",
    x800: "#f9a825",
    x900: "#f57f17",
    x999: "#f57f17",

    a100: "#ffff8d",
    a200: "#ffff00",
    a400: "#ffea00",
    a700: "#ffd600",
  },

  amber: {
    x10: "#FFF9F5",
    x25: "#FFFCF5",
    x50: "#FFFAEB",
    x100: "#FEF0C7",
    x200: "#FEDF89",
    x300: "#FEC84B",
    x400: "#FDB022",
    x500: "#F79009",
    x600: "#DC6803",
    x700: "#B54708",
    x800: "#93370D",
    x900: "#7A2E0E",
    x999: "#6A2A0F",

    a100: "#ffd180",
    a200: "#ffab40",
    a400: "#ff9100",
    a700: "#ff6d00",
  },

  deepOrange: {
    x50: "#fbe9e7",
    x100: "#ffccbc",
    x200: "#ffab91",
    x300: "#ff8a65",
    x400: "#ff7043",
    x500: "#ff5722",
    x600: "#f4511e",
    x700: "#e64a19",
    x800: "#d84315",
    x900: "#bf360c",

    a100: "#ff9e80",
    a200: "#ff6e40",
    a400: "#ff3d00",
    a700: "#dd2c00",
  },

  lime: {
    x50: "#f9fbe7",
    x100: "#f0f4c3",
    x200: "#e6ee9c",
    x300: "#dce775",
    x400: "#d4e157",
    x500: "#cddc39",
    x600: "#c0ca33",
    x700: "#afb42b",
    x800: "#9e9d24",
    x900: "#827717",

    a100: "#f4ff81",
    a200: "#eeff41",
    a400: "#c6ff00",
    a700: "#aeea00",
  },

  green: {
    x10: "#F6FEF9",
    x25: "#F6FEF9",
    x50: "#ECFDF3",
    x100: "#D1FADF",
    x200: "#A6F4C5",
    x300: "#6CE9A6",
    x400: "#32D583",
    x500: "#12B76A",
    x600: "#039855",
    x700: "#027A48",
    x800: "#05603A",
    x900: "#054F31",
    x999: "#04482A",

    a100: "#b9f6ca",
    a200: "#69f0ae",
    a400: "#00e676",
    a700: "#00c853",
  },

  cyan: {
    x50: "#e0f7fa",
    x100: "#b2ebf2",
    x200: "#80deea",
    x300: "#4dd0e1",
    x400: "#26c6da",
    x500: "#00bcd4",
    x600: "#00acc1",
    x700: "#0097a7",
    x800: "#00838f",
    x900: "#006064",

    a100: "#84ffff",
    a200: "#18ffff",
    a400: "#00e5ff",
    a700: "#00b8d4",
  },

  teal: {
    x10: "#F6FEFE",
    x25: "#F6FEFE",
    x50: "#ECFDFD",
    x100: "#D1FAFA",
    x200: "#A6F4F4",
    x300: "#6CE9E9",
    x400: "#32D5D5",
    x500: "#12B7B7",
    x600: "#039898",
    x700: "#027A7A",
    x800: "#056060",
    x900: "#054F4F",
    x999: "#044848",

    a100: "#a7ffeb",
    a200: "#64ffda",
    a400: "#1de9b6",
    a700: "#00bfa5",
  },

  rose: {
    x10: "#FFF5F7",
    x25: "#FFF5F6",
    x50: "#FFF1F3",
    x100: "#FFE4E8",
    x200: "#FECDD6",
    x300: "#FEA3B4",
    x400: "#FD6F8E",
    x500: "#F63D68",
    x600: "#E31B54",
    x700: "#C01048",
    x800: "#A11043",
    x900: "#89123E",
    x999: "#6A1238",

    a100: "#ff80ab",
    a200: "#ff4081",
    a400: "#f50057",
    a700: "#c51162",
  },

  red: {
    x10: "#FFF5F5",
    x25: "#FFF5F5",
    x50: "#ffebee",
    x100: "#ffcdd2",
    x200: "#ef9a9a",
    x300: "#e57373",
    x400: "#ef5350",
    x500: "#f44336",
    x600: "#e53935",
    x700: "#d32f2f",
    x800: "#c62828",
    x900: "#b71c1c",
    x999: "#a01716",

    a100: "#ff8a80",
    a200: "#ff5252",
    a400: "#ff1744",
    a700: "#d50000",
  },

  blue: {
    x10: "#F6F6FE",
    x25: "#F6F6FE",
    x50: "#e3f2fd",
    x100: "#bbdefb",
    x200: "#90caf9",
    x300: "#64b5f6",
    x400: "#42a5f5",
    x500: "#2196f3",
    x600: "#1e88e5",
    x700: "#1976d2",
    x800: "#1565c0",
    x900: "#0d47a1",

    a100: "#82b1ff",
    a200: "#448aff",
    a400: "#2979ff",
    a700: "#2962ff",
  },

  azure: {
    x10: "#F5FAFE",
    x25: "#e1f5fe",
    x50: "#e1f5fe",
    x100: "#b3e5fc",
    x200: "#81d4fa",
    x300: "#4fc3f7",
    x400: "#29b6f6",
    x500: "#03a9f4",
    x600: "#039be5",
    x700: "#0288d1",
    x800: "#0277bd",
    x900: "#01579b",
    x999: "#014f8c",

    a100: "#80d8ff",
    a200: "#40c4ff",
    a400: "#00b0ff",
    a700: "#0091ea",
  },

  grey: {
    x10: "#F9F9FA",
    x25: "#F9F9FA",
    x50: "#fafafa",
    x100: "#f5f5f5",
    x200: "#eeeeee",
    x300: "#e0e0e0",
    x400: "#bdbdbd",
    x500: "#9e9e9e",
    x600: "#757575",
    x700: "#616161",
    x800: "#424242",
    x900: "#212121",
    x999: "#121212",

    a100: "#ffffff",
    a200: "#eeeeee",
    a400: "#bdbdbd",
    a700: "#616161",
  },

  payne: {
    x10: "#F6F6FE",
    x50: "#eceff1",
    x100: "#cfd8dc",
    x200: "#b0bec5",
    x300: "#90a4ae",
    x400: "#78909c",
    x500: "#607d8b",
    x600: "#546e7a",
    x700: "#455a64",
    x800: "#37474f",
    x900: "#263238",
    x999: "#162228",

    a100: "#cfd8dc",
    a200: "#b0bec5",
    a400: "#78909c",
    a700: "#455a64",
  },

  tuna: "#343541",

  black: "#000",
  white: "#fff",

  transparent: "rgba(0, 0, 0, 0)",
  fullBlack: "rgba(0, 0, 0, 1)",
  darkBlack: "rgba(0, 0, 0, 0.87)",
  lightBlack: "rgba(0, 0, 0, 0.54)",
  minBlack: "rgba(0, 0, 0, 0.26)",
  faintBlack: "rgba(0, 0, 0, 0.12)",
  fullWhite: "rgba(255, 255, 255, 1)",
  darkWhite: "rgba(255, 255, 255, 0.87)",
  lightWhite: "rgba(255, 255, 255, 0.54)",
};

export interface ShadeVariants {
  light: string;
  main: string;
  dark: string;
}

export const shadeVariants = (shade: Shade): ShadeVariants => ({
  light: shade.x100,
  main: shade.x500,
  dark: shade.x900,
});
