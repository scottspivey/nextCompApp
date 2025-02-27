/*
Stopped In the middle of nextstep/previous step logic
trying a map/key approach to steps by dynamically rendered - current errors and bugs.

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
                    newErrors.specialCase = "You must select 'yes' or 'no' before proceeding.";
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

    const nextBtnArray = [
        {
            currentStep: 1,
            action: ()=> handleNextStep(1),
            validate: validateStep,
            nextStep: (formdata: any) => 2,
        },
        {
            currentStep: 2,
            action: () => handleNextStep(2),
            validate: validateStep,
            nextStep: (formData: any) => {
                const specialMap: Record<string, number> = {
                    none: 3,
                    guard: 4,
                    volunteerFF: 5,
                    volunteerRescue: 6,
                    volunteerSheriff: 7,
                    volunteerConstable: 8,
                    inmate: 9,
                    student: 10,
                };
                return specialMap[formData.specialCase as keyof typeof specialMap] || 3;
            },
        }, 
        {

        },

    ]

    const handleNextStep = (currentStep: number) => {
        const nextStepConfig = nextBtnArray.find(step => step.currentStep === currentStep);

        if (!nextStepConfig) return;

        const {validate, nextStep} = nextStepConfig

        if (validate(step)) {
            setPrevStep(step);
            setStep(nextStep(formData));
        };
    };

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

    const steps = [
        {
            title: "Input the date of injury",
            description: `Select a date between January 1, 1976, and ${formatDisplayDate(getCurrentDate())}.`,
            content: (
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
            ),
            error: errors.dateOfInjury,
            next: handleNextStepOn1,
        },
        {
            title: "Was the injured worker injured while working as any of the following?",
            options: [
                { value: "guard", label: "State and/or National Guard" },
                { value: "volunteerFF", label: "Volunteer Fire Fighter" },
                { value: "volunteerRescue", label: "Volunteer Rescue Squad Member" },
                { value: "volunteerSheriff", label: "Volunteer Deputy Sheriff" },
                { value: "volunteerConstable", label: "Volunteer State Constable" },
                { value: "inmate", label: "Inmate" },
                { value: "student", label: "Student Engaged in Work Study, Marketing Education, or Apprenticeship" },
                { value: "none", label: "None of the Above" }
            ],
            error: errors.specialCase,
            next: handleNextStepOn2,
        },
        {
            title: `Was the injured worker employed for at least four complete quarters prior to ${formatDisplayDate(formData.dateOfInjury)}?`,
            description: `Note: The four quarters of employment cannot include employment during ${getQuarterContainingDateOfInjury(formData.dateOfInjury)}.`,
            options: [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
            ],
            error: errors.employedFourQuarters,
            next: handleNextStepOn3,
        },
        {
            title: "Enter the employee's gross pay for each quarter",
            content: (
                <>
                    {[1, 2, 3, 4].map((q, index) => (
                        <div key={q}>
                            <label>Gross Pay for Quarter {q}:</label>
                            <input
                                type="number"
                                name={`quarter${q}Pay`}
                                className="border p-2 w-full"
                                value={formData[`quarter${q}Pay`]}
                                onChange={handleInputChange}
                                ref={index === 0 ? firstInputRef : null}
                                tabIndex={index + 1}
                                min="0"
                            />
                            {errors[`quarter${q}Pay`] && <p className="text-red-600">{errors[`quarter${q}Pay`]}</p>}
                        </div>
                    ))}
                </>
            ),
            next: handleNextStepOn1,
        },
        {
            title: "Employee was employed less than four quarters.",
            description: "Please fill out data for the time that they were employed.",
            next: handleNextStepOn1,
        },
        {
            title: "Summary",
            content: (
                <>
                    <p>Total Pre-Injury Annual Gross Pay: ${totalAnnualPay ? Number(totalAnnualPay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <p>Average Weekly Wage: ${averageWeeklyWage ? Number(averageWeeklyWage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                    <p className="font-bold">Compensation Rate: ${compensationRate ? Number(compensationRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</p>
                </>
            ),
        },
    ];

//returns the form/html for the AWW and CR calculator
    return (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
        {steps[step - 1] && (
            <div>
                <h3 className="mb-4 text-lg font-semibold flex">
                    {step} {steps[step - 1].title}
                    <QuestionMarkCircleIcon className="w-6 h-6 ml-1 text-gray-500" />
                </h3>
                {steps[step - 1].description && <p className="mb-2">{steps[step - 1].description}</p>}

                {/* Render Inputs or Options */}
                {steps[step - 1].content}
                {steps[step - 1].options && (
                    <div className="flex flex-col space-y-2">
                        {steps[step - 1].options.map(({ value, label }, index) => (
                            <label key={value} className="flex items-center">
                                <input
                                    type="radio"
                                    name={step === 2 ? "specialCase" : "employedFourQuarters"}
                                    value={value}
                                    checked={formData[step === 2 ? "specialCase" : "employedFourQuarters"] === value}
                                    onChange={handleInputChange}
                                    className="m-1"
                                    tabIndex={index + 1}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                )}

                {steps[step - 1].error && <p className="text-red-600">{steps[step - 1].error}</p>}

                {/* Navigation Buttons */}
                <div className="mt-4">
                    {step > 1 && (
                        <button onClick={handleBackBtn} className="mr-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-400">
                            Back
                        </button>
                    )}
                    {steps[step - 1].next && (
                        <button onClick={steps[step - 1].next} className="bg-blue-600 text-white p-2 rounded focus:bg-blue-500 hover:bg-blue-500">
                            Next
                        </button>
                    )}
                    <button onClick={resetForm} className="bg-red-500 text-white p-2 rounded float-right focus:bg-red-400 hover:bg-red-400">
                        Reset Calculator
                    </button>
                </div>
            </div>
            )}
        </div>
    );
};
export default AwwCRCalculator;