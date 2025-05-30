// app/api/workers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth'; // Assuming you use this for authentication
import type { AppUser } from '@/types/next-auth'; // Assuming this type
import { Prisma, Gender, MaritalStatus } from '@prisma/client'; // Prisma contains PrismaClientKnownRequestError
import * as z from 'zod';

// Define the expected shape of the params for this dynamic route
interface RouteContext {
  params: {
    id: string; // This 'id' must match the [id] in the filename
  };
}

// Zod schema for updating an InjuredWorker
const updateWorkerSchema = z.object({
  first_name: z.string().min(1, "First name is required.").optional(),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, "Last name is required.").optional(),
  suffix: z.string().optional().nullable(),
  ssn: z.string().optional().nullable(),
  date_of_birth: z.coerce.date().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  marital_status: z.nativeEnum(MaritalStatus).optional().nullable(),
  address_line1: z.string().optional().nullable(),
  address_line2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  work_phone_number: z.string().optional().nullable(),
  email: z.string().email("Invalid email address.").optional().nullable(),
  occupation: z.string().optional().nullable(),
  num_dependents: z.coerce.number().int().min(0).optional().nullable(),
});

// PUT Handler for updating a specific InjuredWorker
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const workerId = params.id; // Use params.id

  // No need to check for !workerId here, Next.js ensures it for a matched route.

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = session.user as AppUser; // Ensure AppUser type includes profileId
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

  } catch (error: unknown) {
    console.error(`Error updating worker ${workerId}:`, error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found.
        return NextResponse.json({ error: 'Worker to update not found.'}, { status: 404 });
      }
      const details = `Prisma error code: ${error.code}`;
      return NextResponse.json({ error: 'Failed to update injured worker due to a database issue.', details }, { status: 500 });
    }
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Validation processing error.", details: error.errors }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update injured worker.', details: message }, { status: 500 });
  }
}

// GET handler for fetching a specific InjuredWorker
export async function GET(req: NextRequest, { params }: RouteContext) {
  const workerId = params.id; // Use params.id

  // No need to check for !workerId here.

  try {
      const session = await auth();
      if (!session?.user) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      const user = session.user as AppUser; // Ensure AppUser type includes profileId
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

  } catch (error: unknown) {
      console.error(`Error fetching worker ${workerId}:`, error);
      let message = 'An unknown error occurred';
      if (error instanceof Error) {
          message = error.message;
      }
      return NextResponse.json({ error: 'Failed to fetch injured worker details.', details: message }, { status: 500 });
  }
}