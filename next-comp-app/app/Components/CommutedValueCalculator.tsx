'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type MaxCompensationRates = Record<number, number>;

interface FormData {
  yearOfInjury: string;
  compRate: number;
  ttdPaidToDate: number;
  otherCredit: number;
}

interface Results {
  weeksRemaining: number;
  discountRate: number;
  discountedWeeks: number;
  commutedValue: number;
  compRate: number;
  ttdPaidToDateValue: number;
  commutedValue95: number;
  commutedValue90: number;
  settlementDate: string;
}

interface CommutedValueCalculatorProps {
  maxCompensationRates: MaxCompensationRates;
}

const CommutedValueCalculator: React.FC<CommutedValueCalculatorProps> = ({ maxCompensationRates }) => {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    yearOfInjury: currentYear.toString(),
    compRate: 75,
    ttdPaidToDate: 0,
    otherCredit: 0,
  });
  const [results, setResults] = useState<Results | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [settlementDate, setSettlementDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Initialize available years
  useEffect(() => {
    // Create an array of years from the maxCompensationRates
    const years = Object.keys(maxCompensationRates)
      .map(year => year.toString())
      .sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending

    setAvailableYears(years);
  }, [maxCompensationRates]);

  // Declare calculateResults *before* useEffect
    const calculateResults = useCallback(() => {
        const { compRate, ttdPaidToDate, otherCredit } = formData;

        // Calculate weeks remaining (max 500 weeks in SC)
        const weeksRemaining = 500 - (ttdPaidToDate + otherCredit);

        // Calculate TTD value already paid
        const ttdPaidToDateValue = ttdPaidToDate * compRate;

        // Determine discount rate based on weeks remaining
        // Per SC law, different rates apply based on remaining weeks
        const discountRate = weeksRemaining > 100 ? 0.0438 : 0.02;

        // Convert annual discount rate to weekly
        const weeklyDiscountRate = discountRate / 52;

        // Calculate present value of future payments using the formula:
        // PV = PMT × ((1 - (1 + r)^-n) / r)
        const discountedWeeks = (weeksRemaining > 0)
            ? ((1 - Math.pow(1 + weeklyDiscountRate, -weeksRemaining)) / weeklyDiscountRate)
            : 0;

        // Calculate commuted value
        const commutedValue = discountedWeeks * compRate;

        // Calculate 95% and 90% of commuted value (common settlement values)
        const commutedValue95 = commutedValue * 0.95;
        const commutedValue90 = commutedValue * 0.90;

        setResults({
            weeksRemaining,
            discountRate,
            discountedWeeks,
            commutedValue,
            compRate,
            ttdPaidToDateValue,
            commutedValue95,
            commutedValue90,
            settlementDate
        });
    }, [formData, settlementDate]);

  // Check if URL has calculation params
  useEffect(() => {
    const yearParam = searchParams.get('year');
    const compRateParam = searchParams.get('compRate');
    const ttdParam = searchParams.get('ttd');
    const creditParam = searchParams.get('credit');
    const dateParam = searchParams.get('date');

    if (yearParam) {
      setFormData(prev => ({ ...prev, yearOfInjury: yearParam }));
    }

    if (compRateParam) {
      setFormData(prev => ({ ...prev, compRate: parseFloat(compRateParam) }));
    }

    if (ttdParam) {
      setFormData(prev => ({ ...prev, ttdPaidToDate: parseFloat(ttdParam) }));
    }

    if (creditParam) {
      setFormData(prev => ({ ...prev, otherCredit: parseFloat(creditParam) }));
    }

    if (dateParam) {
      setSettlementDate(dateParam);
    }

    // If all needed params exist, calculate and show results
    if (yearParam && compRateParam && ttdParam && creditParam) {
      // Move to the results step
      setStep(4);
      calculateResults();
    }
  }, [searchParams, calculateResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === "yearOfInjury" ? value : parseFloat(value) || 0
    }));

    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettlementDate(e.target.value);
  };

  // Validate Year of Injury for Step 1
  const validateStep1 = (): boolean => {
    const errors: { [key: string]: string } = {};
    const { yearOfInjury } = formData;
    const year = parseInt(yearOfInjury);

    if (!yearOfInjury) {
      errors.yearOfInjury = "Year of injury is required.";
    } else if (isNaN(year) || year < 1979 || year > currentYear) {
      errors.yearOfInjury = `Year must be between 1979 and ${currentYear}.`;
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation: Max Comp Rate
  const validateStep2 = (): boolean => {
    const errors: { [key: string]: string } = {};
    const { compRate, yearOfInjury } = formData;
    const year = parseInt(yearOfInjury);
    const maxRate = maxCompensationRates[year] || 1134.43;

    if (isNaN(compRate) || compRate <= 0) {
      errors.compRate = "Compensation rate must be greater than 0.";
    } else if (compRate > maxRate) {
      errors.compRate = `Compensation rate cannot exceed ${maxRate.toLocaleString('en-US')}, the maximum rate for ${yearOfInjury}.`;
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation: Validate TTD Weeks Paid to Date and Other Credit
  const validateStep3 = (): boolean => {
    const errors: { [key: string]: string } = {};
    const { ttdPaidToDate, otherCredit } = formData;

    if (isNaN(ttdPaidToDate) || ttdPaidToDate < 0) {
      errors.ttdPaidToDate = "TTD Paid to Date must be 0 or a positive number.";
    } else if (ttdPaidToDate > 500) {
      errors.ttdPaidToDate = "TTD Paid to Date cannot exceed 500 weeks.";
    }

    if (isNaN(otherCredit) || otherCredit < 0) {
      errors.otherCredit = "Other Credit must be 0 or a positive number.";
    } else if (otherCredit > 500) {
      errors.otherCredit = "Other Credit cannot exceed 500 weeks.";
    }

    if (ttdPaidToDate + otherCredit > 500) {
      errors.total = "Total weeks (TTD + Other Credit) cannot exceed 500 weeks.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };



  const handleNext = () => {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        if (isValid) {
          calculateResults();
        }
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setStep(prevStep => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleReset = () => {
    setFormData({
      yearOfInjury: currentYear.toString(),
      compRate: 75,
      ttdPaidToDate: 0,
      otherCredit: 0,
    });
    setSettlementDate(new Date().toISOString().split('T')[0]);
    setResults(null);
    setErrors({});
    setStep(1);
  };

  const handleSaveToUrl = () => {
    const params = new URLSearchParams();
    params.set('year', formData.yearOfInjury);
    params.set('compRate', formData.compRate.toString());
    params.set('ttd', formData.ttdPaidToDate.toString());
    params.set('credit', formData.otherCredit.toString());
    params.set('date', settlementDate);

    // Update URL without refreshing page
    router.push(`?${params.toString()}`);
  };

  // Create an array of years for the dropdown
  const years = Array.from(
    { length: currentYear - 1979 + 1 },
    (_, i) => (currentYear - i).toString()
  );

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
        Commuted Value Calculator
      </h2>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : step > s
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(step - 1) * 33.33}%` }}
          ></div>
        </div>
      </div>

      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Step 1: Year of Injury</h3>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Year of Injury:
              <select
                name="yearOfInjury"
                value={formData.yearOfInjury}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            {errors.yearOfInjury && (
              <p className="text-red-600 text-sm mt-1">{errors.yearOfInjury}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Settlement Date:
              <input
                type="date"
                value={settlementDate}
                onChange={handleDateChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
            </label>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Reset
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Step 2: Compensation Rate</h3>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Compensation Rate ($ per week):
              <input
                type="number"
                name="compRate"
                value={formData.compRate}
                min={1}
                max={maxCompensationRates[parseInt(formData.yearOfInjury)] || 1134.43}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Maximum rate for {formData.yearOfInjury}: ${(maxCompensationRates[parseInt(formData.yearOfInjury)] || 1134.43).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {errors.compRate && (
              <p className="text-red-600 text-sm mt-1">{errors.compRate}</p>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Step 3: Credit Weeks</h3>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              TTD Paid to Date (weeks):
              <input
                type="number"
                name="ttdPaidToDate"
                value={formData.ttdPaidToDate}
                min={0}
                max={500}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
            </label>
            {errors.ttdPaidToDate && (
              <p className="text-red-600 text-sm mt-1">{errors.ttdPaidToDate}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Other Credit (weeks):
              <input
                type="number"
                name="otherCredit"
                value={formData.otherCredit}
                min={0}
                max={500}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
            </label>
            {errors.otherCredit && (
              <p className="text-red-600 text-sm mt-1">{errors.otherCredit}</p>
            )}
          </div>

          {errors.total && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
              {errors.total}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Calculate
            </button>
          </div>
        </div>
      )}

      {step === 4 && results && (
        <div>
          <h3 className="text-lg font-bold mb-4">Calculation Results</h3>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Settlement Date</p>
              <p className="text-lg font-semibold">{new Date(settlementDate).toLocaleDateString()}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Year of Injury</p>
              <p className="text-lg font-semibold">{formData.yearOfInjury}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Compensation Rate</p>
              <p className="text-xl font-semibold">${results.compRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg shadow">
                <p className="text-gray-600 text-sm">TTD Paid to Date</p>
                <p className="text-lg font-semibold">{formData.ttdPaidToDate.toFixed(1)} weeks</p>
                <p className="text-sm text-gray-600">${results.ttdPaidToDateValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Other Credit</p>
                <p className="text-lg font-semibold">{formData.otherCredit.toFixed(1)} weeks</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="p-4 bg-blue-50 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Weeks Remaining</p>
              <p className="text-xl font-semibold">{results.weeksRemaining.toFixed(1)}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="p-4 bg-blue-50 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Discount Rate</p>
              <p className="text-lg font-semibold">{(results.discountRate * 100).toFixed(2)}% per annum</p>
              <p className="text-sm text-gray-600">({(results.discountRate / 52 * 100).toFixed(4)}% weekly)</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="p-4 bg-blue-50 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Discounted Weeks - Present Value</p>
              <p className="text-lg font-semibold">{results.discountedWeeks.toFixed(4)}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="p-4 bg-green-100 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-bold">COMMUTED VALUE</p>
              <p className="text-2xl font-bold text-green-700">${results.commutedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg shadow">
              <p className="text-gray-600 text-sm">95% of Commuted Value</p>
              <p className="text-lg font-semibold">${results.commutedValue95.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg shadow">
              <p className="text-gray-600 text-sm">90% of Commuted Value</p>
              <p className="text-lg font-semibold">${results.commutedValue90.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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

            {/* Premium feature buttons would be here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommutedValueCalculator;
