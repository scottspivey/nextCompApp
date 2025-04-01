// app/Components/StepNavigation.tsx
"use client";

import React from "react";
import { Button } from "@/app/Components/ui/button"
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { CalculatorStep } from "@/app/stores/awwCalculatorstore";

export interface StepNavigationProps {
  currentStep: CalculatorStep;
  totalSteps: number;
  hasErrors: boolean;
  isCalculating: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  hasErrors,
  isCalculating,
  onNext,
  onPrevious,
  onReset,
}: StepNavigationProps) {
  // Determine if we can navigate to next/previous steps
  const canGoNext = currentStep < totalSteps && !hasErrors;
  const canGoPrevious = currentStep > 1;
  
  // Generate step indicators
  const renderStepIndicators = () => {
    const steps = [];
    
    for (let i = 1; i <= totalSteps; i++) {
      steps.push(
        <div 
          key={i}
          className={`relative w-full ${i < totalSteps ? 'flex' : ''}`}
        >
          <div 
            className={`h-10 w-10 rounded-full flex items-center justify-center border-2 z-10 
              ${i === currentStep 
                ? 'bg-blue-600 text-white border-blue-600' 
                : i < currentStep 
                  ? 'bg-blue-100 border-blue-600 text-blue-600' 
                  : 'bg-white border-gray-300 text-gray-400'}`}
          >
            {i}
          </div>
          
          {i < totalSteps && (
            <div 
              className={`h-0.5 w-full absolute top-5 left-0 right-0 z-0 
                ${i < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
              style={{ left: '50%', width: '100%' }}
            />
          )}
        </div>
      );
    }
    
    return (
      <div className="flex w-full justify-between mb-8">
        {steps}
      </div>
    );
  };

  return (
    <div className="mt-8 space-y-6">
      {renderStepIndicators()}
      
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious || isCalculating}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="destructive"
            onClick={onReset}
            disabled={isCalculating}
            className="flex items-center gap-2"
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          
          <Button
            variant="default"
            onClick={onNext}
            disabled={!canGoNext || isCalculating}
            className="flex items-center gap-2"
          >
            {isCalculating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}