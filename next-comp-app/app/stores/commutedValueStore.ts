// app/store/commutedValueStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CommutedValueState {
  yearOfInjury: string;
  compRate: number;
  ttdPaidToDate: number;
  otherCredit: number;
  
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
  setCompRate: (rate: number) => void;
  setTtdPaidToDate: (weeks: number) => void;
  setOtherCredit: (weeks: number) => void;
  calculateResults: () => void;
  nextStep: () => void;
  prevStep: () => void;
  resetCalculator: () => void;
  goToStep: (step: number) => void;
}

export const useCommutedValueStore = create<CommutedValueState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        yearOfInjury: new Date().getFullYear().toString(),
        compRate: 75,
        ttdPaidToDate: 0,
        otherCredit: 0,
        
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
          
          const weeksRemaining = 500 - (ttdPaidToDate + otherCredit);
          const ttdPaidToDateValue = ttdPaidToDate * compRate;
          
          // Apply appropriate discount rate based on remaining weeks
          const discountRate = weeksRemaining > 100 ? 0.0438 : 0.02;
          const weeklyDiscountRate = discountRate / 52; // Convert annual to weekly
          
          // Calculate present value using the appropriate formula
          const discountedWeeks = (weeksRemaining > 100)
            ? ((1 - Math.pow(1 + weeklyDiscountRate, -(weeksRemaining + 1))) / weeklyDiscountRate)
            : ((1 - Math.pow(1 + weeklyDiscountRate, -weeksRemaining)) / weeklyDiscountRate);
          
          const commutedValue = discountedWeeks * compRate;
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
          
          // If moving to results page, calculate results
          if (nextStep === 4) {
            get().calculateResults();
          }
          
          set({ currentStep: nextStep });
        },
        
        prevStep: () => {
          const currentStep = get().currentStep;
          set({ currentStep: Math.max(1, currentStep - 1) });
        },
        
        goToStep: (step) => set({ currentStep: step }),
        
        resetCalculator: () => set({
          yearOfInjury: new Date().getFullYear().toString(),
          compRate: 75,
          ttdPaidToDate: 0,
          otherCredit: 0,
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
      {
        name: 'commuted-value-storage',
        // Only persist the input data, not the calculated results
        partialize: (state) => ({ 
          yearOfInjury: state.yearOfInjury,
          compRate: state.compRate,
          ttdPaidToDate: state.ttdPaidToDate,
          otherCredit: state.otherCredit
        }),
      }
    )
  )
);