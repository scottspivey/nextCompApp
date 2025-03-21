import Navbar from "@/app/Components/Navbar";
import type { Metadata } from "next";
import "@/app/styles/globals.css";


export const metadata: Metadata = {
  title: "SC Worker's Compensation App",
  description: "SC Worker's Compensation App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}