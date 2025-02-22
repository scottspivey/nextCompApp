// To do:
// 1. add step to request user input on whether employee has been employed for 52 weeks
// 2. use existing code to calculate AWW and CR for employee who has been employed for 52 weeks
// 4. create code to calculate AWW and CR for employee who has been employed for less than 52 weeks
// 5. create consistency in styling for this component as compared to CommutedValueCalculator.tsx
// 6. ensure validation for user input on each step
// 7. add comments to explain code
// 8. add a button to reset the form
// 9. add preset values for quarterly pay and other inputs so that user can see how the form works and less errors
// 10. restrict user input for pay to positive numbers only
// 11. add help buttons for each step that gives more information on what to input via pop-up
// 12. add a button to generate a Form 20.
// 13. (done) check the minimum compensation rate logic
// 14. add special cases such as students, volunteer firefighters, etc. - somewhere in step one

"use client";

import React, { useState } from "react";
import { parseISO, isValid } from "date-fns";

interface MaxCompensationRates {
    [year: number]: number;
}

interface QuarterLabel {
    start: string;
    end: string;
}

const getCurrentDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month
    const day = String(now.getDate()).padStart(2, "0"); // Ensure 2-digit day
    return `${year}-${month}-${day}`;
};

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
    const [formData, setFormData] = useState<{ dateOfInjury: string; [key: string]: string }>({dateOfInjury: getCurrentDate(),});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [averageWeeklyWage, setAverageWeeklyWage] = useState<string | null>(null);
    const [compensationRate, setCompensationRate] = useState<string | null>(null);
    const [totalAnnualPay, setTotalAnnualPay] = useState<string | null>(null);

    const handleNextStep = () => {
        if (validateStep(step)) {
            setStep((prev) => prev + 1);
        }
    };

    const handlePrevStep = () => setStep((prev) => prev - 1);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" }); // Clear errors on change
    };

    const validateStep = (step: number) => {
        const newErrors: { [key: string]: string } = {};

        if (step === 1) {
            if (!formData.dateOfInjury) {
                newErrors.dateOfInjury = "Date of Injury is required.";
            } else if (!isValid(parseISO(formData.dateOfInjury))) {
                newErrors.dateOfInjury = "Invalid date format.";
            }
        }

        if (step === 2) {
            getRelevantQuarters(formData.dateOfInjury).forEach((q) => {
                if (!formData[`quarter${q.quarterIndex}Pay`] || parseFloat(formData[`quarter${q.quarterIndex}Pay`]) < 0) {
                    newErrors[`quarter${q.quarterIndex}Pay`] = "Enter a valid amount.";
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getRelevantQuarters = (dateOfInjury?: string) => {
        if (!dateOfInjury) return [];
        const doi = parseISO(dateOfInjury);
        if (!isValid(doi)) return [];

        let year = doi.getFullYear();
        const month = doi.getMonth() + 1;

        const doiQuarter = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4;
        const relevantQuarters = [];
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
        
        const initialCompRate = aww < 75 ? aww : Math.max(aww * 0.6667, 75);
        const maxRate = maxCompensationRates[parseISO(formData.dateOfInjury || "").getFullYear()] || null;
        const finalCompRate = maxRate !== null && initialCompRate > maxRate ? maxRate : initialCompRate;

        setTotalAnnualPay(totalAnnualPay.toFixed(2));
        setAverageWeeklyWage(aww.toFixed(2));
        setCompensationRate(finalCompRate.toFixed(2));
    };

    return (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            {step === 1 && (
                <div>
                    <h3 className="text-lg font-semibold">Step 1: Input the date of injury.</h3>
                    <label>Select a date between Janaury 1, 1976, and {getCurrentDate()}.</label>
                    <input
                        type="date"
                        name="dateOfInjury"
                        className="border p-2 w-full mt-2"
                        value={formData.dateOfInjury}
                        max={getCurrentDate()}
                        min="1979-01-01"
                        onChange={handleInputChange}
                    />
                    {errors.dateOfInjury && <p className="text-red-600">{errors.dateOfInjury}</p>}

                    <button onClick={handleNextStep} className="mt-4 bg-blue-600 text-white p-2 rounded">
                        Next
                    </button>
                </div>
            )}

{/* add a step for whether employee has been employed for 52 weeks */}

            {step === 2 && (
                <div>
                    <h3>Step 2: Enter the employee&#39;s gross pay for each quarter.</h3>
                    {getRelevantQuarters(formData.dateOfInjury).map((q, index) => (
                        <div key={index}>
                            <p></p>
                            <label>{q.label}</label>
                            <input
                                type="number"
                                name={`quarter${q.quarterIndex}Pay`}
                                className="border p-2 w-full"
                                value={formData[`quarter${q.quarterIndex}Pay`] || ""}
                                onChange={handleInputChange}
                            />
                            {errors[`quarter${q.quarterIndex}Pay`] && <p className="text-red-600">{errors[`quarter${q.quarterIndex}Pay`]}</p>}
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
                        disabled={Object.keys(errors).length > 0}
                    >
                        Next
                    </button>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h3 className="text-lg font-bold">Summary</h3>
                    <p>Total Pre-Injury Annual Gross Pay: ${totalAnnualPay ? Number(totalAnnualPay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <p>Average Weekly Wage: ${averageWeeklyWage ? Number(averageWeeklyWage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <p className="font-bold">Compensation Rate: ${compensationRate ? Number(compensationRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <button onClick={handlePrevStep} className="mt-4 bg-gray-500 text-white p-2 rounded">
                        Back
                    </button>
                </div>
            )}
        </div>
    );
};

export default AwwCRCalculator;

