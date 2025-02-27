/* 
Stopped In the middle of nextstep/previous step logic
To do:
1. (DONE) add step to request user input on whether employee has been employed for 52 weeks
2. (DONE) use existing code to calculate AWW and CR for employee who has been employed for 52 weeks
1. (DONE) add step to request user input on whether employee has been employed for 52 weeks
2. (DONE) use existing code to calculate AWW and CR for employee who has been employed for 52 weeks
4. create code to calculate AWW and CR for employee who has been employed for less than 52 weeks
5. create consistency in styling for this component as compared to CommutedValueCalculator.tsx
6. ensure validation for user input on each step
7. add comments to explain code
8. (DONE) add a button to reset the form
9. (DONE) add preset values for quarterly pay and other inputs so that user can see how the form works and less errors
10. (DONE) restrict user input for pay to positive numbers only and validate that user input is a positive number
10. (DONE) restrict user input for pay to positive numbers only and validate that user input is a positive number
11. add help buttons for each step that gives more information on what to input via pop-up
12. add a button to generate a Form 20.
13. (DONE) check the minimum compensation rate logic
14. (DONE) add special cases such as students, volunteer firefighters, etc. - somewhere in step one 
15. (DONE) getCurrentDate below needs to be in correct format in label on step one.
16. (DONE) take the "back to all calc" button out of the div to be just under header.  maybe in it's own div but not w/ gray background.
17. rework handleNextStep and handleConditionalNextStep and handlePrevStep to work correctly with logic
    probably need to a variable to hold the previous steps value so we can go back to previous step if simple decrease
18. look into component library? Hero.ui or something like that
19. (DONE) adjust current date to be in user's timezone
*/

"use client";

import React, { useState, useEffect, useRef } from "react";
import { parseISO, isValid, format, } from "date-fns";
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid'

interface MaxCompensationRates {
    [year: number]: number;
}

interface QuarterLabel {
    start: string;
    end: string;
}
//gets the current date in the format of YYYY-MM-DD
const getCurrentDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString("en-CA");
};

//reformats the date to be in the format of Mmmmmmmm, d, YYYY
const formatDisplayDate = (isoDate: string): string => {
    return format(parseISO(isoDate), "MMMM d, yyyy"); // Converts "2025-02-22" → "February 22, 2025"
};

// Function to determine the quarter containing the date of injury
// used in step 3 to dynamically display the quarter containing the date of injury
const getQuarterContainingDateOfInjury = (dateOfInjury: string): string => {
    const month = parseISO(dateOfInjury).getMonth() + 1; // getMonth() returns 0-11, so add 1
    const year = parseISO(dateOfInjury).getFullYear(); // getFullYear() returns the year
    if (month >= 1 && month <= 3) return "Quarter 1 of " + year + " (January 1, " + year + " - March 31, " + year + ")";
    if (month >= 4 && month <= 6) return "Quarter 2 of " + year + " (April 1, " + year + " - June 30, " + year + ")";
    if (month >= 7 && month <= 9) return "Quarter 3 of " + year + " (July 1, " + year + " - September 30, " + year + ")";
    if (month >= 10 && month <= 12) return "Quarter 4 of " + year + " (October 1, " + year + " - December 31, " + year + ")";
    return "";
};

//labels for the quarters of the year
const quarterLabels: QuarterLabel[] = [
    { start: "January 1", end: "March 31" },
    { start: "April 1", end: "June 30" },
    { start: "July 1", end: "September 30" },
    { start: "October 1", end: "December 31" },
];
//props for the AwwCRCalculator
//maxCompensationRates is the maximum compensation rates for each year
//maxCompensationRates is stored in /app/CommonVariables.ts and then passed to this component from /app/Calculators/page.tsx
interface AwwCRCalculatorProps {
    maxCompensationRates: MaxCompensationRates;
}

// Define the types for some form data
interface FormData {
    dateOfInjury: string;
    employedFourQuarters: string; // "yes" or "no"
    specialCase: string; // "student", "volunteer", etc. or "no"
    [key: string]: string;
}

// Calculate the Average Weekly Wage and Compensation Rate for a worker
// uses a form to input the data and calculate the AWW and CR
// uses the maxCompensationRates to determine the maximum compensation rate for the year of the injury
const AwwCRCalculator: React.FC<AwwCRCalculatorProps> = ({ maxCompensationRates }) => {
    const [step, setStep] = useState<number>(1);
    const [prevStep, setPrevStep] = useState<number>(1);
    const firstInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (step === 3 && firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, [step]);

    // Calculate the AWW and CR when the user reaches step 4
    // This is the default method for calculating AWW and CR
    // This method is only used when the user has been employed for four quarters
    useEffect(() => {
        if (step === 4) {
            calculateAwwAndCompensation();
        }
    }, [step]);

    //seeds the form with preset values
    //Defining the initial state of the form and values
    const [formData, setFormData] = useState<FormData>({
        dateOfInjury: getCurrentDate(),
        specialCase: "none",
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

    //only sets next step if the current step is valid
    //sets value for the previous step to be used in the back button logic
    //advances the step +1
    const handleNextStepOn1 = () => {
        if (validateStep(step)) {
            setPrevStep(step);
            setStep((prev) => prev + 1);
        }
    };

    //only sets next step if the current step is valid
    //advances the step conditionally based on the special case of the employee
    const handleNextStepOn2 = () => {
        if (validateStep(step)) {
            const specialMap: Record<string,number> = {
                none: 3,
                guard: 4,
                volunteerFF: 5,
                volunteerRescue: 6,
                volunteerSheriff: 7,
                volunteerConstable: 8,
                inmate: 9,
                student: 10
            };
    
            const nextStep = specialMap[formData.specialCase as keyof typeof specialMap];
            if (nextStep) {
                setPrevStep(step);
                setStep(nextStep);
            }
        }
    };
    
    // Use this one to handle the next step when the user has been employed for four quarters
    // handles the next step in the form with conditional logic - does not advance the step by one
    //only sets next step if the current step is valid
    const handleNextStepOn3 = () => {
        if (validateStep(step)) {
            if (formData.employedFourQuarters === "yes") {
                setPrevStep(step);
                setStep(4);
            }
            else if (formData.employedFourQuarters === "no") {
                setPrevStep(step);
                setStep(5);
            }
        }
    };

    //handles the back button logic
    const handleBackBtn = () => {
        setStep(prevStep);   
    }

    //resets the form to the initial state with preset values
    const resetForm = () => {
        setFormData({
            dateOfInjury: getCurrentDate(),
            specialCase: "none",
            employedFourQuarters: "yes",
            quarter1Pay: "2500",
            quarter2Pay: "2500",
            quarter3Pay: "2500",
            quarter4Pay: "2500",
        });
        setErrors({});
        setStep(1);
        setAverageWeeklyWage(null);
        setCompensationRate(null);
        setTotalAnnualPay(null);
    };

    //handles the input change for the form data
    //clears the error for the input field on change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    //validates the steps of the form
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
            const validOptions = [
                "none", "volunteerFF", "volunteerSheriff", "guard",
                "volunteerRescue", "volunteerConstable", "inmate", "student"
            ];
        
            if (!validOptions.includes(formData?.specialCase)) {
                newErrors.specialCase = "You must select a valid option before proceeding.";
            }
        }
        if (step === 3) {
            const validOptions = [
                "yes", "no"
            ];
            if (!validOptions.includes(formData?.specialCase)) {
                newErrors.specialCase = "You must select yes or no before proceeding.";
            }
        }
        if (step === 4) {
            [1, 2, 3, 4].forEach((q) => {
                const value = formData[`quarter${q}Pay`] || "2500"; // Ensure preset value is used
                if (!value || parseFloat(value) < 0) {
                    newErrors[`quarter${q}Pay`] = "Enter a valid amount."; // Should throw error message if user inputs negative money.
                }
            });
        }
        if (step === 5) {
            // Add validation for less than four quarters logic here
            // Example: if not entering values.
        }

        // Update the errors state with the new errors
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //calculates the AWW and CR for the employee
    //default method for calculating AWW and CR
    //only used when the employee has been employed for four full quarters
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

    //returns the form for the AWW and CR calculator
    //this is the main component for the AWW and CR calculator
    return (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
{/* Step 1 - should ask for the date of injury*/}
            {step === 1 && (
                <div>
                    <h3 className="mb-4 text-lg font-semibold flex">1 Input the date of injury. 
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
                    <button tabIndex={2} onClick={handleNextStepOn1} className="mt-4 bg-blue-600 text-white p-2 rounded focus:bg-blue-500 hover:bg-blue-500">
                        Next
                    </button>
                    <button tabIndex={3} onClick={resetForm} className="mt-4 bg-red-600 text-white p-2 rounded float-right focus:bg-red-500 hover:bg-red-500">
                        Reset Form
                    </button>
                </div>
            )}
{/*Step 2 - Special "Employees" under 42-7-60 */}
            {step === 2 && (
                <div>
                    <h3 className="mb-4 text-lg font-semibold flex">
                        2 Was the injured worker injured while working as any of the following?
                        <QuestionMarkCircleIcon className="w-6 h-6 ml-1 text-gray-500" />
                    </h3>
                    {[
                        { value: "guard", label: "State and/or National Guard", tabIndex: 1 },
                        { value: "volunteerFF", label: "Volunteer Fire Fighter", tabIndex: 2 },
                        { value: "volunteerRescue", label: "Volunteer Rescue Squad Member", tabIndex: 3 },
                        { value: "volunteerSheriff", label: "Volunteer Deputy Sheriff", tabIndex: 4 },
                        { value: "volunteerConstable", label: "Volunteer State Constable", tabIndex: 5 },
                        { value: "inmate", label: "Inmate", tabIndex: 6 },
                        { value: "student", label: "Student Engaged in Work Study, Marketing Education, or Apprenticeship", tabIndex: 7 },
                        { value: "none", label: "None of the Above", tabIndex: 8 }
                    ].map(({ value, label, tabIndex }) => (
                        <label key={value} className="flex items-center">
                            <input
                                type="radio"
                                name="specialCase"
                                value={value}
                                checked={formData.specialCase === value}
                                onChange={handleInputChange}
                                className="m-2"
                                tabIndex={tabIndex}
                            />
                            {label}
                        </label>
                    ))}

                    {errors.specialCase && <p className="text-red-600">{errors.specialCase}</p>}

                    <button tabIndex={10} onClick={handleBackBtn} className="mt-4 mr-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-400">
                        Back
                    </button>
                    <button tabIndex={9} onClick={handleNextStepOn2} className="mt-4 bg-blue-600 text-white p-2 rounded focus:bg-blue-500 hover:bg-blue-500">
                        Next
                    </button>
                    <button tabIndex={11} onClick={resetForm} className="mt-4 bg-red-600 text-white p-2 rounded float-right focus:bg-red-500 hover:bg-red-500">
                        Reset Form
                    </button>
                </div>
            )}

{/*Step 3 - should ask whether the employee was employed for four quarters*/}
            {step === 3 && (
                <div>
                    <h3 className="mb-1 text-lg font-semibold flex">3Was the injured worker employed for at least four 
                        complete quarters prior to {formatDisplayDate(formData.dateOfInjury)}?
                        <QuestionMarkCircleIcon className="w-6 h-6 ml-1 text-gray-500" />
                    </h3>
                    <h4 className="mb-2 text-lg italic flex">Note: The four quarters of employment cannot include employment during {getQuarterContainingDateOfInjury(formData.dateOfInjury)}. 
                    </h4>
                    <div className="flex flex-col space-y-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="employedFourQuarters"
                                value="yes"
                                checked={formData.employedFourQuarters === "yes"}
                                onChange={handleInputChange}
                                className="m-1"
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
                                className="m-1"
                                tabIndex={2}
                            />
                            No
                        </label>
                    </div>
                    {errors.employedFourQuarters && <p className="text-red-600">{errors.employedFourQuarters}</p>}
                    <button tabIndex={4} onClick={handleBackBtn} className="mt-4 mr-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-400 hover:bg-gray-400">
                        Back
                    </button>
                    <button tabIndex={3} onClick={handleNextStepOn3} className="mt-4 bg-blue-600 text-white p-2 rounded focus:bg-blue-500 hover:bg-blue-500">
                        Next
                    </button>
                    <button tabIndex={5} onClick={resetForm} className="mt-4 bg-red-500 text-white p-2 rounded float-right focus:bg-red-400 hover:bg-red-400">
                        Reset Form
                    </button>
                </div>
            )}
{/*Step 4 - should ask for the gross pay for each quarter and should only be used if the employee was employed for 4 full quarters*/}
            {step === 4 && (
                <div>
                    <h3 className="mb-4 text-lg font-semibold flex">4Enter the employee's gross pay for each quarter. 
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
                        onClick={handleBackBtn} className="mt-4 mr-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-400 hover:bg-gray-400">
                        Back
                    </button>
                    <button
                        tabIndex={5}
                        onClick={handleNextStepOn1}
                        className="mt-4 bg-blue-600 text-white p-2 rounded focus:bg-blue-500 hover:bg-blue-500">
                        Next
                    </button>               
                    <button 
                        tabIndex={7}
                        onClick={resetForm} className="mt-4 bg-red-500 text-white p-2 rounded float-right hover:bg-red-400 hover:bg-red-400">
                        Reset Form
                    </button>
                </div>
            )}
{/*Step 5 - should ask for the gross pay for a time period and should only be used if the employee was employed for less than 4 full quarters*/}
            {step === 5 && (
                <div>
                    <h3 className="mb-4 text-lg font-semibold flex">5Employee was employed less than four quarters.<QuestionMarkCircleIcon className="w-6 h-6 ml-1 text-gray-500" /></h3>
                    {/* Implement the logic for the case where the employee was employed for less than four quarters */}
                    <p>Please fill out data for the time that they were employed.</p>
                     <button
                        tabIndex={1} 
                        onClick={handleBackBtn} className="mt-4 mr-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-400 hover:bg-gray-400">
                        Back
                    </button>
                     <button
                        tabIndex={2} 
                        onClick={handleNextStepOn1}
                        className="mt-4 bg-blue-600 text-white p-2 rounded focus:bg-blue-500 hover:bg-blue-500">
                        Next
                    </button>
                     <button 
                        tabIndex={3}
                        onClick={resetForm} className="mt-4 bg-red-600 text-white p-2 rounded float-right hover:bg-red-500 hover:bg-red-500">
                        Reset Form
                    </button>
                </div>
            )}
{/*Step 6 - should show the summary of the AWW and CR for the employee if the default (full 4 quarters) method used*/}
            {step === 6 && (
                <div>
                    <h3 className="text-lg font-bold mb-2">6Summary</h3>
                    <p></p>
                    <p>Total Pre-Injury Annual Gross Pay: ${totalAnnualPay ? Number(totalAnnualPay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <p>Average Weekly Wage: ${averageWeeklyWage ? Number(averageWeeklyWage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <p className="font-bold">Compensation Rate: ${compensationRate ? Number(compensationRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <button 
                        tabIndex={1}
                        onClick={handleBackBtn} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-400 hover:bg-gray-400">
                        Back
                    </button>
                    <button 
                        tabIndex={2}
                        onClick={resetForm} className="mt-4 bg-red-500 text-white p-2 rounded float-right hover:bg-red-400 hover:bg-red-400">
                        Reset Form
                    </button>
                </div>
            )}
        </div>
    );
};

export default AwwCRCalculator;
