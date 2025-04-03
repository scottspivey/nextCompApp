// app/utils/calculationUtils.ts
import Big from 'big.js';
// Import the state type
import { AWWCalculatorState } from '@/app/stores/awwCalculatorstore'; // Adjust path as needed
// Corrected import path for maxCompensationRates
import { maxCompensationRates } from '@/app/CommonVariables'; // User provided correct path
// Import other constants from awwConstants
import { COMPENSATION_RATE_PERCENTAGE, WEEKS_IN_YEAR } from '@/app/Components/CalcComponents/awwConstants'; // Adjust path as needed
import { getYearFromDate } from './dateUtils'; // Adjust path as needed

// Removed unused ShortEmploymentFormData type alias

/**
 * Placeholder for calculating Average Weekly Wage (AWW) when employed for less than four quarters.
 * NOTE: This needs to be implemented based on SC Section 42-1-40 specific rules.
 * Parameters marked with _ are unused in the current placeholder implementation.
 * Added console.warn to explicitly "use" parameters for ESLint.
 *
 * @param {string} _dateOfInjury - Date of injury string 'YYYY-MM-DD'.
 * @param {AWWCalculatorState} _formData - The relevant calculator state.
 * @returns {Big} The calculated AWW as a Big.js object, or Big(0) if calculation fails.
 */
export function calculateAWWShortEmployment(
    _dateOfInjury: string,
    _formData: AWWCalculatorState // Use the imported state type
): Big {
  // Explicitly reference unused parameters to satisfy ESLint in placeholder
  console.warn(
      "calculateAWWShortEmployment is a placeholder. Params (may be needed for full implementation):",
      { _dateOfInjury, _formData }
  );
  // --- Implementation Required ---
  // Access needed data via _formData, e.g., _formData.specialCase
  // Placeholder returns 0 for now.
  return new Big(0);
}

/**
 * Calculates the Average Weekly Wage (AWW) based on four quarters of earnings.
 * Uses Big.js for precise calculations.
 *
 * @param {string} q1Pay - Gross pay for the most recent prior quarter.
 * @param {string} q2Pay - Gross pay for the 2nd prior quarter.
 * @param {string} q3Pay - Gross pay for the 3rd prior quarter.
 * @param {string} q4Pay - Gross pay for the 4th prior quarter.
 * @returns {Big} The calculated AWW as a Big.js object, or Big(0) if inputs are invalid.
 */
export function calculateAWWFourQuarters(q1Pay: string, q2Pay: string, q3Pay: string, q4Pay: string): Big {
  try {
    const quarter1 = new Big(q1Pay || '0');
    const quarter2 = new Big(q2Pay || '0');
    const quarter3 = new Big(q3Pay || '0');
    const quarter4 = new Big(q4Pay || '0');

    if (quarter1.lt(0) || quarter2.lt(0) || quarter3.lt(0) || quarter4.lt(0)) {
        console.error("Quarterly pay cannot be negative.");
        return new Big(0);
    }

    const totalPay = quarter1.plus(quarter2).plus(quarter3).plus(quarter4);

    if (WEEKS_IN_YEAR <= 0) {
        console.error("WEEKS_IN_YEAR constant must be positive.");
        return new Big(0);
    }
    const averageWeeklyWage = totalPay.div(WEEKS_IN_YEAR);

    return averageWeeklyWage;
  } catch (error) {
    console.error("Error calculating AWW (Four Quarters):", error);
    return new Big(0);
  }
}

/**
 * Calculates the Compensation Rate (CR) based on the Average Weekly Wage (AWW).
 * Applies the standard percentage and caps it at the maximum rate for the year of injury.
 * Uses Big.js for precision.
 *
 * @param {Big} averageWeeklyWage - The calculated AWW as a Big.js object.
 * @param {string} dateOfInjury - Date of injury string 'YYYY-MM-DD'.
 * @returns {{ compensationRate: Big; maxCompRateForYear: Big | null }} An object containing the calculated CR and the maximum rate for the year, or defaults if calculation fails.
 */
export function calculateCompensationRate(averageWeeklyWage: Big, dateOfInjury: string): { compensationRate: Big; maxCompRateForYear: Big | null } {
  const defaultReturn = { compensationRate: new Big(0), maxCompRateForYear: null };
  if (!averageWeeklyWage || averageWeeklyWage.lt(0) || !dateOfInjury) {
     console.error("Invalid input for calculateCompensationRate: AWW must be non-negative and dateOfInjury provided.");
    return defaultReturn;
  }

  try {
    const yearOfInjury = getYearFromDate(dateOfInjury);
    if (yearOfInjury === null) {
      console.error("Invalid date of injury provided for CR calculation.");
      return defaultReturn;
    }

    // Removed unused currentYear variable
    const availableYears = Object.keys(maxCompensationRates).map(Number).filter(year => !isNaN(year));
    if (availableYears.length === 0) {
        console.error("maxCompensationRates data is empty or invalid.");
        const calculatedRate = averageWeeklyWage.times(COMPENSATION_RATE_PERCENTAGE);
        return { compensationRate: calculatedRate.lt(0) ? new Big(0) : calculatedRate, maxCompRateForYear: null };
    }

    const latestYearWithRate = Math.max(...availableYears);
    const effectiveYear = maxCompensationRates[yearOfInjury] !== undefined ? yearOfInjury : latestYearWithRate;

    const maxRateValue = maxCompensationRates[effectiveYear];

    if (maxRateValue === undefined || maxRateValue === null) {
         console.error(`Maximum compensation rate not found or invalid for year ${yearOfInjury} (effective year ${effectiveYear}).`);
         const calculatedRate = averageWeeklyWage.times(COMPENSATION_RATE_PERCENTAGE);
         return { compensationRate: calculatedRate.lt(0) ? new Big(0) : calculatedRate, maxCompRateForYear: null };
    }

    const maxCompRateForYear = new Big(maxRateValue);
    let compensationRate = averageWeeklyWage.times(COMPENSATION_RATE_PERCENTAGE);

    if (compensationRate.gt(maxCompRateForYear)) {
      compensationRate = maxCompRateForYear;
    }

     if (compensationRate.lt(0)) {
         compensationRate = new Big(0);
     }

    return { compensationRate, maxCompRateForYear };

  } catch (error) {
    console.error("Error calculating Compensation Rate:", error);
    return defaultReturn;
  }
}
