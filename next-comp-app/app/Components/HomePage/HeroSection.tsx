// app/Components/HomePage/HeroSection.tsx

// Ensure 'use client' is present as we are using hooks (useRouter)
"use client";

// Import useRouter for navigation
import { useRouter } from 'next/navigation';
import { Button } from "@/app/Components/ui/button"; // Import the themed Button component

export default function HeroSection() {
  // Initialize the router
  const router = useRouter();

  return (
    // Add some vertical padding to the section
    <section className="text-center px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
      {/* Heading using theme foreground color */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
        SC Worker&apos;s Compensation Calculators
      </h1>
      {/* Subheading using theme muted foreground color */}
      <p className="text-lg md:text-xl mb-8 md:mb-10 max-w-3xl mx-auto text-muted-foreground">
        Professional-grade tools to accurately calculate South Carolina workers&apos; compensation benefits and values.
      </p>
      {/* Button group */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Primary CTA Button - Uses onClick for navigation */}
        <Button
          size="lg"
          onClick={() => router.push('/signup')} // Navigate on click
          // No asChild prop
        >
          Start Free Trial
        </Button>
        {/* Secondary CTA Button - Uses onClick for navigation */}
        <Button
          variant="secondary"
          size="lg"
          onClick={() => router.push('/Calculators')} // Navigate on click
          // No asChild prop
        >
          Explore Calculators
        </Button>
      </div>
    </section>
  );
}
