// app/stores/awwCalculatorStore.ts
import { create } from 'zustand';
import { z } from 'zod';
import { maxCompensationRates } from '@/app/CommonVariables';

// Define the schema for validation using Zod
export const dateOfInjurySchema = z.string().refine(
  (date) => {
    if (!date) return false;
    const validDate = new Date(date);
    return !isNaN(validDate.getTime()) && validDate <= new Date() && validDate >= new Date('1979-01-01');
  },
  { message: "Please enter a valid date between January 1, 1979 and today" }
);

export const specialCasesSchema = z.enum(['guard', 'volunteerFF', 'volunteerRescue', 'volunteerSheriff', 'volunteerConstable', 'inmate', 'student', 'none']);

export const employedFourQuartersSchema = z.enum(['yes', 'no']);

export const quarterPaySchema = z.string().refine(
  (pay) => {
    const value = Number(pay);
    return !isNaN(value) && value >= 0;
  },
  { message: "Please enter a valid amount (must be a positive number)" }
);

// Define types for our store
export type CalculatorStep = 1 | 2 | 3 | 4 | 5;

interface AWWCalculatorState {
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
  errors: Record<string, string>;
  isCalculating: boolean;
  
  // Results
  averageWeeklyWage: number | null;
  compensationRate: number | null;
  yearOfInjury: number | null;
  maxCompRate: number | null;
  
  // Actions
  setField: (field: string, value: string) => void;
  validateCurrentStep: () => boolean;
  nextStep: () => void;
  previousStep: () => void;
  calculateResults: () => void;
  resetCalculator: () => void;
}

// Helper function to calculate year from date string
const getYearFromDate = (dateString: string): number => {
  const date = new Date(dateString);
  return date.getFullYear();
};

// Create the Zustand store
export const useAWWCalculatorStore = create<AWWCalculatorState>((set, get) => ({
  // Initial form data
  dateOfInjury: '',
  specialCase: 'none',
  employedFourQuarters: 'yes',
  quarter1Pay: '',
  quarter2Pay: '',
  quarter3Pay: '',
  quarter4Pay: '',
  
  // Initial UI state
  currentStep: 1,
  errors: {},
  isCalculating: false,
  
  // Initial results
  averageWeeklyWage: null,
  compensationRate: null,
  yearOfInjury: null,
  maxCompRate: null,
  
  // Actions
  setField: (field, value) => {
    set({ [field]: value });
    
    // Clear error for this field if it exists
    const currentErrors = { ...get().errors };
    if (currentErrors[field]) {
      delete currentErrors[field];
      set({ errors: currentErrors });
    }
  },
  
  validateCurrentStep: () => {
    const state = get();
    const newErrors: Record<string, string> = {};
    
    switch (state.currentStep) {
      case 1: {
        try {
          dateOfInjurySchema.parse(state.dateOfInjury);
        } catch (error) {
          if (error instanceof z.ZodError) {
            newErrors.dateOfInjury = error.errors[0].message;
          }
        }
        break;
      }
      case 2: {
        try {
          specialCasesSchema.parse(state.specialCase);
        } catch (error) {
          if (error instanceof z.ZodError) {
            newErrors.specialCase = error.errors[0].message;
          }
        }
        break;
      }
      case 3: {
        try {
          employedFourQuartersSchema.parse(state.employedFourQuarters);
        } catch (error) {
          if (error instanceof z.ZodError) {
            newErrors.employedFourQuarters = error.errors[0].message;
          }
        }
        break;
      }
      case 4: {
        // Only validate if employed for four quarters is "yes"
        if (state.employedFourQuarters === 'yes') {
          try {
            quarterPaySchema.parse(state.quarter1Pay);
          } catch (error) {
            if (error instanceof z.ZodError) {
              newErrors.quarter1Pay = error.errors[0].message;
            }
          }
          
          try {
            quarterPaySchema.parse(state.quarter2Pay);
          } catch (error) {
            if (error instanceof z.ZodError) {
              newErrors.quarter2Pay = error.errors[0].message;
            }
          }
          
          try {
            quarterPaySchema.parse(state.quarter3Pay);
          } catch (error) {
            if (error instanceof z.ZodError) {
              newErrors.quarter3Pay = error.errors[0].message;
            }
          }
          
          try {
            quarterPaySchema.parse(state.quarter4Pay);
          } catch (error) {
            if (error instanceof z.ZodError) {
              newErrors.quarter4Pay = error.errors[0].message;
            }
          }
        }
        break;
      }
      // Step 5 validation would go here if needed
    }
    
    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },
  
  nextStep: () => {
    const state = get();
    
    if (state.validateCurrentStep()) {
      if (state.currentStep < 5) {
        // Special case: if user selects "no" for employed four quarters, skip to step 5
        if (state.currentStep === 3 && state.employedFourQuarters === 'no') {
          set({ currentStep: 5 as CalculatorStep });
        } else {
          set({ currentStep: (state.currentStep + 1) as CalculatorStep });
        }
        
        // If we're at the last step, calculate the results
        if (state.currentStep === 4 || (state.currentStep === 3 && state.employedFourQuarters === 'no')) {
          state.calculateResults();
        }
      }
    }
  },
  
  previousStep: () => {
    const state = get();
    
    if (state.currentStep > 1) {
      // Special case: if user is on step 5 and selected "no" for employed four quarters, go back to step 3
      if (state.currentStep === 5 && state.employedFourQuarters === 'no') {
        set({ currentStep: 3 as CalculatorStep });
      } else {
        set({ currentStep: (state.currentStep - 1) as CalculatorStep });
      }
    }
  },
  
  calculateResults: () => {
    const state = get();
    set({ isCalculating: true });
    
    // Add a slight delay to simulate calculation
    setTimeout(() => {
      // Calculate the year of injury
      const yearOfInjury = getYearFromDate(state.dateOfInjury);
      
      // Get max compensation rate for that year
      const maxCompRate = maxCompensationRates[yearOfInjury] || maxCompensationRates[2025]; // Default to current year if not found
      
      let averageWeeklyWage = 0;
      
      if (state.employedFourQuarters === 'yes') {
        // Calculate AWW based on the four quarters of pay
        const quarter1 = parseFloat(state.quarter1Pay) || 0;
        const quarter2 = parseFloat(state.quarter2Pay) || 0;
        const quarter3 = parseFloat(state.quarter3Pay) || 0;
        const quarter4 = parseFloat(state.quarter4Pay) || 0;
        
        const totalPay = quarter1 + quarter2 + quarter3 + quarter4;
        averageWeeklyWage = totalPay / 52; // Divide by weeks in a year
      } else {
        // For this example, we'll just set a placeholder value
        // In a real app, you would implement the calculation for less than 4 quarters
        averageWeeklyWage = 0;
      }
      
      // Calculate compensation rate (typically 66.67% of AWW)
      let compensationRate = averageWeeklyWage * 0.6667;
      
      // Cap the compensation rate at the max for that year
      if (compensationRate > maxCompRate) {
        compensationRate = maxCompRate;
      }
      
      // Apply any special case adjustments (simplified for this example)
      if (state.specialCase !== 'none') {
        // Special case calculations would go here
        // For now, we'll just leave it as is
      }
      
      set({
        averageWeeklyWage,
        compensationRate,
        yearOfInjury,
        maxCompRate,
        isCalculating: false
      });
    }, 500);
  },
  
  resetCalculator: () => {
    set({
      dateOfInjury: '',
      specialCase: 'none',
      employedFourQuarters: 'yes',
      quarter1Pay: '',
      quarter2Pay: '',
      quarter3Pay: '',
      quarter4Pay: '',
      currentStep: 1,
      errors: {},
      isCalculating: false,
      averageWeeklyWage: null,
      compensationRate: null,
      yearOfInjury: null,
      maxCompRate: null
    });
  }
}));