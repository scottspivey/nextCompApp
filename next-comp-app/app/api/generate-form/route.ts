// app/api/generate-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Removed unused Prisma model imports: Claim, InjuredWorker, Employer, Profile, User
import { PrismaClient } from '@prisma/client';
// Removed unused pdf-lib imports: PDFForm, rgb, StandardFonts
import { PDFDocument, PDFCheckBox, PDFTextField } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import {
  formMappings,
  // Removed unused import: FormFieldMap
  formatDateForPDF,
  splitSSN,
  splitPhoneNumber,
  getString,
  // Removed unused import: getDecimalAsString
} from '@/lib/formMappings'; // Adjust path if your lib directory is elsewhere

const prisma = new PrismaClient();

// Define the expected request body structure
interface GenerateFormRequestBody {
  formType: string; // e.g., "SCWCC_Form27", "SCWCC_Form21"
  claimId: string;
  profileId: string; // ID of the user/profile generating the form (for preparer info)
  // Using Record<string, any> for flexibility, but could be more specific
  additionalData?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    // Use type assertion carefully or validate the body structure
    const body = await req.json() as GenerateFormRequestBody;
    const { formType, claimId, profileId, additionalData = {} } = body;

    if (!formType || !claimId || !profileId) {
      return NextResponse.json({ error: 'Missing required fields: formType, claimId, or profileId' }, { status: 400 });
    }

    const fieldMap = formMappings[formType];
    if (!fieldMap) {
      return NextResponse.json({ error: `Form type "${formType}" is not supported or mappings not found.` }, { status: 400 });
    }

    // 1. Fetch data from the database
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        injuredWorker: true,
        employer: true,
      },
    });

    const preparerProfile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
          user: true
      }
    });

    if (!claim?.injuredWorker || !claim?.employer) { // Added optional chaining for safety
      return NextResponse.json({ error: 'Claim, Injured Worker, or Employer not found.' }, { status: 404 });
    }
    if (!preparerProfile?.user) { // Added optional chaining
        return NextResponse.json({ error: 'Preparer profile or associated user not found.' }, { status: 404 });
    }

    // Destructure after checks ensure they exist
    const { injuredWorker, employer } = claim;
    const preparerUser = preparerProfile.user;

    // 2. Construct the data object for PDF filling
    const preparerPhone = getString(preparerProfile.phone_number);
    const preparerPhoneParts = splitPhoneNumber(preparerPhone);

    // Using Record<string, any> for flexibility in data structure
    const pdfData: Record<string, any> = {
      // Common Header Info
      "WCC_File_No": getString(claim.wcc_file_number),
      "Carrier_File_No": getString(claim.carrier_file_number),
      "Carrier_Code_No": getString(additionalData?.carrier_code || ''), // From additionalData
      "Employer_FEIN": getString(employer.fein),

      // Parties
      "Claimant_Name": `${getString(injuredWorker.first_name)} ${getString(injuredWorker.middle_name)} ${getString(injuredWorker.last_name)}`.replace(/\s+/g, ' ').trim(),
      "Claimant_SSN_Full": getString(injuredWorker.ssn),
      ...splitSSN(injuredWorker.ssn),
      "Employer_Name": getString(employer.name),
      "Claimant_Address_Street": getString(injuredWorker.address_line1) + (injuredWorker.address_line2 ? ` ${getString(injuredWorker.address_line2)}` : ''),
      "Employer_Address_Street": getString(employer.address_line1) + (employer.address_line2 ? ` ${getString(employer.address_line2)}` : ''),
      "Claimant_City": getString(injuredWorker.city),
      "Claimant_State": getString(injuredWorker.state),
      "Claimant_Zip_Code": getString(injuredWorker.zip_code),
      "Employer_City": getString(employer.city),
      "Employer_State": getString(employer.state),
      "Employer_Zip_Code": getString(employer.zip_code),

      // Contact Info
      ...splitPhoneNumber(injuredWorker.phone_number),
      "Claimant_Home_Phone_AreaCode": splitPhoneNumber(injuredWorker.phone_number).area,
      "Claimant_Home_Phone_Prefix": splitPhoneNumber(injuredWorker.phone_number).prefix,
      "Claimant_Home_Phone_Suffix": splitPhoneNumber(injuredWorker.phone_number).suffix,
      "Claimant_Work_Phone_Full": getString(injuredWorker.work_phone_number),
      "Claimant_Work_Phone_AreaCode": splitPhoneNumber(injuredWorker.work_phone_number).area,
      "Claimant_Work_Phone_Prefix": splitPhoneNumber(injuredWorker.work_phone_number).prefix,
      "Claimant_Work_Phone_Suffix": splitPhoneNumber(injuredWorker.work_phone_number).suffix,
      "Insurance_Carrier_Name": getString(employer.insurance_carrier_name),

      // Preparer Info
      "Preparer_Name": getString(preparerProfile.full_name),
      "Preparer_Law_Firm": getString(preparerProfile.firm_name),
      "Preparer_Phone_AreaCode": preparerPhoneParts.area,
      "Preparer_Phone_Prefix": preparerPhoneParts.prefix,
      "Preparer_Phone_Suffix": preparerPhoneParts.suffix,
      "Preparer_Title": getString(preparerProfile.role),
      "Preparer_Email": getString(preparerUser.email),

      // Form 21 Specifics
      "Date_Of_Injury_On_12A": formatDateForPDF(claim.date_of_injury),
      "Claimant_MMI_Date_Sec_I": formatDateForPDF(claim.mmi_date),
      "Claimant_MMI_Date_Sec_III": formatDateForPDF(claim.mmi_date),
      "Compensation_Payments_Current_As_Of_Date": formatDateForPDF(additionalData?.comp_current_date),
      "Form17_Offered_Refused_Date": formatDateForPDF(additionalData?.form17_refused_date),
      "Basis_For_Termination_Suspension": getString(additionalData?.termination_basis),
      "Amendment_A_Adding_Party_NameAddress_Text": getString(additionalData?.amendment_adding_party_details),
      "Amendment_B_Removing_Party_NameAddress_Text": getString(additionalData?.amendment_removing_party_details),
      "Amendment_C_Other_Text": getString(additionalData?.amendment_other_details),
      "Date_Of_Form": formatDateForPDF(new Date()),

      // Form 27 Specifics
      "Subpoena_To_Person": getString(additionalData?.subpoena_to_person),
      "Testimony_Place_Address": getString(additionalData?.testimony_place),
      "Testimony_Room": getString(additionalData?.testimony_room),
      "Testimony_DateTime": getString(additionalData?.testimony_datetime),
      "Deposition_Place_Address": getString(additionalData?.deposition_place),
      "Deposition_DateTime": getString(additionalData?.deposition_datetime),
      "Documents_List": getString(additionalData?.documents_list),
      "Documents_Inspection_Place_Address": getString(additionalData?.documents_inspection_place),
      "Documents_Inspection_DateTime": getString(additionalData?.documents_inspection_datetime),
      "Premises_Address": getString(additionalData?.premises_address),
      "Premises_Inspection_DateTime": getString(additionalData?.premises_inspection_datetime),
      "Issuing_Officer_Signature_Title": `${getString(preparerProfile.full_name)}, ${getString(preparerProfile.role)}`,
      "Issuing_Officer_Phone_AreaCode": preparerPhoneParts.area,
      "Issuing_Officer_Phone_Prefix": preparerPhoneParts.prefix,
      "Issuing_Officer_Phone_Suffix": preparerPhoneParts.suffix,
      "Date_Issued": formatDateForPDF(new Date()),

      // Checkbox values (true/false) - MUST come from additionalData
      "Checkbox_Stop_Payment_Compensation": additionalData?.checkbox_stop_payment === true,
      "Checkbox_Appear_For_Hearing_Testimony": additionalData?.checkbox_appear_hearing === true,
      "Checkbox_Appear_For_Deposition_Testimony": additionalData?.checkbox_appear_deposition === true,
      "Checkbox_Produce_Documents": additionalData?.checkbox_produce_documents === true,
      "Checkbox_Inspect_Premises": additionalData?.checkbox_inspect_premises === true,
      "Checkbox_II_A_Pursuant_42_9_260E": additionalData?.checkbox_II_A === true,
      "Checkbox_II_B_After_150_Day_Period": additionalData?.checkbox_II_B === true,
      "Checkbox_III_Determine_Compensation_Due": additionalData?.checkbox_III_determine_comp === true,
      "Checkbox_IV_Request_Credit_Overpayment": additionalData?.checkbox_IV_credit === true,
      "Checkbox_V_Determine_Compensation_Fatality": additionalData?.checkbox_V_fatality === true,
      "Checkbox_V_A_Unpaid_Balance_NonWorkDeath": additionalData?.checkbox_V_A === true,
      "Checkbox_V_B_Amount_Due_WorkDeath": additionalData?.checkbox_V_B === true,
      "Checkbox_Amendment_To_Prior_Request": additionalData?.checkbox_amendment === true,
      "Checkbox_Amendment_A_Adding_Party": additionalData?.checkbox_amendment_add_party === true,
      "Checkbox_Amendment_B_Removing_Party": additionalData?.checkbox_amendment_remove_party === true,
      "Checkbox_Amendment_C_Other": additionalData?.checkbox_amendment_other === true,
      "Checkbox_Mediation_A_Requested_Ordered": additionalData?.checkbox_mediation_A === true,
      "Checkbox_Mediation_B_Required": additionalData?.checkbox_mediation_B === true,
      "Checkbox_Mediation_C_Requested_Consent": additionalData?.checkbox_mediation_C === true,
      "Checkbox_Mediation_D_Conducted_Impasse": additionalData?.checkbox_mediation_D === true,
    };


    // 3. Load the PDF template
    const templateFileName = `${formType.replace('SCWCC_', '')}.pdf`;
    const templatePath = path.join(process.cwd(), 'pdf-templates', templateFileName);

    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await fs.readFile(templatePath);
    } catch (err) {
      console.error(`Error reading PDF template ${templatePath}:`, err);
      return NextResponse.json({ error: `PDF template for ${formType} (${templateFileName}) not found.` }, { status: 500 });
    }

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // 4. Fill the PDF fields
    for (const humanReadableName in fieldMap) {
      const pdfFieldName = fieldMap[humanReadableName];
      const value = pdfData[humanReadableName];

      if (pdfFieldName.toLowerCase().startsWith('undefined')) {
        console.warn(`Skipping field "${humanReadableName}" with potentially problematic PDF name: "${pdfFieldName}"`);
        continue;
      }
      if (value === undefined || value === null) {
        continue;
      }

      try {
        const field = form.getField(pdfFieldName);

        if (field instanceof PDFTextField) {
          field.setText(String(value));
        } else if (field instanceof PDFCheckBox) {
          if (value === true) {
            field.check();
          } else {
             field.uncheck();
          }
        }
        else if (field) {
             console.warn(`Field "${pdfFieldName}" (mapped from "${humanReadableName}") has an unhandled type: ${field.constructor.name}`);
        } else {
             console.warn(`Field "${pdfFieldName}" (mapped from "${humanReadableName}") not found in the PDF form.`);
        }

      } catch (e: unknown) { // Use unknown for catch variable type
        const error = e instanceof Error ? e : new Error(String(e)); // Ensure it's an Error object
        console.warn(`Could not fill field "${pdfFieldName}" (mapped from "${humanReadableName}") with value "${value}". Error: ${error.message}`);
      }
    }

    // 5. Serialize the PDF to bytes
    const filledPdfBytes = await pdfDoc.save();

    // 6. Return the PDF
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    const safeLastName = getString(injuredWorker.last_name).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${formType}_${safeLastName}_${Date.now()}.pdf`;
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(filledPdfBytes, { status: 200, headers });

  } catch (error: unknown) { // Use unknown for catch variable type
    const message = error instanceof Error ? error.message : String(error); // Get message safely
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF.', details: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
