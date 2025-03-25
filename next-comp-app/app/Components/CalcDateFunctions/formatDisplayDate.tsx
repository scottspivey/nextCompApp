import { format, parseISO } from "date-fns";

export const formatDisplayDate = (isoDate: string): string => {
  try {
    return format(parseISO(isoDate), "MMMM d, yyyy"); // Converts "2025-02-22" → "February 22, 2025"
  } catch {
    return "Invalid Date";
  }
};