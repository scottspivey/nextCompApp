// lib/formMappings.ts

// Represents the structure for mapping human-readable field names
// to actual PDF field names for a specific form.
export interface FormFieldMap {
  [humanReadableName: string]: string;
}

// Main object holding all form mappings.
// Keys are form identifiers (e.g., "SCWCC_Form27").
export const formMappings: Record<string, FormFieldMap> = {
  "SCWCC_Form27": {
    // Header Info
    "WCC_File_No": "WCC File",
    "Carrier_File_No": "Carrier File",
    "Carrier_Code_No": "Carrier Code", // Note: Your schema doesn't have a direct carrier_code on Claim. This might come from elsewhere or an Employer's insurance details.
    "Employer_FEIN": "Employer FEIN",

    // Parties
    "Claimant_Name": "Claimants Name",
    "Claimant_SSN_Full": "SSN", // Form 27 seems to take full SSN
    "Employer_Name": "Employers Name",
    "Claimant_Address_Street": "Address",
    "Employer_Address_Street": "Address_2",
    "Claimant_City": "City",
    "Claimant_State": "State",
    "Claimant_Zip_Code": "Zip",
    "Employer_City": "City_2",
    "Employer_State": "State_2",
    "Employer_Zip_Code": "Zip_2",

    // Contact Info
    "Claimant_Home_Phone_AreaCode": "area1",
    "Claimant_Home_Phone_Prefix": "ph1",
    "Claimant_Home_Phone_Suffix": "ph2",
    "Claimant_Work_Phone_Full": "Text f264a188-ae03-4942-a14b-5cd227b13661", // Assuming this is for a full work phone number
    "Insurance_Carrier_Name": "Insurance Carrier", // This would likely come from the Employer model

    // Preparer Info
    "Preparer_Name": "Preparers Name",
    "Preparer_Law_Firm": "Law Firm",
    "Preparer_Phone_AreaCode": "area10",
    "Preparer_Phone_Prefix": "ph11",
    "Preparer_Phone_Suffix": "ph12",

    // Subpoena Details
    "Subpoena_To_Person": "To", // This will likely come from additionalData in the API request

    // Section I: Commanded to Appear for Hearing Testimony
    "Checkbox_Appear_For_Hearing_Testimony": "undefined", // WARNING: 'undefined' name likely problematic
    "Testimony_Place_Address": "PLACE OF TESTIMONY",
    "Testimony_Room": "undefined_2", // WARNING: 'undefined_2' name likely problematic (Text field)
    "Testimony_DateTime": "DATE AND TIME",

    // Section II: Commanded to Appear for Deposition Testimony
    "Checkbox_Appear_For_Deposition_Testimony": "undefined_3", // WARNING: 'undefined_3' name likely problematic
    "Deposition_Place_Address": "PLACE OF DEPOSITION",
    "Deposition_DateTime": "DATE AND TIME_2",

    // Section III: Commanded to Produce Documents
    "Checkbox_Produce_Documents": "undefined_4", // WARNING: 'undefined_4' name likely problematic
    "Documents_List": "LIST OF DOCUMENTS",
    "Documents_Inspection_Place_Address": "PLACE",
    "Documents_Inspection_DateTime": "DATE AND TIME_3",

    // Section IV: Commanded to Permit Inspection of Premises
    "Checkbox_Inspect_Premises": "undefined_5", // WARNING: 'undefined_5' name likely problematic
    "Premises_Address": "PREMISES",
    "Premises_Inspection_DateTime": "DATE AND TIME_4",

    // Issuing Officer Details
    "Issuing_Officer_Signature_Title": "Signature 72e70fdc-9129-4d1d-9b3f-908a441846c1", // This might be a signature field, often not fillable programmatically with simple text
    "Issuing_Officer_Phone_AreaCode": "area101",
    "Issuing_Officer_Phone_Prefix": "ph112",
    "Issuing_Officer_Phone_Suffix": "ph123",
    "Date_Issued": "date sign" // Field name has a space
  },
  "SCWCC_Form21": {
    // Header Info
    "WCC_File_No": "WCC File",
    "Carrier_File_No": "Carrier File",
    "Carrier_Code_No": "Carrier Code",
    "Employer_FEIN": "Employer FEIN",

    // Parties
    "Claimant_Name": "Claimants Name",
    "Claimant_SSN_Part1": "SSN1",
    "Claimant_SSN_Part2": "SSN2",
    "Claimant_SSN_Part3": "SSN3",
    "Employer_Name": "Employers Name",
    "Claimant_Address_Street": "Address",
    "Employer_Address_Street": "Address_2",
    "Claimant_City": "City",
    "Claimant_State": "State",
    "Claimant_Zip_Code": "Zip",
    "Employer_City": "City_2",
    "Employer_State": "State_2",
    "Employer_Zip_Code": "Zip_2",

    // Contact Info
    "Claimant_Home_Phone_AreaCode": "HP1",
    "Claimant_Home_Phone_Prefix": "HP2",
    "Claimant_Home_Phone_Suffix": "HP3",
    "Claimant_Work_Phone_AreaCode": "WP1",
    "Claimant_Work_Phone_Prefix": "WP2",
    "Claimant_Work_Phone_Suffix": "WP3",
    "Insurance_Carrier_Name": "Insurance Carrier",

    // Preparer Info
    "Preparer_Name": "Preparers Name",
    "Preparer_Law_Firm": "Law Firm",
    "Preparer_Phone_AreaCode": "PP1",
    "Preparer_Phone_Prefix": "PP2",
    "Preparer_Phone_Suffix": "PP3",

    // Form Specifics
    "Date_Of_Injury_On_12A": "The date of injury reported on Form 12A is",
    "Checkbox_Stop_Payment_Compensation": "Stop payment of compensation", // Section I
    "Claimant_MMI_Date_Sec_I": "Claimant reached maximum medical improvement on",
    "Compensation_Payments_Current_As_Of_Date": "Compensation payments are current as of",
    "Form17_Offered_Refused_Date": "A Form 17 was offered and refused on",

    "Checkbox_Address_Suspension_Termination_Reduction": "Address suspension termination or reduction of temporary disability payments for any cause", // Section II
    "Checkbox_II_A_Pursuant_42_9_260E": "a",
    "Checkbox_II_B_After_150_Day_Period": "b",
    "Basis_For_Termination_Suspension": "Basis",

    "Checkbox_III_Determine_Compensation_Due": "Determine if compensation is due pursuant to  42910  42920 or 42930 and if so in what amount based on the following grounds", // Section III
    "Claimant_MMI_Date_Sec_III": "Claimant reached maximum medical improvement on_2", // Assumed distinct field name for MMI date in Sec III

    "Checkbox_IV_Request_Credit_Overpayment": "Request Credit for Overpayment of temporary compensation pursuant to  429210", // Section IV

    "Checkbox_V_Determine_Compensation_Fatality": "Determine amount of compensation for claims involving a fatality", // Section V
    "Checkbox_V_A_Unpaid_Balance_NonWorkDeath": "a_2",
    "Checkbox_V_B_Amount_Due_WorkDeath": "b_2",
    // "Text_V_B_Amount_Due_WorkDeath_Explanation": "Amount of compensation for death of employee due to accident pursuant to  429290", // This is likely static text, not a fillable field.

    "Checkbox_Amendment_To_Prior_Request": "Amendment to Prior Hearing Request", // Section VI (Amendment)
    "Checkbox_Amendment_A_Adding_Party": "a_3",
    "Amendment_A_Adding_Party_NameAddress_Text": "I am adding a party pursuant to Reg 67610C Party NameAddress",
    "Checkbox_Amendment_B_Removing_Party": "b_3",
    "Amendment_B_Removing_Party_NameAddress_Text": "I am removing a party pursuant to Reg 67610C Party NameAddress",
    "Checkbox_Amendment_C_Other": "c",
    "Amendment_C_Other_Text": "Other amendment",

    // "Checkbox_Mediation_Section_Header": "Mediation", // Likely a label
    "Checkbox_Mediation_A_Requested_Ordered": "a_4", // Section VII (Mediation)
    "Checkbox_Mediation_B_Required": "b_4",
    "Checkbox_Mediation_C_Requested_Consent": "c_2",
    "Checkbox_Mediation_D_Conducted_Impasse": "d",

    // Footer
    "Preparer_Signature": "Preparers Signature", // Likely not fillable with text
    "Preparer_Title": "Title",
    "Preparer_Email": "Email",
    "Date_Of_Form": "Date"
  },
  "SCWCC_Form20": {
    // TODO: Add field mappings for Form 20
  },
  "SCWCC_Form50": {
    // TODO: Add field mappings for Form 50
  },
  "SCWCC_Form51": {
    // TODO: Add field mappings for Form 51
  }
};

// --- Helper Functions for Data Transformation ---

/**
 * Formats a Date object or a date string into MM/DD/YYYY format.
 * Returns an empty string if the date is null or undefined.
 */
export function formatDateForPDF(date: Date | string | null | undefined): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    // Adjust for potential timezone issues if the date string doesn't have timezone info
    // and is being interpreted as UTC by new Date().
    // This simple approach assumes local timezone is intended for display.
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    const correctedDate = new Date(d.getTime() + userTimezoneOffset); // Correct for local time if it was parsed as UTC

    const month = correctedDate.getMonth() + 1; // getMonth() is 0-indexed
    const day = correctedDate.getDate();
    const year = correctedDate.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return ''; // Or return the original input if it's a string and unparseable
  }
}

/**
 * Splits a full SSN (e.g., "XXX-XX-XXXX" or "XXXXXXXXX") into three parts.
 * Required for Form 21.
 */
export function splitSSN(ssn: string | null | undefined): { ssn1: string; ssn2: string; ssn3: string } {
  const defaultSSNParts = { ssn1: '', ssn2: '', ssn3: '' };
  if (!ssn) return defaultSSNParts;

  const cleanedSSN = ssn.replace(/-/g, ''); // Remove hyphens

  if (cleanedSSN.length === 9) {
    return {
      ssn1: cleanedSSN.substring(0, 3),
      ssn2: cleanedSSN.substring(3, 5),
      ssn3: cleanedSSN.substring(5, 9),
    };
  }
  // If SSN is not in the expected format, return empty or handle as error
  console.warn(`SSN format is not as expected: ${ssn}`);
  return defaultSSNParts;
}

/**
 * Splits a phone number (e.g., "XXX-XXX-XXXX" or "XXXXXXXXXX") into area code, prefix, and line number.
 * Required for Form 21 and parts of Form 27.
 */
export function splitPhoneNumber(phone: string | null | undefined): { area: string; prefix: string; suffix: string } {
  const defaultPhoneParts = { area: '', prefix: '', suffix: '' };
  if (!phone) return defaultPhoneParts;

  const cleanedPhone = phone.replace(/\D/g, ''); // Remove all non-digits

  if (cleanedPhone.length === 10) {
    return {
      area: cleanedPhone.substring(0, 3),
      prefix: cleanedPhone.substring(3, 6),
      suffix: cleanedPhone.substring(6, 10),
    };
  } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith('1')) { // Handle +1 country code
     return {
      area: cleanedPhone.substring(1, 4),
      prefix: cleanedPhone.substring(4, 7),
      suffix: cleanedPhone.substring(7, 11),
    };
  }
  // If phone number is not in the expected format, return empty or handle as error
  console.warn(`Phone number format is not as expected: ${phone}`);
  return defaultPhoneParts;
}

/**
 * Gets a string value safely, returning an empty string if null or undefined.
 */
export function getString(value: string | null | undefined): string {
    return value || '';
}

/**
 * Gets a number as a string, returning an empty string if null or undefined.
 */
export function getNumberAsString(value: number | null | undefined): string {
    return value !== null && value !== undefined ? String(value) : '';
}

/**
 * Gets a decimal value as a string, returning an empty string if null or undefined.
 * Prisma.Decimal needs to be converted to string.
 */
export function getDecimalAsString(value: { toString: () => string } | null | undefined): string {
    return value !== null && value !== undefined ? value.toString() : '';
}

