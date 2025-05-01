// app/Calculators/commuted/page.tsx
import React from "react";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import CommutedValueCalculator from "@/app/Components/CalcComponents/CommutedValueCalculator";

export const metadata: Metadata = {
  title: "Commuted Value Calculator | SC Worker's Compensation App",
  description: "Calculate the present value of future workers' compensation benefits using court-approved discount rates.",
};

/**
 * Fetches all max compensation rates from the database.
 * @returns A promise resolving to a Record mapping year to max rate.
 */
async function getMaxCompRates(): Promise<Record<number, number>> {
  const ratesData = await prisma.rateSetting.findMany({
      where: { rate_type: "MAX_COMPENSATION" },
      select: { year: true, value: true }, // Select only needed fields
      orderBy: { year: 'asc' } // Optional: order by year
  });

  const ratesRecord: Record<number, number> = {};
  
  ratesData.forEach((rate: { year: number; value: { toNumber(): number } }) => {
      ratesRecord[rate.year] = rate.value.toNumber();
  });
  return ratesRecord;
}

/**
 * Fetches the applicable discount rate for 101+ weeks for the current calculation year.
 * @returns A promise resolving to the discount rate (e.g., 0.0438) or null if not found.
 */
async function getCurrentDiscountRate(): Promise<number | null> {
  // Determine the year for which the discount rate should apply (usually the current year)
  const currentCalcYear = new Date().getFullYear(); // e.g., 2025

  const discountRateSetting = await prisma.rateSetting.findUnique({
      where: {
          // Use the composite key defined in the schema (@@id([year, rate_type]))
          year_rate_type: {
              year: currentCalcYear,
              rate_type: "DISCOUNT_RATE_101_PLUS" // The identifier for the variable rate
          }
      },
      select: { value: true } // Select only the rate value
  });

  return discountRateSetting ? discountRateSetting.value.toNumber() : null;
}


export default async function CommutedValuePage() {

  // Fetch data on the server when the page component renders
  const maxCompRates = await getMaxCompRates();
  const currentDiscountRate = await getCurrentDiscountRate(); // e.g., 0.0438 for 2025

  // Log an error if the crucial discount rate for the current year is missing
  // You might want more robust error handling depending on requirements
  if (currentDiscountRate === null) {
      console.error(`CRITICAL: Discount rate ('DISCOUNT_RATE_101_PLUS') for year ${new Date().getFullYear()} not found in database! Calculator may use fallback.`);
      // Consider throwing an error or displaying a message to the user
  }

  // Format the fetched discount rate for display (or show 'N/A')
  const displayDiscountRate = currentDiscountRate !== null
    ? `${(currentDiscountRate * 100).toFixed(2)}%`
    : 'N/A (Rate missing)';

  return (
    // Main container for the page content
    <div>
      {/* Page-specific Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Commuted Value Calculator</h2>
        <p className="text-muted-foreground max-w-3xl">
          Calculate the present value of future workers&apos; compensation benefits, applying the appropriate
          discount rate based on remaining weeks. Used for lump sum settlements and benefit commutations.
        </p>
      </div>

      {/* Main Calculator Component Area */}
      <div className="bg-card text-card-foreground p-6 md:p-8 rounded-lg shadow-sm border border-border">
        {/* Pass the fetched data down to the client component */}
        <CommutedValueCalculator
          maxCompensationRates={maxCompRates}
          currentMarketDiscountRate={currentDiscountRate}
        />
      </div>

      {/* Informational "About" Section */}
      <div className="mt-12 bg-muted text-muted-foreground p-6 md:p-8 rounded-lg border border-border/50">
        <h3 className="text-xl font-semibold mb-4 text-foreground">About This Calculator</h3>
        <div className="space-y-3 text-sm">
          <p>
            <strong>General Information:</strong> Under South Carolina Code § 42-9-301, parties may agree to commute future compensation payments to
            present value when approved by the Workers&apos; Compensation Commission.
            This calculator uses the current S.C. Workers&apos; Compensation Commission approved discount rates: <strong>{displayDiscountRate}</strong> for claims with more than 100 weeks
            remaining and <strong>2%</strong> for claims with 100 weeks or fewer remaining.
            The calculator also provides values at <strong>95%</strong> and <strong>90%</strong> of the commuted value, which may be helpful in the evaluation of claims.
          </p>
          <p>
            <strong>Disclaimer:</strong> This calculator is intended for informational purposes only and does not constitute legal advice.
            While efforts have been made to ensure accuracy based on current South Carolina regulations and rates, users should independently
            verify all calculations and consult with qualified legal counsel before making any decisions based on these results.  
            <strong> Reliance on this tool is solely at the user&apos;s own risk.</strong>          
          </p>
          <p>
            <strong>Note on Rounding:</strong> The South Carolina Workers&apos; Compensation Commission&apos;s official Net Present Value (NPV) tables
            round conversion factors to four decimal places. This calculator performs calculations using higher precision, which may result
            in minor variations compared to the official WCC published values.
          </p>
          <p>
            <strong>Note on NPV Formula Adjustment:</strong> To align with the methodology used in the official South Carolina Workers&apos; 
            Compensation Commission&apos;s Net Present Value (NPV) tables, this calculator incorporates an adjustment to the standard present value annuity 
            formula for calculations involving 101 to 500 weeks. Specifically, an additional week is included in the time period exponent, 
            mirroring the Commission&apos;s published factors. While this differs from standard financial calculations, it ensures results are consistent 
            with those expected based on the Commission&apos;s tables.
          </p>
        </div>
      </div>
    </div>
  );
}