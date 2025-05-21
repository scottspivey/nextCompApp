// app/api/me/profile/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // Your NextAuth.js setup
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client'; // Import Role if you use it

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Assuming profileId is stored on session.user as per your auth.ts setup
    // If not, and you need to fetch User then Profile:
    // const userWithProfile = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   include: { profile: true }
    // });
    // const userProfile = userWithProfile?.profile;

    // Directly fetching profile using userId from session (as per your existing logic)
    const userProfile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        firstName: true, // Fetch new field
        lastName: true,  // Fetch new field
        // full_name: true, // Removed
        role: true,
        firm_name: true,
        phone_number: true,
        user: { // To get the email from the User model
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

    const responseData = {
        profileId: userProfile.id, // Profile ID
        userId: session.user.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        displayName: userProfile.user?.name, // User's display name
        role: userProfile.role as Role | null, // Cast to Role enum
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
  // finally { // Removed prisma.$disconnect() as it's generally not needed per request in serverless functions
  //   await prisma.$disconnect();
  // }
}

// TODO: Add PUT/PATCH handler for updating profile if it doesn't exist elsewhere
// This handler would need to accept firstName, lastName, etc.
// and use prisma.profile.update(...)
/*
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.profileId) {
      return NextResponse.json({ error: 'Not authenticated or profileId missing' }, { status: 401 });
    }

    const { firstName, lastName, firm_name, phone_number, role } = await request.json();

    // Add Zod validation here for the request body

    const updatedProfile = await prisma.profile.update({
      where: {
        id: session.user.profileId,
        // OR: userId: session.user.id, (if profileId not on session directly)
      },
      data: {
        firstName,
        lastName,
        firm_name,
        phone_number,
        role: role ? role as Role : undefined, // Use Role enum
      },
    });

    return NextResponse.json(updatedProfile);

  } catch (error) {
    console.error('Error updating user profile:', error);
    // Add more specific error handling (e.g., Zod validation errors)
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update user profile.', details: message }, { status: 500 });
  }
}
*/