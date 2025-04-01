// app/Components/CalculatorForm.tsx
"use client";

import React, { useRef, useEffect, RefObject } from "react";
import { CalculatorStep } from "@/app/stores/awwCalculatorstore";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/app/Components/ui/tooltip";
import { Input } from "@/app/Components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/app/Components/ui/radio-group"
import { getCurrentDate } from "@/app/Components/CalcDateFunctions/getCurrentDate";
import { Label } from "@/app/Components/ui/label";
import { InfoIcon } from "lucide-react";
import { getQuarterContainingDateOfInjury } from "@/app/Components/CalcDateFunctions/getQuarterContainingDateOfInjury";

export interface CalculatorFormProps {
  currentStep: CalculatorStep;
  dateOfInjury: string;
  specialCase: string;
  employedFourQuarters: string;
  quarter1Pay: string;
  quarter2Pay: string;
  quarter3Pay: string;
  quarter4Pay: string;
  errors: Record<string, string>;
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
  errors,
  handleInputChange,
}: CalculatorFormProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);const guardRadioRef = useRef<HTMLButtonElement>(null);
  const employedYesRef = useRef<HTMLButtonElement>(null);
  const quarterPayRefs = useRef<RefObject<HTMLInputElement | null>[]>([
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [currentStep]);

  // Special cases options
  const specialCaseOptions = [
    { value: "guard", label: "State and/or National Guard" },
    { value: "volunteerFF", label: "Volunteer Fire Fighter" },
    { value: "volunteerRescue", label: "Volunteer Rescue Squad Member" },
    { value: "volunteerSheriff", label: "Volunteer Deputy Sheriff" },
    { value: "volunteerConstable", label: "Volunteer State Constable" },
    { value: "inmate", label: "Inmate" },
    { value: "student", label: "Student Engaged in Work Study, Marketing Education, or Apprenticeship" },
    { value: "none", label: "None of the Above" }
  ];

  // Yes/No options for employment duration
  const yesNoOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" }
  ];

  // Render quarters labels based on date of injury
  const getQuarterLabel = (quarterNum: number) => {
    if (!dateOfInjury) return `Quarter ${quarterNum}`;
    
    try {
      const doi = new Date(dateOfInjury);
      const year = doi.getFullYear();
      // This is simplified - in a real app you'd calculate the actual quarters
      // based on the date of injury
      const startQuarter = Math.floor((doi.getMonth() + 1) / 3);
      
      // Calculate quarter periods
      const quarterIndex = (startQuarter + 4 - quarterNum) % 4;
      const quarterYear = quarterNum > startQuarter ? year - 1 : year;
      const startMonth = quarterIndex * 3 + 1;
      const endMonth = startMonth + 2;
      
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      return `Quarter ${quarterNum}: ${monthNames[startMonth-1]}-${monthNames[endMonth-1]} ${quarterYear}`;
    } catch (error) {
      return `Quarter ${quarterNum}`;
    }
  };

  if (currentStep === 1) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Date of Injury</h3>
          <p className="text-gray-600 mb-4">
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
                  <InfoIcon className="h-4 w-4 text-gray-500" />
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
            ref={firstInputRef}
            value={dateOfInjury}
            max={getCurrentDate()}
            min="1979-01-01"
            onChange={(e) => handleInputChange("dateOfInjury", e.target.value)}
            className={errors.dateOfInjury ? "border-red-500" : ""}
          />
          
          {errors.dateOfInjury && (
            <p className="text-red-500 text-sm mt-1">{errors.dateOfInjury}</p>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Special Employment Situations</h3>
          <p className="text-gray-600 mb-4">
            Select if any of these special employment situations apply. These may affect how your compensation is calculated.
          </p>
        </div>
        
        <RadioGroup
          value={specialCase}
          onValueChange={(value) => handleInputChange("specialCase", value)}
          className="space-y-3"
        >
          {specialCaseOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`specialCase-${option.value}`}
                ref={option.value === "guard" ? guardRadioRef : null}
              />
              <Label
                htmlFor={`specialCase-${option.value}`}
                className="font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {errors.specialCase && (
          <p className="text-red-500 text-sm mt-1">{errors.specialCase}</p>
        )}
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Employment Duration</h3>
          <p className="text-gray-600 mb-4">
            Were you employed for all four quarters prior to your injury?
          </p>
        </div>
        
        <RadioGroup
          value={employedFourQuarters}
          onValueChange={(value) => handleInputChange("employedFourQuarters", value)}
          className="space-y-3"
        >
          {yesNoOptions.map((option, index) => (
            <div key={option.value} className="flex items-start space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`employedFourQuarters-${option.value}`}
                ref={index === 0 ? employedYesRef : null}
              />
              <Label
                htmlFor={`employedFourQuarters-${option.value}`}
                className="font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {errors.employedFourQuarters && (
          <p className="text-red-500 text-sm mt-1">{errors.employedFourQuarters}</p>
        )}
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Earnings History</h3>
          <p className="text-gray-600 mb-4">
            Enter your gross earnings for each of the four quarters prior to your injury.
            {dateOfInjury && (
              <span className="block mt-1 text-blue-600 font-medium">
                Based on your injury date ({new Date(dateOfInjury).toLocaleDateString()}), 
                we need your earnings for the following periods:
              </span>
            )}
          </p>
        </div>
        
        {[1, 2, 3, 4].map((q, index) => {
          const payKey = `quarter${q}Pay` as keyof Pick<CalculatorFormProps, "quarter1Pay" | "quarter2Pay" | "quarter3Pay" | "quarter4Pay">;
          const payValue = q === 1 ? quarter1Pay : q === 2 ? quarter2Pay : q === 3 ? quarter3Pay : quarter4Pay;
          const errorKey = `quarter${q}Pay`;
          
          return (
            <div key={q} className="space-y-1">
              <Label htmlFor={`quarter${q}Pay`} className="font-medium">
                {getQuarterLabel(q)}:
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  type="number"
                  id={`quarter${q}Pay`}
                  className={`pl-7 ${errors[errorKey] ? "border-red-500" : ""}`}
                  value={payValue}
                  onChange={(e) => handleInputChange(payKey, e.target.value)}
                  ref={index === 0 ? firstInputRef : quarterPayRefs.current[index]}
                  min="0"
                  step="0.01"
                />
              </div>
              {errors[errorKey] && (
                <p className="text-red-500 text-sm mt-1">{errors[errorKey]}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (currentStep === 5) {
    // For shorter than four quarters - could be implemented in the future
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Less Than Four Quarters</h3>
          <p className="text-gray-600 mb-4">
            Since you were employed for less than four quarters, a different calculation method will be used.
            This feature is currently in development.
          </p>
        </div>
      </div>
    );
  }

  return null;
}