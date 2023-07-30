import { Shades, shadeVariants } from "./shades";

export const ThemeShades = {
  primary: Shades.indigo,
  neutral: Shades.neutral,
  error: Shades.rose,
  warning: Shades.orange,
  info: Shades.teal,
  success: Shades.green,
};

export const ThemeColors = {
  primary: shadeVariants(ThemeShades.primary),
  neutral: shadeVariants(ThemeShades.neutral),
  error: shadeVariants(ThemeShades.error),
  warning: shadeVariants(ThemeShades.warning),
  info: shadeVariants(ThemeShades.info),
  success: shadeVariants(ThemeShades.success),

  text: ThemeShades.primary.x300,
  bodyBg: ThemeShades.neutral.x900,
  heading: ThemeShades.primary.x10,
  muted: ThemeShades.primary.x400,
  link: ThemeShades.primary.x500,
  border: ThemeShades.neutral.x800,
  divider: ThemeShades.neutral.x700,
  outline: ThemeShades.neutral.x600,
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
      bg: ThemeShades.neutral.x50,
      main: ThemeShades.neutral.x800,
      border: ThemeShades.neutral.x50,
      hover: {
        bg: ThemeShades.neutral.x100,
        main: ThemeShades.neutral.x800,
        border: ThemeShades.neutral.x100,
      },
      disabled: {
        bg: ThemeShades.neutral.x100,
        main: ThemeShades.neutral.x50,
        border: ThemeShades.neutral.x100,
      },
    },
  },
};
