import { createTheme } from "@mui/material/styles";

// DESIGN.md fixes a 4px base unit; MUI ships 8px, so every `spacing(n)` here is n*4px.
const BASE_SPACING_PX = 4;

const shared = {
  spacing: BASE_SPACING_PX,
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
};

export const appTheme = createTheme({
  ...shared,
  palette: {
    mode: "light",
  },
});

// The viewer is a separate theme rather than a `mode` toggle: the tray stays on the app's
// normal background while the viewer alone goes near-black, so both must render at once.
export const viewerTheme = createTheme({
  ...shared,
  palette: {
    mode: "dark",
    background: {
      default: "#0a0a0a",
      paper: "#0a0a0a",
    },
  },
});
