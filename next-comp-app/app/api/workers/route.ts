// app/api/workers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as z from 'zod';

const prisma = new PrismaClient();

// Zod schema for backend validation (for POST requests) - remains the same
const workerFormSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required"),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, "Last name is required"),
  suffix: z.string().optional().nullable(),
  ssn: z.string().optional().nullable().refine(val => !val || /^\d{9}$/.test(val), {
    message: "SSN must be 9 digits or empty",
  }),
  date_of_birth: z.coerce.date().optional().nullable(),
  gender: z.string().optional().nullable(),
  marital_status: z.string().optional().nullable(),
  address_line1: z.string().optional().nullable(),
  address_line2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable().refine(val => !val || (val.length === 2 && /^[A-Z]+$/.test(val.toUpperCase())), {
    message: "State must be a 2-letter uppercase abbreviation or empty",
  }),
  zip_code: z.string().optional().nullable().refine(val => !val || /^\d{5}(-\d{4})?$/.test(val), {
    message: "Zip code must be in XXXXX or XXXXX-XXXX format or empty",
  }),
  phone_number: z.string().optional().nullable().refine(val => !val || /^\d{10}$/.test(val), {
    message: "Phone number must be 10 digits or empty",
  }),
  work_phone_number: z.string().optional().nullable().refine(val => !val || /^\d{10}$/.test(val), {
    message: "Work phone number must be 10 digits or empty",
  }),
  email: z.string().email({ message: "Invalid email address" }).optional().nullable().or(z.literal('')),
  occupation: z.string().optional().nullable(),
  num_dependents: z.number().int().min(0).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = workerFormSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("API - POST /api/workers - Validation errors:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { 
          error: "Invalid input.",
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { ...workerData } = validationResult.data;

    const profileExists = await prisma.profile.findUnique({
      where: { id: workerData.profileId },
    });

    if (!profileExists) {
      console.error("API - POST /api/workers - Profile not found for ID:", workerData.profileId);
      return NextResponse.json(
        { error: "Associated profile not found." },
        { status: 404 }
      );
    }
    
    const newInjuredWorker = await prisma.injuredWorker.create({
      data: {
        ...workerData,
      },
    });
    console.log("API - POST /api/workers - Successfully created worker:", newInjuredWorker.id);
    return NextResponse.json(newInjuredWorker, { status: 201 });

  } catch (error) {
    console.error("API - POST /api/workers - Failed to create injured worker:", error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Validation failed during processing.", details: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An internal server error occurred while creating the injured worker." },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId query parameter is required." },
        { status: 400 }
      );
    }

    const injuredWorkers = await prisma.injuredWorker.findMany({
      where: {
        profileId: profileId,
      },
      select: { 
        id: true,
        first_name: true,
        last_name: true,
        date_of_birth: true,
        ssn: true, 
        city: true,
        state: true,
        claims: { // Include related claims
          select: {
            id: true,
            wcc_file_number: true,
            claim_status: true, // Assuming you have a claim_status field
            date_of_injury: true,
            employer: { // Include related employer for each claim
              select: {
                name: true,
              }
            }
          },
          orderBy: { // Optionally order claims, e.g., by date of injury
            date_of_injury: 'desc' 
          }
        }
      },
      orderBy: [
        { last_name: 'asc' },
        { first_name: 'asc' }
      ],
    });

    // Process workers to mask SSN and structure claims/employer info
    const processedWorkers = injuredWorkers.map(worker => {
      const claimsInfo = worker.claims.map(claim => ({
        id: claim.id,
        wcc_file_number: claim.wcc_file_number || 'N/A',
        claim_status: claim.claim_status || 'Unknown', // Handle null status
        employerName: claim.employer?.name || 'N/A', // Handle null employer or name
        date_of_injury: claim.date_of_injury
      }));

      // Extract unique employer names for this worker
      const employerNames = Array.from(new Set(worker.claims.map(claim => claim.employer?.name).filter(name => name)));

      return {
        id: worker.id,
        first_name: worker.first_name,
        last_name: worker.last_name,
        date_of_birth: worker.date_of_birth,
        ssn: worker.ssn ? `XXX-XX-${worker.ssn.slice(-4)}` : null,
        city: worker.city,
        state: worker.state,
        claims: claimsInfo, // Array of claim details
        employerNames: employerNames.length > 0 ? employerNames : ['N/A'], // Array of unique employer names
      };
    });

    return NextResponse.json(processedWorkers, { status: 200 });

  } catch (error) {
    console.error("API - GET /api/workers - Error fetching injured workers:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while fetching injured workers." },
      { status: 500 }
    );
  }
}
