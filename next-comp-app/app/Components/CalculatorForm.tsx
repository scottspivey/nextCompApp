// app/Components/CalculatorForm.tsx
"use client"; // Mark as client component

import React, { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentDate } from "./CalcDateFunctions/getCurrentDate";

interface CalculatorFormProps {
  currentStep: number;
  dateOfInjury: string;
  specialCase: string;
  employedFourQuarters: string;
  quarter1Pay: string;
  quarter2Pay: string;
  quarter3Pay: string;
  quarter4Pay: string;
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
}: CalculatorFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [localDateOfInjury, setLocalDateOfInjury] = useState(dateOfInjury);
  const [localSpecialCase, setLocalSpecialCase] = useState(specialCase);
  const [localEmployedFourQuarters, setLocalEmployedFourQuarters] = useState(employedFourQuarters);
  const [localQuarter1Pay, setLocalQuarter1Pay] = useState(quarter1Pay);
  const [localQuarter2Pay, setLocalQuarter2Pay] = useState(quarter2Pay);
  const [localQuarter3Pay, setLocalQuarter3Pay] = useState(quarter3Pay);
  const [localQuarter4Pay, setLocalQuarter4Pay] = useState(quarter4Pay);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const updateParams = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    router.push(`?${params.toString()}`);
  };

  if (currentStep === 1) {
    return (
      <input
        type="date"
        ref={firstInputRef}
        name="dateOfInjury"
        className="border p-2 w-full mt-2"
        value={localDateOfInjury}
        max={getCurrentDate()}
        min="1976-01-01"
        onChange={(e) => setLocalDateOfInjury(e.target.value)}
        onBlur={(e) => updateParams("dateOfInjury", e.target.value)}
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
              checked={localSpecialCase === value}
              onChange={() => setLocalSpecialCase(value)}
              onBlur={() => updateParams("specialCase", value)}
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
              checked={localEmployedFourQuarters === value}
              onChange={() => setLocalEmployedFourQuarters(value)}
              onBlur={() => updateParams("employedFourQuarters", value)}
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
        {[1, 2, 3, 4].map((q, index) => (
          <div key={q} className="mb-4">
            <label className="block mb-1">Gross Pay for Quarter {q}:</label>
            <input
              type="number"
              name={`quarter${q}Pay`}
              className="border p-2 w-full"
              value={[localQuarter1Pay, localQuarter2Pay, localQuarter3Pay, localQuarter4Pay][q - 1]}
              onChange={(e) => {
                const newValue = e.target.value;
                if (q === 1) setLocalQuarter1Pay(newValue);
                if (q === 2) setLocalQuarter2Pay(newValue);
                if (q === 3) setLocalQuarter3Pay(newValue);
                if (q === 4) setLocalQuarter4Pay(newValue);
              }}
              onBlur={(e) => updateParams(`quarter${q}Pay`, e.target.value)}
              ref={index === 0 ? firstInputRef : null}
              min="0"
            />
          </div>
        ))}
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