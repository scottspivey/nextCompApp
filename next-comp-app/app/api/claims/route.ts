// app/api/claims/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth'; 
import type { AppUser } from '@/types/next-auth'; // Optional: for explicit typing if needed
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  console.log("API - GET /api/claims - Request received."); 
  try {
    const session = await auth(); // Get the session using the new auth() function

    // The session object now directly contains the user with AppUser fields
    // The 'user' object in the session is already typed as AppUser if your next-auth.d.ts is correct
    if (!session?.user) {
      console.error("API - GET /api/claims - Unauthorized: No session or user found.");
      return NextResponse.json({ error: 'Unauthorized. No valid session.' }, { status: 401 });
    }

    // Access custom fields directly from session.user
    // session.user should be of type AppUser (which includes profileId, role, etc.)
    const user = session.user as AppUser; // Cast for clarity or if inference isn't perfect

    if (!user.profileId) { 
      console.error("API - GET /api/claims - Unauthorized: profileId is missing from the session user object. User:", JSON.stringify(user, null, 2));
      return NextResponse.json({ error: 'Unauthorized. No valid profile ID in session.' }, { status: 401 });
    }
    
    const sessionProfileId = user.profileId; 
    console.log("API - GET /api/claims - Authorized. Session Profile ID:", sessionProfileId);

    console.log(`API - GET /api/claims - Fetching claims for profileId: ${sessionProfileId}`);
    const claims = await prisma.claim.findMany({
      where: {
        profileId: sessionProfileId, 
      },
      // ... rest of your select and orderBy clauses
      select: {
        id: true,
        wcc_file_number: true,
        date_of_injury: true,
        claim_status: true, 
        injuredWorker: {
          select: {
            id: true, 
            first_name: true,
            last_name: true,
          },
        },
        employer: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc', 
      },
    });

    console.log(`API - GET /api/claims - Found ${claims.length} claims for profileId: ${sessionProfileId}`);
    return NextResponse.json(claims, { status: 200 });

  } catch (error) {
    console.error('API - GET /api/claims - Error fetching claims:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch claims.', details: message }, { status: 500 });
  } finally {
    // Consider if prisma.$disconnect() is needed here or managed globally
    // await prisma.$disconnect(); 
  }
}