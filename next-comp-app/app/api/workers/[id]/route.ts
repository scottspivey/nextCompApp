// app/api/workers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth'; // Assuming you use this for authentication
import type { AppUser } from '@/types/next-auth'; // Assuming this type

// IMPORTANT: If you see errors like "Module '@prisma/client' has no exported member 'Gender'..."
// YOU MUST RUN `npx prisma generate` in your terminal to update your Prisma Client.
import { Prisma, Gender, MaritalStatus } from '@prisma/client'; 
import * as z from 'zod';

interface RouteContext {
  params: {
    id: string; // Worker ID from the route
  };
}

// Zod schema for updating an InjuredWorker
// This is an example; adjust it to match all fields you allow for update.
const updateWorkerSchema = z.object({
  first_name: z.string().min(1, "First name is required.").optional(),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, "Last name is required.").optional(),
  suffix: z.string().optional().nullable(),
  ssn: z.string().optional().nullable(), // Add validation like regex if needed
  date_of_birth: z.coerce.date().optional().nullable(),
  
  // Use nativeEnum for the gender field
  gender: z.nativeEnum(Gender).optional().nullable(), 
  
  // Example for another enum-based field from your schema
  marital_status: z.nativeEnum(MaritalStatus).optional().nullable(), 

  address_line1: z.string().optional().nullable(),
  address_line2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(), // Add regex validation if needed
  phone_number: z.string().optional().nullable(), // Add regex validation if needed
  work_phone_number: z.string().optional().nullable(), // Add regex validation if needed
  email: z.string().email("Invalid email address.").optional().nullable(),
  
  occupation: z.string().optional().nullable(),
  num_dependents: z.coerce.number().int().min(0).optional().nullable(),
  
  // Add any other fields from your InjuredWorker model that can be updated
});

// PUT Handler for updating a specific InjuredWorker
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const workerId = params.id;

  if (!workerId) {
    return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // Assuming AppUser has profileId, and you authorize based on that
    const user = session.user as AppUser; 
    if (!user.profileId) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
    }

    // Fetch the existing worker to ensure it belongs to the authenticated user's profile
    const existingWorker = await prisma.injuredWorker.findFirst({
        where: {
            id: workerId,
            profileId: user.profileId, // Authorization check
        },
    });

    if (!existingWorker) {
        return NextResponse.json({ error: 'Injured worker not found or not authorized' }, { status: 404 });
    }

    const body: unknown = await req.json();
    // Use .partial() if you want to allow partial updates (not all fields required)
    const validationResult = updateWorkerSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input for updating worker.", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // The data from validationResult.data should now have `gender` correctly typed as the Gender enum
    // (or null/undefined if optional and not provided).
    const dataToUpdate = validationResult.data;

    // The error "Type '{ ... }' is not assignable to type 'InjuredWorkerUpdateInput'"
    // should be resolved if `dataToUpdate` (specifically its `gender` field)
    // is now correctly typed due to `z.nativeEnum(Gender)`.
    const updatedWorker = await prisma.injuredWorker.update({
      where: { 
        id: workerId 
        // No need to re-check profileId here if you trust the existingWorker fetch,
        // but for extra safety, you could add it:
        // AND: { profileId: user.profileId } 
      },
      data: dataToUpdate, // This is line 156 from your error message
    });

    // Mask SSN before sending back (example)
    const { ssn: rawSsn, ...workerWithoutRawSsn } = updatedWorker;
    const updatedWorkerDataToSend = {
        ...workerWithoutRawSsn,
        ssn: rawSsn ? `XXX-XX-${rawSsn.slice(-4)}` : null,
    };

    return NextResponse.json(updatedWorkerDataToSend);

  } catch (error) {
    console.error(`Error updating worker ${workerId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors, e.g., P2025 (Record to update not found)
      // This is already implicitly handled by the existingWorker check above.
    }
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Validation processing error.", details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update injured worker.', details: message }, { status: 500 });
  }
}

// You would also have GET, DELETE handlers here, potentially.
// Example GET handler:
export async function GET(req: NextRequest, { params }: RouteContext) {
    const workerId = params.id;

    if (!workerId) {
        return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        const user = session.user as AppUser;
        if (!user.profileId) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
        }

        const worker = await prisma.injuredWorker.findFirst({
            where: {
                id: workerId,
                profileId: user.profileId, // Authorization: worker must belong to user's profile
            },
            // include other relations if needed
        });

        if (!worker) {
            return NextResponse.json({ error: 'Injured worker not found or not authorized' }, { status: 404 });
        }
        
        // Mask SSN before sending back
        const { ssn: rawSsn, ...workerWithoutRawSsn } = worker;
        const workerDataToSend = {
            ...workerWithoutRawSsn,
            ssn: rawSsn ? `XXX-XX-${rawSsn.slice(-4)}` : null,
        };

        return NextResponse.json(workerDataToSend);

    } catch (error) {
        console.error(`Error fetching worker ${workerId}:`, error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Failed to fetch injured worker details.', details: message }, { status: 500 });
    }
}
