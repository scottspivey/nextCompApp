// app/utils/dateUtils.ts
import { format, getYear, startOfQuarter, endOfQuarter, subQuarters, isValid, parseISO } from 'date-fns';

/**
 * Gets the current date in 'YYYY-MM-DD' format.
 * @returns {string} The current date string.
 */
export function getCurrentDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Formats a date string (YYYY-MM-DD) for display (e.g., "MM/DD/YYYY").
 * Returns an empty string if the date is invalid.
 * @param {string | null | undefined} dateString - The date string to format.
 * @returns {string} The formatted date string or empty string.
 */
export function formatDisplayDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString); // Use parseISO for reliability
    if (!isValid(date)) return '';
    return format(date, 'MM/dd/yyyy');
  } catch (error) {
    console.error("Error formatting display date:", error);
    return '';
  }
}

/**
 * Extracts the year from a date string (YYYY-MM-DD).
 * Returns null if the date string is invalid.
 * @param {string | null | undefined} dateString - The date string.
 * @returns {number | null} The year or null.
 */
export function getYearFromDate(dateString: string | null | undefined): number | null {
  if (!dateString) return null;
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return null;
    return getYear(date);
  } catch (error) {
    console.error("Error getting year from date:", error);
    return null;
  }
}

/**
 * Calculates the start and end dates for the four quarters preceding the date of injury.
 * Quarter 1 is the most recent quarter before the DOI quarter.
 * Quarter 4 is the earliest quarter.
 * @param {string} dateOfInjuryString - The date of injury in 'YYYY-MM-DD' format.
 * @returns {Array<{ quarterNum: number; startDate: string; endDate: string; label: string }> | null} An array of quarter details or null if DOI is invalid.
 */
export function getPrecedingFourQuarters(dateOfInjuryString: string): Array<{ quarterNum: number; startDate: Date; endDate: Date; label: string }> | null {
  if (!dateOfInjuryString) return null;

  try {
    const doi = parseISO(dateOfInjuryString);
    if (!isValid(doi)) return null;

    const quarters = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Start from the quarter *before* the quarter containing the DOI
    let currentQuarterEndDate = endOfQuarter(subQuarters(doi, 1));

    for (let i = 1; i <= 4; i++) {
      const startDate = startOfQuarter(currentQuarterEndDate);
      const endDate = endOfQuarter(currentQuarterEndDate);
      const startMonth = monthNames[startDate.getMonth()];
      const endMonth = monthNames[endDate.getMonth()];
      const year = startDate.getFullYear();

      quarters.push({
        quarterNum: i, // Quarter 1 is the most recent prior quarter
        startDate: startDate,
        endDate: endDate,
        label: `Quarter ${i}: ${startMonth}-${endMonth} ${year}`
      });

      // Move to the previous quarter for the next iteration
      currentQuarterEndDate = subQuarters(currentQuarterEndDate, 1);
    }

    return quarters; // Returns quarters ordered 1 (most recent) to 4 (earliest)

  } catch (error) {
    console.error("Error calculating preceding quarters:", error);
    return null;
  }
}

/**
 * Generates a label for a specific preceding quarter based on the date of injury.
 * Uses getPrecedingFourQuarters to determine the correct date range.
 * @param {number} quarterNum - The quarter number (1-4, where 1 is most recent).
 * @param {string} dateOfInjuryString - The date of injury ('YYYY-MM-DD').
 * @returns {string} The label for the quarter (e.g., "Quarter 1: July-September 2024") or a default label.
 */
export function getQuarterLabel(quarterNum: number, dateOfInjuryString: string): string {
   if (!dateOfInjuryString || quarterNum < 1 || quarterNum > 4) {
     return `Quarter ${quarterNum}`;
   }

   const quarters = getPrecedingFourQuarters(dateOfInjuryString);
   const targetQuarter = quarters?.find(q => q.quarterNum === quarterNum);

   return targetQuarter ? targetQuarter.label : `Quarter ${quarterNum}`;
}
