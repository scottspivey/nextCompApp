// app/api/workers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as z from 'zod';
import { auth } from '@/auth';
import { Prisma, Gender, MaritalStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


// This route uses `auth()` which relies on `bcryptjs`.
// `bcryptjs` is not compatible with the Edge Runtime.
// Therefore, this route MUST run on the Node.js runtime (which is the default).
// DO NOT add `export const runtime = 'edge';` to this file.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Zod schema using nativeEnum for gender and marital_status
const updateWorkerSchema = z.object({
  first_name: z.string().min(1, "First name is required.").optional(),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, "Last name is required.").optional(),
  suffix: z.string().optional().nullable(),
  ssn: z.string().optional().nullable().refine(val => !val || /^\d{9}$/.test(val), {
    message: "SSN must be 9 digits or empty",
  }),
  date_of_birth: z.coerce.date().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(), 
  marital_status: z.nativeEnum(MaritalStatus).optional().nullable(), 
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

// PUT Handler for updating a specific InjuredWorker
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const workerId = params.id; 

  if (!workerId) {
    return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
  }

  try {
    const session = await auth(); 
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = session.user;
    if (!user.profileId) {
      return NextResponse.json({ error: 'User profile not found in session' }, { status: 403 });
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
    if (error instanceof z.ZodError) { 
        return NextResponse.json({ error: "Validation failed during processing.", details: error.errors }, { status: 400 });
    }
    if (error instanceof PrismaClientKnownRequestError) { 
        if (error.code === 'P2025') {
           return NextResponse.json({ error: 'Worker to update not found.'}, { status: 404 });
        }
        return NextResponse.json({ error: 'A database error occurred while updating the worker.' }, { status: 500 });
    }
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "An internal server error occurred while updating the worker.", details: message },
      { status: 500 }
    );
  }
}


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const workerId = params.id; 

  if (!workerId) {
    return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
  }

  try {
    const session = await auth(); 
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = session.user;

    if (!user.profileId) {
      return NextResponse.json({ error: 'User profile not found in session' }, { status: 403 });
    }
    
    const worker = await prisma.injuredWorker.findFirst({
      where: {
          id: workerId,
          profileId: user.profileId, 
      },
      include: { 
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
      }
    });

    if (!worker) {
        return NextResponse.json({ error: 'Injured worker not found or not authorized' }, { status: 404 });
    }
    
    const workerDataToSend = {
        ...worker,
        ssn: worker.ssn ? `XXX-XX-${worker.ssn.slice(-4)}` : null,
    };

    return NextResponse.json(workerDataToSend);

  } catch (error: unknown) { 
    console.error(`Error fetching worker ${workerId}:`, error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "An internal server error occurred while fetching injured worker details.", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const workerId = params.id;

  if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required for deletion' }, { status: 400 });
  }

  try {
      const session = await auth();
      if (!session?.user) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      const user = session.user; 
      if (!user.profileId) {
          return NextResponse.json({ error: 'User profile not found in session' }, { status: 403 });
      }

      const workerToDelete = await prisma.injuredWorker.findFirst({
          where: {
              id: workerId,
              profileId: user.profileId, 
          },
      });

      if (!workerToDelete) {
          return NextResponse.json({ error: 'Injured worker not found or not authorized for deletion.' }, { status: 404 });
      }

      await prisma.injuredWorker.delete({
          where: {
              id: workerId,
          },
      });

      return NextResponse.json({ message: `Worker ${workerToDelete.first_name} ${workerToDelete.last_name} deleted successfully.` }, { status: 200 });

  } catch (error: unknown) {
      console.error(`Error deleting worker ${workerId}:`, error);
      if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2003') { 
              return NextResponse.json({ error: 'Failed to delete worker due to related records. Ensure cascading deletes are set up or handle related records first.' }, { status: 409 });
          }
          if (error.code === 'P2025') {
              return NextResponse.json({ error: 'Worker to delete not found.' }, { status: 404 });
          }
          return NextResponse.json({ error: 'A database error occurred during deletion.' }, { status: 500 });
      }
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ error: 'Failed to delete injured worker.', details: message }, { status: 500 });
  }
}
