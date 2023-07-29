import { Shades, shadeVariants } from "./shades";

export const ThemeShades = {
  primary: Shades.indigo,
  secondary: Shades.neutral,
  error: Shades.rose,
  warning: Shades.orange,
  info: Shades.teal,
  success: Shades.green,
};

const ThemeShadeVariants = {
  primary: shadeVariants(ThemeShades.primary),
  secondary: shadeVariants(ThemeShades.secondary),
  error: shadeVariants(ThemeShades.error),
  warning: shadeVariants(ThemeShades.warning),
  info: shadeVariants(ThemeShades.info),
  success: shadeVariants(ThemeShades.success),
};

export const ThemeColors = {
  ...ThemeShadeVariants,

  text: ThemeShades.primary.x300,
  bodyBg: ThemeShades.secondary.x900,
  heading: ThemeShades.primary.x10,
  muted: ThemeShades.primary.x400,
  link: ThemeShades.primary.x500,
  border: ThemeShades.secondary.x800,
  divider: ThemeShades.secondary.x700,
  outline: ThemeShades.secondary.x600,
  button: {
    primary: {
      bg: ThemeShades.primary.x500,
      main: ThemeShades.primary.x10,
      border: ThemeShades.primary.x500,
      hover: {
        bg: ThemeShades.primary.x600,
        main: ThemeShades.primary.x10,
        border: ThemeShades.primary.x600,
      },
      disabled: {
        bg: ThemeShades.primary.x100,
        main: ThemeShades.primary.x50,
        border: ThemeShades.primary.x100,
      },
    },
    secondary: {
      bg: ThemeShades.secondary.x50,
      main: ThemeShades.secondary.x800,
      border: ThemeShades.secondary.x50,
      hover: {
        bg: ThemeShades.secondary.x100,
        main: ThemeShades.secondary.x800,
        border: ThemeShades.secondary.x100,
      },
      disabled: {
        bg: ThemeShades.secondary.x100,
        main: ThemeShades.secondary.x50,
        border: ThemeShades.secondary.x100,
      },
    },
  },
};