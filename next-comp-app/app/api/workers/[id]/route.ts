// app/api/workers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Use your shared Prisma instance
import { auth } from '@/auth';     // Your NextAuth.js v5 auth
import type { AppUser } from '@/types/next-auth';
import * as z from 'zod';

// Zod schema for PUT request validation (can be similar to your page's schema)
// Ensure it matches the payload structure sent from the frontend
const updateWorkerFormSchema = z.object({
  first_name: z.string().min(1, "First name is required").optional(),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, "Last name is required").optional(),
  suffix: z.string().optional().nullable(),
  ssn: z.string().optional().nullable().refine(val => !val || /^\d{9}$/.test(val), {
    message: "SSN must be 9 digits or empty/null if not provided for update.",
  }), // Expecting raw 9 digits or null
  date_of_birth: z.coerce.date({invalid_type_error: "Invalid date"}).optional().nullable(),
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
  }), // Expecting raw 10 digits
  work_phone_number: z.string().optional().nullable().refine(val => !val || /^\d{10}$/.test(val), {
    message: "Work phone number must be 10 digits or empty",
  }), // Expecting raw 10 digits
  email: z.string().email({ message: "Invalid email address" }).optional().nullable().or(z.literal('')),
  occupation: z.string().optional().nullable(),
  num_dependents: z.number().int().min(0).optional().nullable(),
});


// GET Handler for fetching a specific worker
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = session.user as AppUser;
    if (!user.profileId) {
      return NextResponse.json({ error: 'User profile not found in session' }, { status: 403 });
    }

    const workerId = params.id;
    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    const worker = await prisma.injuredWorker.findUnique({
      where: {
        id: workerId,
        // Authorization: Ensure the worker belongs to the authenticated user's profile
        profileId: user.profileId,
      },
      include: {
        claims: { // Include claims if you want to display them on the detail page
          select: {
            id: true,
            wcc_file_number: true,
            claim_status: true,
            date_of_injury: true,
            employer: {
              select: { name: true }
            }
          },
          orderBy: { date_of_injury: 'desc' }
        }
      }
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found or not authorized' }, { status: 404 });
    }

    // Mask SSN before sending to client if it exists
    const workerDataToSend = {
      ...worker,
      ssn: worker.ssn ? `XXX-XX-${worker.ssn.slice(-4)}` : null,
    };

    return NextResponse.json(workerDataToSend);

  } catch (error) {
    console.error(`Error fetching worker ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch worker details' }, { status: 500 });
  }
}

// PUT Handler for updating a specific worker
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = session.user as AppUser;
    if (!user.profileId) {
      return NextResponse.json({ error: 'User profile not found in session' }, { status: 403 });
    }

    const workerId = params.id;
    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    // First, verify the worker exists and belongs to the user
    const existingWorker = await prisma.injuredWorker.findFirst({
      where: {
        id: workerId,
        profileId: user.profileId,
      },
    });

    if (!existingWorker) {
      return NextResponse.json({ error: 'Worker not found or not authorized for update' }, { status: 404 });
    }

    const body: unknown = await req.json();
    // Make all fields optional for PUT, as it's an update
    const validationResult = updateWorkerFormSchema.partial().safeParse(body); 

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const dataToUpdate = { ...validationResult.data };

    // Handle SSN:
    // If 'ssn' is not present in validationResult.data, it means client didn't send it (e.g. original masked SSN was kept)
    // If it's present and null, it means client wants to clear it.
    // If it's present and a 9-digit string, client wants to update it.
    if ('ssn' in validationResult.data) {
        if (validationResult.data.ssn === null) {
            dataToUpdate.ssn = null; // Explicitly set to null if client sent null
        } else if (validationResult.data.ssn) {
            // The schema already validated it's 9 digits if not null
            dataToUpdate.ssn = validationResult.data.ssn;
        }
        // If ssn was undefined in payload (meaning no change from original masked value),
        // it won't be in dataToUpdate, so existingWorker.ssn will be preserved.
    } else {
      // If SSN was not sent in the payload (e.g., user didn't want to change the masked one),
      // do not change it in the database. Prisma update will ignore undefined fields.
      delete dataToUpdate.ssn;
    }


    const updatedWorker = await prisma.injuredWorker.update({
      where: {
        id: workerId,
        // Redundant profileId check here, but good for safety
        // profileId: user.profileId,
      },
      data: dataToUpdate,
    });
    
    // Mask SSN again before sending back
    const updatedWorkerDataToSend = {
        ...updatedWorker,
        ssn: updatedWorker.ssn ? `XXX-XX-${updatedWorker.ssn.slice(-4)}` : null,
    };

    return NextResponse.json(updatedWorkerDataToSend);

  } catch (error) {
    console.error(`Error updating worker ${params.id}:`, error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Validation failed during processing.", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update worker' }, { status: 500 });
  }
}