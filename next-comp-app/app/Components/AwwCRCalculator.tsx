'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { maxCompensationRates } from '@/app/CommonVariables';
import { getCurrentDate } from '@/app/Components/CalcDateFunctions/getCurrentDate';
import { formatDisplayDate } from '@/app/Components/CalcDateFunctions/formatDisplayDate';
import { getQuarterContainingDateOfInjury } from '@/app/Components/CalcDateFunctions/getQuarterContainingDateOfInjury';
import { CalculatorForm, CalculatorFormProps } from '@/app/Components/CalculatorForm';
import { StepNavigation } from '@/app/Components/StepNavigation';

type MaxCompensationRates = Record<number, number>;

interface AwwCRCalculatorProps {
  maxCompensationRates: MaxCompensationRates;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export function AwwCRCalculator({ maxCompensationRates, searchParams = {} }: AwwCRCalculatorProps) {
  // State for form values
  const [dateOfInjury, setDateOfInjury] = useState<string>(getCurrentDate());
  const [specialCase, setSpecialCase] = useState<string>('none');
  const [employedFourQuarters, setEmployedFourQuarters] = useState<string>('yes');
  const [quarter1Pay, setQuarter1Pay] = useState<string>('0');
  const [quarter2Pay, setQuarter2Pay] = useState<string>('0');
  const [quarter3Pay, setQuarter3Pay] = useState<string>('0');
  const [quarter4Pay, setQuarter4Pay] = useState<string>('0');
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Results state
  const [results, setResults] = useState<{
    averageWeeklyWage: number;
    compensationRate: number;
    maxCompRate: number;
    yearOfInjury: number;
    quarters: string[];
  } | null>(null);

  const router = useRouter();
  const searchParamsHook = useSearchParams();

  // Initialize from URL parameters if present
  useEffect(() => {
    // Check for parameters in both props and hook for flexibility
    const params = searchParams || {};
    const paramDOI = (params.doi || searchParamsHook.get('doi')) as string;
    const paramSpecialCase = (params.special || searchParamsHook.get('special')) as string;
    const paramFourQuarters = (params.fourq || searchParamsHook.get('fourq')) as string;
    const paramQ1 = (params.q1 || searchParamsHook.get('q1')) as string;
    const paramQ2 = (params.q2 || searchParamsHook.get('q2')) as string;
    const paramQ3 = (params.q3 || searchParamsHook.get('q3')) as string;
    const paramQ4 = (params.q4 || searchParamsHook.get('q4')) as string;

    if (paramDOI) setDateOfInjury(paramDOI);
    if (paramSpecialCase) setSpecialCase(paramSpecialCase);
    if (paramFourQuarters) setEmployedFourQuarters(paramFourQuarters);
    if (paramQ1) setQuarter1Pay(paramQ1);
    if (paramQ2) setQuarter2Pay(paramQ2);
    if (paramQ3) setQuarter3Pay(paramQ3);
    if (paramQ4) setQuarter4Pay(paramQ4);

    // If we have all the data, calculate and jump to results
    if (paramDOI && paramQ1 && paramQ2 && paramQ3 && paramQ4) {
      setCurrentStep(5); // Jump to results step
      calculateAwwCr();
    }
  }, [searchParams, searchParamsHook]);

  // Handle input changes
  const handleInputChange = (name: string, value: string) => {
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear error for this field

    switch (name) {
      case 'dateOfInjury':
        setDateOfInjury(value);
        break;
      case 'specialCase':
        setSpecialCase(value);
        break;
      case 'employedFourQuarters':
        setEmployedFourQuarters(value);
        break;
      case 'quarter1Pay':
        setQuarter1Pay(value);
        break;
      case 'quarter2Pay':
        setQuarter2Pay(value);
        break;
      case 'quarter3Pay':
        setQuarter3Pay(value);
        break;
      case 'quarter4Pay':
        setQuarter4Pay(value);
        break;
      default:
        break;
    }
  };

  // Validate the current step
  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 1: // Date of Injury
        if (!dateOfInjury) {
          newErrors.dateOfInjury = 'Date of injury is required';
        } else {
          const injuryDate = new Date(dateOfInjury);
          const minDate = new Date('1979-01-01');
          const maxDate = new Date();
          
          if (injuryDate < minDate) {
            newErrors.dateOfInjury = 'Date must be after January 1, 1979';
          } else if (injuryDate > maxDate) {
            newErrors.dateOfInjury = 'Date cannot be in the future';
          }
        }
        break;
      
      case 2: // Special Case
        if (!specialCase) {
          newErrors.specialCase = 'Please select an option';
        }
        break;
      
      case 3: // Employed Four Quarters
        if (!employedFourQuarters) {
          newErrors.employedFourQuarters = 'Please select an option';
        }
        break;
      
      case 4: // Quarterly Pay
        if (employedFourQuarters === 'yes') {
          if (isNaN(parseFloat(quarter1Pay)) || parseFloat(quarter1Pay) < 0) {
            newErrors.quarter1Pay = 'Please enter a valid amount for Quarter 1';
          }
          if (isNaN(parseFloat(quarter2Pay)) || parseFloat(quarter2Pay) < 0) {
            newErrors.quarter2Pay = 'Please enter a valid amount for Quarter 2';
          }
          if (isNaN(parseFloat(quarter3Pay)) || parseFloat(quarter3Pay) < 0) {
            newErrors.quarter3Pay = 'Please enter a valid amount for Quarter 3';
          }
          if (isNaN(parseFloat(quarter4Pay)) || parseFloat(quarter4Pay) < 0) {
            newErrors.quarter4Pay = 'Please enter a valid amount for Quarter 4';
          }
        }
        break;
      
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate AWW and Compensation Rate
  const calculateAwwCr = () => {
    if (employedFourQuarters === 'yes') {
      const q1 = parseFloat(quarter1Pay) || 0;
      const q2 = parseFloat(quarter2Pay) || 0;
      const q3 = parseFloat(quarter3Pay) || 0;
      const q4 = parseFloat(quarter4Pay) || 0;
      
      // Per SC law, AWW = Total wages from previous 4 quarters / 52
      const totalWages = q1 + q2 + q3 + q4;
      const aww = totalWages / 52;
      
      // Get year of injury to determine max comp rate
      const yearOfInjury = new Date(dateOfInjury).getFullYear();
      const maxCompRate = maxCompensationRates[yearOfInjury] || maxCompensationRates[new Date().getFullYear()];
      
      // SC comp rate is 66.67% of AWW, capped at max rate
      const tempCompRate = aww * (2/3);
      const compRate = Math.min(tempCompRate, maxCompRate);
      
      // Generate quarter info for display
      const quarters: string[] = [];
      for (let i = 1; i <= 4; i++) {
        quarters.push(`Quarter ${i}: $${eval(`q${i}`).toFixed(2)}`);
      }
      
      setResults({
        averageWeeklyWage: aww,
        compensationRate: compRate,
        maxCompRate: maxCompRate,
        yearOfInjury: yearOfInjury,
        quarters: quarters
      });
    }
  };

  // Handle form navigation
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep === 4) {
        calculateAwwCr();
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleReset = () => {
    setDateOfInjury(getCurrentDate());
    setSpecialCase('none');
    setEmployedFourQuarters('yes');
    setQuarter1Pay('0');
    setQuarter2Pay('0');
    setQuarter3Pay('0');
    setQuarter4Pay('0');
    setCurrentStep(1);
    setResults(null);
    setErrors({});
  };

  // Save calculation to URL for sharing
  const handleSaveToUrl = () => {
    const params = new URLSearchParams();
    params.set('doi', dateOfInjury);
    params.set('special', specialCase);
    params.set('fourq', employedFourQuarters);
    params.set('q1', quarter1Pay);
    params.set('q2', quarter2Pay);
    params.set('q3', quarter3Pay);
    params.set('q4', quarter4Pay);
    
    // Update URL without refreshing page
    router.push(`?${params.toString()}`);
  };

  // Determine step navigation state
  const getNextStep = () => {
    if (currentStep === 5) return null; // No next step at results
    return currentStep + 1;
  };

  const getPrevStep = () => {
    if (currentStep === 1) return null; // No previous step at first step
    return currentStep - 1;
  };

  // Render the calculator form
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
        Average Weekly Wage &amp; Compensation Rate Calculator
      </h2>
      
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div 
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === step 
                  ? 'bg-blue-600 text-white' 
                  : currentStep > step 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-blue-600 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep - 1) * 25}%` }}
          ></div>
        </div>
      </div>
      
      {/* Step title */}
      <h3 className="text-xl font-semibold mb-4">
        {currentStep === 1 && "Date of Injury"}
        {currentStep === 2 && "Employee Type"}
        {currentStep === 3 && "Employment History"}
        {currentStep === 4 && "Wage Information"}
        {currentStep === 5 && "Calculation Results"}
      </h3>
      
      {/* Form steps */}
      {currentStep < 5 && (
        <>
          <CalculatorForm
            currentStep={currentStep}
            dateOfInjury={dateOfInjury}
            specialCase={specialCase}
            employedFourQuarters={employedFourQuarters}
            quarter1Pay={quarter1Pay}
            quarter2Pay={quarter2Pay}
            quarter3Pay={quarter3Pay}
            quarter4Pay={quarter4Pay}
            handleInputChange={handleInputChange}
          />
          
          {/* Display validation errors */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {Object.values(errors).map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
          
          {/* Navigation buttons */}
          <StepNavigation
            currentStep={currentStep}
            nextStep={getNextStep()}
            prevStep={getPrevStep()}
            errors={errors}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onReset={handleReset}
          />
        </>
      )}
      
      {/* Results display */}
      {currentStep === 5 && results && (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">Calculation Results</h3>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-sm">Date of Injury</p>
              <p className="text-xl font-semibold">{formatDisplayDate(dateOfInjury)}</p>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-sm">Average Weekly Wage</p>
              <p className="text-2xl font-bold text-blue-700">${results.averageWeeklyWage.toFixed(2)}</p>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-sm">Compensation Rate (66.67% of AWW)</p>
              <p className="text-2xl font-bold text-blue-700">${results.compensationRate.toFixed(2)}</p>
              {results.compensationRate === results.maxCompRate && (
                <p className="text-sm text-orange-600 mt-1">
                  *Capped at {results.yearOfInjury} maximum rate
                </p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Quarterly Wages Used:</h4>
            <div className="bg-white p-4 rounded-lg shadow">
              <ul className="list-disc list-inside">
                {results.quarters.map((quarter, index) => (
                  <li key={index}>{quarter}</li>
                ))}
              </ul>
              <p className="mt-2 text-gray-600">
                Total Wages: ${(parseFloat(quarter1Pay) + parseFloat(quarter2Pay) + parseFloat(quarter3Pay) + parseFloat(quarter4Pay)).toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handlePrevious}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Edit
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Start Over
            </button>
            
            <button
              onClick={handleSaveToUrl}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Calculation
            </button>
            
            {/* Additional buttons for premium features would be here */}
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper component to handle search params
export function AwwCRCalculatorWrapper() {
  const searchParams = useSearchParams();
  
  // Convert searchParams to a regular object
  const params: {[key: string]: string} = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return <AwwCRCalculator maxCompensationRates={maxCompensationRates} searchParams={params} />;
}

export default AwwCRCalculatorWrapper;