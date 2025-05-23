// app/api/workers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth'; // Assuming you use this for authentication
import type { AppUser } from '@/types/next-auth'; // Assuming this type

import { Prisma, Gender, MaritalStatus } from '@prisma/client'; 
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as z from 'zod';

// Define an interface for the route handler's context
interface RouteHandlerContext {
  params: { id: string };
}

// Zod schema for updating an InjuredWorker
// Assuming Gender and MaritalStatus are enums in your schema.prisma and will be available after `npx prisma generate`.
const updateWorkerSchema = z.object({
  first_name: z.string().min(1, "First name is required.").optional(),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, "Last name is required.").optional(),
  suffix: z.string().optional().nullable(),
  ssn: z.string().optional().nullable(), // Add validation like regex if needed
  date_of_birth: z.coerce.date().optional().nullable(),
  
  // Switched to z.nativeEnum assuming 'Gender' is an enum in your schema and available after `prisma generate`
  gender: z.nativeEnum(Gender).optional().nullable(), 
  // Switched to z.nativeEnum assuming 'MaritalStatus' is an enum in your schema and available after `prisma generate`
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
export async function PUT(
    req: NextRequest, 
    context: RouteHandlerContext 
) {
  const workerId = context.params.id; 

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

    const existingWorker = await prisma.injuredWorker.findFirst({
        where: {
            id: workerId,
            profileId: user.profileId, 
        },
    });

    if (!existingWorker) {
        return NextResponse.json({ error: 'Injured worker not found or not authorized' }, { status: 404 });
    }

    const body: unknown = await req.json();
    const validationResult = updateWorkerSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input for updating worker.", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // If Gender and MaritalStatus are correctly typed as enums by Zod (after `prisma generate`),
    // this data should align with Prisma.InjuredWorkerUpdateInput.
    const dataToUpdate: Prisma.InjuredWorkerUpdateInput = validationResult.data;

    const updatedWorker = await prisma.injuredWorker.update({
      where: { 
        id: workerId 
      },
      data: dataToUpdate, 
    });

    const { ssn: rawSsn, ...workerWithoutRawSsn } = updatedWorker;
    const updatedWorkerDataToSend = {
        ...workerWithoutRawSsn,
        ssn: rawSsn ? `XXX-XX-${rawSsn.slice(-4)}` : null,
    };

    return NextResponse.json(updatedWorkerDataToSend);

  } catch (error: unknown) { // Catch error as unknown
    console.error(`Error updating worker ${workerId}:`, error);
    
    // Type narrowing for error handling
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ error: 'Worker to update not found.'}, { status: 404 });
      }
      // Add other specific Prisma error codes as needed
      const details = `Prisma error code: ${error.code}`;
      return NextResponse.json({ error: 'Failed to update injured worker due to a database issue.', details }, { status: 500 });
    }
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Validation processing error.", details: error.errors }, { status: 400 });
    }
    
    // General error
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update injured worker.', details: message }, { status: 500 });
  }
}

// GET handler for fetching a specific InjuredWorker
export async function GET(
    req: NextRequest, 
    context: RouteHandlerContext 
) {
    const workerId = context.params.id; 

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
                profileId: user.profileId, 
            },
        });

        if (!worker) {
            return NextResponse.json({ error: 'Injured worker not found or not authorized' }, { status: 404 });
        }
        
        const { ssn: rawSsn, ...workerWithoutRawSsn } = worker;
        const workerDataToSend = {
            ...workerWithoutRawSsn,
            ssn: rawSsn ? `XXX-XX-${rawSsn.slice(-4)}` : null,
        };

        return NextResponse.json(workerDataToSend);

    } catch (error: unknown) { // Catch error as unknown
        console.error(`Error fetching worker ${workerId}:`, error);
        // Type narrowing for error handling
        let message = 'An unknown error occurred';
        if (error instanceof Error) {
            message = error.message;
        }
        return NextResponse.json({ error: 'Failed to fetch injured worker details.', details: message }, { status: 500 });
    }
}
