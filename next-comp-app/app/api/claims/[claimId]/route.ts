// app/api/claims/[claimId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Your shared Prisma instance
import { auth } from '@/auth';     // Your NextAuth.js v5 auth
import type { AppUser } from '@/types/next-auth';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for types

interface RouteContextParams {
  claimId: string;
}

// GET Handler for fetching a specific claim
export async function GET(
  req: NextRequest,
  context: { params: RouteContextParams } 
) {
  const { params } = context;
  const claimId = params.claimId;

  if (!claimId) {
    return NextResponse.json({ error: 'Claim ID is required' }, { status: 400 });
  }

  try {
    const session = await auth();
    const user = session?.user as AppUser | undefined; // Get user, can be undefined

    // Ensure user and user.profileId exist
    if (!user?.profileId) {
      return NextResponse.json({ error: 'Not authenticated or profile ID missing' }, { status: 401 });
    }
    // At this point, user.profileId is guaranteed to be a string because AppUser types it as string | null | undefined,
    // and we've checked it's not null/undefined.
    const sessionProfileId: string = user.profileId;

    // Define the expected payload type for the claim
    type ClaimWithRelations = Prisma.ClaimGetPayload<{
      include: {
        injuredWorker: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            date_of_birth: true,
            ssn: true, 
          }
        },
        employer: { 
          select: {
            id: true,
            name: true,
            fein: true,
          }
        },
        // documents: true, // Example: if you have these relations
        // notes: true,     // Example: if you have these relations
      }
    }>;

    const claim: ClaimWithRelations | null = await prisma.claim.findFirst({
      where: {
        id: claimId,
        // Authorization: Ensure the claim is associated with the logged-in user's profile
        profileId: sessionProfileId, // Now sessionProfileId is correctly typed as string
      },
      include: {
        injuredWorker: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            date_of_birth: true,
            ssn: true, // Fetches raw SSN from DB
          }
        },
        employer: { // If you have an Employer relation on your Claim model
          select: {
            id: true,
            name: true,
            fein: true,
            // other employer details
          }
        },
        // documents: true, // Uncomment if you have this relation
        // notes: true,     // Uncomment if you have this relation
      }
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found or you are not authorized to view it.' }, { status: 404 });
    }

    // Optionally, mask sensitive data like SSN before sending to client
    // The explicit typing of ClaimWithRelations helps TypeScript understand claim.injuredWorker here
    const claimDataToSend = {
      ...claim,
      injuredWorker: claim.injuredWorker ? { // Check if injuredWorker object exists
        ...claim.injuredWorker,
        ssn: claim.injuredWorker.ssn ? `XXX-XX-${claim.injuredWorker.ssn.slice(-4)}` : null,
      } : null, // If claim.injuredWorker is null, keep it null
    };

    return NextResponse.json(claimDataToSend);

  } catch (error) {
    console.error(`Error fetching claim ${claimId}:`, error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch claim details.', details: message }, { status: 500 });
  }
}

// You can also add PUT and DELETE handlers here later for editing and deleting claims
// export async function PUT(req: NextRequest, context: { params: RouteContextParams }) { /* ... */ }
// export async function DELETE(req: NextRequest, context: { params: RouteContextParams }) { /* ... */ }
