// app/page.tsx
import { Metadata } from "next";
import HeroSection from "./Components/HomePage/HeroSection";
import FeaturedCalculators from "./Components/HomePage/FeaturedCalculators";
import BenefitsSection from "./Components/HomePage/BenefitsSection";
import TestimonialsSection from "./Components/HomePage/TestimonialsSection";
import CTASection from "./Components/HomePage/CTASection";
import HowItWorksSection from "./Components/HomePage/HowItWorksSection";
import FAQSection from "./Components/HomePage/FAQSection";
import NewsletterSignup from "./Components/NewsletterSignup";
import TrustedBy from "./Components/TrustedBy";
import KeyFeatures from "./Components/KeyFeatures";

export const metadata: Metadata = {
  title: "SC Worker's Compensation App | Professional Calculators for Comp Claims",
  description: "Professional-grade calculators specifically designed for South Carolina workers' compensation claims. Save time and ensure accuracy with our specialized tools.",
};

export default function HomePage() {
  return (
    <main className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <HeroSection />
      </div>

      {/* Trusted By Section */}
      <TrustedBy />

      {/* Featured Calculators Section */}
      <div className="container mx-auto px-4">
        <FeaturedCalculators />
      </div>

      {/* Key Features Section */}
      <KeyFeatures />

      {/* Benefits Section */}
      <div className="container mx-auto px-4">
        <BenefitsSection />
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 bg-gray-50 py-12 rounded-lg">
        <HowItWorksSection />
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4">
        <TestimonialsSection />
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4">
        <FAQSection />
      </div>

      {/* Newsletter Signup */}
      <div className="container mx-auto px-4">
        <NewsletterSignup />
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4">
        <CTASection />
      </div>
      
      {/* Latest Updates Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Calculator Update
              </span>
              <h3 className="text-lg font-semibold mt-2 mb-3">
                2025 Compensation Rates Now Available
              </h3>
              <p className="text-gray-600 mb-3">
                Our calculators now include the official 2025 maximum compensation rates
                released by the SC Workers&apos; Compensation Commission.
              </p>
              <p className="text-sm text-gray-500">April 1, 2025</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                New Feature
              </span>
              <h3 className="text-lg font-semibold mt-2 mb-3">
                Export to PDF and Excel
              </h3>
              <p className="text-gray-600 mb-3">
                Professional and Enterprise subscribers can now export calculation 
                results in PDF and Excel formats with custom branding.
              </p>
              <p className="text-sm text-gray-500">March 15, 2025</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                Legal Update
              </span>
              <h3 className="text-lg font-semibold mt-2 mb-3">
                SC Supreme Court Decision on Compensation Calculations
              </h3>
              <p className="text-gray-600 mb-3">
                Recent ruling clarifies wage calculation methods for seasonal workers.
                Our calculators have been updated accordingly.
              </p>
              <p className="text-sm text-gray-500">February 28, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}