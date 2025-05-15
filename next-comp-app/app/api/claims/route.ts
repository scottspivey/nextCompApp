// app/api/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Your shared Prisma instance
import { auth } from '@/auth';     // Your NextAuth.js v5 auth
import type { AppUser } from '@/types/next-auth';
import * as z from 'zod';

// Zod Schema for creating a new claim
const createClaimSchema = z.object({
  injuredWorkerId: z.string().min(1, "Injured Worker ID is required"),
  wcc_file_number: z.string().optional().nullable(),
  carrier_file_number: z.string().optional().nullable(),
  date_of_injury: z.coerce.date({ invalid_type_error: "Invalid date of injury" }).optional().nullable(),
  body_parts_injured: z.string().optional().nullable(),
  claim_status: z.string().optional().nullable(),
  employerName: z.string().optional().nullable(), // If storing employer name directly
  // Add other fields that are part of your claim creation form
});

// GET Handler for fetching claims list
export async function GET(req: NextRequest) {
  console.log("API - GET /api/claims - Request received.");
  try {
    const session = await auth(); 
    const user = session?.user as AppUser | undefined;

    // Stricter check: Ensure user.profileId is a non-empty string
    if (typeof user?.profileId !== 'string' || user.profileId.trim() === '') {
      console.error("API - GET /api/claims - Unauthorized: No session user or profileId is not a valid string.");
      return NextResponse.json({ error: 'Unauthorized. No valid session or profile ID.' }, { status: 401 });
    }
    
    const sessionProfileId: string = user.profileId; 
    console.log("API - GET /api/claims - Authorized. Session Profile ID:", sessionProfileId);

    const claims = await prisma.claim.findMany({
      where: {
        profileId: sessionProfileId, // Now strictly a string
      },
      select: {
        id: true,
        wcc_file_number: true,
        date_of_injury: true,
        claim_status: true,
        injuredWorker: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        // employer: { select: { name: true } } // Uncomment if 'employer' is a relation
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    console.log(`API - GET /api/claims - Found ${claims.length} claims for profileId: ${sessionProfileId}`);
    return NextResponse.json(claims, { status: 200 });

  } catch (error) {
    console.error('API - GET /api/claims - Error fetching claims:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch claims.', details: message }, { status: 500 });
  }
}

// POST Handler for creating a new claim
export async function POST(req: NextRequest) {
  console.log("API - POST /api/claims - Request received to create claim.");
  try {
    const session = await auth(); 
    const user = session?.user as AppUser | undefined;

    // Stricter check: Ensure user.profileId is a non-empty string
    if (typeof user?.profileId !== 'string' || user.profileId.trim() === '') {
      console.error("API - POST /api/claims - Not authenticated or profile ID missing/invalid from session.");
      return NextResponse.json({ error: 'Not authenticated or profile ID missing/invalid' }, { status: 401 });
    }
    const preparerProfileId: string = user.profileId; // Now strictly a string

    const body: unknown = await req.json();
    const validationResult = createClaimSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("API - POST /api/claims - Validation errors:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Invalid input for new claim.", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Destructure validated data
    const { injuredWorkerId, date_of_injury, ...otherClaimData } = validationResult.data;

    // Verify that the injuredWorkerId exists and is associated with the current user's profile
    console.log(`API - POST /api/claims - Verifying worker ${injuredWorkerId} for profile ${preparerProfileId}`);
    const worker = await prisma.injuredWorker.findFirst({
        where: {
            id: injuredWorkerId,
            profileId: preparerProfileId, // Now strictly a string
        }
    });

    if (!worker) {
        console.error(`API - POST /api/claims - Injured worker ${injuredWorkerId} not found or not associated with profile ${preparerProfileId}.`);
        return NextResponse.json({ error: 'Injured worker not found or not associated with your profile.' }, { status: 404 });
    }
    console.log(`API - POST /api/claims - Worker ${injuredWorkerId} verified.`);

    // Prepare data for claim creation.
    // For `date_of_injury`, if it's a valid Date object, include it.
    // If it's null or undefined (from Zod validation of an optional field),
    // omit it from the `dataForCreate` object. Prisma will then handle it as an
    // unprovided optional field, resulting in SQL NULL if the DB field is nullable.
    const dataForCreate: { [key: string]: any } = {
      ...otherClaimData,
      injuredWorkerId: injuredWorkerId,
      profileId: preparerProfileId,
    };

    if (date_of_injury instanceof Date) {
      dataForCreate.date_of_injury = date_of_injury;
    }
    // If date_of_injury is null or undefined, it's not added to dataForCreate,
    // so the key will be absent, satisfying the "string | Date" type if the key were present.

    const newClaim = await prisma.claim.create({
      data: dataForCreate as any, // Using 'as any' here is a pragmatic way to bypass TS if it still complains
                                   // about the dynamically constructed object, assuming Prisma handles omitted optional fields correctly.
                                   // A more type-safe way would be to ensure `dataForCreate` strictly matches
                                   // `Prisma.ClaimUncheckedCreateInput` where optional fields are truly optional.
    });
    console.log(`API - POST /api/claims - Successfully created claim ${newClaim.id}`);
    return NextResponse.json(newClaim, { status: 201 });

  } catch (error) {
    console.error('API - POST /api/claims - Failed to create claim:', error);
    if (error instanceof z.ZodError) { 
        return NextResponse.json({ error: "Validation failed during processing.", details: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An internal server error occurred while creating the claim." },
      { status: 500 }
    );
  }
}
