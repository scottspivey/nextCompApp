// app/Calculators/aww/page.tsx
import React from "react";
import { Metadata } from "next";
import { AwwCRCalculatorWrapper } from "@/app/Components/AwwCRCalculator";

export const metadata: Metadata = {
  title: "Average Weekly Wage Calculator | SC Worker's Compensation App",
  description: "Calculate Average Weekly Wage and Compensation Rate for South Carolina workers' compensation claims.",
};

export default function AwwCalculatorPage() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2 text-blue-700">Average Weekly Wage Calculator</h2>
        <p className="text-gray-600 mb-6">
          Calculate a claimant&apos;s Average Weekly Wage (AWW) and Compensation Rate based on their earnings 
          in the four quarters preceding the injury, in accordance with South Carolina law.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <AwwCRCalculatorWrapper />
      </div>
      
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">About This Calculator</h3>
        <p className="mb-3">
          Per South Carolina Code § 42-1-40, the Average Weekly Wage is typically calculated by dividing 
          the employee&apos;s total wages from the four quarters preceding the injury by 52.
        </p>
        <p className="mb-3">
          The Compensation Rate is then calculated as 66.67% (or 2/3) of the Average Weekly Wage, but cannot 
          exceed the maximum compensation rate for the year of injury.
        </p>
        <p>
          This calculator automatically applies the appropriate maximum compensation rate based on the 
          date of injury.
        </p>
      </div>
    </div>
  );
}