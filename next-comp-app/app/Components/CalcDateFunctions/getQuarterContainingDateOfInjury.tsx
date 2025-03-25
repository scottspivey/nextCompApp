import { parseISO } from 'date-fns';

export const getQuarterContainingDateOfInjury = (dateOfInjury: string): string => {
  try {
    const doi = parseISO(dateOfInjury);
    const month = doi.getMonth() + 1;
    const year = doi.getFullYear();

    const quarter = Math.ceil(month / 3);

    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    let endDay = 30;

    if (quarter === 1 || quarter === 4 ){
        endDay = 31;
    } else if (quarter === 2 || quarter === 3 ) {
        endDay = 30;
    } else if (quarter !== 1 && quarter !== 2 && quarter !== 3 && quarter !== 4){
        return "Invalid Date";
    }

    const getMonthName = (monthNumber: number): string => {
      return new Date(year, monthNumber - 1, 1).toLocaleString('en-US', { month: 'long' });
    };

    const startMonthName = getMonthName(startMonth);
    const endMonthName = getMonthName(endMonth);

    return `Quarter ${quarter} of ${year} (${startMonthName} 1, ${year} - ${endMonthName} ${endDay}, ${year})`;
  } catch {
    return "Invalid Date";
  }
};