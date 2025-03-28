// app/page.tsx
import HeroSection from "./Components/HomePage/HeroSection";
import FeaturedCalculators from "./Components/HomePage/FeaturedCalculators";
import BenefitsSection from "./Components/HomePage/BenefitsSection";
import TestimonialsSection from "./Components/HomePage/TestimonialsSection";
import CTASection from "./Components/HomePage/CTASection";
import HowItWorksSection from "./Components/HomePage/HowItWorksSection";
import FAQSection from "./Components/HomePage/FAQSection";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 py-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Calculators Section */}
      <FeaturedCalculators />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}