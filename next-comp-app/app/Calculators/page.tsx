// app/Calculators/page.tsx
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Calculators | SC Worker\'s Compensation App',
  description: 'Professional calculators for South Carolina workers\' compensation claims, including AWW, commuted value, and indemnity calculators.',
};

interface Calculator {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  premiumOnly?: boolean;
}

const calculators: Calculator[] = [
  {
    id: "aww",
    name: "Average Weekly Wage",
    description: "Calculate AWW and compensation rate based on earnings history.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    path: "/Calculators/aww",
  },
  {
    id: "commuted",
    name: "Commuted Value",
    description: "Calculate present value of future compensation payments.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    path: "/Calculators/commuted",
  },
  {
    id: "indemnity",
    name: "Indemnity Benefits",
    description: "Calculate indemnity benefits for scheduled and non-scheduled injuries.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    path: "/Calculators/indemnity",
    premiumOnly: true,
  },
  {
    id: "life-expectancy",
    name: "Life Expectancy",
    description: "Calculate remaining life expectancy for lifelong benefits.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    path: "/Calculators/life-expectancy",
    premiumOnly: true,
  },
  {
    id: "hearing-loss",
    name: "Hearing Loss",
    description: "Calculate compensation for hearing loss claims.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    path: "/Calculators/hearing-loss",
    premiumOnly: true,
  },
  {
    id: "uninsured-motion",
    name: "Uninsured Employer Tools",
    description: "Generate forms and calculate benefits for uninsured employer cases.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    path: "/Calculators/uninsured-motion",
    premiumOnly: true,
  },
];

export default function CalculatorsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Workers&apos; Compensation Calculators</h1>
        <p className="text-gray-600 max-w-4xl">
          Our suite of professional-grade calculators is specifically designed for South Carolina 
          workers&apos; compensation claims. Each calculator uses the latest rates and follows methodologies 
          approved by the South Carolina Workers&apos; Compensation Commission.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {calculators.map((calc) => (
          <div 
            key={calc.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg ${
              calc.premiumOnly ? 'border-2 border-amber-300' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="shrink-0">
                  {calc.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-blue-700 flex items-center">
                    {calc.name}
                    {calc.premiumOnly && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        Premium
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 mt-1">{calc.description}</p>
                </div>
              </div>
              
              <div className="mt-4">
                {calc.premiumOnly ? (
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-gray-500">
                      This calculator is available with premium subscription
                    </span>
                    <div className="flex space-x-3">
                      <Link
                        href="/pricing"
                        className="inline-block mt-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                      >
                        Upgrade
                      </Link>
                      <Link
                        href={calc.path}
                        className="inline-block mt-2 px-4 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Preview
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={calc.path}
                    className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Open Calculator
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Most Popular Calculators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2 text-blue-700">
              <Link href="/Calculators/aww" className="hover:underline">
                Average Weekly Wage Calculator
              </Link>
            </h3>
            <p className="text-gray-600 mb-3">
              Determine the Average Weekly Wage and Compensation Rate based on earnings history,
              in accordance with South Carolina Code § 42-1-40.
            </p>
            <Link
              href="/Calculators/aww"
              className="text-blue-600 font-medium hover:underline"
            >
              Open Calculator →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2 text-blue-700">
              <Link href="/Calculators/commuted" className="hover:underline">
                Commuted Value Calculator
              </Link>
            </h3>
            <p className="text-gray-600 mb-3">
              Calculate present value of future compensation payments based on court-approved discount rates,
              as allowed under South Carolina Code § 42-9-301.
            </p>
            <Link
              href="/Calculators/commuted"
              className="text-blue-600 font-medium hover:underline"
            >
              Open Calculator →
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-3/4">
            <h2 className="text-2xl font-bold mb-3">Need More Specialized Calculators?</h2>
            <p className="mb-4">
              Upgrade to our premium subscription to access all calculators, save your calculations,
              and create professional reports for your clients and case submissions.
            </p>
          </div>
          <div className="md:w-1/4 flex justify-center md:justify-end mt-4 md:mt-0">
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-gray-100 transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}