// app/api/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Your shared Prisma instance
import { auth } from '@/auth';     // Your NextAuth.js v5 auth
import type { AppUser } from '@/types/next-auth';
import * as z from 'zod';

// Zod Schema for creating a new claim, aligned with Prisma schema
const createClaimSchema = z.object({
  injuredWorkerId: z.string().min(1, "Injured Worker ID is required"),
  employerId: z.string().optional().nullable(), // If you select an employer
  
  wcc_file_number: z.string().optional().nullable(),
  carrier_file_number: z.string().optional().nullable(),
  
  date_of_injury: z.coerce.date({ required_error: "Date of injury is required.", invalid_type_error: "Invalid date of injury" }), // Now required
  time_of_injury: z.string().optional().nullable(),
  place_of_injury: z.string().optional().nullable(),
  accident_description: z.string().optional().nullable(),
  part_of_body_injured: z.string().optional().nullable(), // Renamed from body_parts_injured to match schema
  nature_of_injury: z.string().optional().nullable(),
  cause_of_injury: z.string().optional().nullable(),
  notice_given_date: z.coerce.date().optional().nullable(),

  average_weekly_wage: z.coerce.number().optional().nullable(),
  compensation_rate: z.coerce.number().optional().nullable(),
  date_disability_began: z.coerce.date().optional().nullable(),
  date_returned_to_work: z.coerce.date().optional().nullable(),
  mmi_date: z.coerce.date().optional().nullable(),

  initial_treatment_desc: z.string().optional().nullable(),
  current_work_status: z.string().optional().nullable(),
  permanent_impairment_rating: z.coerce.number().int().optional().nullable(),

  claimant_attorney_name: z.string().optional().nullable(),
  claimant_attorney_firm: z.string().optional().nullable(),
  claimant_attorney_address: z.string().optional().nullable(),
  claimant_attorney_phone: z.string().optional().nullable(),
  claimant_attorney_email: z.string().email().optional().nullable().or(z.literal('')),
  
  claim_status: z.string().optional().nullable(),
});

// GET Handler for fetching claims list
export async function GET(req: NextRequest) {
  console.log("API - GET /api/claims - Request received.");
  try {
    const session = await auth(); 
    const user = session?.user as AppUser | undefined;

    if (typeof user?.profileId !== 'string' || user.profileId.trim() === '') {
      console.error("API - GET /api/claims - Unauthorized: No session user or profileId is not a valid string.");
      return NextResponse.json({ error: 'Unauthorized. No valid session or profile ID.' }, { status: 401 });
    }
    
    const sessionProfileId: string = user.profileId; 
    console.log("API - GET /api/claims - Authorized. Session Profile ID:", sessionProfileId);

    const claims = await prisma.claim.findMany({
      where: {
        profileId: sessionProfileId, 
      },
      select: { // Select fields needed for the claims list page
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
        employer: { // Include employer name if available
            select: {
                name: true,
            }
        }
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

    if (typeof user?.profileId !== 'string' || user.profileId.trim() === '') {
      console.error("API - POST /api/claims - Not authenticated or profile ID missing/invalid from session.");
      return NextResponse.json({ error: 'Not authenticated or profile ID missing/invalid' }, { status: 401 });
    }
    const preparerProfileId: string = user.profileId;

    const body: unknown = await req.json();
    const validationResult = createClaimSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("API - POST /api/claims - Validation errors:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Invalid input for new claim.", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { injuredWorkerId, employerId, date_of_injury, ...otherClaimData } = validationResult.data;

    console.log(`API - POST /api/claims - Verifying worker ${injuredWorkerId} for profile ${preparerProfileId}`);
    const worker = await prisma.injuredWorker.findFirst({
        where: {
            id: injuredWorkerId,
            profileId: preparerProfileId, 
        }
    });

    if (!worker) {
        console.error(`API - POST /api/claims - Injured worker ${injuredWorkerId} not found or not associated with profile ${preparerProfileId}.`);
        return NextResponse.json({ error: 'Injured worker not found or not associated with your profile.' }, { status: 404 });
    }
    console.log(`API - POST /api/claims - Worker ${injuredWorkerId} verified.`);

    // Prepare data for claim creation
    const dataForCreate: any = {
      ...otherClaimData,
      injuredWorkerId: injuredWorkerId,
      profileId: preparerProfileId,
      date_of_injury: date_of_injury, // Already a Date object from Zod coercion and is required
    };

    if (employerId) {
        dataForCreate.employerId = employerId;
    }
    
    // Handle optional date fields: if undefined from Zod, pass null to Prisma (if DB field is nullable)
    // or omit if not nullable and truly optional (though Zod would make it required if DB is)
    const optionalDateFields: (keyof typeof otherClaimData)[] = ['notice_given_date', 'date_disability_began', 'date_returned_to_work', 'mmi_date'];
    optionalDateFields.forEach(field => {
        if (otherClaimData[field] === undefined) {
            dataForCreate[field] = null;
        }
    });


    const newClaim = await prisma.claim.create({
      data: dataForCreate,
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
