/* 
To do:
1. (DONE) add step to request user input on whether employee has been employed for 52 weeks
2. (DONE) use existing code to calculate AWW and CR for employee who has been employed for 52 weeks
4. create code to calculate AWW and CR for employee who has been employed for less than 52 weeks
5. create consistency in styling for this component as compared to CommutedValueCalculator.tsx
6. ensure validation for user input on each step
7. add comments to explain code
8. (DONE) add a button to reset the form
9. (DONE) add preset values for quarterly pay and other inputs so that user can see how the form works and less errors
10. (DONE) restrict user input for pay to positive numbers only and validate that user input is a positive number
11. add help buttons for each step that gives more information on what to input via pop-up
12. add a button to generate a Form 20.
13. (DONE) check the minimum compensation rate logic
14. add special cases such as students, volunteer firefighters, etc. - somewhere in step one 
15. (DONE) getCurrentDate below needs to be in correct format in label on step one.
16. (DONE) take the "back to all calc" button out of the div to be just under header.  maybe in it's own div but not w/ gray background.
17. 
*/

"use client";

import React, { useState, useEffect, useRef } from "react";
import { parseISO, isValid } from "date-fns";
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid'
import { format } from "date-fns";

interface MaxCompensationRates {
    [year: number]: number;
}

interface QuarterLabel {
    start: string;
    end: string;
}

const getCurrentDate = (): string => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
};

//reformat the date to be in the format of Mmmmmmmm, d, YYYY
const formatDisplayDate = (isoDate: string): string => {
    return format(parseISO(isoDate), "MMMM d, yyyy"); // Converts "2025-02-22" → "February 22, 2025"
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

// Define the types for the form data
interface FormData {
    dateOfInjury: string;
    employedFourQuarters: string; // "yes" or "no"
    [key: string]: string;
}

const AwwCRCalculator: React.FC<AwwCRCalculatorProps> = ({ maxCompensationRates }) => {
    const [step, setStep] = useState<number>(1);
    const [subStep, setSubStep] = useState<string | null>(null); // New state for sub-steps
    const firstInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (step === 3 && firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, [step]);

    useEffect(() => {
        if (step === 4) {
            calculateAwwAndCompensation();
        }
    }, [step]);

    const [formData, setFormData] = useState<FormData>({
        dateOfInjury: getCurrentDate(),
        employedFourQuarters: "yes",
        quarter1Pay: "2500",
        quarter2Pay: "2500",
        quarter3Pay: "2500",
        quarter4Pay: "2500",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [averageWeeklyWage, setAverageWeeklyWage] = useState<string | null>(null);
    const [compensationRate, setCompensationRate] = useState<string | null>(null);
    const [totalAnnualPay, setTotalAnnualPay] = useState<string | null>(null);

    const handleNextStep = () => {
        if (validateStep(step)) {
            if (step === 3 && subStep === null) {
                setSubStep(formData.employedFourQuarters === "yes" ? "3a" : "3b");
            } else if (step === 3 && subStep !== null) {
                setStep((prev) => prev + 1);
                setSubStep(null);
            } else {
                setStep((prev) => prev + 1);
            }
        }
    };

    const handlePrevStep = () => {
        if (step === 3 && subStep !== null) {
            setSubStep(null);
        } else {
            setStep((prev) => prev - 1);
        }
    };

    const resetForm = () => {
        setFormData({
            dateOfInjury: getCurrentDate(),
            employedFourQuarters: "yes",
            quarter1Pay: "2500",
            quarter2Pay: "2500",
            quarter3Pay: "2500",
            quarter4Pay: "2500",
        });
        setErrors({});
        setStep(1);
        setSubStep(null);
        setAverageWeeklyWage(null);
        setCompensationRate(null);
        setTotalAnnualPay(null);
    };

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
            if (formData.employedFourQuarters === "") {
                newErrors.employedFourQuarters = "Please indicate if the worker was employed for at least four quarters.";
            }
        }
        if (step === 3 && formData.employedFourQuarters === "yes") {
            [1, 2, 3, 4].forEach((q) => {
                const value = formData[`quarter${q}Pay`] || "2500"; // Ensure preset value is used
                if (!value || parseFloat(value) < 0) {
                    newErrors[`quarter${q}Pay`] = "Enter a valid amount."; // Should throw error message if user inputs negative money.
                }
            });
        }
        if (step === 3 && formData.employedFourQuarters === "no") {
            // Add validation for less than four quarters logic here
            // Example: if not entering values.
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
                    <h3 className="mb-4 text-lg font-semibold flex">Step 1: Input the date of injury. 
                        <QuestionMarkCircleIcon className="w-6 h-6 ml-1 text-gray-500" /></h3>
                    <label>Select a date between January 1, 1976, and {formatDisplayDate(getCurrentDate())}.</label> 
                    <input
                        type="date"
                        autoFocus
                        name="dateOfInjury"
                        className="border p-2 w-full mt-2"
                        value={formData.dateOfInjury}
                        max={getCurrentDate()}
                        min="1976-01-01"
                        onChange={handleInputChange}
                        tabIndex={1}
                    />
                    {errors.dateOfInjury && <p className="text-red-600">{errors.dateOfInjury}</p>}
                    <button tabIndex={2} onClick={handleNextStep} className="mt-4 bg-blue-600 text-white p-2 rounded focus:bg-blue-500 hover:bg-blue-500">
                        Next
                    </button>
                    <button tabIndex={3} onClick={resetForm} className="mt-4 bg-red-600 text-white p-2 rounded float-right focus:bg-red-500 hover:bg-red-500">
                        Reset Form
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3 className="mb-4 text-lg font-semibold flex">Step 2: Was the worker employed for at least four quarters prior to the date of injury? 
                        <QuestionMarkCircleIcon className="w-6 h-6 ml-1 text-gray-500" /></h3>
                    <div className="mt-2 flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="employedFourQuarters"
                                value="yes"
                                checked={formData.employedFourQuarters === "yes"}
                                onChange={handleInputChange}
                                className="mr-2"
                                tabIndex={1}
                            />
                            Yes
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="employedFourQuarters"
                                value="no"
                                checked={formData.employedFourQuarters === "no"}
                                onChange={handleInputChange}
                                className="mr-2"
                                tabIndex={2}
                            />
                            No
                        </label>
                    </div>
                    {errors.employedFourQuarters && <p className="text-red-600">{errors.employedFourQuarters}</p>}
                    <button tabIndex={3} onClick={handlePrevStep} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-400 hover:bg-gray-400">
                        Back
                    </button>
                    <button tabIndex={4} onClick={handleNextStep} className="mt-4 bg-blue-600 text-white p-2 rounded focus:bg-blue-500 hover:bg-blue-500">
                        Next
                    </button>
                    <button tabIndex={5} onClick={resetForm} className="mt-4 bg-red-600 text-white p-2 rounded float-right focus:bg-red-500 hover:bg-red-500">
                        Reset Form
                    </button>
                </div>
            )}

            {step === 3 && subStep === "3a" && (
                <div>
                    <h3 className="mb-4 text-lg font-semibold flex">Step 3: Enter the employee's gross pay for each quarter. 
                            <QuestionMarkCircleIcon className="w-6 h-6 ml-1 text-gray-500" /></h3>
                    {[1, 2, 3, 4].map((q, index) => (
                        <div key={q}>
                            <label>Gross Pay for Quarter {q}:</label>
                            <input
                                type="number"
                                name={`quarter${q}Pay`}
                                className="border p-2 w-full"
                                value={formData[`quarter${q}Pay`]}
                                onChange={handleInputChange}
                                ref={index === 0 ? firstInputRef : null} // Only first input gets the ref
                                tabIndex={index + 1}
                                min="0"
                            />
                            {errors[`quarter${q}Pay`] && <p className="text-red-600">{errors[`quarter${q}Pay`]}</p>}
                        </div>
                    ))}       
                    <button
                        tabIndex={6} 
                        onClick={handlePrevStep} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-400 hover:bg-gray-400">
                        Back
                    </button>
                    <button
                        tabIndex={5}
                        onClick={() => {
                            handleNextStep();
                        }}
                        className="mt-4 mr-2 bg-blue-600 text-white p-2 rounded focus:bg-blue-500 hover:bg-blue-500">
                        Next
                    </button>               
                    <button 
                        tabIndex={7}
                        onClick={resetForm} className="mt-4 bg-red-600 text-white p-2 rounded float-right hover:bg-red-500 hover:bg-red-500">
                        Reset Form
                    </button>
                </div>
            )}
            {step === 3 && subStep === "3b" && (
                <div>
                    <h3 className="mb-4 text-lg font-semibold flex">Step 3: Employee was employed less than four quarters.<QuestionMarkCircleIcon className="w-6 h-6 ml-1 text-gray-500" /></h3>
                    {/* Implement the logic for the case where the employee was employed for less than four quarters */}
                    <p>Please fill out data for the time that they were employed.</p>
                     <button
                        tabIndex={1} 
                        onClick={handlePrevStep} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-400 hover:bg-gray-400">
                        Back
                    </button>
                     <button
                        tabIndex={2} 
                        onClick={() => {
                            handleNextStep();
                        }} className="mt-4 mr-2 bg-blue-600 text-white p-2 rounded focus:bg-blue-500 hover:bg-blue-500">
                        Next
                    </button>
                     <button 
                        tabIndex={3}
                        onClick={resetForm} className="mt-4 bg-red-600 text-white p-2 rounded float-right hover:bg-red-500 hover:bg-red-500">
                        Reset Form
                    </button>
                </div>
            )}

            {step === 4 && (
                <div>
                    <h3 className="text-lg font-bold mb-2">Summary</h3>
                    <p></p>
                    <p>Total Pre-Injury Annual Gross Pay: ${totalAnnualPay ? Number(totalAnnualPay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <p>Average Weekly Wage: ${averageWeeklyWage ? Number(averageWeeklyWage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <p className="font-bold">Compensation Rate: ${compensationRate ? Number(compensationRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <button 
                        tabIndex={1}
                        onClick={handlePrevStep} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-400 hover:bg-gray-400">
                        Back
                    </button>
                    <button 
                        tabIndex={2}
                        onClick={resetForm} className="mt-4 bg-red-600 text-white p-2 rounded float-right hover:bg-red-500 hover:bg-red-500">
                        Reset Form
                    </button>
                </div>
            )}
        </div>
    );
};

export default AwwCRCalculator;
