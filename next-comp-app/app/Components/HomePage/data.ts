// Data for the homepage components
import { LucideIcon } from 'lucide-react'; // Import type if needed elsewhere, otherwise just use React.FC<any> below
import { Calculator, Printer, History, ShieldCheck } from 'lucide-react'; // Import specific icons

interface testimonials { id: string | number; name: string; role: string; quote: string; avatarUrl?: string; }

// Interface for Feature data
export interface FeatureItem {
  id: number;
  // Store the icon component directly for easier use
  icon: LucideIcon; 
  title: string;
  description: string;
}

// Example Fearture data - Replace with your actual features
export const featureItems: FeatureItem[] = [
  {
    id: 1,
    icon: Calculator, // Use imported icon component
    title: "Instant Calculations",
    description: "Calculate compensation rates, commuted values, and more in seconds.",
  },
  {
    id: 2,
    icon: Printer, // Use imported icon component
    title: "Printable Reports",
    description: "Generate professional reports for claims, court submissions, and client communications.",
   },
   {
    id: 3,
    icon: History, // Use imported icon component
    title: "Rate Tracking",
    description: "Track compensation rates over time with historical data from 1979 to current year.",
   },
   {
    id: 4,
    icon: ShieldCheck, // Use imported icon component
    title: "Compliance Assured",
    description: "All calculations follow SC Workers' Compensation Commission approved methodologies.",
   },
];

export interface TrustedByLogo {
  id: number;
  name: string; // Used for alt text
  logoUrl: string; // Path to the logo image/svg
}

export const trustedByLogos: TrustedByLogo[] = [
  { id: 1, name: "Example Law Firm A", logoUrl: "https://placehold.co/600/e2e8f0/64748b?text=Law+Firm+A" }, // Placeholder
  { id: 2, name: "Example Insurance Co", logoUrl: "https://placehold.co/200/e2e8f0/64748b?text=Insurance+Co" }, // Placeholder
  { id: 3, name: "Example Legal Group", logoUrl: "https://placehold.co/200/e2e8f0/64748b?text=Legal+Group" }, // Placeholder
  { id: 4, name: "Example Adjuster Firm", logoUrl: "https://placehold.co/200/e2e8f0/64748b?text=Adjusters" }, // Placeholder
  { id: 5, name: "Example SC Association", logoUrl: "https://placehold.co/200/e2e8f0/64748b?text=Association" }, // Placeholder
  // Add more logos as needed (up to 5 for the lg:grid-cols-5 layout)
];

export const featuredCalculators = [
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

export const benefitsList = [
  {
    id: "accuracy",
    title: "South Carolina Specific",
    description: "Designed specifically for South Carolina workers' compensation laws and regulations.",
    iconType: "checkmark",
  },
  {
    id: "time",
    title: "Save Time",
    description: "Reduce calculation time from hours to minutes with our specialized tools.",
    iconType: "clock",
  },
  {
    id: "reliability",
    title: "Court-Approved Methodology",
    description: "Our calculations follow methodologies approved by the South Carolina Workers' Compensation Commission.",
    iconType: "scale",
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Workers' Compensation Attorney",
    quote: "This platform has transformed how I handle my cases. The calculations are accurate and save me hours of work on each claim.",
    avatarUrl: "https://ui-avatars.com/api/?name=Sarah+Johnson&size=128&background=random&color=fff"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Insurance Adjuster",
    quote: "I've been using this system for six months and it's dramatically improved our accuracy and efficiency in processing claims.",
    avatarUrl: ""
  },
];

export const howItWorks = [
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

export const faqs = [
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