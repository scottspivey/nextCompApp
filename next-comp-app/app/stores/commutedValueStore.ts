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
          // Use 2% if 100 weeks or less remaining (as per SC rules)
          calculatedDiscountRate = 0.02;
        } else if (marketRate !== null) {
          // Use the fetched market rate if 101+ weeks and the rate was found
          calculatedDiscountRate = marketRate;
        } else {
          // Fallback if 101+ weeks but the market rate was null (not found in DB)
          // Logged error in the page component already. Define fallback behavior here.
          console.warn(`Using fallback discount rate 0.0438 for calculation as current year's rate was missing.`);
          calculatedDiscountRate = 0.0438; // Using last known good rate as fallback
          // Consider if another fallback (e.g., 0.02) or throwing an error is more appropriate
        }

        // Calculate the weekly discount rate
        const weeklyDiscountRate = calculatedDiscountRate / 52;

        // Calculate discounted weeks using present value of annuity formula
        // Handle edge case of zero discount rate or zero weeks remaining
        let discountedWeeks = 0;
        if (weeklyDiscountRate > 0 && weeksRemaining > 0) {
          // Standard formula: (1 - (1 + i)^-n) / i
          // Note: The previous formula had -(weeksRemaining + 1) for >100 weeks.
          // Verify if that "+1" is correct based on specific annuity timing (ordinary vs. due).
          // Using standard ordinary annuity formula here:
          discountedWeeks = (1 - Math.pow(1 + weeklyDiscountRate, -weeksRemaining)) / weeklyDiscountRate;

        } else if (weeksRemaining > 0) {
          // If discount rate is zero, present value is just the sum (n * payment)
          // Here, we just need the number of weeks
          discountedWeeks = weeksRemaining;
        }

        // Calculate final commuted values
        const commutedValue = discountedWeeks * currentCompRate;
        const commutedValue95 = commutedValue * 0.95;
        const commutedValue90 = commutedValue * 0.90;

        // Update the store state with all calculated results
        set({
          weeksRemaining,
          discountRate: calculatedDiscountRate, // Store the rate actually used
          discountedWeeks,
          commutedValue,
          ttdPaidToDateValue,
          commutedValue95,
          commutedValue90
        });
      },

      nextStep: () => {
        const currentStep = get().currentStep;
        // Ensure not going beyond step 4
        set({ currentStep: Math.min(4, currentStep + 1) });
      },

      prevStep: () => {
        const currentStep = get().currentStep;
        // Ensure not going below step 1
        set({ currentStep: Math.max(1, currentStep - 1) });
      },

      goToStep: (step) => {
        // Ensure step is within valid range (1-4)
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
        currentStep: 1
      })
    }),
  )
);