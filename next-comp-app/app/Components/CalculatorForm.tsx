// app/Components/CalculatorForm.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { getCurrentDate } from "./CalcDateFunctions/getCurrentDate";

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

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  if (currentStep === 1) {
    return (
      <input
        type="date"
        ref={firstInputRef}
        name="dateOfInjury"
        className="border p-2 w-full mt-2"
        value={dateOfInjury}
        max={getCurrentDate()}
        min="1976-01-01"
        onChange={(e) => handleInputChange("dateOfInjury", e.target.value)}
      />
    );
  }

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
      <div className="flex flex-col space-y-2">
        {options.map(({ value, label }, index) => (
          <label key={value} className="flex items-center">
            <input
              type="radio"
              name="specialCase"
              value={value}
              checked={specialCase === value}
              onChange={() => handleInputChange("specialCase", value)}
              className="m-1"
              ref={index === 0 ? firstInputRef : null}
            />
            {label}
          </label>
        ))}
      </div>
    );
  }

  if (currentStep === 3) {
    const options = [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ];

    return (
      <div className="flex flex-col space-y-2">
        {options.map(({ value, label }, index) => (
          <label key={value} className="flex items-center">
            <input
              type="radio"
              name="employedFourQuarters"
              value={value}
              checked={employedFourQuarters === value}
              onChange={() => handleInputChange("employedFourQuarters", value)}
              className="m-1"
              ref={index === 0 ? firstInputRef : null}
            />
            {label}
          </label>
        ))}
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <>
        {[1, 2, 3, 4].map((q, index) => {
          const payKey = `quarter${q}Pay` as keyof CalculatorFormProps;
          const payValue = String(
            q === 1 ? quarter1Pay : 
            q === 2 ? quarter2Pay : 
            q === 3 ? quarter3Pay : 
            quarter4Pay
          );
          
          return (
            <div key={q} className="mb-4">
              <label className="block mb-1">Gross Pay for Quarter {q}:</label>
              <input
                type="number"
                name={payKey}
                className="border p-2 w-full"
                value={payValue}
                onChange={(e) => handleInputChange(payKey, e.target.value)}
                ref={index === 0 ? firstInputRef : null}
                min="0"
              />
            </div>
          );
        })}
      </>
    );
  }

  if (currentStep === 5) {
    // For less than four quarters - could be customized further
    return (
      <div>
        <p>This step needs to be implemented for employees with less than four quarters of employment.</p>
        {/* Add form for less than four quarters */}
      </div>
    );
  }

  return null;
}