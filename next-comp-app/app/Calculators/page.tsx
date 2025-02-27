"use client";

import React, { useState } from "react";
import AwwCRCalculator from "@/app/Components/AwwCRCalculator";
import CommutedValueCalculator from "@/app/Components/CommutedValueCalculator";
import HearingLossCalculator from "@/app/Components/HearingLossCalculator";
import IndemnityCalculator from "@/app/Components/IndemnityCalculator";
import UMCalculator from "@/app/Components/UMCalculator";
import LifeExpectancyCalculator from "@/app/Components/LifeExpectancyCalculator";
import WageLossCalculator from "@/app/Components/WageLossCalculator";
import Conversions from "@/app/Components/Conversions"
import Head from "next/head";
import { maxCompensationRates } from "@/app/CommonVariables"

interface Calculator {
  name: string;
  component: React.FC<{ maxCompensationRates: Record<number, number> }>;
}

const calculators: Record<string, Calculator> = {
  aww: { name: "Average Weekly Wage / Compensation Rate", component: AwwCRCalculator },
  indemnity: { name: "Indemnity", component: IndemnityCalculator },
  commuted: { name: "Commuted Value", component: CommutedValueCalculator },
  hearing: { name: "Hearing Loss", component: HearingLossCalculator },
  um: { name: "Utica Mohawk", component: UMCalculator },
  lifeexpectancy: { name: "Life Expectancy", component: LifeExpectancyCalculator },
  wageloss: { name: "Wage Loss", component: WageLossCalculator },
  conversions: { name: "Common Conversions", component: Conversions },
};

export default function Calculators() {
  const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>Calculators - SC Worker&#39;s Compensation App</title>
        <meta name="description" content="Calculators of SC Worker's Compensation App" />
      </Head>

      <div className="container mx-auto p-6">
        {!selectedCalculator ? (
          <>
            <h1 className="text-3xl font-bold text-center mb-6">Select a Calculator</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(calculators).map(([id, calc]) => (
                <button
                  key={id}
                  className="bg-blue-600 text-white p-4 rounded-lg shadow-md hover:bg-blue-500"
                  onClick={() => setSelectedCalculator(id)}
                >
                  {calc.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div>
            <div className="mb-1">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg mb-2 focus:bg-red-400 hover:bg-red-400"
                onClick={() => setSelectedCalculator(null)}
              >
                ← Back to All Calculators
              </button>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-center">{calculators[selectedCalculator].name}</h2>
              {React.createElement(calculators[selectedCalculator].component, { maxCompensationRates })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
