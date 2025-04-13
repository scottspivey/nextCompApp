// components/providers/theme-provider.tsx
"use client"; // Theme provider needs to be a client component

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Ensure necessary props are passed, especially attribute="class"
  // and defaultTheme="system" enableSystem disableTransitionOnChange
  return (
    <NextThemesProvider
      attribute="class" // Apply theme changes via class on the html tag
      defaultTheme="system" // Default to system preference
      enableSystem // Enable system preference detection
      disableTransitionOnChange // Disable transitions on theme change
      {...props} // Pass through any other props
    >
      {children}
    </NextThemesProvider>
  );
}
