// app/Pricing/data.ts
// this is the data for the pricing page and its components.

export interface PricingTier {
  id: string; // e.g., 'tier-basic'
  name: string; // e.g., 'Basic'
  priceMonthly: string; // e.g., '$29'
  priceAnnually: string; // e.g., '$24' (representing price per month when billed annually)
  description: string;
  features: string[];
  href: string; // Path for the signup button
  mostPopular: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "tier-basic",
    name: "Basic",
    priceMonthly: "$29",
    priceAnnually: "$24", // Price per month, billed annually
    description: "Essential features for occasional users.",
    features: [
      "AWW & Commuted Value Calculators",
      "Limited to 10 calculations/month",
      "No saved calculations",
      "Basic PDF reports",
      "Standard email support",
    ],
    href: "/signup?plan=basic",
    mostPopular: false,
  },
  {
    id: "tier-professional",
    name: "Professional",
    priceMonthly: "$49",
    priceAnnually: "$39", // Price per month, billed annually
    description: "Perfect for individual attorneys and adjusters.",
    features: [
      "All calculators including specialized tools",
      "Unlimited calculations",
      "Save up to 50 calculations",
      "Professional reports with branding",
      "Priority email support",
      "Form 20 generation (future)", // Example feature
      "Access to historical rate data",
    ],
    href: "/signup?plan=professional",
    mostPopular: true,
  },
  {
    id: "tier-enterprise",
    name: "Enterprise",
    priceMonthly: "$99", // Or "Custom"
    priceAnnually: "$79", // Or "Custom" - Price per user per month, billed annually
    description: "For law firms and insurance companies.",
    features: [
      "All Professional features",
      "Unlimited saved calculations",
      "Team access (up to 5 users included)",
      "Client/Case organization",
      "Custom calculation templates (future)",
      "API access (add-on)",
      "Dedicated account manager",
      "Phone support",
    ],
    href: "/contact?plan=enterprise", // Link to contact form for enterprise
    mostPopular: false,
  },
];

export interface FeatureComparison {
    id: string;
    feature: string;
    basic: string | boolean; // Use boolean for check/cross, string for limits
    professional: string | boolean;
    enterprise: string | boolean;
  }
  
  export interface PricingFaq {
      id: string | number;
      question: string;
      answer: string;
  }
  
  export const comparisonFeatures: FeatureComparison[] = [
    { id: "f1", feature: "AWW Calculator", basic: true, professional: true, enterprise: true },
    { id: "f2", feature: "Commuted Value Calculator", basic: true, professional: true, enterprise: true },
    { id: "f3", feature: "Indemnity Calculator", basic: false, professional: true, enterprise: true },
    { id: "f4", feature: "Hearing Loss Calculator", basic: false, professional: true, enterprise: true },
    { id: "f5", feature: "Life Expectancy Calculator", basic: false, professional: true, enterprise: true },
    { id: "f6", feature: "Uninsured Employer Tools", basic: false, professional: true, enterprise: true },
    { id: "f7", feature: "Save Calculations", basic: "10 max", professional: "50 max", enterprise: "Unlimited" },
    { id: "f8", feature: "Professional Reports", basic: "Basic", professional: "Custom Branding", enterprise: "Advanced Customization" },
    { id: "f9", feature: "Client/Case Organization", basic: false, professional: true, enterprise: true },
    { id: "f10", feature: "Team Members", basic: "1", professional: "1", enterprise: "Up to 5" }, // Example limits
    { id: "f11", feature: "Email Support", basic: true, professional: "Priority", enterprise: "Priority" },
    { id: "f12", feature: "Phone Support", basic: false, professional: false, enterprise: true },
    { id: "f13", feature: "API Access", basic: false, professional: false, enterprise: true },
  ];
  
  export const pricingFaqs: PricingFaq[] = [
     {
      id: 1,
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
     },
     {
      id: 2,
      question: "How accurate are the calculators?",
      answer: "Our calculators use formulas and methodologies specifically designed for South Carolina workers' compensation law and are regularly updated to reflect current rates and legal standards."
     },
     {
      id: 3,
      question: "Can I switch between plans?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades will be applied at the start of your next billing cycle."
     },
     {
      id: 4,
      question: "Is my data secure?",
      answer: "Yes, all your data is encrypted and stored securely. We never share your information with third parties. Our platform is HIPAA-compliant for handling sensitive claimant information."
     },
      {
      id: 5,
      question: "Can I export my calculations?",
      answer: "Yes, all plans allow you to export your calculations as PDF reports. Professional and Enterprise plans offer additional export options and customization features."
     },
     {
      id: 6,
      question: "Is there a free trial?",
      answer: "Yes, we offer a 14-day free trial of our Professional plan so you can experience all the features before making a decision."
     },
  ];
  
  // Other data exports...
  
  