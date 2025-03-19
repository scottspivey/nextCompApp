// app/Calculators/aww/page.tsx
import React from "react";
import { AwwCRCalculator } from "@/app/Components/AwwCRCalculator";
import { maxCompensationRates } from "@/app/CommonVariables";

export default function AwwCalculatorPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-1">
        <a
          href="/Calculators"
          className="inline-block bg-red-500 text-white px-4 py-2 rounded-lg mb-2 focus:bg-red-400 hover:bg-red-400"
        >
          ← Back to All Calculators
        </a>
      </div>
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Average Weekly Wage / Compensation Rate</h2>
        <AwwCRCalculator maxCompensationRates={maxCompensationRates} searchParams={searchParams} />
      </div>
    </div>
  );
}