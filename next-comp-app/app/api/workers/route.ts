// app/api/workers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as z from 'zod';
import { auth } from '@/auth'; //  Adjust path if necessary
import type { AppUser } from '@/types/next-auth'; // Optional, for clarity


// Zod schema remains the same
const workerFormSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required"), // Will be validated against session user's profileId
  first_name: z.string().min(1, "First name is required"),
  // ... other fields ...
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

type ValidatedWorkerData = z.infer<typeof workerFormSchema>;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = session.user as AppUser;
    if (!user.profileId) {
      return NextResponse.json({ error: 'User profile not found in session' }, { status: 403 });
    }

    const body: unknown = await req.json();
    const validationResult = workerFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { profileId: requestProfileId, ...workerDataFields }: ValidatedWorkerData = validationResult.data;

    // Authorization: Ensure the profileId in the request matches the session user's profileId
    if (requestProfileId !== user.profileId) {
      return NextResponse.json({ error: 'Forbidden: You can only add workers to your own profile.' }, { status: 403 });
    }

    // Check if the validated profileId (which is the user's own profileId) exists
    const profileExists = await prisma.profile.findUnique({
      where: { id: user.profileId }, // Use the authenticated user's profileId
    });

    if (!profileExists) {
      // This case should be rare if profileId from session is always valid
      return NextResponse.json({ error: "Associated profile not found for authenticated user." }, { status: 404 });
    }
    
    const newInjuredWorker = await prisma.injuredWorker.create({
      data: {
        ...workerDataFields,
        profileId: user.profileId, // Ensure it uses the authenticated user's profileId
      },
    });
    return NextResponse.json(newInjuredWorker, { status: 201 });

  } catch (error) {
    // ... (keep existing error handling) ...
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = session.user as AppUser;

    // The GET request for workers should be for the currently logged-in user's profile.
    // So, we use user.profileId from the session instead of a query parameter.
    if (!user.profileId) {
      return NextResponse.json({ error: 'User profile not found in session' }, { status: 403 });
    }
    const sessionProfileId = user.profileId;

    // Removed: const { searchParams } = new URL(req.url);
    // Removed: const profileId = searchParams.get('profileId');
    // Removed: if (!profileId) { ... }

    const injuredWorkers = await prisma.injuredWorker.findMany({
      where: {
        profileId: sessionProfileId, // Fetch workers for the authenticated user's profile
      },
      // ... (keep existing select, orderBy) ...
      select: { 
        id: true,
        first_name: true,
        last_name: true,
        date_of_birth: true,
        ssn: true, 
        city: true,
        state: true,
        claims: { 
          select: {
            id: true,
            wcc_file_number: true,
            claim_status: true, 
            date_of_injury: true,
            employer: { 
              select: {
                name: true,
              }
            }
          },
          orderBy: { 
            date_of_injury: 'desc' 
          }
        }
      },
      orderBy: [ 
        { last_name: 'asc' },
        { first_name: 'asc' }
      ],
    });

    // ... (keep existing processing logic for processedWorkers) ...
    const processedWorkers = injuredWorkers.map(worker => {
      const claimsInfo = worker.claims.map(claim => ({
        id: claim.id,
        wcc_file_number: claim.wcc_file_number || 'N/A',
        claim_status: claim.claim_status || 'Unknown', 
        employerName: claim.employer?.name || 'N/A', 
        date_of_injury: claim.date_of_injury
      }));

      const employerNames = Array.from(new Set(worker.claims.map(claim => claim.employer?.name).filter(name => name)));

      return {
        id: worker.id,
        first_name: worker.first_name,
        last_name: worker.last_name,
        date_of_birth: worker.date_of_birth,
        ssn: worker.ssn ? `XXX-XX-${worker.ssn.slice(-4)}` : null,
        city: worker.city,
        state: worker.state,
        claims: claimsInfo, 
        employerNames: employerNames.length > 0 ? employerNames : ['N/A'], 
      };
    });

    return NextResponse.json(processedWorkers, { status: 200 });

  } catch (error) {
    // ... (keep existing error handling) ...
    console.error("API - GET /api/workers - Error fetching injured workers:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while fetching injured workers." },
      { status: 500 }
    );
  }
}