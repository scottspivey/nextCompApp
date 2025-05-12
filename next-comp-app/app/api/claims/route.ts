// app/api/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId query parameter is required' }, { status: 400 });
    }

    // Optional: Add authentication check here if only the owner of the profile can see their claims
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    // }
    // // Further check if the session.user.profile.id matches the requested profileId if needed

    const claims = await prisma.claim.findMany({
      where: {
        profileId: profileId,
      },
      select: {
        id: true,
        wcc_file_number: true,
        date_of_injury: true,
        injuredWorker: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        // Add other claim fields you might want for summary display
      },
      orderBy: {
        updatedAt: 'desc', // Or createdAt, or date_of_injury
      },
    });

    if (!claims) { // findMany returns an array, so check length if needed, or rely on empty array
      return NextResponse.json({ error: 'No claims found for this profile.' }, { status: 404 });
    }

    return NextResponse.json(claims);

  } catch (error) {
    console.error('Error fetching claims:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch claims.', details: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
