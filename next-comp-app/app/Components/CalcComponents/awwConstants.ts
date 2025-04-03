// app/Components/awwConstants.ts

/**
 * Defines options for special employment cases relevant to AWW calculation.
 */
export const specialCaseOptions = [
    { value: "guard", label: "State and/or National Guard" },
    { value: "volunteerFF", label: "Volunteer Fire Fighter" },
    { value: "volunteerRescue", label: "Volunteer Rescue Squad Member" },
    { value: "volunteerSheriff", label: "Volunteer Deputy Sheriff" },
    { value: "volunteerConstable", label: "Volunteer State Constable" },
    { value: "inmate", label: "Inmate" },
    { value: "student", label: "Student Engaged in Work Study, Marketing Education, or Apprenticeship" },
    { value: "none", label: "None of the Above" }
  ];
  
  /**
   * Defines standard Yes/No options for radio groups or selects.
   */
  export const yesNoOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" }
  ];

  
  /**
   * The standard percentage used to calculate the compensation rate from the AWW.
   * (66.67% or 2/3)
   */
  export const COMPENSATION_RATE_PERCENTAGE = .6667;
  
  /**
   * Number of weeks in a year, used for AWW calculation.
   */
  export const WEEKS_IN_YEAR = 52;
  
  /**
   * The earliest date of injury allowed by the calculator.
   */
  export const MIN_DOI_DATE = '1979-01-01';
  