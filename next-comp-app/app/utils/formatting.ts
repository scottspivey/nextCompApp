// app/utils/formatting.ts

/**
 * Formats a number as a US dollar currency string.
 * Handles null, undefined, or NaN values by returning an empty string.
 * @param value - The numeric value to format.
 * @returns The formatted currency string (e.g., "$1,000.00") or an empty string.
 */
export const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return ''; // Return empty string for invalid inputs
    }
    // Use Intl.NumberFormat for robust and locale-aware currency formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2, // Always show two decimal places
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  /**
   * Parses a formatted string (potentially currency) into a number.
   * Removes common currency symbols and grouping separators.
   * @param value - The string value to parse.
   * @returns The parsed number, or undefined if parsing fails or input is invalid.
   */
  export const parseCurrency = (value: string | null | undefined): number | undefined => {
      if (value === null || value === undefined || typeof value !== 'string') {
          return undefined; // Return undefined for non-string inputs
      }
      // Remove non-numeric characters except for the decimal point and negative sign
      // Handles $, ,, etc.
      const numericString = value.replace(/[^0-9.-]+/g, '');
      // Attempt to parse the cleaned string as a float
      const number = parseFloat(numericString);
      // Return the number if parsing was successful, otherwise undefined
      return isNaN(number) ? undefined : number;
  };
  