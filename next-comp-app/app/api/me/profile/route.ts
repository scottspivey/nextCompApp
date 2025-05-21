// app/api/me/profile/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // Your NextAuth.js setup
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Directly fetching profile using userId from session
    const userProfile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        firm_name: true,
        phone_number: true,
        user: { // To get the email and name from the User model
          select: {
            email: true,
            name: true, // User.name (display name)
          }
        }
      },
    });

    if (!userProfile) {
      console.warn(`Profile not found for authenticated user ID: ${session.user.id}`);
      return NextResponse.json({ error: 'Profile not found for the authenticated user.' }, { status: 404 });
    }

    // Prepare response data
    // The type assertion for role was removed as it's unnecessary.
    // Prisma's generated types should correctly infer userProfile.role as Role | null
    // if the 'role' field in your Profile model is optional or can be null.
    // If 'role' is a non-nullable field of type Role in your schema, then it will be inferred as Role.
    const responseData = {
        profileId: userProfile.id,
        userId: session.user.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        displayName: userProfile.user?.name, // User's display name
        role: userProfile.role, // Removed unnecessary type assertion: `as Role | null`
        firm_name: userProfile.firm_name,
        phone_number: userProfile.phone_number,
        email: userProfile.user?.email
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch user profile.', details: message }, { status: 500 });
  }
  
}

// TODO: Add PUT/PATCH handler for updating profile if it doesn't exist elsewhere
// This handler would need to accept firstName, lastName, etc.
// and use prisma.profile.update(...)
/*
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) { // Assuming profileId might not be on session, or using userId as key
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Define an interface for the PUT request body for type safety
    interface UpdateProfileBody {
      firstName?: string;
      lastName?: string;
      firm_name?: string;
      phone_number?: string;
      role?: Role;
    }

    const { firstName, lastName, firm_name, phone_number, role } = await request.json() as UpdateProfileBody;

    // Add Zod validation here for the request body for more robust validation

    const updatedProfile = await prisma.profile.update({
      where: {
        userId: session.user.id, // Update based on userId
      },
      data: {
        // Only include fields that are actually provided in the request
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(firm_name !== undefined && { firm_name }),
        ...(phone_number !== undefined && { phone_number }),
        ...(role !== undefined && { role }), // Role enum should be used directly if valid
      },
    });

    return NextResponse.json(updatedProfile);

  } catch (error) {
    console.error('Error updating user profile:', error);
    // Add more specific error handling (e.g., Zod validation errors, Prisma errors)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ error: 'Profile not found for update.' }, { status: 404 });
      }
    }
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update user profile.', details: message }, { status: 500 });
  }
}
*/
