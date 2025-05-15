// app/api/claims/[claimId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Your shared Prisma instance
import { auth } from '@/auth';     // Your NextAuth.js v5 auth
import type { AppUser } from '@/types/next-auth';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for types

// Interface for the resolved params, not the Promise itself
interface ResolvedRouteParams {
  claimId: string;
}

// GET Handler for fetching a specific claim
export async function GET(
  req: NextRequest,
  // Corrected signature for Next.js 15+: params is a Promise
  { params }: { params: Promise<ResolvedRouteParams> } 
) {
  // Await the params to resolve them
  const resolvedParams = await params;
  const claimId = resolvedParams.claimId;

  if (!claimId) {
    // This check is somewhat redundant as Next.js routing ensures claimId is present,
    // but it's harmless.
    return NextResponse.json({ error: 'Claim ID is required' }, { status: 400 });
  }

  try {
    const session = await auth();
    const user = session?.user as AppUser | undefined; 

    if (typeof user?.profileId !== 'string' || user.profileId.trim() === '') {
      return NextResponse.json({ error: 'Not authenticated or profile ID missing/invalid' }, { status: 401 });
    }
    const sessionProfileId: string = user.profileId;

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
        // documents: true, 
        // notes: true,     
      }
    }>;

    const claim: ClaimWithRelations | null = await prisma.claim.findFirst({
      where: {
        id: claimId,
        profileId: sessionProfileId, 
      },
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
        // documents: true, 
        // notes: true,     
      }
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found or you are not authorized to view it.' }, { status: 404 });
    }

    const claimDataToSend = {
      ...claim,
      injuredWorker: claim.injuredWorker ? { 
        ...claim.injuredWorker,
        ssn: claim.injuredWorker.ssn ? `XXX-XX-${claim.injuredWorker.ssn.slice(-4)}` : null,
      } : null, 
    };

    return NextResponse.json(claimDataToSend);

  } catch (error) {
    console.error(`Error fetching claim ${claimId}:`, error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch claim details.', details: message }, { status: 500 });
  }
}

// If you add PUT or DELETE handlers, they will also need the corrected params signature:
// export async function PUT(req: NextRequest, { params }: { params: Promise<ResolvedRouteParams> }) {
//   const resolvedParams = await params;
//   const claimId = resolvedParams.claimId;
//   /* ... */
// }
// export async function DELETE(req: NextRequest, { params }: { params: Promise<ResolvedRouteParams> }) {
//   const resolvedParams = await params;
//   const claimId = resolvedParams.claimId;
//   /* ... */
// }
