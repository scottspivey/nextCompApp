// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/Components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/app/Components/ui/avatar";
import { Progress } from "@/app/Components/ui/progress";
import { 
    Users,
    UserPlus, 
    Calculator, 
    FileText, 
    ClipboardList, 
    FilePlus2, 
    Settings, 
    HelpCircle,
    BarChart3, 
    LogOut,
    Loader2, 
    UserCircle, 
    ShieldCheck, 
    BookOpen,
    AlertTriangle
} from 'lucide-react';

// Define types for dashboard data
interface UserProfile {
    name?: string | null; // Changed from full_name to align with session.user.name
    email?: string | null;
    role?: string | null; // Assuming AppUser has role
    firm_name?: string | null; // This would need to be populated from session or a profile API call
    profileId?: string | null; 
    subscriptionStatus?: string | null; // Assuming AppUser has subscriptionStatus
    image?: string | null; 
}

interface RecentActivityItem {
  id: string;
  description: string;
  time: string; // Consider using Date type and formatting on client
  type: 'claim' | 'worker' | 'form' | 'other'; // Added 'other' for flexibility
  link?: string; // Optional link for the activity item
}

interface DashboardStats {
    activeCases: number;
    pendingTasks: number;
    recentActivity: RecentActivityItem[];
}

interface ApiErrorData {
    error?: string;
    details?: unknown; 
}


// ActionButton component
interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    description: string;
    href: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, description, href }) => (
    <Link href={href} passHref>
        <Button variant="outline" className="w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6 space-y-2 text-center hover:bg-accent hover:text-accent-foreground transition-colors duration-150 ease-in-out group">
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 mb-1 sm:mb-2 text-primary group-hover:text-primary-focus transition-colors" />
            <span className="text-sm font-semibold text-foreground group-hover:text-foreground">{label}</span>
            <p className="hidden sm:block text-xs text-muted-foreground group-hover:text-foreground/80">{description}</p>
        </Button>
    </Link>
);


export default function DashboardPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        setIsLoadingStats(true);
        setError(null);
        try {
            // This is the new API call for dashboard stats
            const response = await fetch('/api/dashboard/summary'); // Ensure this API route exists
            if (!response.ok) {
                let errData: ApiErrorData = { error: "Failed to parse error response" };
                try {
                    const parsedError: unknown = await response.json();
                    if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError && typeof (parsedError as ApiErrorData).error === 'string') {
                        errData = parsedError as ApiErrorData;
                    }
                } catch (parseError) {
                    console.warn("Failed to parse error JSON from API (dashboard/summary):", parseError);
                    errData.error = response.statusText || "Failed to fetch dashboard data";
                }
                throw new Error(errData.error);
            }
            const data: DashboardStats = await response.json() as DashboardStats;
            setDashboardStats(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred while fetching dashboard data.";
            console.error("Error fetching dashboard data:", err);
            setError(message); // Set a general error state for the page
            // Optionally, show a toast for this specific error
            // toast({ title: "Error Fetching Dashboard Data", description: message, variant: "destructive" });
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push('/login');
        } else if (sessionStatus === "authenticated" && session?.user) {
            // Assuming AppUser is the augmented type from next-auth.d.ts
            const typedUser = session.user; 
            
            setUserProfile({
                name: typedUser.name, 
                email: typedUser.email,
                // These custom fields must be correctly populated in your AppUser type via session/jwt callbacks
                role: typedUser.role, 
                profileId: typedUser.profileId, 
                subscriptionStatus: typedUser.subscriptionStatus, 
                image: typedUser.image,
                // firm_name would need to be added to AppUser or fetched separately
                // firm_name: typedUser.firm_name 
            });
            setIsLoadingProfile(false); 

            // Fetch dashboard stats once authenticated
            void fetchDashboardData();
        }
    }, [sessionStatus, session, router, fetchDashboardData]);

    if (sessionStatus === "loading" || isLoadingProfile || (isLoadingStats && !dashboardStats) ) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!session || !userProfile) {
        // This case handles if session is somehow null after loading, or profile couldn't be set
        // It might also be hit if the user is unauthenticated and router.push hasn't completed.
        return (
            <div className="flex items-center justify-center min-h-screen">
                 <p className="text-center mt-10">Session not available or user profile could not be loaded. Redirecting...</p>
            </div>
        );
    }
    
    if (error && !dashboardStats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center text-destructive">
                            <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Dashboard
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive-foreground">{error}</p>
                        <Button variant="outline" onClick={() => void fetchDashboardData()} className="mt-4">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }


    const getInitials = (name?: string | null) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <header className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back, {userProfile.name || userProfile.email || 'User'}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here’s what’s happening with your cases today.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <section>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                    <CardDescription>Get started with common tasks.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <ActionButton icon={Users} label="View Workers" description="See and manage all injured workers." href="/workers" />
                                    <ActionButton icon={UserPlus} label="Add New Worker" description="Create a profile for an injured worker." href="/workers/new" />
                                    <ActionButton icon={ClipboardList} label="View Claims" description="Access and review all claims." href="/claims" />
                                    <ActionButton icon={FilePlus2} label="Add new Claim" description="Start a new claim for an existing worker." href="/claims/new" />
                                    <ActionButton icon={FileText} label="Generate Forms" description="Create and fill SCWCC forms." href="/tools/generate-form" />
                                    <ActionButton icon={Calculator} label="Calculators" description="Access various calculators." href="/Calculators" />
                                </CardContent>
                            </Card>
                        </section>

                        <section>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Latest updates on your cases and actions.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingStats && !dashboardStats?.recentActivity?.length ? (
                                        <div className="flex justify-center items-center py-6">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <p className="ml-2 text-muted-foreground">Loading activity...</p>
                                        </div>
                                    ) : dashboardStats && dashboardStats.recentActivity.length > 0 ? (
                                        <ul className="space-y-4">
                                            {dashboardStats.recentActivity.map(activity => (
                                                <li key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-md transition-colors">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {activity.type === 'claim' && <ClipboardList className="w-5 h-5 text-blue-500" />}
                                                        {activity.type === 'worker' && <Users className="w-5 h-5 text-green-500" />}
                                                        {activity.type === 'form' && <FileText className="w-5 h-5 text-purple-500" />}
                                                        {activity.type === 'other' && <BarChart3 className="w-5 h-5 text-gray-500" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {activity.link ? (
                                                                <Link href={activity.link} className="hover:underline">{activity.description}</Link>
                                                            ) : (
                                                                activity.description
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No recent activity to display.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={userProfile.image || undefined} alt={userProfile.name || 'User'} />
                                    <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl">{userProfile.name || 'N/A'}</CardTitle>
                                    <CardDescription>{userProfile.email || 'N/A'}</CardDescription>
                                    <p className="text-xs text-muted-foreground mt-1">Role: {userProfile.role || 'User'}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/dashboard/profile" passHref>
                                    <Button variant="outline" className="w-full justify-start"><UserCircle className="mr-2 h-4 w-4" /> View/Edit Profile</Button>
                                </Link>
                                <Link href="/dashboard/settings" passHref>
                                    <Button variant="outline" className="w-full justify-start"><Settings className="mr-2 h-4 w-4" /> Account Settings</Button>
                                </Link>
                                {userProfile.subscriptionStatus && (
                                     <p className="text-xs text-center text-muted-foreground pt-2">Subscription: <span className="font-semibold text-primary">{userProfile.subscriptionStatus}</span></p>
                                )}
                                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive/90" onClick={() => void signOut({ callbackUrl: '/login' })}>
                                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>At a Glance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoadingStats && (!dashboardStats?.activeCases && !dashboardStats?.pendingTasks) ? (
                                    <div className="flex justify-center items-center py-6">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <p className="ml-2 text-muted-foreground">Loading stats...</p>
                                    </div>
                                ) : dashboardStats ? (
                                    <>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-muted-foreground">Active Cases</span>
                                                <span className="font-semibold">{dashboardStats.activeCases}</span>
                                            </div>
                                            <Progress value={dashboardStats.activeCases * 5} className="h-2" /> 
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-muted-foreground">Pending Tasks</span>
                                                <span className="font-semibold">{dashboardStats.pendingTasks}</span>
                                            </div>
                                            <Progress value={dashboardStats.pendingTasks * 10} className="h-2" />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Statistics are currently unavailable.</p>
                                )}
                                <Link href="/dashboard/reports" passHref>
                                    <Button variant="secondary" className="w-full mt-2"><BarChart3 className="mr-2 h-4 w-4" /> View Detailed Reports</Button>
                                </Link>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <Link href="/Helpful%20Resources" passHref><Button variant="link" className="p-0 h-auto justify-start text-primary"><BookOpen className="mr-2 h-4 w-4" /> Helpful Resources</Button></Link>
                                <Link href="/faq" passHref><Button variant="link" className="p-0 h-auto justify-start text-primary"><HelpCircle className="mr-2 h-4 w-4" /> FAQ & Support</Button></Link>
                                <Link href="/privacy" passHref><Button variant="link" className="p-0 h-auto justify-start text-primary"><ShieldCheck className="mr-2 h-4 w-4" /> Privacy Policy</Button></Link>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}

