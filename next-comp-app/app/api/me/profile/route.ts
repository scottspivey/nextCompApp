// app/api/me/profile/route.ts
import { NextResponse } from 'next/server';
// Corrected: Import 'auth' from your central NextAuth.js setup file
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Corrected: Use the 'auth()' function to get the session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userProfile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        full_name: true,
        role: true,
        firm_name: true,
        phone_number: true,
        user: {
          select: {
            email: true,
          }
        }
      },
    });

    if (!userProfile) {
      console.warn(`Profile not found for authenticated user ID: ${session.user.id}`);
      return NextResponse.json({ error: 'Profile not found for the authenticated user.' }, { status: 404 });
    }

    const responseData = {
        id: userProfile.id, // Profile ID
        userId: session.user.id,
        full_name: userProfile.full_name,
        role: userProfile.role,
        firm_name: userProfile.firm_name,
        phone_number: userProfile.phone_number,
        email: userProfile.user?.email
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch user profile.', details: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
