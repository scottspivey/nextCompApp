//app/api/dashboard/summary/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // Assuming this is your NextAuth.js auth utility
import prisma from '@/lib/prisma'; // Your Prisma client instance
// Import AppUser if your session.user needs specific custom fields not on default NextAuthUser
// import type { AppUser } from '@/types/next-auth'; 

// Import ClaimStatus enum from Prisma Client
// Ensure ClaimStatus is defined as an enum in your schema.prisma and `npx prisma generate` has been run.
import { ClaimStatus } from '@prisma/client';

// Define the structure for the response, matching the frontend DashboardStats interface
interface DashboardStats {
    activeCases: number;
    pendingTasks: number; 
    recentActivity: RecentActivityItem[];
}

interface RecentActivityItem {
  id: string;
  description: string;
  time: string; // e.g., "2 hours ago", "Yesterday"
  type: 'claim' | 'worker' | 'form' | 'other'; 
  link?: string; // Optional link to the relevant item
}

// Define what constitutes an "active" claim status using the ClaimStatus enum
const ACTIVE_CLAIM_STATUSES: ClaimStatus[] = [
    ClaimStatus.OPEN, 
    ClaimStatus.PENDING, 
    ClaimStatus.ACCEPTED, 
    ClaimStatus.INVESTIGATING, 
    ClaimStatus.IN_LITIGATION, 
    ClaimStatus.PENDING_REVIEW, 
    ClaimStatus.UNKNOWN 
];


export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Access user properties. If `profileId` is custom, ensure your NextAuth.js session callback
        // and `next-auth.d.ts` correctly augment the session.user type.
        const user = session.user; 
        // The `profileId` should be available on `user` if your NextAuth types are set up correctly.
        // If you have `AppUser` type that includes `profileId`, you could cast:
        // const user = session.user as AppUser;
        if (!user.id) { // Standard NextAuth.js user has `id`
             return NextResponse.json({ error: 'User ID not found in session.' }, { status: 403 });
        }
        
        // Assuming profileId is fetched or available on the user object.
        // For this example, let's assume profileId is directly on user or fetched based on user.id
        // If `profileId` is not directly on `session.user`, you might need to fetch it:
        const userProfile = await prisma.profile.findUnique({
            where: { userId: user.id }
        });

        if (!userProfile?.id) {
            return NextResponse.json({ error: 'User profile ID not found.' }, { status: 403 });
        }
        const profileId = userProfile.id;


        // 1. Fetch Active Cases
        const activeCasesCount = await prisma.claim.count({
            where: {
                profileId: profileId, 
                claim_status: {
                    in: ACTIVE_CLAIM_STATUSES, 
                },
            },
        });

        // 2. Fetch Pending Tasks (Placeholder/Mock Data)
        const pendingTasksCount = 5; // Mock data for now

        // 3. Fetch Recent Activity (Mock Data with corrected types)
        const recentActivityData: RecentActivityItem[] = [
            { 
                id: 'activity1', 
                description: `New claim submitted for an Injured Worker.`, 
                time: '2 hours ago', 
                type: 'claim' as const,
                link: '/claims' 
            },
            { 
                id: 'activity2', 
                description: `Profile for a new Injured Worker was created.`, 
                time: '5 hours ago', 
                type: 'worker' as const,
                link: '/workers' 
            },
            { 
                id: 'activity3', 
                description: `Form 18 generated for Claim #XYZ123.`, 
                time: '1 day ago', 
                type: 'form' as const,
            },
            {
                id: 'activity4',
                description: 'Calculation saved for PPD evaluation.',
                time: '2 days ago',
                type: 'other' as const,
                link: '/calculators'
            },
            {
                id: 'activity5',
                description: 'Viewed details for worker Jane Doe.',
                time: '3 days ago',
                type: 'worker' as const,
                link: '/workers' 
            }
        ].slice(0, 3); 


        const dashboardData: DashboardStats = {
            activeCases: activeCasesCount,
            pendingTasks: pendingTasksCount,
            recentActivity: recentActivityData,
        };

        return NextResponse.json(dashboardData);

    } catch (error) {
        console.error("API Error - /api/dashboard/summary:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: 'Failed to fetch dashboard summary data.', details: message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
