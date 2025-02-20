"use client";

import React, { useState } from "react";
import { parseISO } from "date-fns";

interface MaxCompensationRates {
    [year: number]: number;
}

interface QuarterLabel {
    start: string;
    end: string;
}

const quarterLabels: QuarterLabel[] = [
    { start: "January 1", end: "March 31" },
    { start: "April 1", end: "June 30" },
    { start: "July 1", end: "September 30" },
    { start: "October 1", end: "December 31" },
];

interface AwwCRCalculatorProps {
    maxCompensationRates: MaxCompensationRates;
}

const AwwCRCalculator: React.FC<AwwCRCalculatorProps> = ({ maxCompensationRates }) => {
    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [averageWeeklyWage, setAverageWeeklyWage] = useState<string | null>(null);
    const [compensationRate, setCompensationRate] = useState<string | null>(null);
    const [totalAnnualPay, setTotalAnnualPay] = useState<string | null>(null);

    const handleNextStep = () => setStep((prev) => prev + 1);
    const handlePrevStep = () => setStep((prev) => prev - 1);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getRelevantQuarters = (dateOfInjury?: string) => {
        if (!dateOfInjury) return [];
        const doi = parseISO(dateOfInjury);
        let year = doi.getFullYear();
        const month = doi.getMonth() + 1;

        let doiQuarter = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4;
        let relevantQuarters = [];
        let count = 0;

        let currentQuarter = doiQuarter - 1;
        if (currentQuarter < 1) {
            currentQuarter = 4;
            year--;
        }

        while (count < 4) {
            relevantQuarters.push({
                ...quarterLabels[currentQuarter - 1],
                year,
                label: `Gross Pay for Quarter ${currentQuarter} of ${year}:`,
                quarterIndex: currentQuarter,
            });

            currentQuarter--;
            if (currentQuarter < 1) {
                currentQuarter = 4;
                year--;
            }
            count++;
        }

        return relevantQuarters;
    };

    const calculateAwwAndCompensation = () => {
        const totalAnnualPay = [1, 2, 3, 4].reduce(
            (sum, q) => sum + (parseFloat(formData[`quarter${q}Pay`]) || 0),
            0
        );
        const aww = totalAnnualPay / 52;
        let compRate = Math.max(aww * 0.6667, 75);
        
        const maxRate = maxCompensationRates[parseISO(formData.dateOfInjury || "").getFullYear()] || null;
        if (maxRate !== null && compRate > maxRate) compRate = maxRate;

        setTotalAnnualPay(totalAnnualPay.toFixed(2));
        setAverageWeeklyWage(aww.toFixed(2));
        setCompensationRate(compRate.toFixed(2));
    };

    return (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Average Weekly Wage / Compensation Rate</h2>

            {step === 1 && (
                <div>
                    <h3>Step 1: Enter Date of Injury</h3>
                    <input
                        type="date"
                        name="dateOfInjury"
                        className="border p-2 w-full mt-2"
                        onChange={handleInputChange}
                    />
                    <button onClick={handleNextStep} className="mt-4 bg-blue-600 text-white p-2 rounded">
                        Next
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3>Step 2: Enter Employee's Pay for Each Quarter</h3>
                    {getRelevantQuarters(formData.dateOfInjury).map((q, index) => (
                        <div key={index}>
                            <label>{q.label}</label>
                            <input
                                type="number"
                                name={`quarter${q.quarterIndex}Pay`}
                                className="border p-2 w-full"
                                onChange={handleInputChange}
                            />
                        </div>
                    ))}
                    <button onClick={handlePrevStep} className="mt-4 bg-gray-500 text-white p-2 rounded">
                        Back
                    </button>
                    <button
                        onClick={() => {
                            calculateAwwAndCompensation();
                            handleNextStep();
                        }}
                        className="ml-2 bg-blue-600 text-white p-2 rounded"
                    >
                        Next
                    </button>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h3>Summary</h3>
                    <p>
                        Total Pre-Injury Annual Gross Pay: $
                        {totalAnnualPay ? parseFloat(totalAnnualPay).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                    </p>
                    <p>
                        Average Weekly Wage: $
                        {averageWeeklyWage ? parseFloat(averageWeeklyWage).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                    </p>
                    <p>
                        Compensation Rate: $
                        {compensationRate ? parseFloat(compensationRate).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                    </p>
                    <button onClick={handlePrevStep} className="mt-4 bg-gray-500 text-white p-2 rounded">
                        Back
                    </button>
                </div>
            )}
        </div>
    );
};

export default AwwCRCalculator;
