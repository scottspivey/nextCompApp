// app/Components/HomePage/FeaturedCalculators.tsx

// Make it a client component to use hooks
"use client";

import { useRouter } from 'next/navigation'; // Import useRouter
// Assuming featuredCalculators data is imported correctly
import { featuredCalculators } from "./data"; // Adjust path if needed
import { Button } from "@/app/Components/ui/button"; // Import the Button component


export default function FeaturedCalculators() {
  // Initialize router
  const router = useRouter();

  return (
    // Use muted background for the section, add vertical padding
    <section className="bg-muted py-16 md:py-20 lg:py-24 px-4 md:px-6 lg:px-8 rounded-lg">
      {/* Section Title - Use theme text color */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12 text-foreground">
        Featured Calculators
      </h2>
      {/* Grid for calculator cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {featuredCalculators.map((calc) => (
          // Apply card styling
          <div key={calc.id} className="bg-card border border-border rounded-lg shadow-sm p-6 flex flex-col transition-shadow hover:shadow-md">
            {/* Card Title - Use theme text color */}
            <h3 className="text-xl font-semibold mb-3 text-foreground">{calc.name}</h3>
            {/* Card Description - Use theme muted text color */}
            {/* Use flex-grow to push button to the bottom */}
            <p className="text-muted-foreground text-sm mb-4 flex-grow">{calc.description}</p>
            {/* Use Button with onClick for navigation */}
            <Button
              variant="default" // Or "outline" or "default" depending on desired emphasis
              size="sm"
              onClick={() => router.push(calc.path)}
              className="mt-auto" // Ensure button aligns nicely if description lengths vary slightly
            >
              Try Calculator
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
