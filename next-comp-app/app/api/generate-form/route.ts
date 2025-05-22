// app/api/generate-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PDFDocument, PDFCheckBox, PDFTextField } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import {
  formMappings,
  formatDateForPDF,
  splitSSN,
  splitPhoneNumber,
  getString,
} from '@/lib/formMappings';

import { auth } from '@/auth';
import type { AppUser } from '@/types/next-auth'; // Ensure AppUser includes profileId and Profile has firstName, lastName

type PdfFieldValue = string | number | boolean | null | undefined;

interface GenerateFormRequestBody {
  formType: string;
  claimId: string;
  additionalData?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Assuming AppUser is correctly typed and session.user will conform to it.
    const user = session.user as AppUser; 
    const preparerProfileId = user.profileId; 

    if (!preparerProfileId) {
      return NextResponse.json({ error: 'User profile ID not found in session. Cannot determine preparer.' }, { status: 403 });
    }

    // 2. Request Body Parsing
    const body = await req.json() as GenerateFormRequestBody;
    const { formType, claimId, additionalData = {} } = body;

    if (!formType || !claimId) {
      return NextResponse.json({ error: 'Missing required fields: formType or claimId' }, { status: 400 });
    }

    const fieldMap = formMappings[formType];
    if (!fieldMap) {
      return NextResponse.json({ error: `Form type "${formType}" is not supported or mappings not found.` }, { status: 400 });
    }

    // 3. Fetch data from the database with Authorization
    const claim = await prisma.claim.findFirst({
      where: {
        id: claimId,
        injuredWorker: { 
          profileId: preparerProfileId, 
        },
      },
      include: {
        injuredWorker: true,
        employer: true,
      },
    });

    if (!claim) { 
      return NextResponse.json({ error: 'Claim not found or you are not authorized to access this claim.' }, { status: 404 });
    }


    const preparerProfile = await prisma.profile.findUnique({
      where: { id: preparerProfileId },
      include: {
          user: true 
      }
    });

    if (!claim.injuredWorker || !claim.employer) {
      console.error(`Data inconsistency: Claim ${claimId} found but missing related InjuredWorker or Employer.`);
      return NextResponse.json({ error: 'Critical data missing for the claim (Injured Worker or Employer).' }, { status: 500 });
    }
    if (!preparerProfile?.user) {
      console.error(`Data inconsistency: Preparer profile ${preparerProfileId} not found for authenticated user.`);
      return NextResponse.json({ error: 'Preparer profile or associated user not found.' }, { status: 500 });
    }

    const { injuredWorker, employer } = claim;
    const preparerUser = preparerProfile.user;

    // 4. Construct the data object for PDF filling
    const preparerPhone = getString(preparerProfile.phone_number);
    const preparerPhoneParts = splitPhoneNumber(preparerPhone);

    
    const preparerFullName = `${getString(preparerProfile.firstName)} ${getString(preparerProfile.lastName)}`.trim();


    const pdfData: Record<string, PdfFieldValue> = {
      // Common Header Info
      "WCC_File_No": getString(claim.wcc_file_number),
      "Carrier_File_No": getString(claim.carrier_file_number),
      "Carrier_Code_No": getString(employer.carrier_code),
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
      "Preparer_Name": preparerFullName,
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
      "Compensation_Payments_Current_As_Of_Date": formatDateForPDF(additionalData?.comp_current_date as string | Date | null | undefined),
      "Form17_Offered_Refused_Date": formatDateForPDF(additionalData?.form17_refused_date as string | Date | null | undefined),
      "Basis_For_Termination_Suspension": getString(additionalData?.termination_basis as string | null | undefined),
      "Amendment_A_Adding_Party_NameAddress_Text": getString(additionalData?.amendment_adding_party_details as string | null | undefined),
      "Amendment_B_Removing_Party_NameAddress_Text": getString(additionalData?.amendment_removing_party_details as string | null | undefined),
      "Amendment_C_Other_Text": getString(additionalData?.amendment_other_details as string | null | undefined),
      "Date_Of_Form": formatDateForPDF(new Date()),

      // Form 27 Specifics
      "Subpoena_To_Person": getString(additionalData?.subpoena_to_person as string | null | undefined),
      "Testimony_Place_Address": getString(additionalData?.testimony_place as string | null | undefined),
      "Testimony_Room": getString(additionalData?.testimony_room as string | null | undefined),
      "Testimony_DateTime": getString(additionalData?.testimony_datetime as string | null | undefined),
      "Deposition_Place_Address": getString(additionalData?.deposition_place as string | null | undefined),
      "Deposition_DateTime": getString(additionalData?.deposition_datetime as string | null | undefined),
      "Documents_List": getString(additionalData?.documents_list as string | null | undefined),
      "Documents_Inspection_Place_Address": getString(additionalData?.documents_inspection_place as string | null | undefined),
      "Documents_Inspection_DateTime": getString(additionalData?.documents_inspection_datetime as string | null | undefined),
      "Premises_Address": getString(additionalData?.premises_address as string | null | undefined),
      "Premises_Inspection_DateTime": getString(additionalData?.premises_inspection_datetime as string | null | undefined),
      "Issuing_Officer_Signature_Title": `${preparerFullName}, ${getString(preparerProfile.role)}`,
      "Issuing_Officer_Phone_AreaCode": preparerPhoneParts.area,
      "Issuing_Officer_Phone_Prefix": preparerPhoneParts.prefix,
      "Issuing_Officer_Phone_Suffix": preparerPhoneParts.suffix,
      "Date_Issued": formatDateForPDF(new Date()),

      // Checkbox values
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

    // 5. Load the PDF template
    const formNumber = formType.replace('SCWCC_Form', '');
    const templateFileName = `${formNumber}.pdf`;
    const templatePath = path.join(process.cwd(), 'pdf-templates', templateFileName);

    console.log(`Attempting to load PDF template from: ${templatePath}`);
    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await fs.readFile(templatePath);
    } catch (err) {
      console.error(`Error reading PDF template ${templatePath}:`, err);
      return NextResponse.json({ error: `PDF template for ${formType} (${templateFileName}) not found.` }, { status: 500 });
    }

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // 6. Fill the PDF fields
    for (const humanReadableName in fieldMap) {
      const pdfFieldName = fieldMap[humanReadableName];
      const value: PdfFieldValue = pdfData[humanReadableName];

      if (pdfFieldName.toLowerCase().startsWith('undefined')) {
        console.warn(`Skipping field "${humanReadableName}" with potentially problematic PDF name: "${pdfFieldName}"`);
        continue;
      }
      if (value === undefined || value === null) {
        if (!(form.getField(pdfFieldName) instanceof PDFCheckBox)) {
            continue;
        }
      }

      try {
        const field = form.getField(pdfFieldName);
        if (field instanceof PDFTextField) {
          field.setText(String(value)); 
        } else if (field instanceof PDFCheckBox) {
          if (value === true) field.check();
          else field.uncheck(); 
        } else if (field) {
          console.warn(`Field "${pdfFieldName}" (mapped from "${humanReadableName}") has an unhandled type: ${field.constructor.name}`);
        } else {
          console.warn(`Field "${pdfFieldName}" (mapped from "${humanReadableName}") not found in the PDF form.`);
        }
      } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.warn(`Could not fill field "${pdfFieldName}" (mapped from "${humanReadableName}") with value "${value}". Error: ${error.message}`);
      }
    }

    // 7. Serialize the PDF to bytes
    const filledPdfBytes = await pdfDoc.save();

    // 8. Return the PDF
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    const safeLastName = getString(injuredWorker.last_name).replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${formType}_${safeLastName}_${Date.now()}.pdf`;
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(filledPdfBytes, { status: 200, headers });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF.', details: message }, { status: 500 });
  }
}
