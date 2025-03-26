// app/Components/StepNavigation.tsx
"use client";

import React from "react";

export interface StepNavigationProps {
  currentStep: number;
  nextStep: number | null;
  prevStep: number | null;
  errors: { [key: string]: string };
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
}

export function StepNavigation({
  nextStep,
  prevStep,
  errors,
  onNext,
  onPrevious,
  onReset,
}: StepNavigationProps) {
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="mt-4">
      {prevStep !== null && (
        <button 
          onClick={onPrevious} 
          className="mr-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-400"
        >
          Back
        </button>
      )}
      
      {nextStep !== null && (
        <button 
          onClick={onNext} 
          className={`bg-blue-600 text-white p-2 rounded ${hasErrors ? 'opacity-50 cursor-not-allowed' : 'focus:bg-blue-500 hover:bg-blue-500'}`}
          disabled={hasErrors}
        >
          Next
        </button>
      )}
      
      <button 
        onClick={onReset} 
        className="bg-red-500 text-white p-2 rounded float-right focus:bg-red-400 hover:bg-red-400"
      >
        Reset Calculator
      </button>
    </div>
  );
}