// app/Components/providers/theme-provider.tsx
"use client"; // This component must be a Client Component

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes"; // Import the props type

// Create and export your ThemeProvider component
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Pass all props (like attribute, defaultTheme, enableSystem, etc.)
  // directly to the NextThemesProvider.
  // Your layout.tsx already provides these:
  // attribute="class"
  // defaultTheme="system"
  // enableSystem
  // disableTransitionOnChange
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
