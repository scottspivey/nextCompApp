// app/Components/AwwCRCalculator.tsx
'use client';

import React, { useState } from 'react';

// Define types for results
interface CalculationResults {
  averageWeeklyWage: number;
  compensationRate: number;
}

// Define types for wage inputs
interface WageInput {
  amount: string;
}

// Main calculator component
const AwwCRCalculator: React.FC = () => {
  // Initialize state for the weekly wage inputs
  const [weeklyWages, setWeeklyWages] = useState<WageInput[]>(
    Array(13).fill({ amount: '' })
  );
  
  // State for calculation results
  const [results, setResults] = useState<CalculationResults | null>(null);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<string>("weekly");
  
  // State for showing/hiding instructions
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  
  // Update a specific weekly wage input
  const handleWeeklyWageChange = (index: number, value: string) => {
    const updatedWages = [...weeklyWages];
    updatedWages[index] = { amount: value };
    setWeeklyWages(updatedWages);
  };

  // Calculate the average weekly wage and compensation rate
  const calculateResults = () => {
    // Filter out empty values and convert to numbers
    const validWages = weeklyWages
      .map(wage => parseFloat(wage.amount))
      .filter(amount => !isNaN(amount));

    // If no valid wages, return early
    if (validWages.length === 0) {
      setResults(null);
      return;
    }

    // Calculate average weekly wage
    const total = validWages.reduce((sum, wage) => sum + wage, 0);
    const averageWeeklyWage = total / validWages.length;
    
    // Calculate compensation rate (2/3 of AWW)
    const compensationRate = averageWeeklyWage * (2/3);
    
    // Update results
    setResults({
      averageWeeklyWage,
      compensationRate
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateResults();
  };

  // Toggle instructions visibility
  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div className="w-full max-w-2xl mx-auto border rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Average Weekly Wage & Compensation Rate Calculator</h2>
        <p className="text-gray-600">
          Calculate a claimant&apos;s AWW and CR based on their earnings history.
        </p>
        <button 
          onClick={toggleInstructions}
          className="mt-2 px-4 py-2 text-sm border rounded hover:bg-gray-100"
        >
          {showInstructions ? "Hide Instructions" : "Show Instructions"}
        </button>
      </div>

      {showInstructions && (
        <div className="p-6 border-b bg-blue-50">
          <div className="flex gap-2 items-start">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Instructions</h3>
              <p>Enter the claimant&apos;s weekly wages for the 13 weeks prior to injury. Leave blank any weeks not worked.</p>
              <p>The calculator will automatically determine the Average Weekly Wage (AWW) and Compensation Rate (CR).</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="mb-4 border-b">
          <div className="flex">
            <button 
              className={`px-4 py-2 ${activeTab === "weekly" ? "border-b-2 border-blue-500 -mb-px" : ""}`}
              onClick={() => setActiveTab("weekly")}
            >
              Weekly Method
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === "fourweek" ? "border-b-2 border-blue-500 -mb-px" : ""}`}
              onClick={() => setActiveTab("fourweek")}
            >
              Four-Week Method
            </button>
          </div>
        </div>

        {activeTab === "weekly" ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {weeklyWages.map((wage, index) => (
                <div key={index} className="grid grid-cols-2 items-center gap-4">
                  <label htmlFor={`week-${index}`} className="text-sm font-medium">Week {index + 1}</label>
                  <input
                    id={`week-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={wage.amount}
                    onChange={(e) => handleWeeklyWageChange(index, e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
              ))}
            </div>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Calculate
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500">Four-week calculation method coming soon.</p>
          </div>
        )}
      </div>

      {results && (
        <div className="p-6 border-t">
          <div className="w-full">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Average Weekly Wage</label>
                <p className="text-2xl font-bold">${results.averageWeeklyWage.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Compensation Rate</label>
                <p className="text-2xl font-bold">${results.compensationRate.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create a wrapper for server components to use
export const AwwCRCalculatorWrapper = () => {
  return <AwwCRCalculator />;
};

export default AwwCRCalculator;