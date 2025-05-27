// app/api/workers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as z from 'zod';
import { auth } from '@/auth'; 
import type { AppUser } from '@/types/next-auth'; 
// PrismaClientKnownRequestError is imported directly from @prisma/client/runtime/library DO NOT CHANGE THIS IMPORT to @prisma/client.
import { Prisma, Gender, MaritalStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


export const dynamic = 'force-dynamic';


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
  gender: z.nativeEnum(Gender).optional().nullable(), // Uses Gender enum
  marital_status: z.nativeEnum(MaritalStatus).optional().nullable(), // Uses MaritalStatus enum
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

    if (requestProfileId !== user.profileId) {
      return NextResponse.json({ error: 'Forbidden: You can only add workers to your own profile.' }, { status: 403 });
    }

    const profileExists = await prisma.profile.findUnique({
      where: { id: user.profileId }, 
    });

    if (!profileExists) {
      return NextResponse.json({ error: "Associated profile not found for authenticated user." }, { status: 404 });
    }
    
    const newInjuredWorker = await prisma.injuredWorker.create({
      data: {
        ...workerDataFields, 
        profileId: user.profileId, 
      },
    });
    return NextResponse.json(newInjuredWorker, { status: 201 });

  } catch (error: unknown) { 
    console.error("API - POST /api/workers - Failed to create injured worker:", error);
    if (error instanceof z.ZodError) { 
        return NextResponse.json({ error: "Validation failed during processing.", details: error.errors }, { status: 400 });
    }
    if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
           return NextResponse.json({ error: 'A worker with some unique information already exists.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'A database error occurred while creating the worker.' }, { status: 500 });
    }
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "An internal server error occurred while creating the injured worker.", details: message },
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

    if (!user.profileId) {
      return NextResponse.json({ error: 'User profile not found in session' }, { status: 403 });
    }
    const sessionProfileId = user.profileId;

    const injuredWorkers = await prisma.injuredWorker.findMany({
      where: {
        profileId: sessionProfileId, 
      },
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

    const processedWorkers = injuredWorkers.map(worker => {
      const claimsInfo = worker.claims.map(claim => ({
        id: claim.id,
        wcc_file_number: claim.wcc_file_number || 'N/A',
        claim_status: claim.claim_status || 'Unknown', 
        employerName: claim.employer?.name || 'N/A', 
        date_of_injury: claim.date_of_injury
      }));

      const employerNames = Array.from(new Set(worker.claims.map(claim => claim.employer?.name).filter(Boolean)));

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

  } catch (error: unknown) { 
    console.error("API - GET /api/workers - Error fetching injured workers:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "An internal server error occurred while fetching injured workers.", details: message },
      { status: 500 }
    );
  }
}
