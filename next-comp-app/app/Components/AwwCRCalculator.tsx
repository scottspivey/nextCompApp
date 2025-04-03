// app/Components/AwwCRCalculator.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/Components/ui/card"; // Adjust path
import { formatDisplayDate } from "@/app/utils/dateUtils"; // Adjust path
import { CalculatorForm } from "./CalculatorForm"; // Adjust path
import { StepNavigation } from "./StepNavigation"; // Adjust path
import { useAWWCalculatorStore } from "@/app/stores/awwCalculatorstore"; // Adjust path
import { specialCaseOptions } from "./awwConstants"; // Import specialCaseOptions
import Big from 'big.js'; // Import Big for potential calculations in results if needed

/**
 * Main component for the Average Weekly Wage & Compensation Rate Calculator.
 * Orchestrates the form steps, state management, and results display.
 */
export function AwwCRCalculator() {
  // Get state and actions from the Zustand store
  const {
    // Form Data
    dateOfInjury,
    specialCase,
    employedFourQuarters,
    quarter1Pay,
    quarter2Pay,
    quarter3Pay,
    quarter4Pay,
    // UI State
    currentStep,
    errors, // This object is already typed as AWWErrors by the store
    isCalculating,
    showResults, // Use this flag to control results visibility
    // Results (stored as strings or null)
    averageWeeklyWage,
    compensationRate,
    yearOfInjury,
    maxCompRate,
    // Actions
    setField,
    goToNextStep,
    goToPreviousStep,
    resetCalculator,
    // validateStep, // We might not need validateStep directly here anymore
  } = useAWWCalculatorStore();

  // Determine if there are any errors relevant to the *current* step or previous steps.
  // This logic might need refinement depending on exact UX desired for disabling 'Next'.
  // For now, check if *any* error exists in the errors object.
   const hasErrors = Object.values(errors).some(error => error != null); // Check for non-null/undefined errors

  // Handle input changes - directly calls the store's setField action
  const handleInputChange = (name: string, value: string) => {
    setField(name as keyof ReturnType<typeof useAWWCalculatorStore>, value);
  };

  // --- Render Calculation Results ---
  const renderResults = () => {
    // Show results only if the showResults flag is true and calculation isn't in progress
    if (!showResults || isCalculating) {
      return null;
    }

    // Check if calculation resulted in an error message
     if (errors.calculation) {
         return (
             <Card className="mt-8 border-destructive bg-destructive/10">
                 <CardHeader>
                     <CardTitle className="text-destructive">Calculation Error</CardTitle>
                     <CardDescription className="text-destructive">
                         {errors.calculation} {/* Display the specific calculation error */}
                     </CardDescription>
                 </CardHeader>
             </Card>
         );
     }


    // Check if essential results are available (assuming no calculation error)
    if (
      averageWeeklyWage === null ||
      compensationRate === null ||
      yearOfInjury === null
    ) {
      // This case might indicate an unexpected state if errors.calculation is not set
      return (
         <Card className="mt-8 border-orange-500 bg-orange-50">
             <CardHeader>
                 <CardTitle className="text-orange-700">Calculation Incomplete</CardTitle>
                 <CardDescription className="text-orange-600">
                     Could not calculate results. Please ensure all required information is entered correctly. If the issue persists, there might be an unexpected problem.
                 </CardDescription>
             </CardHeader>
         </Card>
      );
    }

    // Calculate Total Annual Earnings from stored string values using Big.js
    let totalAnnualEarnings = new Big(0);
    if (employedFourQuarters === 'yes') {
        try {
            totalAnnualEarnings = new Big(quarter1Pay || '0')
                .plus(new Big(quarter2Pay || '0'))
                .plus(new Big(quarter3Pay || '0'))
                .plus(new Big(quarter4Pay || '0'));
        } catch {
            console.error("Error calculating total annual earnings for display.");
        }
    }

    // Calculate unadjusted weekly compensation (AWW * 2/3) for display comparison
    let unadjustedWeeklyComp = new Big(0);
     try {
         // Ensure averageWeeklyWage is a valid number string before using Big
         if (averageWeeklyWage && !isNaN(Number(averageWeeklyWage))) {
            unadjustedWeeklyComp = new Big(averageWeeklyWage).times(2 / 3);
         } else {
             throw new Error("Invalid averageWeeklyWage value for calculation");
         }
     } catch(e) {
         console.error("Error calculating unadjusted weekly comp for display:", e);
     }

    // Determine if the rate was limited by the maximum
    const wasLimited = maxCompRate !== null && compensationRate !== null && new Big(compensationRate).eq(new Big(maxCompRate));

    // Find the label for the selected special case
    const specialCaseLabel = specialCase === "none"
        ? "None"
        // Add explicit type for 'opt' parameter here
        : specialCaseOptions.find((opt: { value: string; label: string }) => opt.value === specialCase)?.label ?? specialCase;


    return (
      <Card className="mt-8 bg-primary/5 border-primary/20"> {/* Use primary theme color */}
        <CardHeader>
          <CardTitle className="text-primary">Calculation Results</CardTitle> {/* Use primary theme color */}
          <CardDescription>
            Based on the information provided for an injury date of {formatDisplayDate(dateOfInjury)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Average Weekly Wage */}
            <div className="bg-card p-4 rounded-lg shadow-sm border"> {/* Use card background */}
              <h4 className="text-sm font-medium text-muted-foreground">Average Weekly Wage (AWW)</h4>
              <p className="text-xl font-semibold text-primary"> {/* Use primary theme color */}
                ${averageWeeklyWage}
              </p>
            </div>

            {/* Compensation Rate */}
            <div className="bg-card p-4 rounded-lg shadow-sm border"> {/* Use card background */}
              <h4 className="text-sm font-medium text-muted-foreground">Compensation Rate (CR)</h4>
              <p className="text-xl font-semibold text-primary"> {/* Use primary theme color */}
                ${compensationRate}
                 {wasLimited && <span className="text-xs text-orange-600 block">(Limited by state maximum)</span>}
              </p>
            </div>

            {/* Year of Injury */}
            <div className="bg-card p-4 rounded-lg shadow-sm border"> {/* Use card background */}
              <h4 className="text-sm font-medium text-muted-foreground">Year of Injury</h4>
              <p className="text-xl font-semibold">{yearOfInjury}</p>
            </div>

            {/* Maximum Rate for Year */}
            <div className="bg-card p-4 rounded-lg shadow-sm border"> {/* Use card background */}
              <h4 className="text-sm font-medium text-muted-foreground">
                Maximum CR for {yearOfInjury}
              </h4>
              <p className="text-xl font-semibold">
                {maxCompRate !== null ? `$${maxCompRate}` : 'N/A*'}
              </p>
               {maxCompRate === null && <p className="text-xs text-muted-foreground mt-1">*Max rate data unavailable for this year.</p>}
            </div>
          </div>

          {/* Calculation Details Section */}
          <div className="bg-card p-4 rounded-lg shadow-sm border mt-4"> {/* Use card background */}
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Calculation Details</h4>
            <ul className="space-y-2 text-sm">
              {/* Only show total earnings if 4 quarters were used */}
              {employedFourQuarters === "yes" && (
                <li>
                  <span className="font-medium">Total Annual Earnings Used:</span> $
                  {totalAnnualEarnings.toFixed(2)}
                </li>
              )}
              <li>
                <span className="font-medium">Calculation Method:</span>{" "}
                {employedFourQuarters === "yes"
                  ? "Standard Four Quarters Method (§ 42-1-40)"
                  : "Alternative Method (§ 42-1-40) - See Note Below"}
              </li>
              <li>
                <span className="font-medium">Special Case Selected:</span>{" "}
                {specialCaseLabel} {/* Use the resolved label */}
              </li>
               <li>
                 <span className="font-medium">Calculated Weekly Comp (AWW * 2/3):</span> $
                 {unadjustedWeeklyComp.toFixed(2)}
                 {wasLimited && (
                     <span className="text-orange-600"> (Limited to ${maxCompRate})</span>
                 )}
               </li>
            </ul>
            {/* Add note for alternative method if applicable */}
            {employedFourQuarters === "no" && (
                <p className="text-xs text-muted-foreground mt-3">
                    <strong>Note:</strong> The AWW/CR for employment less than four quarters depends on specific circumstances (days worked, similar employee wages, etc.) not fully captured by this simplified calculator step. The results shown are based on placeholder logic. Consult S.C. Code § 42-1-40 or a legal professional.
                </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // --- Main Component Render ---
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg border border-border"> {/* Use border color */}
        <CardHeader>
          <CardTitle>Average Weekly Wage & Compensation Rate Calculator</CardTitle>
          <CardDescription>
            Complete the following steps to calculate your Average Weekly Wage (AWW) and Compensation Rate (CR)
            according to South Carolina Workers&apos; Compensation laws.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Calculator Form Component */}
            <CalculatorForm
              currentStep={currentStep}
              dateOfInjury={dateOfInjury}
              specialCase={specialCase}
              employedFourQuarters={employedFourQuarters}
              quarter1Pay={quarter1Pay}
              quarter2Pay={quarter2Pay}
              quarter3Pay={quarter3Pay}
              quarter4Pay={quarter4Pay}
              errors={errors}
              handleInputChange={handleInputChange}
            />

            {/* Step Navigation Component */}
            <StepNavigation
              currentStep={currentStep}
              totalSteps={5}
              // Pass the necessary props for StepNavigation's internal logic
              hasErrors={hasErrors}
              isCalculating={isCalculating}
              // Pass actions
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
              onReset={resetCalculator}
              // Pass display options
              // Show "Calculate" on the last input step (step 4 if 'yes', step 3 if 'no')
              nextButtonText={
                  (currentStep === 4 && employedFourQuarters === 'yes') ||
                  (currentStep === 3 && employedFourQuarters === 'no')
                  ? "Calculate"
                  : "Next"
              }
              // Show reset only on the final step (step 5) after results are shown
              showReset={currentStep === 5 && showResults}
            />
          </div>
        </CardContent>
      </Card>

      {/* Render Results Section */}
      {renderResults()}

      {/* Disclaimer/Note Section */}
      <div className="mt-12 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg border"> {/* Use muted background/foreground */}
        <p>
          <strong>Disclaimer:</strong> This calculator is intended for informational purposes only and provides an estimate based on the standard calculation methods outlined in South Carolina Workers&apos; Compensation laws (primarily S.C. Code § 42-1-40).
        </p>
        <p className="mt-2">
          Calculations involving concurrent employment, special employment situations (volunteers, etc.), or employment periods shorter than four full quarters may involve different rules and complexities not fully addressed here. The maximum compensation rates are based on available data and subject to change.
        </p>
        <p className="mt-2">
          This tool does not constitute legal advice. Consult with a qualified legal professional or the South Carolina Workers&apos; Compensation Commission for advice specific to your situation.
        </p>
      </div>
    </div>
  );
}

// Removed the placeholder StepNavigationProps interface comment
