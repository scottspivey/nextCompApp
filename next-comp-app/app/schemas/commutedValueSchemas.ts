// app/schemas/commutedValueSchemas.ts
import { z } from "zod";

// --- Zod Schemas for Commuted Value Calculator ---

/**
 * Schema for Step 1: Year of Injury.
 * Validates that the input is a string representing a year between 1979 and the current year.
 */
export const YearOfInjurySchema = z.object({
  yearOfInjury: z.string().refine((val) => {
    const year = parseInt(val);
    const currentYear = new Date().getFullYear();
    // Check if parsing was successful and year is within the valid range
    return !isNaN(year) && year >= 1979 && year <= currentYear;
  }, {
    // Error message if validation fails
    message: `Year must be between 1979 and ${new Date().getFullYear()}`
  })
});
// Type inferred from the schema
export type YearOfInjuryValues = z.infer<typeof YearOfInjurySchema>;


/**
 * Schema for Step 2: Compensation Rate.
 * Validates that the input can be coerced to a positive number greater than 0.
 */
export const CompRateSchema = z.object({
  compRate: z.coerce // Attempts to convert input to number first
    .number({
      required_error: "Compensation Rate is required.", // Error if empty after coercion attempt fails
      invalid_type_error: "Please enter a valid number for the Compensation Rate.", // Error if not a number
    })
    .positive({ message: "Rate must be positive." }) // Must be > 0
    .gt(0, { message: "Rate must be greater than 0." }) // Explicitly > 0 (redundant with positive but clearer)
});
// Type inferred from the schema (compRate: number)
export type CompRateValues = z.infer<typeof CompRateSchema>;


/**
 * Schema for Step 3: TTD Weeks Paid and Other Credit Weeks.
 * Validates that inputs can be coerced to numbers between 0 and 500,
 * and their sum does not exceed 500. Both fields are optional.
 */
export const WeeksSchema = z.object({
  ttdPaidToDate: z.coerce // Attempts to convert input to number first
    .number({ invalid_type_error: "TTD Paid must be a valid number." })
    .min(0, { message: "Cannot be negative." })
    .max(500, { message: "Cannot exceed 500 weeks." })
    .optional(), // Makes the field optional (allows undefined)
  otherCredit: z.coerce // Attempts to convert input to number first
    .number({ invalid_type_error: "Other Credit must be a valid number." })
    .min(0, { message: "Cannot be negative." })
    .max(500, { message: "Cannot exceed 500 weeks." })
    .optional(), // Makes the field optional (allows undefined)
}).refine(data => {
    // Refinement check: ensure the sum of weeks (defaulting null/undefined to 0) is not over 500
    const totalWeeks = (data.ttdPaidToDate ?? 0) + (data.otherCredit ?? 0);
    return totalWeeks <= 500;
  }, {
    // Error message if the sum exceeds 500
    message: "Total weeks (TTD Paid + Other Credit) cannot exceed 500.",
    // Path to apply the error message to (can be one or both fields)
    path: ["ttdPaidToDate"],
});
// Type inferred from the schema, including optional properties
export type WeeksValues = z.infer<typeof WeeksSchema>; // { ttdPaidToDate?: number | undefined; otherCredit?: number | undefined; }
