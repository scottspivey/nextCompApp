// app/api/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt'; // For server-side session access

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // --- Authentication and Authorization ---
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    if (!token || !token.profileId) {
      // profileId should be in your JWT token from NextAuth callbacks
      return NextResponse.json({ error: 'Unauthorized. No valid session or profile ID.' }, { status: 401 });
    }
    
    const sessionProfileId = token.profileId;

    // --- Original profileId from query (optional, could be removed if always using session's) ---
    // const { searchParams } = new URL(req.url);
    // const queryProfileId = searchParams.get('profileId');
    // if (queryProfileId && queryProfileId !== sessionProfileId) {
    //   // If a profileId is passed in query and it doesn't match the session's, deny access.
    //   return NextResponse.json({ error: 'Forbidden. Mismatched profile ID.' }, { status: 403 });
    // }
    // For this route, we will strictly use the sessionProfileId to ensure user can only access their own claims.

    const claims = await prisma.claim.findMany({
      where: {
        profileId: sessionProfileId, // Fetch claims ONLY for the authenticated user's profile
      },
      select: {
        id: true,
        wcc_file_number: true,
        date_of_injury: true,
        claim_status: true, // Crucial for filtering on the dashboard
        injuredWorker: {
          select: {
            id: true, // Needed for dashboard's selectableClaimsForPdf logic
            first_name: true,
            last_name: true,
          },
        },
        // You can add other fields like 'employer' if needed for the claim summary
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

    // findMany returns an empty array if no records are found, so no explicit 404 is needed here.
    // The client will receive an empty array and can handle it accordingly.
    return NextResponse.json(claims, { status: 200 });

  } catch (error) {
    console.error('API - GET /api/claims - Error fetching claims:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch claims.', details: message }, { status: 500 });
  }
  // No prisma.$disconnect() needed in serverless functions
}
