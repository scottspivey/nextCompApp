// This should be for upper extremity to shoulder; wp to regional back
// below code is just filler. Wrong Logic.
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
    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState<FormData>({
        compRate: 75,
        yearOfInjury: "",
        ttdPaidToDate: 0,
        otherCredit: 0,
    });
    const [results, setResults] = useState<Results | null>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "yearOfInjury" ? value : Number(value) });
    };

    const validateStep1 = (): boolean => {
        const { compRate, yearOfInjury } = formData;
        const year = parseInt(yearOfInjury);
        const maxRate = maxCompensationRates[year] || 1134.43;
        return compRate > 0 && compRate <= maxRate && year >= 1979 && year <= 2025;
    };

    const validateStep2 = (): boolean => {
        const { ttdPaidToDate, otherCredit } = formData;
        return ttdPaidToDate >= 0 && ttdPaidToDate <= 500 && otherCredit >= 0 && otherCredit <= 500;
    };

    const calculateResults = () => {
        const { compRate, ttdPaidToDate, otherCredit } = formData;
        const weeksRemaining = 500 - (ttdPaidToDate + otherCredit);
        const discountRate = weeksRemaining > 100 ? 0.0438 : 0.02;
        const discountedWeeks = weeksRemaining / (1 + discountRate);
        const commutedValue = discountedWeeks * compRate;

        setResults({ weeksRemaining, discountRate, discountedWeeks, commutedValue, compRate });
    };

    return (
        <div className="p-6 bg-gray-100 rounded-lg">
            {step === 1 && (
                <div>
                    <h3 className="text-lg font-semibold">Step 1: Compensation Rate & Year of Injury</h3>
                    <label>Compensation Rate ($):</label>
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
                    <label>Year of Injury:</label>
                    <input
                        type="number"
                        name="yearOfInjury"
                        value={formData.yearOfInjury}
                        min={1979}
                        max={2025}
                        onChange={handleInputChange}
                        className="border p-2 w-full"
                        required
                    />
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
                    <h3 className="text-lg font-semibold">Step 2: TTD Paid to Date & Other Credit</h3>
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
                    <button
                        onClick={() => setStep(1)}
                        className="mt-4 bg-gray-500 text-white p-2 rounded"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => validateStep2() && (setStep(3), calculateResults())}
                        className="mt-4 bg-blue-600 text-white p-2 rounded"
                    >
                        Next
                    </button>
                </div>
            )}
            {step === 3 && results && (
                <div>
                    <h3 className="text-lg font-semibold">Summary</h3>
                    <p>Weeks Remaining: {results.weeksRemaining}</p>
                    <p>Discount Rate: {(results.discountRate * 100).toFixed(2)}%</p>
                    <p>Discounted Weeks: {results.discountedWeeks.toFixed(2)}</p>
                    <p>Compensation Rate: ${results.compRate.toFixed(2)}</p>
                    <p>Commuted Value: ${results.commutedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <button
                        onClick={() => setStep(2)}
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