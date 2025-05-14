// app/api/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt'; // For server-side session access

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  console.log("API - GET /api/claims - Request received."); // Log start of request
  try {
    // --- Authentication and Authorization ---
    console.log("API - GET /api/claims - Attempting to get token...");
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    // Log the entire token object to see its contents
    console.log("API - GET /api/claims - Token received by getToken:", JSON.stringify(token, null, 2));

    if (!token) {
      console.error("API - GET /api/claims - Unauthorized: Token is null or undefined.");
      return NextResponse.json({ error: 'Unauthorized. No valid session token.' }, { status: 401 });
    }

    if (!token.profileId) { 
      console.error("API - GET /api/claims - Unauthorized: profileId is missing from the token. Token content:", JSON.stringify(token, null, 2));
      return NextResponse.json({ error: 'Unauthorized. No valid profile ID in session.' }, { status: 401 });
    }
    
    const sessionProfileId = token.profileId; // We've checked it exists, so assertion is okay here if your next-auth.d.ts types it as string | null | undefined
    console.log("API - GET /api/claims - Authorized. Session Profile ID:", sessionProfileId);

    console.log(`API - GET /api/claims - Fetching claims for profileId: ${sessionProfileId}`);
    const claims = await prisma.claim.findMany({
      where: {
        profileId: sessionProfileId, 
      },
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
  }
}
