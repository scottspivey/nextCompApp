// app/stores/awwCalculatorstore.tsx
import { create } from 'zustand';
import { z, ZodTypeAny } from 'zod'; // Import ZodTypeAny
import Big from 'big.js';
import { MIN_DOI_DATE } from '@/app/Components/awwConstants'; // Adjust path
import { getYearFromDate } from '@/app/utils/dateUtils'; // Adjust path
import {
  calculateAWWFourQuarters,
  calculateAWWShortEmployment,
  calculateCompensationRate
} from '@/app/utils/calculationUtils'; // Adjust path

// --- Zod Schemas for Validation ---

export const dateOfInjurySchema = z.string()
  .min(1, { message: "Date of injury is required" })
  .refine(date => !isNaN(new Date(date).getTime()), { message: "Invalid date format" })
  .refine(date => new Date(date) <= new Date(), { message: "Date cannot be in the future" })
  .refine(date => new Date(date) >= new Date(MIN_DOI_DATE), { message: `Date must be on or after ${new Date(MIN_DOI_DATE).toLocaleDateString()}` });

export const specialCasesSchema = z.enum(['guard', 'volunteerFF', 'volunteerRescue', 'volunteerSheriff', 'volunteerConstable', 'inmate', 'student', 'none'], {
    errorMap: () => ({ message: "Please select a valid option." })
});

export const employedFourQuartersSchema = z.enum(['yes', 'no'], {
    errorMap: () => ({ message: "Please select Yes or No." })
});

export const quarterPaySchema = z.string()
  .min(1, { message: "Amount is required" })
  .refine(pay => /^\d+(\.\d{1,2})?$/.test(pay), { message: "Please enter a valid positive amount (e.g., 123.45)" })
  .refine(pay => {
      try {
          return new Big(pay).gte(0);
      } catch {
          return false;
      }
  }, { message: "Amount cannot be negative" });


// --- Store State and Actions ---

export type CalculatorStep = 1 | 2 | 3 | 4 | 5;

export interface AWWErrors {
  dateOfInjury?: string;
  specialCase?: string;
  employedFourQuarters?: string;
  quarter1Pay?: string;
  quarter2Pay?: string;
  quarter3Pay?: string;
  quarter4Pay?: string;
  calculation?: string;
}

// Exporting this interface so it can be used in calculationUtils.ts
export interface AWWCalculatorState {
  // Form data
  dateOfInjury: string;
  specialCase: string;
  employedFourQuarters: string;
  quarter1Pay: string;
  quarter2Pay: string;
  quarter3Pay: string;
  quarter4Pay: string;

  // UI state
  currentStep: CalculatorStep;
  errors: AWWErrors;
  isCalculating: boolean;
  showResults: boolean;

  // Results
  averageWeeklyWage: string | null;
  compensationRate: string | null;
  yearOfInjury: number | null;
  maxCompRate: string | null;

  // Actions
  setField: (field: keyof AWWCalculatorState, value: string) => void;
  validateStep: (step: CalculatorStep) => boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  calculateAndShowResults: () => void;
  resetCalculator: () => void;
}

// Define the initial state for the calculator
// Removed the explicit : AWWCalculatorState type annotation here
const initialState = {
  dateOfInjury: '',
  specialCase: 'none',
  employedFourQuarters: '',
  quarter1Pay: '',
  quarter2Pay: '',
  quarter3Pay: '',
  quarter4Pay: '',
  currentStep: 1 as CalculatorStep,
  errors: {},
  isCalculating: false,
  showResults: false,
  averageWeeklyWage: null,
  compensationRate: null,
  yearOfInjury: null,
  maxCompRate: null,
};

// Create the Zustand store
export const useAWWCalculatorStore = create<AWWCalculatorState>((set, get) => ({
  ...initialState,

  // Action to update any field in the state
  setField: (field, value) => {
    if (field in get()) {
        set(state => ({
            ...state,
            [field]: value,
            errors: { ...state.errors, [field]: undefined, calculation: undefined },
            showResults: false,
            averageWeeklyWage: null,
            compensationRate: null,
            yearOfInjury: null,
            maxCompRate: null,
        }));
    } else {
        console.warn(`Attempted to set invalid field: ${String(field)}`);
    }
  },

  // Action to validate the data for a specific step
  validateStep: (step) => {
    const state = get();
    let success = true;
    const currentErrors = { ...state.errors };
    const stepErrors: AWWErrors = {};

    // Helper to run validation and update errors for this step
    // Updated schema type from z.ZodSchema<any> to z.ZodTypeAny
    const validateField = (field: keyof AWWErrors, schema: ZodTypeAny, value: string) => {
        const result = schema.safeParse(value);
        if (!result.success) {
            stepErrors[field] = result.error.errors[0].message;
            success = false;
        } else {
             stepErrors[field] = undefined;
        }
    };

    switch (step) {
      case 1:
        validateField('dateOfInjury', dateOfInjurySchema, state.dateOfInjury);
        break;
      case 2:
        validateField('specialCase', specialCasesSchema, state.specialCase);
        break;
      case 3:
        validateField('employedFourQuarters', employedFourQuartersSchema, state.employedFourQuarters);
        break;
      case 4:
        if (state.employedFourQuarters === 'yes') {
          validateField('quarter1Pay', quarterPaySchema, state.quarter1Pay);
          validateField('quarter2Pay', quarterPaySchema, state.quarter2Pay);
          validateField('quarter3Pay', quarterPaySchema, state.quarter3Pay);
          validateField('quarter4Pay', quarterPaySchema, state.quarter4Pay);
        } else {
             stepErrors.quarter1Pay = undefined;
             stepErrors.quarter2Pay = undefined;
             stepErrors.quarter3Pay = undefined;
             stepErrors.quarter4Pay = undefined;
        }
        break;
      case 5:
        // No validation needed for step 5 currently
        break;
    }

     const updatedErrors = { ...currentErrors, ...stepErrors };

     const cleanedErrors = Object.entries(updatedErrors).reduce((acc, [key, value]) => {
         if (value !== undefined) {
             acc[key as keyof AWWErrors] = value;
         }
         return acc;
     }, {} as AWWErrors);

    set({ errors: cleanedErrors });
    return success;
  },

  // Action to proceed to the next step if current step is valid
  goToNextStep: () => {
    const { currentStep, validateStep, calculateAndShowResults, employedFourQuarters } = get();
    if (validateStep(currentStep)) {
        let nextStep = currentStep + 1;
        if (currentStep === 3 && employedFourQuarters === 'no') {
            nextStep = 5;
        }
        const maxSteps = 5;
        if (nextStep <= maxSteps) {
             set({ currentStep: nextStep as CalculatorStep });
             if (nextStep === 5) {
                 calculateAndShowResults();
             }
        }
    }
  },

  // Action to go back to the previous step
  goToPreviousStep: () => {
    const { currentStep, employedFourQuarters } = get();
    let previousStep = currentStep - 1;
    if (currentStep === 5 && employedFourQuarters === 'no') {
      previousStep = 3;
    }
    if (previousStep >= 1) {
      set({
          currentStep: previousStep as CalculatorStep,
          showResults: false,
          averageWeeklyWage: null,
          compensationRate: null,
          yearOfInjury: null,
          maxCompRate: null,
          errors: { ...get().errors, calculation: undefined }
      });
    }
  },

  // Action to perform the calculation and update results state
  calculateAndShowResults: () => {
    const state = get();
    let canCalculate = true;
    const validationSteps = [1, 2, 3];
    if(state.employedFourQuarters === 'yes') {
        validationSteps.push(4);
    }

    validationSteps.forEach(step => {
        if (!state.validateStep(step as CalculatorStep)) {
            canCalculate = false;
        }
    });

     if (!canCalculate) {
         console.error("Cannot calculate results, validation failed for preceding steps.");
         set({
             isCalculating: false,
             showResults: false,
             errors: { ...get().errors, calculation: "Please fix errors in previous steps before calculating." }
            });
         return;
     }

    set({ isCalculating: true, showResults: false, errors: { ...get().errors, calculation: undefined } });

    setTimeout(() => {
      try {
        const yearOfInjury = getYearFromDate(state.dateOfInjury);
        let aww: Big;

        if (state.employedFourQuarters === 'yes') {
          aww = calculateAWWFourQuarters(
            state.quarter1Pay,
            state.quarter2Pay,
            state.quarter3Pay,
            state.quarter4Pay
          );
        } else {
          aww = calculateAWWShortEmployment(state.dateOfInjury, state);
        }

        const { compensationRate, maxCompRateForYear } = calculateCompensationRate(aww, state.dateOfInjury);

        set({
          averageWeeklyWage: aww.toFixed(2),
          compensationRate: compensationRate.toFixed(2),
          yearOfInjury: yearOfInjury,
          maxCompRate: maxCompRateForYear ? maxCompRateForYear.toFixed(2) : null,
          isCalculating: false,
          showResults: true,
          currentStep: 5,
        });

      } catch (error) {
          console.error("Error during AWW/CR calculation:", error);
          set(prevState => ({
              isCalculating: false,
              showResults: false,
              errors: { ...prevState.errors, calculation: "An unexpected error occurred during calculation." }
          }));
      }
    }, 50);
  },

  // Action to reset the calculator to its initial state
  resetCalculator: () => {
    set(initialState);
  },
}));
