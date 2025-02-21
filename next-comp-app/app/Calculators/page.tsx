"use client";

import React, { useState } from "react";
import AwwCRCalculator from "@/app/Components/AwwCRCalculator";
import CommutedValueCalculator from "@/app/Components/CommutedValueCalculator";
import HearingLossCalculator from "@/app/Components/HearingLossCalculator";
import IndemnityCalculator from "@/app/Components/IndemnityCalculator";
import UMCalculator from "@/app/Components/UMCalculator";
import LifeExpectancyCalculator from "@/app/Components/LifeExpectancyCalculator";
import Head from "next/head";

const maxCompensationRates: Record<number, number> = {
  2025: 1134.43,
  2024: 1093.67,
  2023: 1035.78,
  2022: 963.37,
  2021: 903.4,
  2020: 866.67,
  2019: 845.74,
  2018: 838.21,
  2017: 806.92,
  2016: 784.03,
  2015: 766.05,
  2014: 752.16,
  2013: 743.72,
  2012: 725.47,
  2011: 704.92,
  2010: 689.71,
  2009: 681.36,
  2008: 661.29,
  2007: 645.94,
  2006: 616.48,
  2005: 592.56,
  2004: 577.73,
  2003: 563.55,
  2002: 549.42,
  2001: 532.77,
  2000: 507.34,
  1999: 483.47,
  1998: 465.18,
  1997: 450.62,
  1996: 437.79,
  1995: 422.48,
  1994: 410.26,
  1993: 393.06,
  1992: 379.82,
  1991: 364.37,
  1990: 350.19,
  1989: 334.87,
  1988: 319.2,
  1987: 308.24,
  1986: 294.95,
  1985: 287.02,
  1984: 268.99,
  1983: 254.38,
  1982: 235.0,
  1981: 216.0,
  1980: 197.0,
  1979: 185.0,
};

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
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">{calculators[selectedCalculator].name}</h2>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-red-400"
              onClick={() => setSelectedCalculator(null)}
            >
              ← Back to All Calculators
            </button>
            {React.createElement(calculators[selectedCalculator].component, { maxCompensationRates })}
          </div>
        )}
      </div>
    </>
  );
}
