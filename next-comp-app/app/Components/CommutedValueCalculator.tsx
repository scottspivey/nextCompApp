'use client';

import React, { useState } from "react";
import { useCommutedValueStore } from "@/app/stores/commutedValueStore";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type MaxCompensationRates = Record<number, number>;

interface CommutedValueCalculatorProps {
  maxCompensationRates: MaxCompensationRates;
}

// Step 1: Year of Injury Schema
const YearOfInjurySchema = z.object({
  yearOfInjury: z.string().refine((val) => {
    const year = parseInt(val);
    const currentYear = new Date().getFullYear();
    return year >= 1979 && year <= currentYear;
  }, { message: `Year of Injury must be between 1979 and ${new Date().getFullYear()}` })
});

// Step 2: Compensation Rate Schema
const CompRateSchema = z.object({
  compRate: z.number()
    .positive({ message: "Compensation Rate must be positive" })
    .refine((val) => val > 0, { message: "Compensation Rate must be greater than 0" })
});

// Step 3: TTD and Credits Schema
const WeeksSchema = z.object({
  ttdPaidToDate: z.number()
    .min(0, { message: "TTD Paid to Date must be at least 0" })
    .max(500, { message: "TTD Paid to Date cannot exceed 500 weeks" }),
  otherCredit: z.number()
    .min(0, { message: "Other Credit must be at least 0" })
    .max(500, { message: "Other Credit cannot exceed 500 weeks" })
});

const CommutedValueCalculator: React.FC<CommutedValueCalculatorProps> = ({ maxCompensationRates }) => {
  const {
    yearOfInjury,
    compRate,
    ttdPaidToDate,
    otherCredit,
    currentStep,
    weeksRemaining,
    discountRate,
    discountedWeeks,
    commutedValue,
    ttdPaidToDateValue,
    commutedValue95,
    commutedValue90,
    setYearOfInjury,
    setCompRate,
    setTtdPaidToDate,
    setOtherCredit,
    nextStep,
    prevStep,
    resetCalculator,
    calculateResults
  } = useCommutedValueStore();

  // Form validations for each step
  const [stepErrors, setStepErrors] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();
  
  // Create years array for dropdown
  const years = Array.from(
    { length: currentYear - 1979 + 1 }, 
    (_, i) => (currentYear - i).toString()
  );

  // Step 1 Form
  const yearForm = useForm({
    resolver: zodResolver(YearOfInjurySchema),
    defaultValues: { yearOfInjury }
  });

  // Step 2 Form
  const compRateForm = useForm({
    resolver: zodResolver(CompRateSchema),
    defaultValues: { compRate }
  });

  // Step 3 Form
  const weeksForm = useForm({
    resolver: zodResolver(WeeksSchema),
    defaultValues: { ttdPaidToDate, otherCredit }
  });

  // Handle form submissions for each step
  const handleStep1Submit = yearForm.handleSubmit((data) => {
    setYearOfInjury(data.yearOfInjury);
    setStepErrors(null);
    nextStep();
  });

  const handleStep2Submit = compRateForm.handleSubmit((data) => {
    const year = parseInt(yearOfInjury);
    const maxRate = maxCompensationRates[year] || 1134.43;
    
    if (data.compRate > maxRate) {
      setStepErrors(`Compensation Rate cannot exceed the maximum rate of $${maxRate.toLocaleString('en-US')} for ${yearOfInjury}`);
      return;
    }
    
    setCompRate(data.compRate);
    setStepErrors(null);
    nextStep();
  });

  const handleStep3Submit = weeksForm.handleSubmit((data) => {
    if (data.ttdPaidToDate + data.otherCredit > 500) {
      setStepErrors("Total weeks (TTD Paid + Other Credit) cannot exceed 500 weeks");
      return;
    }

    setTtdPaidToDate(data.ttdPaidToDate);
    setOtherCredit(data.otherCredit);
    setStepErrors(null);
    calculateResults();
    nextStep();
  });

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      {currentStep === 1 && (
        <form onSubmit={handleStep1Submit}>
          <h3 className="text-lg font-semibold mb-4">Step 1: Year of Injury</h3>
          <label className="block mb-2">Year of Injury:</label>
          <select
            {...yearForm.register("yearOfInjury")}
            className="w-full p-2 border rounded mb-4"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          {yearForm.formState.errors.yearOfInjury && (
            <p className="text-red-500 mb-4">{yearForm.formState.errors.yearOfInjury.message}</p>
          )}
          
          {stepErrors && <p className="text-red-500 mb-4">{stepErrors}</p>}
          
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-500"
          >
            Next
          </button>
          
          <button
            type="button"
            onClick={resetCalculator}
            className="mt-4 ml-4 bg-red-500 text-white p-2 rounded hover:bg-red-400"
          >
            Reset Calculator
          </button>
        </form>
      )}

      {currentStep === 2 && (
        <form onSubmit={handleStep2Submit}>
          <h3 className="text-lg font-semibold mb-4">Step 2: Compensation Rate</h3>
          <label className="block mb-2">
            Compensation Rate ($):
            <span className="ml-1 text-sm text-gray-600">
              (Max: ${(maxCompensationRates[parseInt(yearOfInjury)] || 1134.43).toLocaleString('en-US')} for {yearOfInjury})
            </span>
          </label>
          
          <input
            type="number"
            step="0.01"
            min="0"
            {...compRateForm.register("compRate", { valueAsNumber: true })}
            className="w-full p-2 border rounded mb-4"
          />
          
          {compRateForm.formState.errors.compRate && (
            <p className="text-red-500 mb-4">{compRateForm.formState.errors.compRate.message}</p>
          )}
          
          {stepErrors && <p className="text-red-500 mb-4">{stepErrors}</p>}
          
          <button
            type="button"
            onClick={prevStep}
            className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-400"
          >
            Back
          </button>
          
          <button
            type="submit"
            className="mt-4 ml-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-500"
          >
            Next
          </button>
        </form>
      )}

      {currentStep === 3 && (
        <form onSubmit={handleStep3Submit}>
          <h3 className="text-lg font-semibold mb-4">Step 3: TTD Paid to Date & Other Credit</h3>
          
          <label className="block mb-2">TTD Paid to Date (weeks):</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="500"
            {...weeksForm.register("ttdPaidToDate", { valueAsNumber: true })}
            className="w-full p-2 border rounded mb-4"
          />
          
          {weeksForm.formState.errors.ttdPaidToDate && (
            <p className="text-red-500 mb-4">{weeksForm.formState.errors.ttdPaidToDate.message}</p>
          )}
          
          <label className="block mb-2">Other Credit (weeks):</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="500"
            {...weeksForm.register("otherCredit", { valueAsNumber: true })}
            className="w-full p-2 border rounded mb-4"
          />
          
          {weeksForm.formState.errors.otherCredit && (
            <p className="text-red-500 mb-4">{weeksForm.formState.errors.otherCredit.message}</p>
          )}
          
          {stepErrors && <p className="text-red-500 mb-4">{stepErrors}</p>}
          
          <button
            type="button"
            onClick={prevStep}
            className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-400"
          >
            Back
          </button>
          
          <button
            type="submit"
            className="mt-4 ml-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-500"
          >
            Calculate Results
          </button>
        </form>
      )}

      {currentStep === 4 && weeksRemaining !== null && (
        <div>
          <h3 className="text-lg font-bold mb-6">Summary Results</h3>
          
          <div className="space-y-2 bg-white p-4 rounded-lg shadow mb-6">
            <h4 className="font-semibold text-blue-700">Input Values</h4>
            <p>Year of Injury: {yearOfInjury}</p>
            <p>Compensation Rate: ${compRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p>TTD Weeks Paid: {ttdPaidToDate}</p>
            <p>Other Credit Weeks: {otherCredit}</p>
          </div>
          
          <div className="space-y-2 bg-white p-4 rounded-lg shadow mb-6">
            <h4 className="font-semibold text-blue-700">Calculation Results</h4>
            <p>Weeks Already Paid: {ttdPaidToDate}</p>
            <p>TTD Dollar Value Paid to Date: ${ttdPaidToDateValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p>Other Credit: {otherCredit}</p>
            <p>Weeks Remaining: {weeksRemaining}</p>
            <p>Discount Rate: {(discountRate! * 100).toFixed(2)}% per annum</p>
            <p>Weeks - Present Value: {discountedWeeks?.toFixed(4)}</p>
            <p>Compensation Rate: ${compRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="space-y-2 bg-blue-50 p-4 rounded-lg shadow mb-6">
            <h4 className="font-semibold text-blue-700">Settlement Values</h4>
            <p className="font-bold">Commuted Value: ${commutedValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p>95% of Commuted Value: ${commutedValue95?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p>90% of Commuted Value: ${commutedValue90?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={prevStep}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-400"
            >
              Back
            </button>
            
            <button
              onClick={resetCalculator}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-400"
            >
              Start New Calculation
            </button>
            
            <button
              onClick={() => window.print()}
              className="bg-green-600 text-white p-2 rounded hover:bg-green-500"
            >
              Print Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommutedValueCalculator;