// app/api/claims/[claimId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { auth } from '@/auth';
import { Prisma, WorkStatus, ClaimStatus } from '@prisma/client'; 
import * as z from 'zod';

interface ResolvedRouteParams {
  claimId: string;
}

// Zod schema for updating a claim, aligned with Prisma schema
const updateClaimSchema = z.object({
  wcc_file_number: z.string().optional().nullable(),
  carrier_file_number: z.string().optional().nullable(),
  
  date_of_injury: z.coerce.date({ invalid_type_error: "Invalid date of injury" }).optional(), 
  
  time_of_injury: z.string().optional().nullable(),
  place_of_injury: z.string().optional().nullable(),
  accident_description: z.string().optional().nullable(),
  part_of_body_injured: z.string().optional().nullable(),
  nature_of_injury: z.string().optional().nullable(),
  cause_of_injury: z.string().optional().nullable(),
  notice_given_date: z.coerce.date().optional().nullable(),

  average_weekly_wage: z.coerce.number().optional().nullable(),
  compensation_rate: z.coerce.number().optional().nullable(),
  date_disability_began: z.coerce.date().optional().nullable(),
  date_returned_to_work: z.coerce.date().optional().nullable(),
  mmi_date: z.coerce.date().optional().nullable(),

  initial_treatment_desc: z.string().optional().nullable(),
  // Use nativeEnum for fields based on Prisma enums
  current_work_status: z.nativeEnum(WorkStatus).optional().nullable(), 
  permanent_impairment_rating: z.coerce.number().int().optional().nullable(),

  claimant_attorney_name: z.string().optional().nullable(),
  claimant_attorney_firm: z.string().optional().nullable(),
  claimant_attorney_address: z.string().optional().nullable(),
  claimant_attorney_phone: z.string().optional().nullable().refine(val => !val || /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(val), {
    message: "Invalid phone number format or empty",
  }),
  claimant_attorney_email: z.string().email({ message: "Invalid email address" }).optional().nullable().or(z.literal('')),
  
  // Use nativeEnum for fields based on Prisma enums
  claim_status: z.nativeEnum(ClaimStatus).optional().nullable(), 
  employerId: z.string().uuid({ message: "Invalid Employer ID format"}).optional().nullable(),
});


// GET Handler for fetching a specific claim
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<ResolvedRouteParams> } 
) {
  const resolvedParams = await params;
  const claimId = resolvedParams.claimId;

  if (!claimId) {
    return NextResponse.json({ error: 'Claim ID is required' }, { status: 400 });
  }

  try {
    const session = await auth();
    // Removed unnecessary type assertion: TypeScript can infer this.
    // The type of session.user is likely already { id: string; profileId?: string | null ... } & AppUser or similar
    const user = session?.user; 

    if (typeof user?.profileId !== 'string' || user.profileId.trim() === '') {
      return NextResponse.json({ error: 'Not authenticated or profile ID missing/invalid' }, { status: 401 });
    }
    const sessionProfileId: string = user.profileId;

    type ClaimWithRelations = Prisma.ClaimGetPayload<{
      include: {
        injuredWorker: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            date_of_birth: true,
            ssn: true, 
          }
        },
        employer: { 
          select: {
            id: true,
            name: true,
            fein: true,
          }
        },
      }
    }>;

    const claim: ClaimWithRelations | null = await prisma.claim.findFirst({
      where: {
        id: claimId,
        profileId: sessionProfileId, 
      },
      include: {
        injuredWorker: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            date_of_birth: true,
            ssn: true, 
          }
        },
        employer: { 
          select: {
            id: true,
            name: true,
            fein: true,
          }
        },
      }
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found or you are not authorized to view it.' }, { status: 404 });
    }

    const claimDataToSend = {
      ...claim,
      injuredWorker: claim.injuredWorker ? { 
        ...claim.injuredWorker,
        ssn: claim.injuredWorker.ssn ? `XXX-XX-${claim.injuredWorker.ssn.slice(-4)}` : null,
      } : null, 
    };

    return NextResponse.json(claimDataToSend);

  } catch (error) {
    console.error(`Error fetching claim ${claimId}:`, error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch claim details.', details: message }, { status: 500 });
  }
}

// PUT Handler for updating a specific claim
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<ResolvedRouteParams> }
) {
  const resolvedParams = await params;
  const claimId = resolvedParams.claimId;

  if (!claimId) {
    return NextResponse.json({ error: 'Claim ID is required for update' }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // Removed unnecessary type assertion: session.user is already typed by NextAuth
    const user = session.user; 
    if (typeof user.profileId !== 'string' || user.profileId.trim() === '') {
      return NextResponse.json({ error: 'User profile not found in session' }, { status: 403 });
    }

    const existingClaim = await prisma.claim.findFirst({
      where: {
        id: claimId,
        profileId: user.profileId, 
      },
    });

    if (!existingClaim) {
      return NextResponse.json({ error: 'Claim not found or you are not authorized to update this claim.' }, { status: 404 });
    }

    const body: unknown = await req.json();
    // Using .partial() means all fields in updateClaimSchema are optional for the update
    const validationResult = updateClaimSchema.partial().safeParse(body); 

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input for updating claim.", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    // Destructure validated data.
    // current_work_status and claim_status will now be correctly typed as their respective enums (or null/undefined)
    const { date_of_injury, claimant_attorney_phone, ...otherDataToUpdate } = validationResult.data;
    
    // This assignment should now be type-correct because otherDataToUpdate's
    // enum fields (current_work_status, claim_status) match Prisma.ClaimUpdateInput expectations.
    const dataToUpdate: Prisma.ClaimUpdateInput = { ...otherDataToUpdate };

    if (date_of_injury !== undefined) {
        dataToUpdate.date_of_injury = date_of_injury; 
    }

    if (claimant_attorney_phone) {
        dataToUpdate.claimant_attorney_phone = claimant_attorney_phone.replace(/\D/g, '');
    } else if (claimant_attorney_phone === null) {
        dataToUpdate.claimant_attorney_phone = null;
    }


    const updatedClaim = await prisma.claim.update({
      where: {
        id: claimId,
      },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedClaim);

  } catch (error) {
    console.error(`Error updating claim ${claimId}:`, error);
    if (error instanceof z.ZodError) { 
        return NextResponse.json({ error: "Validation failed during processing.", details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if needed
        // For example, P2025 (Record to update not found) is already implicitly handled by the existingClaim check,
        // but other errors might warrant specific messages.
    }
    return NextResponse.json({ error: 'Failed to update claim.' }, { status: 500 });
  }
}


// DELETE Handler
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<ResolvedRouteParams> }
) {
  const resolvedParams = await params;
  const claimId = resolvedParams.claimId;

  if (!claimId) {
    return NextResponse.json({ error: 'Claim ID is required for deletion' }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // Removed unnecessary type assertion: session.user is already typed by NextAuth
    const user = session.user; 
    if (typeof user.profileId !== 'string' || user.profileId.trim() === '') {
      return NextResponse.json({ error: 'User profile not found in session' }, { status: 403 });
    }

    const claimToDelete = await prisma.claim.findFirst({
      where: {
        id: claimId,
        profileId: user.profileId, 
      },
      select: { 
        id: true,
        wcc_file_number: true 
      }
    });

    if (!claimToDelete) {
      return NextResponse.json({ error: 'Claim not found or you are not authorized to delete this claim.' }, { status: 404 });
    }

    await prisma.claim.delete({
      where: {
        id: claimId,
      },
    });

    return NextResponse.json({ message: `Claim (WCC#: ${claimToDelete.wcc_file_number || claimToDelete.id}) deleted successfully.` }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting claim ${claimId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') { // Foreign key constraint failed
             return NextResponse.json({ error: 'Failed to delete claim. It may have related records that need to be addressed first.' }, { status: 409 });
        }
    }
    return NextResponse.json({ error: 'Failed to delete claim.' }, { status: 500 });
  }
}
