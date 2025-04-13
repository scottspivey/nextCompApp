// app/Calculators/commuted/page.tsx
import React from "react";
import { Metadata } from "next";
import CommutedValueCalculator from "@/app/Components/CalcComponents/CommutedValueCalculator"; // Adjust path if needed
import { maxCompensationRates } from "@/app/CommonVariables"; // Adjust path if needed

// Metadata remains the same
export const metadata: Metadata = {
  title: "Commuted Value Calculator | SC Worker's Compensation App",
  description: "Calculate the present value of future workers' compensation benefits using court-approved discount rates.",
};

export default function CommutedValuePage() {
  return (
    // No outer container needed if rendered within CalculatorsLayout which has one
    <div>
      {/* Page-specific Header */}
      <div className="mb-8">
        {/* Use theme text colors */}
        <h2 className="text-2xl font-bold mb-2 text-foreground">Commuted Value Calculator</h2>
        <p className="text-muted-foreground max-w-3xl">
          Calculate the present value of future workers&apos; compensation benefits, applying the appropriate
          discount rate based on remaining weeks. Used for lump sum settlements and benefit commutations.
        </p>
      </div>
      {/* Main Calculator Component Area */}
      {/* Wrap the calculator in a themed card */}
      <div className="bg-card text-card-foreground p-6 md:p-8 rounded-lg shadow-sm border border-border">
        {/* Assuming CommutedValueCalculator component handles its internal layout */}
        <CommutedValueCalculator maxCompensationRates={maxCompensationRates} />
      </div>
      {/* Informational "About" Section */}
      {/* Use muted background for contrast */}
      <div className="mt-12 bg-muted text-muted-foreground p-6 md:p-8 rounded-lg border border-border/50">
        <h3 className="text-xl font-semibold mb-4 text-foreground">About This Calculator</h3>
        <div className="space-y-3 text-sm"> {/* Add spacing between paragraphs */}
          <p>
            Under South Carolina Code § 42-9-301, parties may agree to commute future compensation payments to
            present value when approved by the Workers&apos; Compensation Commission.
          </p>
          <p>
            This calculator uses the current court-approved discount rates: <strong>4.38%</strong> for claims with more than 100 weeks
            remaining and <strong>2%</strong> for claims with 100 weeks or fewer remaining.
          </p>
          <p>
            The calculator also provides values at <strong>95%</strong> and <strong>90%</strong> of the commuted value, which are common settlement
            percentages used in South Carolina workers&apos; compensation cases.
          </p>
        </div>
      </div>
    </div>
  );
}
