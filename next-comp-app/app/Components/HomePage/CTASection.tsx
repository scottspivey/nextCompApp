// app/Components/HomePage/CTASection.tsx

import Link from "next/link";
import { Button } from "@/app/Components/ui/button"; // Import the themed Button component

export default function CTASection() {
  return (
    // Use primary background and foreground for a strong CTA
    <section className="bg-primary text-primary-foreground py-16 md:py-20 lg:py-24 px-4 md:px-8 rounded-lg text-center">
      {/* Use responsive text sizes */}
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Ready to Streamline Your Calculations?
      </h2>
      {/* Use responsive text sizes and ensure foreground color */}
      <p className="text-lg md:text-xl mb-8 md:mb-10 max-w-3xl mx-auto text-primary-foreground/90"> {/* Slightly muted foreground for paragraph */}
        Join attorneys and adjusters across South Carolina who trust our platform for accurate workers&apos; compensation calculations.
      </p>
      {/* Use themed Button component with asChild and Link */}
      <Button
        asChild
        // Use secondary variant for contrast against primary background
        variant="secondary"
        // Make button larger for CTA
        size="lg"
        className="shadow-lg" // Add optional shadow for more pop
      >
        <Link href="/signup">
          Start Your Free Trial Today!
        </Link>
      </Button>
    </section>
  );
}
