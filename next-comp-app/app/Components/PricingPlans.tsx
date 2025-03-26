// app/Components/PricingPlans.tsx
import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";

const tiers = [
  {
    name: "Basic",
    id: "tier-basic",
    price: { monthly: "$29", annually: "$24" },
    description: "Essential features for occasional users.",
    features: [
      "All standard calculators",
      "Limited to 10 calculations per month",
      "No saved calculations",
      "Basic reports",
      "Email support",
    ],
    href: "/signup?plan=basic",
    mostPopular: false,
  },
  {
    name: "Professional",
    id: "tier-professional",
    price: { monthly: "$49", annually: "$39" },
    description: "Perfect for individual attorneys and adjusters.",
    features: [
      "All calculators including specialized tools",
      "Unlimited calculations",
      "Save up to 50 calculations",
      "Professional reports with branding",
      "Priority email support",
      "Form 20 generation",
      "Access to historical rate data",
    ],
    href: "/signup?plan=professional",
    mostPopular: true,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    price: { monthly: "$99", annually: "$79" },
    description: "For law firms and insurance companies.",
    features: [
      "All Professional features",
      "Unlimited saved calculations",
      "Team access (up to 5 users)",
      "Client/Case organization",
      "Custom calculation templates",
      "API access",
      "Dedicated account manager",
      "Phone support",
    ],
    href: "/signup?plan=enterprise",
    mostPopular: false,
  },
];

//type Frequency = "monthly" | "annually";

export default function PricingPlans() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Plans for every professional
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Choose the perfect plan to streamline your workers&apos; compensation calculations
          and stay compliant with South Carolina regulations.
        </p>
        
        <div className="mt-16 flex justify-center">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`flex flex-col rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 ${
                  tier.mostPopular ? "bg-blue-50 ring-2 ring-blue-600" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className={`text-lg font-semibold leading-8 ${
                      tier.mostPopular ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  {tier.mostPopular && (
                    <span className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
                      Most popular
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.price.monthly}</span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  or {tier.price.annually}/month billed annually
                </p>
                <Link
                  href={tier.href}
                  aria-describedby={tier.id}
                  className={`mt-6 rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
                    ${
                      tier.mostPopular
                        ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-600"
                        : "bg-white text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300 focus-visible:outline-blue-600"
                    }`}
                >
                  Get started today
                </Link>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}