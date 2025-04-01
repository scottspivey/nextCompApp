// app/Calculators/layout.tsx
import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculators | SC Worker\'s Compensation App',
  description: 'Professional calculators for South Carolina workers\' compensation claims, including AWW, commuted value, and indemnity calculators.',
};

interface CalculatorItem {
  id: string;
  name: string;
  description: string;
  path: string;
  premiumOnly?: boolean;
}

const calculators: CalculatorItem[] = [
  {
    id: "aww",
    name: "Average Weekly Wage",
    description: "Calculate the Average Weekly Wage and Compensation Rate based on earnings history.",
    path: "/Calculators/aww",
  },
  {
    id: "commuted",
    name: "Commuted Value",
    description: "Calculate present value of future compensation payments with court-approved discount rates.",
    path: "/Calculators/commuted",
  },
  {
    id: "indemnity",
    name: "Indemnity Benefits",
    description: "Calculate indemnity benefits for scheduled and non-scheduled injuries.",
    path: "/Calculators/indemnity",
    premiumOnly: true,
  },
  {
    id: "life-expectancy",
    name: "Life Expectancy",
    description: "Calculate remaining life expectancy for lifelong benefits.",
    path: "/Calculators/life-expectancy",
    premiumOnly: true,
  },
  {
    id: "hearing-loss",
    name: "Hearing Loss",
    description: "Calculate compensation for hearing loss claims.",
    path: "/Calculators/hearing-loss",
    premiumOnly: true,
  },
  {
    id: "uninsured-motion",
    name: "Uninsured Employer Motion",
    description: "Generate form for uninsured employer motions.",
    path: "/Calculators/uninsured-motion",
    premiumOnly: true,
  },
];

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-700">Workers&apos; Compensation Calculators</h1>
        <p className="text-gray-600 mb-6">
          Professional-grade calculators specifically designed for South Carolina workers&apos; compensation claims.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {calculators.map((calc) => (
            <div 
              key={calc.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                calc.premiumOnly ? 'border-amber-300' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-blue-700 flex items-center">
                  {calc.name}
                  {calc.premiumOnly && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      Premium
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 mb-4">{calc.description}</p>
                <Link
                  href={calc.path}
                  className={`inline-block px-4 py-2 rounded-md ${
                    calc.premiumOnly
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {calc.premiumOnly ? 'Upgrade to Access' : 'Open Calculator'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}