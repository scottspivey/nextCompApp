// app/store/commutedValueStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Get the current year once (though not directly used in this version of store logic)
const currentYear = new Date().getFullYear();

interface CommutedValueState {
  // Input state
  yearOfInjury: string;
  compRate: number | null;
  ttdPaidToDate: number | null;
  otherCredit: number | null;

  // Results state
  weeksRemaining: number | null;
  discountRate: number | null; // This will store the rate *actually used* in calculation
  discountedWeeks: number | null;
  commutedValue: number | null;
  ttdPaidToDateValue: number | null;
  commutedValue95: number | null;
  commutedValue90: number | null;
  calculationDate: Date | null; // *** Added calculationDate state ***

  // Step tracking
  currentStep: number;

  // Actions
  setYearOfInjury: (year: string) => void;
  setCompRate: (rate: number | null) => void;
  setTtdPaidToDate: (weeks: number | null) => void;
  setOtherCredit: (weeks: number | null) => void;
  // *** Updated signature for calculateResults ***
  calculateResults: (marketRate: number | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetCalculator: () => void;
  goToStep: (step: number) => void;
}

export const useCommutedValueStore = create<CommutedValueState>()(
  devtools(
    (set, get) => ({
      // Initial state
      yearOfInjury: currentYear.toString(), // Default yearOfInjury to current year
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
      calculationDate: null, // *** Initialize calculationDate to null ***

      // Start at step 1
      currentStep: 1,

      // --- Actions ---
      setYearOfInjury: (year) => set({ yearOfInjury: year }),
      setCompRate: (rate) => set({ compRate: rate }),
      setTtdPaidToDate: (weeks) => set({ ttdPaidToDate: weeks }),
      setOtherCredit: (weeks) => set({ otherCredit: weeks }),

      // *** Updated implementation for calculateResults ***
      calculateResults: (marketRate: number | null) => {
        const { compRate, ttdPaidToDate, otherCredit } = get();

        // Use nullish coalescing for safe calculations
        const currentCompRate = compRate ?? 0;
        const currentTtdPaid = ttdPaidToDate ?? 0;
        const currentOtherCredit = otherCredit ?? 0;

        // Calculate remaining weeks, ensuring it's not negative
        const weeksRemaining = Math.max(0, 500 - (currentTtdPaid + currentOtherCredit));
        // Calculate the value of TTD already paid
        const ttdPaidToDateValue = currentTtdPaid * currentCompRate;

        // Determine the discount rate to apply based on weeks remaining and fetched market rate
        let calculatedDiscountRate: number;
        if (weeksRemaining < 101) {
          calculatedDiscountRate = 0.02;
        } else if (marketRate !== null) {
          calculatedDiscountRate = marketRate;
        } else {
          console.warn(`Using fallback discount rate 0.0438 for calculation as current year's rate was missing.`);
          calculatedDiscountRate = 0.0438;
        }

        // Calculate the weekly discount rate
        const weeklyDiscountRate = calculatedDiscountRate / 52;

        // Calculate discounted weeks using present value of annuity formula
        let discountedWeeks = 0;
        if (weeklyDiscountRate > 0 && weeksRemaining > 0) {
          const exponent = weeksRemaining > 100 ? -(weeksRemaining + 1) : -weeksRemaining;
          discountedWeeks = (1 - Math.pow(1 + weeklyDiscountRate, exponent)) / weeklyDiscountRate;
        } else if (weeksRemaining > 0) {
          discountedWeeks = weeksRemaining;
        }

        // Calculate final commuted values
        const commutedValue = discountedWeeks * currentCompRate;
        const commutedValue95 = commutedValue * 0.95;
        const commutedValue90 = commutedValue * 0.90;

        // *** Get the current date when calculation runs ***
        const calculationDate = new Date();

        // Update the store state with all calculated results
        set({
          weeksRemaining,
          discountRate: calculatedDiscountRate,
          discountedWeeks,
          commutedValue,
          ttdPaidToDateValue,
          commutedValue95,
          commutedValue90,
          calculationDate // *** Store the calculation date ***
        });
      },

      nextStep: () => {
        const currentStep = get().currentStep;
        set({ currentStep: Math.min(4, currentStep + 1) });
      },

      prevStep: () => {
        const currentStep = get().currentStep;
        set({ currentStep: Math.max(1, currentStep - 1) });
      },

      goToStep: (step) => {
        const validStep = Math.max(1, Math.min(4, step));
        set({ currentStep: validStep });
      },

      // Reset all inputs and results to initial state
      resetCalculator: () => set({
        yearOfInjury: currentYear.toString(),
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
        calculationDate: null, // *** Reset calculationDate to null ***
        currentStep: 1
      })
    }),
    // { name: "commuted-value-store" } // Optional devtools options
  )
);