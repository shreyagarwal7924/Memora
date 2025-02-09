import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// Color tokens
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        primary: {
          100: "#fbe9e7",
          200: "#ffccbc",
          300: "#ffab91",
          400: "#ff8a65",
          500: "#ff7043",
          600: "#f4511e",
          700: "#e64a19",
          800: "#d84315",
          900: "#bf360c"
        },
        grey: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#141414"
        },
        accent: {
          100: "#ffecb3",
          200: "#ffe082",
          300: "#ffd54f",
          400: "#ffca28",
          500: "#ffc107",
          600: "#ffb300",
          700: "#ffa000",
          800: "#ff8f00",
          900: "#ff6f00"
        },
        background: "#1F2A40",
        text: "#ffffff"
      }
    : {
        primary: {
          100: "#ff6f00",
          200: "#ff8f00",
          300: "#ffa000",
          400: "#ffb300",
          500: "#ffc107",
          600: "#ffca28",
          700: "#ffd54f",
          800: "#ffe082",
          900: "#ffecb3"
        },
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#e0e0e0"
        },
        accent: {
          100: "#bf360c",
          200: "#d84315",
          300: "#e64a19",
          400: "#f4511e",
          500: "#ff7043",
          600: "#ff8a65",
          700: "#ffab91",
          800: "#ffccbc",
          900: "#fbe9e7"
        },
        background: "#fcfcfc",
        text: "#141414"
      })
});

// MUI theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.primary[500]
            },
            secondary: {
              main: colors.accent[500]
            },
            background: {
              default: colors.background,
              paper: colors.primary[400]
            },
            text: {
              primary: colors.text,
              secondary: colors.grey[300]
            }
          }
        : {
            primary: {
              main: colors.primary[500]
            },
            secondary: {
              main: colors.accent[500]
            },
            background: {
              default: colors.background,
              paper: colors.primary[400]
            },
            text: {
              primary: colors.text,
              secondary: colors.grey[700]
            }
          })
    }
  };
};

// Context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {}
});

// Custom hook for using the theme
export const useMode = () => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light"))
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return [theme, colorMode];
};
