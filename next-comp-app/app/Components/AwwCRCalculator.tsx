"use client";

import React from "react";
import { parseISO, isValid } from "date-fns";
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { CalculatorForm } from "./CalculatorForm";
import { StepNavigation } from "./StepNavigation";
import { getCurrentDate } from "./CalcDateFunctions/getCurrentDate";
import { formatDisplayDate } from "./CalcDateFunctions/formatDisplayDate";
import { getQuarterContainingDateOfInjury } from "./CalcDateFunctions/getQuarterContainingDateOfInjury";
import { useSearchParams } from "next/navigation";

interface MaxCompensationRates {
  [year: number]: number;
}

interface AwwCRCalculatorProps {
  maxCompensationRates: MaxCompensationRates;
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function AwwCRCalculator({ maxCompensationRates }: AwwCRCalculatorProps) {
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get("step") || "1");
  const dateOfInjury = searchParams.get("dateOfInjury") || getCurrentDate();
  const specialCase = searchParams.get("specialCase") || "none";
  const employedFourQuarters = searchParams.get("employedFourQuarters") || "yes";
  const quarter1Pay = searchParams.get("quarter1Pay") || "2500";
  const quarter2Pay = searchParams.get("quarter2Pay") || "2500";
  const quarter3Pay = searchParams.get("quarter3Pay") || "2500";
  const quarter4Pay = searchParams.get("quarter4Pay") || "2500";
  
  // Validation
  const errors: { [key: string]: string } = {};

  if (step === 1) {
    if (!dateOfInjury) {
      errors.dateOfInjury = "Date of Injury is required.";
    } else if (!isValid(parseISO(dateOfInjury))) {
      errors.dateOfInjury = "Invalid date format.";
    }
  }

  if (step === 2) {
    const validOptions = [
      "none", "volunteerFF", "volunteerSheriff", "guard",
      "volunteerRescue", "volunteerConstable", "inmate", "student"
    ];

    if (!validOptions.includes(specialCase)) {
      errors.specialCase = "You must select a valid option before proceeding.";
    }
  }

  if (step === 3) {
    const validOptions = ["yes", "no"];
    if (!validOptions.includes(employedFourQuarters)) {
      errors.employedFourQuarters = "You must select 'yes' or 'no' before proceeding.";
    }
  }

  if (step === 4) {
    [1, 2, 3, 4].forEach((q) => {
      const value = searchParams.get(`quarter${q}Pay`) as string || "0";
      if (!value || parseFloat(value) < 0) {
        errors[`quarter${q}Pay`] = "Enter a valid amount.";
      }
    });
  }


  let averageWeeklyWage: string | null = null;
  let compensationRate: string | null = null;
  let totalAnnualPay: string | null = null;
  let maxRateNotice: string | null = null;
  let minRateNotice: string | null = null;

  if ((step === 4 && employedFourQuarters === "yes") || step === 6) {
    const calculatedTotalPay = [1, 2, 3, 4].reduce(
      (sum, q) => {
        const payParam = searchParams.get(`quarter${q}Pay`) || "0";
        return sum + (parseFloat(payParam) || 0);
      },
      0
    );
    
    const aww = calculatedTotalPay / 52;
    const initialCompRate = aww < 75 ? aww : Math.max(aww * 0.6667, 75);
    
    try {
      const maxRate = maxCompensationRates[parseISO(dateOfInjury).getFullYear()] || null;
      const finalCompRate = maxRate !== null && initialCompRate > maxRate ? maxRate : initialCompRate;
      
      totalAnnualPay = calculatedTotalPay.toFixed(2);
      averageWeeklyWage = aww.toFixed(2);
      compensationRate = finalCompRate.toFixed(2);

      if (maxRate !== null && initialCompRate > maxRate) {
        maxRateNotice = '*The compensation rate was limited by the maximum compensation rate for ${parseISO(dateOfInjury).getFullYear()}: $${maxRate.toFixed(2)}*';
      }
      if (aww <= 75) {
        minRateNotice = 'The compensation rate was set to the Average Weekly Wage because the Average Weekly Wage is less than $75.00';
      }
      if (aww <112.5 && aww >75) { 
        minRateNotice = 'The compensation rate was limited by the minimum compensation rate of $75.00';
      }
    } catch (error) {
      console.error("Error calculating compensation rate:", error);
    }
  }
    // Define step definitions for rendering
  const steps = [
    {
      title: "Input the date of injury",
      description: `Select a date between January 1, 1976, and ${formatDisplayDate(getCurrentDate())}.`,
      content: (
        <CalculatorForm
          currentStep={1}
          dateOfInjury={dateOfInjury}
          specialCase={specialCase}
          employedFourQuarters={employedFourQuarters}
          quarter1Pay={quarter1Pay}
          quarter2Pay={quarter2Pay}
          quarter3Pay={quarter3Pay}
          quarter4Pay={quarter4Pay}
        />
      ),
      error: errors.dateOfInjury,
      nextStep: 2,
      prevStep: null,
    },
    {
      title: "Was the injured worker injured while working as any of the following?",
      options: [
        { value: "guard", label: "State and/or National Guard" },
        { value: "volunteerFF", label: "Volunteer Fire Fighter" },
        { value: "volunteerRescue", label: "Volunteer Rescue Squad Member" },
        { value: "volunteerSheriff", label: "Volunteer Deputy Sheriff" },
        { value: "volunteerConstable", label: "Volunteer State Constable" },
        { value: "inmate", label: "Inmate" },
        { value: "student", label: "Student Engaged in Work Study, Marketing Education, or Apprenticeship" },
        { value: "none", label: "None of the Above" }
      ],
      content: (
        <CalculatorForm
          currentStep={2}
          dateOfInjury={dateOfInjury}
          specialCase={specialCase}
          employedFourQuarters={employedFourQuarters}
          quarter1Pay={quarter1Pay}
          quarter2Pay={quarter2Pay}
          quarter3Pay={quarter3Pay}
          quarter4Pay={quarter4Pay}
        />
      ),
      error: errors.specialCase,
      nextStep: specialCase === "none" ? 3 : 
                specialCase === "guard" ? 4 : 
                specialCase === "volunteerFF" ? 5 : 
                specialCase === "volunteerRescue" ? 6 : 
                specialCase === "volunteerSheriff" ? 7 : 
                specialCase === "volunteerConstable" ? 8 : 
                specialCase === "inmate" ? 9 : 
                specialCase === "student" ? 10 : 3,
      prevStep: 1,
    },
    {
      title: `Was the injured worker employed for at least four complete quarters prior to ${formatDisplayDate(dateOfInjury)}?`,
      description: `Note: The four quarters of employment cannot include employment during ${getQuarterContainingDateOfInjury(dateOfInjury)}.`,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      content: (
        <CalculatorForm
          currentStep={3}
          dateOfInjury={dateOfInjury}
          specialCase={specialCase}
          employedFourQuarters={employedFourQuarters}
          quarter1Pay={quarter1Pay}
          quarter2Pay={quarter2Pay}
          quarter3Pay={quarter3Pay}
          quarter4Pay={quarter4Pay}
        />
      ),
      error: errors.employedFourQuarters,
      nextStep: employedFourQuarters === "yes" ? 4 : 5,
      prevStep: 2,
    },
    {
      title: "Enter the employee's gross pay for each quarter",
      content: (
        <CalculatorForm
          currentStep={4}
          dateOfInjury={dateOfInjury}
          specialCase={specialCase}
          employedFourQuarters={employedFourQuarters}
          quarter1Pay={quarter1Pay}
          quarter2Pay={quarter2Pay}
          quarter3Pay={quarter3Pay}
          quarter4Pay={quarter4Pay}
        />
      ),
      nextStep: 6,
      prevStep: 3,
    },
    {
      title: "Employee was employed less than four quarters.",
      description: "Please fill out data for the time that they were employed.",
      content: (
        <CalculatorForm
          currentStep={5}
          dateOfInjury={dateOfInjury}
          specialCase={specialCase}
          employedFourQuarters={employedFourQuarters}
          quarter1Pay={quarter1Pay}
          quarter2Pay={quarter2Pay}
          quarter3Pay={quarter3Pay}
          quarter4Pay={quarter4Pay}
        />
      ),
      nextStep: 6,
      prevStep: 3,
    },
    {
      title: "Summary",
      content: (
        <>
          <p>Total Pre-Injury Annual Gross Pay: ${totalAnnualPay ? Number(totalAnnualPay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
          <p>Average Weekly Wage: ${averageWeeklyWage ? Number(averageWeeklyWage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
          <p className="font-bold">Compensation Rate: ${compensationRate ? Number(compensationRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
          {maxRateNotice && <p className="text-sm text-gray-500">{maxRateNotice}</p>}
          {minRateNotice && <p className="text-sm text-gray-500">{minRateNotice}</p>}
        </>
      ),
      prevStep: employedFourQuarters === "yes" ? 4 : 5,
      nextStep: null,
    },
  ];

  const currentStep = steps[Math.min(step - 1, steps.length - 1)];

  return (
    <div className="mt-8 p-6 bg-gray-100 rounded-lg">
      <div>
        <h3 className="mb-4 text-lg font-semibold flex">
          {step}. {currentStep.title}
          <QuestionMarkCircleIcon className="w-6 h-6 ml-1 text-gray-500" />
        </h3>
        {currentStep.description && <p className="mb-2">{currentStep.description}</p>}

        {/* Render the form or options based on step */}
        {currentStep.content}

        {currentStep.error && <p className="text-red-600">{currentStep.error}</p>}

        {/* Navigation Buttons */}
        <StepNavigation 
          currentStep={step}
          prevStep={currentStep.prevStep}
          nextStep={currentStep.nextStep}
          errors={errors}
          dateOfInjury={dateOfInjury}
          specialCase={specialCase}
          employedFourQuarters={employedFourQuarters}
          quarter1Pay={quarter1Pay}
          quarter2Pay={quarter2Pay}
          quarter3Pay={quarter3Pay}
          quarter4Pay={quarter4Pay}
        />
      </div>
    </div>
  );
}