// app/store/commutedValueStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CommutedValueState {
  yearOfInjury: string;
  compRate: number | null;
  ttdPaidToDate: number | null;
  otherCredit: number | null;
  
  // Results
  weeksRemaining: number | null;
  discountRate: number | null;
  discountedWeeks: number | null;
  commutedValue: number | null;
  ttdPaidToDateValue: number | null;
  commutedValue95: number | null;
  commutedValue90: number | null;
  
  // Step tracking
  currentStep: number;
  
  // Actions
  setYearOfInjury: (year: string) => void;
  setCompRate: (rate: number | null) => void;
  setTtdPaidToDate: (weeks: number | null) => void;
  setOtherCredit: (weeks: number | null) => void;
  calculateResults: () => void;
  nextStep: () => void;
  prevStep: () => void;
  resetCalculator: () => void;
  goToStep: (step: number) => void;
}

export const useCommutedValueStore = create<CommutedValueState>()(
  devtools(
      (set, get) => ({
        // Initial state
        yearOfInjury: new Date().getFullYear().toString(),
        compRate: null,
        ttdPaidToDate: null,
        otherCredit: null,
        
        // Results initialized as null
        weeksRemaining: null,
        discountRate: null, 
        discountedWeeks: null,
        commutedValue: null,
        ttdPaidToDateValue: null,
        commutedValue95: null,
        commutedValue90: null,
        
        // Start at step 1
        currentStep: 1,
        
        // Actions
        setYearOfInjury: (year) => set({ yearOfInjury: year }),
        
        setCompRate: (rate) => set({ compRate: rate }),
        
        setTtdPaidToDate: (weeks) => set({ ttdPaidToDate: weeks }),
        
        setOtherCredit: (weeks) => set({ otherCredit: weeks }),
        
        calculateResults: () => {
          const { compRate, ttdPaidToDate, otherCredit } = get();

          // Add safety checks for calculation, defaulting nulls to 0
          const currentCompRate = compRate ?? 0;
          const currentTtdPaid = ttdPaidToDate ?? 0;
          const currentOtherCredit = otherCredit ?? 0;
          
          const weeksRemaining = Math.max(0, 500 - (currentTtdPaid + currentOtherCredit)); // Ensure not negative
          const ttdPaidToDateValue = currentTtdPaid * currentCompRate;
          
          // Apply appropriate discount rate based on remaining weeks
          const discountRate = weeksRemaining > 100 ? 0.0438 : 0.02;
          const weeklyDiscountRate = discountRate / 52; // Convert annual to weekly
          
          // Calculate present value using the appropriate formula
          const discountedWeeks = (weeksRemaining > 100)
            ? ((1 - Math.pow(1 + weeklyDiscountRate, -(weeksRemaining + 1))) / weeklyDiscountRate)
            : ((1 - Math.pow(1 + weeklyDiscountRate, -weeksRemaining)) / weeklyDiscountRate);
          
          const commutedValue = discountedWeeks * currentCompRate;
          const commutedValue95 = commutedValue * 0.95;
          const commutedValue90 = commutedValue * 0.90;
          
          set({
            weeksRemaining,
            discountRate,
            discountedWeeks,
            commutedValue,
            ttdPaidToDateValue,
            commutedValue95,
            commutedValue90
          });
        },
        
        nextStep: () => {
          const currentStep = get().currentStep;
          const nextStep = currentStep + 1;
          
          set({ currentStep: nextStep });
        },
        
        prevStep: () => {
          const currentStep = get().currentStep;
          set({ currentStep: Math.max(1, currentStep - 1) });
        },
        
        goToStep: (step) => set({ currentStep: step }),
        
        resetCalculator: () => set({
          yearOfInjury: new Date().getFullYear().toString(),
          compRate: null,
          ttdPaidToDate: null,
          otherCredit: null,
          weeksRemaining: null,
          discountRate: null,
          discountedWeeks: null,
          commutedValue: null,
          ttdPaidToDateValue: null,
          commutedValue95: null,
          commutedValue90: null,
          currentStep: 1
        })
      }),
  )
);