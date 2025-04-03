// app/page.tsx
import { Metadata } from "next";
// Updated imports to use absolute paths assuming '@/' points to the root directory
import HeroSection from "@/app/Components/HomePage/HeroSection";
import FeaturedCalculators from "@/app/Components/HomePage/FeaturedCalculators";
import BenefitsSection from "@/app/Components/HomePage/BenefitsSection";
import TestimonialsSection from "@/app/Components/HomePage/TestimonialsSection";
import CTASection from "@/app/Components/HomePage/CTASection";
import HowItWorksSection from "@/app/Components/HomePage/HowItWorksSection";
import FAQSection from "@/app/Components/HomePage/FAQSection";
import NewsletterSignup from "@/app/Components/HomePage/NewsletterSignup";
import TrustedBy from "@/app/Components/HomePage/TrustedBy";
import FeaturesCallout from "@/app/Components/HomePage/FeaturesCallout";
// no longer used 
// import KeyFeatures from "@/app/Components/HomePage/KeyFeatures";

export const metadata: Metadata = {
  title: "SC Worker's Compensation App | Professional Calculators for Comp Claims",
  description: "Professional-grade calculators specifically designed for South Carolina workers' compensation claims. Save time and ensure accuracy with our specialized tools.",
};

export default function HomePage() {
  return (
    // Apply base background color and consistent vertical spacing/padding
    <main className="flex flex-col gap-16 md:gap-20 lg:gap-24 py-8 md:py-12 bg-background">

      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <HeroSection />
      </div>

      {/* Trusted By Section (Assuming this component handles its own background/styling) */}
      <TrustedBy />

      {/* Featured Calculators Section */}
      <div className="container mx-auto px-4">
        <FeaturedCalculators />
      </div>

      {/* Key Features Section (Assuming this component handles its own background/styling) */}
      {/* Alternating background example: */}
      {/* <div className="bg-muted py-16 md:py-20">
           <div className="container mx-auto px-4"> */}
            <FeaturesCallout />
      {/* </div>
         </div> */}


      {/* Benefits Section */}
      <div className="container mx-auto px-4">
        <BenefitsSection />
      </div>

      {/* How It Works Section - Use muted background */}
      <div className="bg-muted py-12 md:py-16 rounded-lg"> {/* Apply theme color, padding, optional rounding */}
        <div className="container mx-auto px-4">
            <HowItWorksSection />
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4">
        <TestimonialsSection />
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4">
        <FAQSection />
      </div>

      {/* Newsletter Signup - Use muted background */}
       <div className="bg-muted py-12 md:py-16 rounded-lg">
          <div className="container mx-auto px-4">
            <NewsletterSignup />
          </div>
       </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4">
        <CTASection />
      </div>

      {/* Latest Updates Section */}
      <div className="container mx-auto px-4 pb-16">
        {/* Use card styling for the section wrapper */}
        <div className="bg-card text-card-foreground p-6 md:p-8 rounded-lg shadow-sm border border-border">
          {/* Use theme text color */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Update Card 1 */}
            <div className="border border-border rounded-lg p-6 bg-background"> {/* Use background or keep card color */}
              {/* Use primary theme for calculator updates badge */}
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                Calculator Update
              </span>
              {/* Use theme text colors */}
              <h3 className="text-lg font-semibold text-foreground mt-2 mb-3">
                2025 Compensation Rates Now Available
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                Our calculators now include the official 2025 maximum compensation rates
                released by the SC Workers&apos; Compensation Commission.
              </p>
              <p className="text-xs text-muted-foreground/80">April 2, 2025</p>
            </div>

            {/* Update Card 2 */}
            <div className="border border-border rounded-lg p-6 bg-background">
               {/* Use secondary theme for new features badge */}
               {/* Note: Teal theme's secondary is light gray, might want a different color like green? */}
               {/* Using secondary for theme consistency: */}
              <span className="text-xs font-medium text-secondary-foreground bg-secondary px-2 py-1 rounded-full">
                New Feature
              </span>
              {/* Or using a hardcoded green for visual distinction: */}
              {/* <span className="text-xs font-medium text-emerald-800 bg-emerald-100 dark:text-emerald-100 dark:bg-emerald-900 px-2 py-1 rounded-full">
                New Feature
              </span> */}
              <h3 className="text-lg font-semibold text-foreground mt-2 mb-3">
                Export to PDF and Excel
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                Professional and Enterprise subscribers can now export calculation
                results in PDF and Excel formats with custom branding.
              </p>
              <p className="text-xs text-muted-foreground/80">March 15, 2025</p>
            </div>

            {/* Update Card 3 */}
            <div className="border border-border rounded-lg p-6 bg-background">
              {/* Use muted theme for legal updates badge */}
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Legal Update
              </span>
              <h3 className="text-lg font-semibold text-foreground mt-2 mb-3">
                SC Supreme Court Decision on Compensation Calculations
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                Recent ruling clarifies wage calculation methods for seasonal workers.
                Our calculators have been updated accordingly.
              </p>
              <p className="text-xs text-muted-foreground/80">February 28, 2025</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
