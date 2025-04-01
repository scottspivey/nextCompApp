// app/Components/CalculatorForm.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { getCurrentDate } from "./CalcDateFunctions/getCurrentDate";
import { getQuarterContainingDateOfInjury } from "./CalcDateFunctions/getQuarterContainingDateOfInjury";

export interface CalculatorFormProps {
  currentStep: number;
  dateOfInjury: string;
  specialCase: string;
  employedFourQuarters: string;
  quarter1Pay: string;
  quarter2Pay: string;
  quarter3Pay: string;
  quarter4Pay: string;
  handleInputChange: (name: string, value: string) => void;
}

export function CalculatorForm({
  currentStep,
  dateOfInjury,
  specialCase,
  employedFourQuarters,
  quarter1Pay,
  quarter2Pay,
  quarter3Pay,
  quarter4Pay,
  handleInputChange,
}: CalculatorFormProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus the first input on each step when component mounts
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [currentStep]);

  // Step 1: Date of Injury
  if (currentStep === 1) {
    return (
      <div className="mb-4">
        <p className="mb-3 text-gray-600">
          Select the date when the injury occurred. This date is used to determine the correct
          quarters for wage calculation and the applicable maximum compensation rate.
        </p>
        <label className="block text-gray-700 mb-2">Date of Injury:</label>
        <input
          type="date"
          ref={firstInputRef}
          name="dateOfInjury"
          className="border p-2 w-full rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          value={dateOfInjury}
          max={getCurrentDate()}
          min="1979-01-01"
          onChange={(e) => handleInputChange("dateOfInjury", e.target.value)}
        />
        
        {dateOfInjury && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Based on this date, we&apos;ll need wage information from:
              <br />
              <strong>{getQuarterContainingDateOfInjury(dateOfInjury)}</strong>
              <br />
              and the three quarters preceding it.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Employee Type / Special Cases
  if (currentStep === 2) {
    const options = [
      { value: "guard", label: "State and/or National Guard" },
      { value: "volunteerFF", label: "Volunteer Fire Fighter" },
      { value: "volunteerRescue", label: "Volunteer Rescue Squad Member" },
      { value: "volunteerSheriff", label: "Volunteer Deputy Sheriff" },
      { value: "volunteerConstable", label: "Volunteer State Constable" },
      { value: "inmate", label: "Inmate" },
      { value: "student", label: "Student Engaged in Work Study, Marketing Education, or Apprenticeship" },
      { value: "none", label: "None of the Above" }
    ];

    return (
      <div className="mb-4">
        <p className="mb-3 text-gray-600">
          Some worker categories have special rules for calculating average weekly wage.
          Select any special category that applies to this claim.
        </p>
        <fieldset className="mt-4">
          <legend className="text-gray-700 mb-2">Employee Type:</legend>
          <div className="space-y-2">
            {options.map(({ value, label }, index) => (
              <label key={value} className="flex items-center p-2 rounded-md hover:bg-gray-50">
                <input
                  type="radio"
                  name="specialCase"
                  value={value}
                  checked={specialCase === value}
                  onChange={() => handleInputChange("specialCase", value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  ref={index === 0 ? firstInputRef : null}
                />
                <span className="ml-2 text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    );
  }

  // Step 3: Employment History
  if (currentStep === 3) {
    const options = [
      { value: "yes", label: "Yes, employed for the full four quarters before injury" },
      { value: "no", label: "No, employed for less than four quarters before injury" },
    ];

    return (
      <div className="mb-4">
        <p className="mb-3 text-gray-600">
          Per SC Code § 42-1-40, wage calculation is normally based on the four quarters preceding the 
          injury. If the employee wasn&apos;t employed for all four quarters, a different method applies.
        </p>
        <fieldset className="mt-4">
          <legend className="text-gray-700 mb-2">Was the employee employed for all four quarters preceding the injury?</legend>
          <div className="space-y-2">
            {options.map(({ value, label }, index) => (
              <label key={value} className="flex items-center p-2 rounded-md hover:bg-gray-50">
                <input
                  type="radio"
                  name="employedFourQuarters"
                  value={value}
                  checked={employedFourQuarters === value}
                  onChange={() => handleInputChange("employedFourQuarters", value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  ref={index === 0 ? firstInputRef : null}
                />
                <span className="ml-2 text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    );
  }

  // Step 4: Quarterly Pay (For those employed all four quarters)
  if (currentStep === 4 && employedFourQuarters === "yes") {
    const quarters = [
      { key: "quarter1Pay", label: "Quarter 1 (Most Recent)", value: quarter1Pay },
      { key: "quarter2Pay", label: "Quarter 2", value: quarter2Pay },
      { key: "quarter3Pay", label: "Quarter 3", value: quarter3Pay },
      { key: "quarter4Pay", label: "Quarter 4 (Earliest)", value: quarter4Pay },
    ];

    return (
      <div className="mb-4">
        <p className="mb-3 text-gray-600">
          Enter the total gross wages for each of the four quarters preceding the date of injury,
          starting with the most recent quarter.
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          {quarters.map((quarter, index) => (
            <div key={quarter.key} className="mb-3">
              <label className="block text-gray-700 mb-1">
                {quarter.label}:
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name={quarter.key}
                  className="border p-2 pl-7 w-full rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={quarter.value}
                  onChange={(e) => handleInputChange(quarter.key, e.target.value)}
                  ref={index === 0 ? firstInputRef : null}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            Total wages: $
            {(
              parseFloat(quarter1Pay || "0") +
              parseFloat(quarter2Pay || "0") +
              parseFloat(quarter3Pay || "0") +
              parseFloat(quarter4Pay || "0")
            ).toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  // Step 5: Alternative method for less than four quarters of employment
  if (currentStep === 4 && employedFourQuarters === "no") {
    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h4 className="font-semibold text-yellow-800 mb-2">
          Alternative Calculation Method
        </h4>
        <p className="mb-3 text-gray-700">
          For employees with less than four quarters of employment, South Carolina law 
          provides alternative methods for calculating the average weekly wage:
        </p>
        <ul className="list-disc list-inside mb-3 text-gray-700 space-y-2">
          <li>
            If employed for less than 52 weeks but more than 7 weeks, divide total wages 
            by number of weeks worked
          </li>
          <li>
            For less than 7 weeks, use wages of similar employee in same employment
          </li>
          <li>
            If neither method is applicable, use full-time weekly wage
          </li>
        </ul>
        <p className="text-sm text-yellow-600">
          Please contact our support team for assistance with these special cases, 
          or upgrade to our premium plan for access to these alternative calculations.
        </p>
      </div>
    );
  }

  return null;
}