// app/stores/awwCalculatorstore.tsx
import { create } from 'zustand';
import { z, ZodTypeAny } from 'zod'; // Import ZodTypeAny
import Big from 'big.js';
import { MIN_DOI_DATE } from '@/app/Components/CalcComponents/awwConstants'; // Adjust path
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
  calculation?: string; // For errors during the final calculation
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
  averageWeeklyWage: string | null; // Store as formatted string
  compensationRate: string | null; // Store as formatted string
  yearOfInjury: number | null; // Store year number
  maxCompRate: string | null; // Store max rate for the year as formatted string

  // Actions
  setField: (field: keyof AWWCalculatorState, value: string) => void;
  validateStep: (step: CalculatorStep) => boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  // *** Action signature updated ***
  calculateAndShowResults: (maxRates: Record<number, number>) => void;
  resetCalculator: () => void;
}

// Define the initial state for the calculator
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
            // Clear errors for the specific field being changed and any calculation error
            errors: { ...state.errors, [field]: undefined, calculation: undefined },
            // Reset results when input changes
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
    const validateField = (field: keyof AWWErrors, schema: ZodTypeAny, value: string) => {
        const result = schema.safeParse(value);
        if (!result.success) {
            stepErrors[field] = result.error.errors[0].message;
            success = false;
        } else {
            stepErrors[field] = undefined; // Clear error if valid
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
        // Only validate quarter pay if employedFourQuarters is 'yes'
        if (state.employedFourQuarters === 'yes') {
          validateField('quarter1Pay', quarterPaySchema, state.quarter1Pay);
          validateField('quarter2Pay', quarterPaySchema, state.quarter2Pay);
          validateField('quarter3Pay', quarterPaySchema, state.quarter3Pay);
          validateField('quarter4Pay', quarterPaySchema, state.quarter4Pay);
        } else {
           // Clear quarter pay errors if not applicable
           stepErrors.quarter1Pay = undefined;
           stepErrors.quarter2Pay = undefined;
           stepErrors.quarter3Pay = undefined;
           stepErrors.quarter4Pay = undefined;
        }
        break;
      case 5:
        // No validation needed for step 5 (results display)
        break;
    }

     // Merge step errors with existing errors, removing undefined keys
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
    const { currentStep, validateStep } = get();
    // Validate the current step before proceeding
    if (validateStep(currentStep)) {
        const maxSteps = 5; // Total steps including results
        if (currentStep < maxSteps) {
            // Note: Calculation trigger is now separate (in component's handleCalculate)
            set({ currentStep: (currentStep + 1) as CalculatorStep });
        }
    }
  },

  // Action to go back to the previous step
  goToPreviousStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({
          currentStep: (currentStep - 1) as CalculatorStep,
          // Clear results when going back
          showResults: false,
          averageWeeklyWage: null,
          compensationRate: null,
          yearOfInjury: null,
          maxCompRate: null,
          errors: { ...get().errors, calculation: undefined } // Clear calculation error
      });
    }
  },

  // Action to perform the calculation and update results state
  // *** Updated signature and implementation ***
  calculateAndShowResults: (maxRates: Record<number, number>) => { // Accept maxRates
    const state = get();
    let canCalculate = true;
    // Determine required validation steps based on employment duration
    const validationSteps: CalculatorStep[] = [1, 2, 3];
    if(state.employedFourQuarters === 'yes') {
        validationSteps.push(4);
    } else if (!state.employedFourQuarters) { // Ensure a selection was made
        canCalculate = false; // Cannot calculate without knowing employment duration
        validationSteps.length = 0; // Skip validation if step 3 is invalid
         set({
            errors: { ...get().errors, employedFourQuarters: "Please select employment duration." }
         });
    }

    // Validate all necessary preceding steps
    validationSteps.forEach(step => {
        if (!state.validateStep(step)) {
            canCalculate = false;
        }
    });

     if (!canCalculate) {
         console.error("Cannot calculate results, validation failed for preceding steps.");
         set({
             isCalculating: false,
             showResults: false, // Don't show results section if validation fails
             errors: { ...get().errors, calculation: "Please fix errors in previous steps before calculating." }
           });
         return; // Stop calculation
     }

    // Proceed with calculation
    set({ isCalculating: true, showResults: false, errors: { ...get().errors, calculation: undefined } });

    // Use setTimeout to simulate async calculation if needed, or remove for direct calc
    setTimeout(() => {
      try {
        const yearOfInjuryNum = getYearFromDate(state.dateOfInjury);
        if (yearOfInjuryNum === null) {
            throw new Error("Invalid Date of Injury for calculation.");
        }

        let aww: Big;

        if (state.employedFourQuarters === 'yes') {
          aww = calculateAWWFourQuarters(
            state.quarter1Pay,
            state.quarter2Pay,
            state.quarter3Pay,
            state.quarter4Pay
          );
        } else { // employedFourQuarters === 'no'
          // Use placeholder or implement logic for short employment
          aww = calculateAWWShortEmployment(state.dateOfInjury, state);
          // Add a warning if using placeholder logic
          console.warn("Using placeholder AWW calculation for short employment.");
        }

        // Ensure AWW is not negative
        if (aww.lt(0)) {
            throw new Error("Calculated Average Weekly Wage cannot be negative.");
        }

        // Calculate CR using the calculated AWW and *passed-in* maxRates
        const { compensationRate: cr, maxCompRateForYear } = calculateCompensationRate(aww, state.dateOfInjury, maxRates); // Pass maxRates here

        // Format results for storage/display (e.g., to 2 decimal places)
        const formattedAWW = aww.toFixed(2);
        const formattedCR = cr.toFixed(2);
        const formattedMaxRate = maxCompRateForYear ? maxCompRateForYear.toFixed(2) : null;

        set({
            averageWeeklyWage: formattedAWW,
            compensationRate: formattedCR,
            maxCompRate: formattedMaxRate,
            yearOfInjury: yearOfInjuryNum, // Store as number
            isCalculating: false,
            showResults: true, // Show results now
            currentStep: 5, // Move to results step
            errors: { ...get().errors, calculation: undefined } // Clear calculation error on success
        });

      } catch (error) {
          console.error("Error during AWW/CR calculation:", error);
          let errorMessage = "An unexpected error occurred during calculation.";
          if (error instanceof Error) {
              errorMessage = error.message;
          }
          set(prevState => ({
              isCalculating: false,
              showResults: true, // Still show results section to display the error
              errors: { ...prevState.errors, calculation: errorMessage }, // Set calculation error
              // Clear potentially partial results
              averageWeeklyWage: null,
              compensationRate: null,
              maxCompRate: null,
              yearOfInjury: null,
              currentStep: 5 // Ensure user sees the error message on the final step
          }));
      }
    }, 50); // Simulate short delay
  },

  // Action to reset the calculator to its initial state
  resetCalculator: () => {
    set(initialState);
  },
}));