"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode } from "react";
import { appTheme } from "./theme";

// Client boundary for the theme: `appTheme` carries functions (spacing, palette helpers), so it
// can't be passed as a prop across the server/client edge. Creating and consuming it inside this
// module keeps `layout.tsx` a server component, which is what lets it export `metadata`.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
