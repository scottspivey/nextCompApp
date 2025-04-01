// app/Calculators/commuted/page.tsx
import React from "react";
import { Metadata } from "next";
import CommutedValueCalculator from "@/app/Components/CommutedValueCalculator";
import { maxCompensationRates } from "@/app/CommonVariables";

export const metadata: Metadata = {
  title: "Commuted Value Calculator | SC Worker's Compensation App",
  description: "Calculate the present value of future workers' compensation benefits using court-approved discount rates.",
};

export default function CommutedValuePage() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2 text-blue-700">Commuted Value Calculator</h2>
        <p className="text-gray-600 mb-6">
          Calculate the present value of future workers&apos; compensation benefits, applying the appropriate 
          discount rate based on remaining weeks. Used for lump sum settlements and benefit commutations.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <CommutedValueCalculator maxCompensationRates={maxCompensationRates} />
      </div>
      
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">About This Calculator</h3>
        <p className="mb-3">
          Under South Carolina Code § 42-9-301, parties may agree to commute future compensation payments to 
          present value when approved by the Workers&apos; Compensation Commission.
        </p>
        <p className="mb-3">
          This calculator uses the current court-approved discount rates: 4.38% for claims with more than 100 weeks 
          remaining and 2% for claims with 100 weeks or fewer remaining.
        </p>
        <p className="mb-3">
          The calculator also provides values at 95% and 90% of the commuted value, which are common settlement 
          percentages used in South Carolina workers&apos; compensation cases.
        </p>
      </div>
    </div>
  );
}