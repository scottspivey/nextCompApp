"use client";

import React, { useState, ChangeEvent } from "react";

type MaxCompensationRates = Record<number, number>;

interface FormData {
    compRate: number;
    yearOfInjury: string;
    ttdPaidToDate: number;
    otherCredit: number;
}

interface Results {
    weeksRemaining: number;
    discountRate: number;
    discountedWeeks: number;
    commutedValue: number;
    compRate: number;
}

interface CommutedValueCalculatorProps {
    maxCompensationRates: MaxCompensationRates;
}

const CommutedValueCalculator: React.FC<CommutedValueCalculatorProps> = ({ maxCompensationRates }) => {
    const currentYear = new Date().getFullYear();
    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState<FormData>({
        compRate: 75,
        yearOfInjury: currentYear.toString(),
        ttdPaidToDate: 0,
        otherCredit: 0,
    });
    const [results, setResults] = useState<Results | null>(null);
    const [errors, setErrors] = useState<string | null>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "yearOfInjury" ? value : Number(value) });
    };

    // Validate only Year of Injury for Step 1
    const validateStep1 = (): boolean => {
        const { yearOfInjury } = formData;
        const year = parseInt(yearOfInjury);
    
        if (year < 1979 || year > currentYear) {
            setErrors("Year of Injury must be between 1979 and the current year.");
            return false;
        }
    
        setErrors(null); // No errors, so we clear the error message
        return true;
    };
    
    // Step 2 Validation: Max Comp Rate
    const validateStep2 = (): boolean => {
        const { compRate, yearOfInjury } = formData;
        const year = parseInt(yearOfInjury);
        const maxRate = maxCompensationRates[year] || 1134.43;

        if (compRate <= 0 || compRate > maxRate) {
            setErrors(`Compensation Rate must be between $0 and ${maxRate}.`);
            return false;
        }
    
        setErrors(null); // No errors
        return true;
    };

    // Step 3 Validation: Validate TTD Weeks Paid to Date and Other Credit
    const validateStep3 = (): boolean => {
    const { ttdPaidToDate, otherCredit } = formData;

    
    if (ttdPaidToDate < 0 || ttdPaidToDate > 500) {
        setErrors("TTD Paid to Date must be between 0 and 500 weeks.");
        return false;
    }
    if (otherCredit < 0 || otherCredit > 500) {
        setErrors("Other Credit must be between 0 and 500 weeks.");
        return false;
    }

    setErrors(null); // No errors
    return true;
};

    const calculateResults = () => {
        const { compRate, ttdPaidToDate, otherCredit } = formData;
        const weeksRemaining = 500 - (ttdPaidToDate + otherCredit);
        const discountRate = weeksRemaining > 100 ? 0.0438 : 0.02;
        const discountedWeeks = weeksRemaining / (1 + discountRate);
        const commutedValue = discountedWeeks * compRate;

        setResults({ weeksRemaining, discountRate, discountedWeeks, commutedValue, compRate });
    };

    // Create an array of years starting from the current year and going back to 1979
    const years = Array.from({ length: currentYear - 1979 + 1 }, (_, i) => (currentYear - i).toString());

    return (
        <div className="p-6 bg-gray-100 rounded-lg">
            {step === 1 && (
                <div>
                    <h3 className="text-lg font-semibold">Step 1: Year of Injury</h3>
                    <label>Year of Injury (Select from 1976 to {currentYear}):</label>
                    <select
                        name="yearOfInjury"
                        value={formData.yearOfInjury}
                        onChange={handleInputChange}
                        className="border p-2 w-full"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    {errors && <p className="text-red-500">{errors}</p>}
                    <button
                        onClick={() => validateStep1() && setStep(2)}
                        className="mt-4 bg-blue-600 text-white p-2 rounded"
                    >
                        Next
                    </button>
                </div>
            )}
            {step === 2 && (
                <div>
                    <h3 className="text-lg font-semibold">Step 2: Compensation Rate</h3>
                    <label>
                        Compensation Rate (From $0 to ${(maxCompensationRates[parseInt(formData.yearOfInjury)] || 1134.43).toLocaleString('en-US')}, which is the maximum rate for {formData.yearOfInjury}):
                    </label>
                    <input
                        type="number"
                        name="compRate"
                        value={formData.compRate}
                        min={75}
                        max={maxCompensationRates[parseInt(formData.yearOfInjury)] || 1134.43}
                        onChange={handleInputChange}
                        className="border p-2 w-full"
                        required
                    />
                    {errors && <p className="text-red-500">{errors}</p>}

                    <button
                        onClick={() => setStep(1)}
                        className="mt-4 bg-gray-500 text-white p-2 rounded"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => validateStep2() && setStep(3)}
                        className="mt-4 bg-blue-600 text-white p-2 rounded"
                    >
                        Next
                    </button>
                </div>
            )}
            {step === 3 && (
                <div>
                    <h3 className="text-lg font-semibold">Step 3: TTD Paid to Date & Other Credit</h3>
                    <label>TTD Paid to Date (weeks):</label>
                    <input
                        type="number"
                        name="ttdPaidToDate"
                        value={formData.ttdPaidToDate}
                        min={0}
                        max={500}
                        onChange={handleInputChange}
                        className="border p-2 w-full"
                        required
                    />
                    <label>Other Credit (weeks):</label>
                    <input
                        type="number"
                        name="otherCredit"
                        value={formData.otherCredit}
                        min={0}
                        max={500}
                        onChange={handleInputChange}
                        className="border p-2 w-full"
                    />
                    {errors && <p className="text-red-500">{errors}</p>}
                    <button
                        onClick={() => setStep(2)}
                        className="mt-4 bg-gray-500 text-white p-2 rounded"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => validateStep3() && (setStep(4), calculateResults())}
                        className="mt-4 bg-blue-600 text-white p-2 rounded"
                    >
                        Next
                    </button>
                </div>
            )}

            {step === 4 && results && (
                <div>
                    <h3 className="text-lg font-semibold">Summary</h3>
                    <p>Weeks Remaining: {results.weeksRemaining}</p>
                    <p>Discount Rate: {(results.discountRate * 100).toFixed(2)}%</p>
                    <p>Discounted Weeks: {results.discountedWeeks.toFixed(2)}</p>
                    <p>Compensation Rate: ${results.compRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p>Commuted Value: ${results.commutedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <button
                        onClick={() => setStep(3)}
                        className="mt-4 bg-gray-500 text-white p-2 rounded"
                    >
                        Back
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommutedValueCalculator;
