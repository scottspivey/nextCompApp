// app/Components/AwwCRCalculator.tsx
"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/Components/ui/card";
import { formatDisplayDate } from "./CalcDateFunctions/formatDisplayDate";
import { CalculatorForm } from "./CalculatorForm";
import { StepNavigation } from "./StepNavigation";
import { useAWWCalculatorStore } from "@/app/stores/awwCalculatorstore";
import { maxCompensationRates } from "@/app/CommonVariables";

interface AWWCRCalculatorProps {
  maxCompensationRates: typeof maxCompensationRates;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export function AwwCRCalculator({ maxCompensationRates, searchParams }: AWWCRCalculatorProps) {
  // Get state and actions from our store
  const {
    dateOfInjury,
    specialCase,
    employedFourQuarters,
    quarter1Pay,
    quarter2Pay,
    quarter3Pay,
    quarter4Pay,
    currentStep,
    errors,
    isCalculating,
    averageWeeklyWage,
    compensationRate,
    yearOfInjury,
    maxCompRate,
    setField,
    nextStep,
    previousStep,
    resetCalculator
  } = useAWWCalculatorStore();

  // Determine if we have any errors
  const hasErrors = Object.keys(errors).length > 0;

  // Use URLSearchParams to handle any pre-filled data 
  useEffect(() => {
    if (searchParams) {
      // Handle wage if provided in URL
      const wageParam = searchParams.wage?.toString();
      if (wageParam) {
        try {
          const parsedWage = parseFloat(wageParam);
          if (!isNaN(parsedWage) && parsedWage >= 0) {
            setField("quarter1Pay", parsedWage.toString());
          }
        } catch (error) {
          console.error("Error parsing wage parameter:", error);
        }
      }

      // Handle date of injury if provided in URL
      const doiParam = searchParams.doi?.toString();
      if (doiParam) {
        try {
          const date = new Date(doiParam);
          if (!isNaN(date.getTime())) {
            setField("dateOfInjury", doiParam);
          }
        } catch (error) {
          console.error("Error parsing date of injury parameter:", error);
        }
      }
    }
  }, [searchParams, setField]);

  // Handle input changes from the form
  const handleInputChange = (name: string, value: string) => {
    setField(name, value);
  };

  // Render results if we have calculated them
  const renderResults = () => {
    if (averageWeeklyWage !== null && compensationRate !== null && yearOfInjury !== null && maxCompRate !== null) {
      return (
        <Card className="mt-8 bg-blue-50">
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
            <CardDescription>
              Based on the information provided for your {formatDisplayDate(dateOfInjury)} injury
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Average Weekly Wage</h4>
                <p className="text-xl font-semibold text-blue-700">
                  ${averageWeeklyWage.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Compensation Rate</h4>
                <p className="text-xl font-semibold text-blue-700">
                  ${compensationRate.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Year of Injury</h4>
                <p className="text-xl font-semibold">
                  {yearOfInjury}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Maximum Rate for {yearOfInjury}</h4>
                <p className="text-xl font-semibold">
                  ${maxCompRate.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Calculation Details</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-medium">Total Annual Earnings:</span> $
                  {(
                    parseFloat(quarter1Pay || "0") +
                    parseFloat(quarter2Pay || "0") +
                    parseFloat(quarter3Pay || "0") +
                    parseFloat(quarter4Pay || "0")
                  ).toFixed(2)}
                </li>
                <li>
                  <span className="font-medium">Calculation Method:</span> {employedFourQuarters === "yes" ? "Four Quarters Method" : "Alternative Method"}
                </li>
                <li>
                  <span className="font-medium">Special Case:</span> {specialCase === "none" ? "None" : specialCase}
                </li>
                <li>
                  <span className="font-medium">Weekly Compensation:</span> {(averageWeeklyWage * 0.6667).toFixed(2)} 
                  {compensationRate < (averageWeeklyWage * 0.6667) && " (limited to maximum rate)"}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Average Weekly Wage & Compensation Rate Calculator</CardTitle>
          <CardDescription>
            Complete the following steps to calculate your Average Weekly Wage and Compensation Rate
            according to South Carolina Workers&apos; Compensation laws.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
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
            
            <StepNavigation
              currentStep={currentStep}
              totalSteps={5}
              hasErrors={hasErrors}
              isCalculating={isCalculating}
              onNext={nextStep}
              onPrevious={previousStep}
              onReset={resetCalculator}
            />
          </div>
        </CardContent>
      </Card>
      
      {renderResults()}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>
          <strong>Note:</strong> This calculator follows South Carolina Workers&apos; Compensation laws as defined in 
          Section 42-1-40 of the SC Code. The average weekly wage is typically calculated by dividing the 
          employee&apos;s total wages from the four quarters immediately preceding the injury by 52.
        </p>
      </div>
    </div>
  );
}