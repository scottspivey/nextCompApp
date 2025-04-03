// app/Components/StepNavigation.tsx
"use client";

import React from "react";
import { Button } from "@/app/Components/ui/button"; // Adjust path
import { ArrowLeft, ArrowRight, RotateCcw, Loader2 } from "lucide-react"; // Use Loader2 for consistency
import { CalculatorStep } from "@/app/stores/awwCalculatorstore"; // Adjust path

// Updated Props Interface
export interface StepNavigationProps {
  currentStep: CalculatorStep;
  totalSteps: number;
  hasErrors: boolean; // Used for internal disabling logic
  isCalculating: boolean; // Used for disabling and showing spinner
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  nextButtonText?: string; // Optional text for the next button (e.g., "Calculate")
  showReset?: boolean; // Optional flag to control Reset button visibility
}

export function StepNavigation({
  currentStep,
  totalSteps,
  hasErrors,
  isCalculating,
  onNext,
  onPrevious,
  onReset,
  nextButtonText = "Next", // Default text is "Next"
  showReset = true, // Default to showing the reset button
}: StepNavigationProps) {
  // Determine if we can navigate to previous step
  // Disable previous if on first step or is calculating
  const canGoPrevious = currentStep > 1 && !isCalculating;

  // NOTE: Removed unused 'canGoNext' variable.
  // The disabling logic is handled directly in the button's 'disabled' prop below.

  // Generate step indicators (Using shadcn/ui colors for consistency)
  const renderStepIndicators = () => {
    const steps = [];

    for (let i = 1; i <= totalSteps; i++) {
      const isActive = i === currentStep;
      const isCompleted = i < currentStep;

      steps.push(
        <div
          key={i}
          className={`relative flex-1 flex ${i === 1 ? 'justify-start' : i === totalSteps ? 'justify-end' : 'justify-center'}`}
          // Add aria attributes for accessibility
          aria-current={isActive ? 'step' : undefined}
        >
          {/* Connecting Line (before the circle, except for the first step) */}
          {i > 1 && (
             <div
               className={`h-0.5 absolute top-5 w-full ${isCompleted || isActive ? 'bg-primary' : 'bg-border'}`}
               style={{ right: '50%', zIndex: 0 }} // Line extends from center to the left
             />
           )}
           {/* Connecting Line (after the circle, except for the last step) */}
           {i < totalSteps && (
             <div
               className={`h-0.5 absolute top-5 w-full ${isCompleted ? 'bg-primary' : 'bg-border'}`}
               style={{ left: '50%', zIndex: 0 }} // Line extends from center to the right
             />
           )}
          {/* Step Circle */}
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center border-2 z-10 transition-colors duration-300
              ${isActive
                ? 'bg-primary text-primary-foreground border-primary' // Active step
                : isCompleted
                  ? 'bg-primary/20 border-primary text-primary' // Completed step
                  : 'bg-background border-border text-muted-foreground' // Future step
              }`}
          >
            <span className="text-sm font-medium">{i}</span>
          </div>
           {/* Step Label (Optional) */}
           {/*
           <div className={`absolute top-12 text-center w-20 text-xs ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
               Step {i}
           </div>
           */}
        </div>
      );
    }

    return (
      <div className="flex w-full justify-between items-start mb-8 px-2 md:px-4"> {/* Added padding */}
        {steps}
      </div>
    );
  };

  return (
    <div className="mt-8 pt-6 border-t border-border space-y-6"> {/* Added top border */}
      {/* Render Step Indicators */}
      {renderStepIndicators()}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center flex-wrap gap-4"> {/* Added flex-wrap and gap */}
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious} // Use derived state
          className="flex items-center gap-2"
          aria-label="Go to previous step"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Reset and Next Buttons Group */}
        <div className="flex space-x-2">
          {/* Reset Button (Conditionally Rendered) */}
          {showReset && (
            <Button
              variant="ghost" // Use ghost variant for less emphasis
              onClick={onReset}
              disabled={isCalculating} // Only disable if calculating
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive" // Subtle styling
              type="button"
              aria-label="Reset calculator"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}

          {/* Next/Calculate Button */}
          <Button
            variant="default"
            onClick={onNext}
            // Disable based on combined conditions: cannot go past total steps, or has errors, or is calculating
            disabled={currentStep >= totalSteps || hasErrors || isCalculating}
            className="flex items-center gap-2 min-w-[120px] justify-center" // Ensure minimum width
            aria-label={isCalculating ? "Calculating results" : `Go to next step: ${nextButtonText}`}
          >
            {isCalculating ? (
              <>
                {/* Use Loader2 icon from lucide-react */}
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Calculating...
              </>
            ) : (
              <>
                {/* Use the nextButtonText prop */}
                {nextButtonText}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
