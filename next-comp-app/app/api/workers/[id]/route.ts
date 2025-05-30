// app/api/workers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import type { AppUser } from '@/types/next-auth';
import { Prisma, Gender, MaritalStatus } from '@prisma/client';
import * as z from 'zod';

// Interface for the structure of the 'params' object (content of the promise)
interface WorkerRouteParams {
  id: string;
}

// Zod schema (remains the same)
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

// GET handler: params is now a Promise
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<WorkerRouteParams> } // Updated type
) {
  const resolvedParams = await params; // Await the params
  const workerId = resolvedParams.id;

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
      where: { id: workerId, profileId: user.profileId },
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
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch injured worker details.', details: message }, { status: 500 });
  }
}

// PUT Handler: params is now a Promise
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<WorkerRouteParams> } // Updated type
) {
  const resolvedParams = await params; // Await the params
  const workerId = resolvedParams.id;

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
      where: { id: workerId, profileId: user.profileId },
    });

    if (!existingWorker) {
      return NextResponse.json({ error: 'Injured worker not found or not authorized to update' }, { status: 404 });
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
      where: { id: workerId },
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
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Worker to update not found.' }, { status: 404 });
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

// DELETE Handler: params is now a Promise
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<WorkerRouteParams> } // Updated type
) {
  const resolvedParams = await params; // Await the params
  const workerId = resolvedParams.id;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = session.user as AppUser;
    if (!user.profileId) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
    }

    const workerToDelete = await prisma.injuredWorker.findFirst({
      where: { id: workerId, profileId: user.profileId },
      select: { id: true, first_name: true, last_name: true }
    });

    if (!workerToDelete) {
      return NextResponse.json({ error: 'Injured worker not found or you are not authorized to delete this worker.' }, { status: 404 });
    }

    await prisma.injuredWorker.delete({
      where: { id: workerId },
    });

    return NextResponse.json({ message: `Injured worker (${workerToDelete.first_name} ${workerToDelete.last_name}, ID: ${workerId}) deleted successfully.` }, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error deleting worker ${workerId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json({ error: 'Failed to delete worker. They may be associated with existing claims or other records.' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Worker to delete not found.' }, { status: 404 });
      }
      const details = `Prisma error code: ${error.code}`;
      return NextResponse.json({ error: 'Failed to delete injured worker due to a database issue.', details }, { status: 500 });
    }
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete injured worker.', details: message }, { status: 500 });
  }
}