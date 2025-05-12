// app/layout.tsx
import "@/app/styles/globals.css"; // User's global CSS import
import type { Metadata } from "next"; // Keep 'type' for Metadata import
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import { Toaster } from "@/app/Components/ui/toaster";
import { ThemeProvider } from "@/app/Components/providers/theme-provider"; // User's ThemeProvider
import NextAuthProvider from "@/app/Components/providers/NextAuthProvider"; // Import NextAuthProvider

// User's detailed metadata
export const metadata: Metadata = {
  title: {
    template: '%s | SC Worker\'s Compensation App',
    default: 'SC Worker\'s Compensation App',
  },
  description: "Professional tools for accurate South Carolina workers' compensation calculations and benefit assessments.",
  keywords: ["workers compensation", "South Carolina", "calculator", "legal tools", "compensation rate"],
  authors: [{ name: "SC Workers' Comp App Team" }],
  creator: "SC Workers' Comp App",
  publisher: "SC Workers' Comp App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add suppressHydrationWarning if using next-themes (which your ThemeProvider likely is)
    <html lang="en" className="h-full" suppressHydrationWarning>
      {/*
        If you were using a font like Inter from next/font/google,
        you would apply its className to the body or html tag.
        Example: <body className={`${inter.className} flex flex-col min-h-screen`}>
        Assuming your font setup is handled within globals.css or Tailwind config.
      */}
      <body className="flex flex-col min-h-screen">
        {/* ThemeProvider wraps everything to provide theme context */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* NextAuthProvider wraps the parts of the app that need session context,
              placed inside ThemeProvider so auth-related UI also gets themed. */}
          <NextAuthProvider>
            <Navbar />
            {/* Toaster is often placed here so it's within all provider contexts */}
            <Toaster />
            <main className="flex-grow">{children}</main>
            <Footer />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
