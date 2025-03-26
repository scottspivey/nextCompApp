// app/layout.tsx
import { Metadata } from "next";
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import "@/app/styles/globals.css";

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
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}