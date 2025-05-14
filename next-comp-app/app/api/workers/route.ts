// app/api/workers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as z from 'zod';
// Import the JWT type and getToken helper if you need to get the session server-side
// For GET requests based on query params passed by an authenticated client, direct session check might not be needed here
// if the client is responsible for passing its own profileId obtained from its session.
// However, for security, it's better if the API can verify the profileId against the authenticated user.
// For simplicity in this step, we'll assume the client passes a profileId it's authorized to see.
// A more robust solution would involve getting the session on the server.

const prisma = new PrismaClient();

// Zod schema for backend validation (for POST requests)
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

    // Validate if the profileId is a valid UUID (optional, but good practice)
    // For simplicity, skipping direct UUID validation here.

    // Fetch injured workers associated with the given profileId
    const injuredWorkers = await prisma.injuredWorker.findMany({
      where: {
        profileId: profileId,
      },
      select: { // Select only the fields needed for the list view
        id: true,
        first_name: true,
        last_name: true,
        date_of_birth: true,
        ssn: true, // Consider masking this or omitting for a list view for privacy
        city: true,
        state: true,
        // Add other "survey level" fields as needed
        // For example, if you have a primary claim associated, you might want its status or WCC number
        // claims: { // Example: Fetching related claim info (adjust based on your needs)
        //   select: {
        //     wcc_file_number: true,
        //     claim_status: true
        //   },
        //   orderBy: {
        //     createdAt: 'desc' // Or date_of_injury
        //   },
        //   take: 1 // Get the most recent or primary claim
        // }
      },
      orderBy: {
        last_name: 'asc', // Example: order by last name
        first_name: 'asc',
      },
    });

    if (!injuredWorkers) { // findMany returns an array, so it will be [] if none found, not null.
      return NextResponse.json([], { status: 200 }); // Return empty array if no workers found
    }
    
    // Optional: Mask SSN before sending to client
    const workersWithMaskedSSN = injuredWorkers.map(worker => ({
        ...worker,
        ssn: worker.ssn ? `XXX-XX-${worker.ssn.slice(-4)}` : null, // Basic masking
    }));


    return NextResponse.json(workersWithMaskedSSN, { status: 200 });

  } catch (error) {
    console.error("API - GET /api/workers - Error fetching injured workers:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while fetching injured workers." },
      { status: 500 }
    );
  }
}
