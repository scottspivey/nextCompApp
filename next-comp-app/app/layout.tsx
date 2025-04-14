// app/layout.tsx
import "@/app/styles/globals.css";
import { Metadata } from "next";
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import { Toaster } from "@/app/Components/ui/toaster";

import { ThemeProvider } from "@/app/Components/providers/theme-provider"; // Import the ThemeProvider
// Import your font if needed
// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"] });

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Add suppressHydrationWarning if using next-themes
    <html lang="en" className="h-full" suppressHydrationWarning>
      {/* Add font className if needed: className={inter.className} */}
      <body className="flex flex-col min-h-screen">
        {/* Wrap content with ThemeProvider */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <Navbar />
          <Toaster />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
