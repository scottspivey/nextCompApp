'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function AwwCRCalculator() {
  // Get search params outside any async function
  const searchParams = useSearchParams();
  
  const [wages, setWages] = useState<number[]>([0, 0, 0, 0]);
  const [averageWeeklyWage, setAverageWeeklyWage] = useState<number>(0);
  const [compensationRate, setCompensationRate] = useState<number>(0);
  
  // Use useEffect for any async operations after getting searchParams
  useEffect(() => {
    // Parse any URL parameters here if needed
    const wageParam = searchParams.get('wage');
    
    if (wageParam) {
      try {
        const parsedWage = parseFloat(wageParam);
        handleWageChange(0, parsedWage);
      } catch (error) {
        console.error('Error parsing wage parameter:', error);
      }
    }
  }, [searchParams]);

  const handleWageChange = (index: number, value: number) => {
    const newWages = [...wages];
    newWages[index] = value;
    setWages(newWages);
    calculateAWW(newWages);
  };

  const calculateAWW = (wageValues: number[]) => {
    const sum = wageValues.reduce((acc, curr) => acc + curr, 0);
    const aww = sum / 4; // Assuming 4 weeks for this example
    setAverageWeeklyWage(aww);
    
    // SC workers comp is typically 66.67% of AWW
    const compRate = aww * 0.6667;
    setCompensationRate(compRate);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Average Weekly Wage Calculator</h2>
      
      {wages.map((wage, index) => (
        <div key={index} className="mb-4">
          <label className="block text-gray-700 mb-2">
            Week {index + 1} Wages:
            <input
              type="number"
              value={wage}
              onChange={(e) => handleWageChange(index, parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </label>
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-lg"><strong>Average Weekly Wage:</strong> ${averageWeeklyWage.toFixed(2)}</p>
        <p className="text-lg"><strong>Compensation Rate:</strong> ${compensationRate.toFixed(2)}</p>
      </div>
    </div>
  );
}

// Add default export to fix import errors
export default AwwCRCalculator;