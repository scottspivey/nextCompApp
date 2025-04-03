// app/Calculators/layout.tsx
import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/app/Components/ui/button'; // Corrected import path
import { cn } from "@/lib/utils"; // Assuming you have this utility

export const metadata: Metadata = {
  title: 'Calculators | SC Worker\'s Compensation App',
  description: 'Professional calculators for South Carolina workers\' compensation claims, including AWW, commuted value, and indemnity calculators.',
};

interface CalculatorItem {
  id: string;
  name: string;
  description: string;
  path: string;
  premiumOnly?: boolean;
}

// Consider moving this data to a separate file (e.g., data/calculators.ts)
const calculators: CalculatorItem[] = [
  {
    id: "aww",
    name: "Average Weekly Wage",
    description: "Calculate the Average Weekly Wage and Compensation Rate based on earnings history.",
    path: "/Calculators/aww",
  },
  {
    id: "commuted",
    name: "Commuted Value",
    description: "Calculate present value of future compensation payments with court-approved discount rates.",
    path: "/Calculators/commuted",
  },
  {
    id: "indemnity",
    name: "Indemnity Benefits",
    description: "Calculate indemnity benefits for scheduled and non-scheduled injuries.",
    path: "/Calculators/indemnity",
    premiumOnly: true,
  },
  {
    id: "life-expectancy",
    name: "Life Expectancy",
    description: "Calculate remaining life expectancy for lifelong benefits.",
    path: "/Calculators/life-expectancy",
    premiumOnly: true,
  },
  {
    id: "hearing-loss",
    name: "Hearing Loss",
    description: "Calculate compensation for hearing loss claims.",
    path: "/Calculators/hearing-loss",
    premiumOnly: true,
  },
  {
    id: "uninsured-motion",
    name: "Uninsured Employer Motion",
    description: "Generate form for uninsured employer motions.",
    path: "/Calculators/uninsured-motion",
    premiumOnly: true,
  },
];

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Use theme background for the overall container
    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 bg-background min-h-screen">
      {/* Header Section */}
      <div className="mb-8 md:mb-12 pb-6 border-b border-border">
        {/* Use theme text colors */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Workers&apos; Compensation Calculators</h1>
        <p className="text-muted-foreground mb-6 max-w-3xl">
          Professional-grade calculators specifically designed for South Carolina workers&apos; compensation claims. Select a calculator below to begin.
        </p>
      </div>

      {/* Calculator Grid Section */}
      {/* Note: This layout shows *all* calculators. The CalculatorsPage component handles filtering. */}
      {/* This layout might be better suited for just wrapping {children} if the page handles the grid */}
      {/* However, keeping the grid here as per original code for styling example */}
      <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Available Calculators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculators.map((calc) => (
              <div
                key={calc.id}
                // Use theme card styling
                className={cn(
                    "bg-card rounded-lg border border-border shadow-sm overflow-hidden flex flex-col", // Use flex column
                    calc.premiumOnly && "border-t-4 border-primary" // Use primary border for premium
                )}
              >
                <div className="p-6 flex-grow"> {/* Allow content to grow */}
                  <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center justify-between">
                    <span>{calc.name}</span>
                    {/* Styled Premium Badge */}
                    {calc.premiumOnly && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        Premium
                      </span>
                    )}
                  </h3>
                  {/* Use theme muted text color */}
                  <p className="text-muted-foreground text-sm mb-4">{calc.description}</p>
                </div>
                {/* Footer with Button */}
                <div className="p-6 pt-0 mt-auto"> {/* Push button to bottom */}
                   {/* Use themed Button component with Link */}
                   {/* Link always goes to calculator path; access control happens on the target page */}
                  <Button
                    asChild
                    variant={calc.premiumOnly ? "secondary" : "default"} // Use secondary style for premium access button
                    size="sm" // Smaller button
                    className="w-full" // Make button full width
                  >
                    <Link href={calc.path}>
                      {calc.premiumOnly ? 'View Details' : 'Open Calculator'}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Content Area for Specific Calculator Page */}
      <div className="mt-8">
        {/* The actual page content (e.g., AwwCalculatorPage) will be rendered here */}
        {children}
      </div>
    </div>
  );
}
