// app/page.tsx
import Link from "next/link";
import NewsletterSignup from "./Components/NewsletterSignup";
import KeyFeatures from "./Components/KeyFeatures";
import PricingPlans from "./Components/PricingPlans";
import TrustedBy from "./Components/TrustedBy";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 py-8">
      {/* Hero Section */}
      <section className="text-center px-4 md:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-700">
          SC Worker&apos;s Compensation Calculators
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-600">
          Professional-grade tools to accurately calculate South Carolina workers&apos; compensation benefits and values.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Start Free Trial
          </Link>
          <Link
            href="/Calculators"
            className="bg-gray-100 text-blue-600 font-semibold px-6 py-3 rounded-lg shadow border border-gray-300 hover:bg-gray-200 transition-colors"
          >
            Try Calculators
          </Link>
        </div>
      </section>

      {/* Trusted By Section */}
      <TrustedBy />

      {/* Featured Calculators Section */}
      <section className="bg-gray-50 py-10 px-4 md:px-6 lg:px-8 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Calculators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCalculators.map((calc) => (
            <div key={calc.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <h3 className="text-xl font-semibold mb-3 text-blue-700">{calc.name}</h3>
              <p className="text-gray-600 mb-4 flex-grow">{calc.description}</p>
              <Link
                href={calc.path}
                className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
              >
                Try Calculator →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <KeyFeatures />

      {/* Benefits Section */}
      <section className="px-4 md:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefitsList.map((benefit) => (
            <div key={benefit.id} className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-blue-50 py-10 px-4 md:px-6 lg:px-8 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8">What Professionals Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">&ldquo;{testimonial.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-12 px-4 md:px-8 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Streamline Your Calculations?</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Join attorneys and adjusters across South Carolina who trust our platform for accurate workers&apos; compensation calculations.
        </p>
        <Link
          href="/signup"
          className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors inline-block"
        >
          Start Your Free Trial Today
        </Link>
      </section>
      
      {/* Pricing Section */}
      <section className="py-8">
        <PricingPlans />
      </section>

      {/* How It Works Section */}
      <section className="px-4 md:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className="bg-blue-600 text-white text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-10 px-4 md:px-6 lg:px-8 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/faq"
            className="text-blue-600 font-semibold hover:underline"
          >
            View All FAQs →
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-4 md:px-6 lg:px-8 mb-12">
        <NewsletterSignup />
      </section>
    </div>
  );
}

// Data for the homepage components
const featuredCalculators = [
  {
    id: "aww",
    name: "Average Weekly Wage Calculator",
    description: "Accurately determine the Average Weekly Wage and Compensation Rate based on earnings history.",
    path: "/Calculators/aww",
  },
  {
    id: "commuted",
    name: "Commuted Value Calculator",
    description: "Calculate present value of future compensation payments based on court-approved discount rates.",
    path: "/Calculators/commuted",
  },
  {
    id: "indemnity",
    name: "Indemnity Calculator",
    description: "Determine indemnity benefits for permanent or temporary disability claims.",
    path: "/Calculators/indemnity",
  },
];

const benefitsList = [
  {
    id: "accuracy",
    title: "South Carolina Specific",
    description: "Designed specifically for South Carolina workers' compensation laws and regulations.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "time",
    title: "Save Time",
    description: "Reduce calculation time from hours to minutes with our specialized tools.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "reliability",
    title: "Court-Approved Methodology",
    description: "Our calculations follow methodologies approved by the South Carolina Workers' Compensation Commission.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Workers' Compensation Attorney",
    quote: "This platform has transformed how I handle my cases. The calculations are accurate and save me hours of work on each claim.",
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Insurance Adjuster",
    quote: "I've been using this system for six months and it's dramatically improved our accuracy and efficiency in processing claims.",
  },
];

const howItWorks = [
  {
    id: "select",
    title: "Select a Calculator",
    description: "Choose from our suite of specialized workers' compensation calculators.",
  },
  {
    id: "input",
    title: "Enter Your Data",
    description: "Follow our guided process to input case-specific information.",
  },
  {
    id: "results",
    title: "Get Accurate Results",
    description: "Instantly receive detailed calculations and printable reports.",
  },
];

const faqs = [
  {
    id: "faq1",
    question: "How accurate are the calculators?",
    answer: "Our calculators use formulas and methodologies specifically designed for South Carolina workers' compensation law, regularly updated to reflect current maximum rates and legal standards.",
  },
  {
    id: "faq2",
    question: "Can I save my calculations?",
    answer: "Yes, with a premium account you can save unlimited calculations, create client profiles, and generate professional reports.",
  },
  {
    id: "faq3",
    question: "Are the calculators up to date with current law?",
    answer: "Yes, we regularly update our calculators to reflect the latest South Carolina workers' compensation rates, laws, and Commission decisions.",
  },
];