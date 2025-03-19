// app/Components/StepNavigation.tsx
"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface StepNavigationProps {
  currentStep: number;
  nextStep: number | null;
  prevStep: number | null;
  errors: { [key: string]: string };
  dateOfInjury: string;
  specialCase: string;
  employedFourQuarters: string;
  quarter1Pay: string;
  quarter2Pay: string;
  quarter3Pay: string;
  quarter4Pay: string;
}

export function StepNavigation({
  currentStep,
  nextStep,
  prevStep,
  errors,
  dateOfInjury,
  specialCase,
  employedFourQuarters,
  quarter1Pay,
  quarter2Pay,
  quarter3Pay,
  quarter4Pay,
}: StepNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasErrors = Object.keys(errors).length > 0;

  const goToStep = (step: number | null) => {
    if (step === null) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", step.toString());
    router.push(`?${params.toString()}`);
  };

  const resetCalculator = () => {
    const params = new URLSearchParams();
    params.set("step", "1");
    params.set("dateOfInjury", new Date().toLocaleDateString("en-CA"));
    params.set("specialCase", "none");
    params.set("employedFourQuarters", "yes");
    params.set("quarter1Pay", "2500");
    params.set("quarter2Pay", "2500");
    params.set("quarter3Pay", "2500");
    params.set("quarter4Pay", "2500");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mt-4">
      {prevStep !== null && (
        <button 
          onClick={() => goToStep(prevStep)} 
          className="mr-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-400"
        >
          Back
        </button>
      )}
      
      {nextStep !== null && (
        <button 
          onClick={() => !hasErrors && goToStep(nextStep)} 
          className={`bg-blue-600 text-white p-2 rounded ${hasErrors ? 'opacity-50 cursor-not-allowed' : 'focus:bg-blue-500 hover:bg-blue-500'}`}
          disabled={hasErrors}
        >
          Next
        </button>
      )}
      
      <button 
        onClick={resetCalculator} 
        className="bg-red-500 text-white p-2 rounded float-right focus:bg-red-400 hover:bg-red-400"
      >
        Reset Calculator
      </button>
    </div>
  );
}