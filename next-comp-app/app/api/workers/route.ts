// app/api/workers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as z from 'zod';

const prisma = new PrismaClient();

// Zod schema for backend validation.
// This should align with the data structure sent by the frontend
// and the fields expected by your InjuredWorker model.
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

    // 1. Validate the incoming data using the Zod schema
    const validationResult = workerFormSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { 
          error: "Invalid input.",
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    // Destructure validated data. This data structure should match what prisma.injuredWorker.create expects.
    const { ...workerData } = validationResult.data;

    // 2. Check if the associated profileId exists
    const profileExists = await prisma.profile.findUnique({
      where: { id: workerData.profileId },
    });

    if (!profileExists) {
      return NextResponse.json(
        { error: "Associated profile not found." },
        { status: 404 } // Or 400 if it's considered a client error for providing a non-existent profileId
      );
    }
    
    // 3. Create the new InjuredWorker in the database
    // Corrected to use prisma.injuredWorker.create
    const newInjuredWorker = await prisma.injuredWorker.create({
      data: {
        ...workerData,
        // Prisma will handle default values like `id`, `createdAt`, `updatedAt`, `last_accessed_at`
        // Ensure that the fields in `workerData` (after Zod validation)
        // correctly map to the fields in your `InjuredWorker` model.
        // For example, `date_of_birth` is coerced to a Date object by Zod.
        // `ssn` and phone numbers are expected in their cleaned format as per the Zod schema.
      },
    });

    // 4. Return a success response with the created worker data
    return NextResponse.json(newInjuredWorker, { status: 201 });

  } catch (error) {
    console.error("Failed to create injured worker:", error);

    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Validation failed during processing.", details: error.errors }, { status: 400 });
    }
    
    // Handle potential Prisma-specific errors (e.g., unique constraint violation)
    // Example: (This is a generic way to check Prisma errors, you might need to be more specific based on error.code)
    // if (error.constructor.name === 'PrismaClientKnownRequestError') {
    //    if (error.code === 'P2002' && error.meta?.target?.includes('ssn')) { // Example for unique SSN
    //      return NextResponse.json({ error: "An injured worker with this SSN already exists." }, { status: 409 }); // 409 Conflict
    //    }
    // }

    return NextResponse.json(
      { error: "An internal server error occurred while creating the injured worker." },
      { status: 500 }
    );
  }
  // `finally { await prisma.$disconnect(); }` is generally not needed in serverless environments like Next.js API routes.
  // Prisma Client manages connections efficiently.
}
