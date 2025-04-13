// app/Components/CalculatorForm.tsx
"use client";

import React, { useRef, useEffect, RefObject } from "react";
// Import AWWErrors type from the store
import { CalculatorStep, AWWErrors } from "@/app/stores/awwCalculatorstore"; // Adjust path if needed
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/app/Components/ui/tooltip"; // Adjust path
import { Input } from "@/app/Components/ui/input"; // Adjust path
import { RadioGroup, RadioGroupItem } from "@/app/Components/ui/radio-group"; // Adjust path
import { Label } from "@/app/Components/ui/label"; // Adjust path
import { InfoIcon } from "lucide-react";
import { getCurrentDate, getQuarterLabel } from "@/app/utils/dateUtils"; // Import from utils
import { specialCaseOptions, yesNoOptions, MIN_DOI_DATE } from "./awwConstants"; // Import constants

// Interface for component props
export interface CalculatorFormProps {
  currentStep: CalculatorStep;
  dateOfInjury: string;
  specialCase: string;
  employedFourQuarters: string;
  quarter1Pay: string;
  quarter2Pay: string;
  quarter3Pay: string;
  quarter4Pay: string;
  errors: AWWErrors; // Use the specific AWWErrors type from the store
  handleInputChange: (name: string, value: string) => void;
}

/**
 * Renders the form inputs for a specific step of the AWW calculator.
 */
export function CalculatorForm({
  currentStep,
  dateOfInjury,
  specialCase,
  employedFourQuarters,
  quarter1Pay,
  quarter2Pay,
  quarter3Pay,
  quarter4Pay,
  errors, // Now typed as AWWErrors
  handleInputChange,
}: CalculatorFormProps) {
  // Refs for focusing inputs on step change
  const firstInputRef = useRef<HTMLInputElement>(null);
  const guardRadioRef = useRef<HTMLButtonElement>(null); // Ref for specific radio item if needed
  const employedYesRef = useRef<HTMLButtonElement>(null); // Ref for specific radio item if needed
  const quarterPayRefs = useRef<Array<RefObject<HTMLInputElement | null>>>([
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]);

  // Effect to focus the first relevant input when the step changes
  useEffect(() => {
    switch (currentStep) {
      case 1:
        firstInputRef.current?.focus();
        break;
      case 2:
        // Focus the first radio item generally
         const firstSpecialCaseRadio = document.querySelector<HTMLButtonElement>('input[id^="specialCase-"]');
         firstSpecialCaseRadio?.focus();
        // guardRadioRef.current?.focus(); // Or focus a specific one like 'guard' if desired
        break;
      case 3:
        employedYesRef.current?.focus(); // Focus the 'Yes' option
        break;
      case 4:
         // Focus the first quarter pay input if it exists
         // Check if employedFourQuarters is 'yes' because step 4 only renders then
         if (employedFourQuarters === 'yes') {
             firstInputRef.current?.focus(); // Reuse firstInputRef for step 4's first input
         }
        break;
      // Add cases for other steps if they need focus management
    }
  }, [currentStep, employedFourQuarters]); // Add employedFourQuarters dependency for step 4 focus logic

  // --- Step 1: Date of Injury ---
  if (currentStep === 1) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Date of Injury</h3>
          <p className="text-muted-foreground mb-4"> {/* Use text-muted-foreground */}
            Please enter the date when the work-related injury occurred.
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Label htmlFor="dateOfInjury" className="font-medium">
              Date of Injury
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" /> {/* Use text-muted-foreground */}
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">This date determines which maximum compensation rate applies to your claim.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Input
            type="date"
            id="dateOfInjury"
            ref={firstInputRef} // Ref for focusing
            value={dateOfInjury}
            max={getCurrentDate()} // Use utility function
            min={MIN_DOI_DATE} // Use constant
            onChange={(e) => handleInputChange("dateOfInjury", e.target.value)}
            className={errors.dateOfInjury ? "border-destructive" : ""} // Use border-destructive
            aria-invalid={!!errors.dateOfInjury} // Accessibility
            aria-describedby={errors.dateOfInjury ? "dateOfInjury-error" : undefined}
          />

          {errors.dateOfInjury && (
            (<p id="dateOfInjury-error" className="text-sm text-destructive mt-1">{errors.dateOfInjury}</p>) // Use text-destructive
          )}
        </div>
      </div>
    );
  }

  // --- Step 2: Special Employment Situations ---
  if (currentStep === 2) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Special Employment Situations</h3>
          <p className="text-muted-foreground mb-4"> {/* Use text-muted-foreground */}
            Select if any of these special employment situations apply. These may affect how your compensation is calculated.
          </p>
        </div>
        <RadioGroup
          value={specialCase}
          onValueChange={(value) => handleInputChange("specialCase", value)}
          className="space-y-3"
          aria-labelledby="special-case-heading" // Accessibility
        >
          <span id="special-case-heading" className="sr-only">Special Employment Situations</span> {/* Added for screen reader */}
          {/* Use options from constants */}
          {specialCaseOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-3"> {/* Increased space */}
              <RadioGroupItem
                value={option.value}
                id={`specialCase-${option.value}`}
                ref={option.value === "guard" ? guardRadioRef : null} // Assign ref if needed
                aria-describedby={`specialCase-${option.value}-label`}
              />
              <Label
                htmlFor={`specialCase-${option.value}`}
                id={`specialCase-${option.value}-label`}
                className="font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.specialCase && (
          (<p className="text-sm text-destructive mt-1">{errors.specialCase}</p>) // Use text-destructive
        )}
      </div>
    );
  }

  // --- Step 3: Employment Duration ---
  if (currentStep === 3) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 id="employment-duration-heading" className="text-lg font-medium mb-2">Employment Duration</h3> {/* Added ID */}
          <p className="text-muted-foreground mb-4"> {/* Use text-muted-foreground */}
            Were you employed by the employer where the injury occurred for all of the four quarters immediately prior to your injury?
          </p>
        </div>
        <RadioGroup
          value={employedFourQuarters}
          onValueChange={(value) => handleInputChange("employedFourQuarters", value)}
          className="space-y-3"
          aria-labelledby="employment-duration-heading" // Accessibility
        >
          {/* Use options from constants */}
          {yesNoOptions.map((option, index) => (
            <div key={option.value} className="flex items-start space-x-3"> {/* Increased space */}
              <RadioGroupItem
                value={option.value}
                id={`employedFourQuarters-${option.value}`}
                ref={index === 0 ? employedYesRef : null} // Assign ref to 'Yes'
                aria-describedby={`employedFourQuarters-${option.value}-label`}
              />
              <Label
                htmlFor={`employedFourQuarters-${option.value}`}
                id={`employedFourQuarters-${option.value}-label`}
                className="font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.employedFourQuarters && (
          (<p className="text-sm text-destructive mt-1">{errors.employedFourQuarters}</p>) // Use text-destructive
        )}
      </div>
    );
  }

  // --- Step 4: Earnings History (Only if employedFourQuarters === 'yes') ---
   if (currentStep === 4 && employedFourQuarters === 'yes') {
     // Ensure dateOfInjury is valid before trying to generate labels
     const isValidDoi = !!dateOfInjury && !isNaN(new Date(dateOfInjury).getTime());

     return (
       <div className="space-y-6">
         <div className="mb-6">
           <h3 className="text-lg font-medium mb-2">Earnings History</h3>
           <p className="text-muted-foreground mb-4"> {/* Use text-muted-foreground */}
             Enter your gross earnings for each of the four quarters immediately prior to your injury.
             {isValidDoi && (
               <span className="block mt-1 text-primary font-medium"> {/* Use text-primary */}
                 Based on your injury date ({new Date(dateOfInjury).toLocaleDateString()}),
                 we need your earnings for the following periods (Quarter 1 is the most recent):
               </span>
             )}
           </p>
         </div>
         {/* Map through quarters 1 to 4 */}
         {[1, 2, 3, 4].map((q, index) => {
           // Dynamically create the key for accessing props and errors
           const payKey = `quarter${q}Pay` as keyof Pick<CalculatorFormProps, "quarter1Pay" | "quarter2Pay" | "quarter3Pay" | "quarter4Pay">;
           // Access the correct prop value based on the quarter number
           const payValue = q === 1 ? quarter1Pay : q === 2 ? quarter2Pay : q === 3 ? quarter3Pay : quarter4Pay;
           // Error key uses the specific property name from AWWErrors
           const errorKey = `quarter${q}Pay` as keyof AWWErrors;

           return (
             <div key={q} className="space-y-1">
               <Label htmlFor={`quarter${q}Pay`} className="font-medium">
                 {/* Use utility function to get quarter label */}
                 {getQuarterLabel(q, dateOfInjury)}:
               </Label>
               <div className="relative">
                 {/* Dollar sign prefix */}
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">$</span> {/* Use text-muted-foreground */}
                 <Input
                   type="number" // Use number type for better mobile keyboards
                   inputMode="decimal" // Hint for decimal input
                   id={`quarter${q}Pay`}
                   className={`pl-8 ${errors[errorKey] ? "border-destructive" : ""}`} // Increased padding, use border-destructive
                   value={payValue}
                   onChange={(e) => handleInputChange(payKey, e.target.value)}
                   // Assign ref to the first input, others use dynamic refs
                   ref={index === 0 ? firstInputRef : quarterPayRefs.current[index]}
                   min="0"
                   step="0.01" // Allow cents
                   placeholder="0.00"
                   aria-invalid={!!errors[errorKey]} // Accessibility
                   aria-describedby={errors[errorKey] ? `${errorKey}-error` : undefined}
                 />
               </div>
               {/* Display error message if exists */}
               {errors[errorKey] && (
                 (<p id={`${errorKey}-error`} className="text-sm text-destructive mt-1">{errors[errorKey]}</p>) // Use text-destructive
               )}
             </div>
           );
         })}
       </div>
     );
   }


  // --- Step 5: Less Than Four Quarters ---
  // This step is reached if currentStep is 5 OR (currentStep is 4 AND employedFourQuarters === 'no')
  if (currentStep === 5 || (currentStep === 4 && employedFourQuarters === 'no')) {
    // Placeholder for alternative calculation methods
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Employment Less Than Four Quarters</h3>
          <p className="text-muted-foreground mb-4"> {/* Use text-muted-foreground */}
            Calculating the Average Weekly Wage for employees working less than the four preceding quarters requires specific methods outlined in S.C. Code § 42-1-40.
          </p>
          <p className="text-muted-foreground mb-4"> {/* Use text-muted-foreground */}
            Common methods include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1"> {/* Use text-muted-foreground */}
            <li>Using the average earnings for the days actually worked.</li>
            <li>Using the wages of a similar employee in the same type of employment.</li>
            <li>Using the contracted full-time weekly wage.</li>
          </ul>
           <p className="text-muted-foreground mt-4"> {/* Use text-muted-foreground */}
             This calculator currently focuses on the standard four-quarter method. Please consult the statute or a legal professional for calculations involving shorter employment periods.
           </p>
           {/* Future Implementation: Add inputs here for the alternative methods */}
        </div>
      </div>
    );
  }

  // Fallback if no step matches (shouldn't happen in normal flow)
  return null;
}
