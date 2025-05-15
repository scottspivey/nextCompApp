// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/Components/ui/button'; // Assuming this path is correct
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/Components/ui/card'; // Assuming this path is correct
import { Avatar, AvatarFallback, AvatarImage } from "@/app/Components/ui/avatar"; // Assuming this path is correct
import { Progress } from "@/app/Components/ui/progress"; // Assuming this path is correct
import { 
    Users,
    UserPlus, 
    Calculator, 
    Briefcase, 
    FileText, 
    ClipboardList, 
    FilePlus2, // For "Add a Claim" via workers list
    Settings, 
    Bell, 
    HelpCircle,
    BarChart3, // For Stats/Reports
    DollarSign, // For Subscription/Billing
    LogOut,
    Loader2, // For Loading Spinner
    UserCircle, // For Profile
    ShieldCheck, // For Security/Privacy
    BookOpen // For Helpful Resources
} from 'lucide-react';
import { signOut } from "next-auth/react";
import type { AppUser } from '@/types/next-auth'; // Ensure this path is correct

// Define types for dashboard data - adjust as per your actual data structure
interface UserProfile {
    full_name?: string | null;
    email?: string | null;
    role?: string | null;
    firm_name?: string | null;
    profileId?: string | null; // Added from AppUser
    subscriptionStatus?: string | null; // Added from AppUser
    image?: string | null; // From NextAuth user
}

interface DashboardStats {
    activeCases: number;
    pendingTasks: number;
    recentActivity: Array<{ id: string; description: string; time: string; type: 'claim' | 'worker' | 'form' }>;
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
            {/* Description text is hidden on extra-small screens, visible from 'sm' breakpoint upwards */}
            <p className="hidden sm:block text-xs text-muted-foreground group-hover:text-foreground/80">{description}</p>
        </Button>
    </Link>
);


export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/login');
        } else if (status === "authenticated" && session?.user) {
            const typedUser = session.user as AppUser; // Cast to your AppUser type
            
            setUserProfile({
                full_name: typedUser.name, 
                email: typedUser.email,
                role: typedUser.role, 
                profileId: typedUser.profileId, 
                subscriptionStatus: typedUser.subscriptionStatus, 
                image: typedUser.image, 
            });
            setIsLoadingProfile(false); 

            // Mock stats - TODO: Replace with actual API calls
            setDashboardStats({
                activeCases: 12,
                pendingTasks: 5,
                recentActivity: [
                    { id: '1', description: 'New claim filed for John Doe', time: '2 hours ago', type: 'claim' },
                    { id: '2', description: 'Jane Smith worker profile updated', time: '5 hours ago', type: 'worker' },
                    { id: '3', description: 'Form 20 generated for claim #12345', time: '1 day ago', type: 'form' },
                ],
            });
            setIsLoadingStats(false);
        }
    }, [status, session, router]);

    if (status === "loading" || isLoadingProfile || isLoadingStats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!session || !userProfile) {
        return <p className="text-center mt-10">Could not load user data.</p>;
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
                        Welcome back, {userProfile.full_name || userProfile.email || 'User'}!
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
                                    <ActionButton icon={UserPlus} label="Add New Worker" description="Create a profile for an injured worker." href="/workers/new" />
                                    <ActionButton icon={FilePlus2} label="Add a Claim" description="Start a new claim for an existing worker." href="/claims/new" />
                                    <ActionButton icon={Users} label="View Workers" description="See and manage all injured workers." href="/workers" />
                                    <ActionButton icon={ClipboardList} label="View Claims" description="Access and review all claims." href="/claims" />
                                    <ActionButton icon={FileText} label="Generate Forms" description="Create and fill SCWCC forms." href="/tools/generate-form" />
                                    <ActionButton icon={Calculator} label="Calculators" description="Access various compensation calculators." href="/Calculators" />
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
                                    {dashboardStats && dashboardStats.recentActivity.length > 0 ? (
                                        <ul className="space-y-4">
                                            {dashboardStats.recentActivity.map(activity => (
                                                <li key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-md transition-colors">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {activity.type === 'claim' && <ClipboardList className="w-5 h-5 text-blue-500" />}
                                                        {activity.type === 'worker' && <Users className="w-5 h-5 text-green-500" />}
                                                        {activity.type === 'form' && <FileText className="w-5 h-5 text-purple-500" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{activity.description}</p>
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
                                    <AvatarImage src={userProfile.image || undefined} alt={userProfile.full_name || 'User'} />
                                    <AvatarFallback>{getInitials(userProfile.full_name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl">{userProfile.full_name || 'N/A'}</CardTitle>
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
                                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive/90" onClick={() => signOut({ callbackUrl: '/login' })}>
                                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>At a Glance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Active Cases</span>
                                        <span className="font-semibold">{dashboardStats?.activeCases ?? 0}</span>
                                    </div>
                                    <Progress value={(dashboardStats?.activeCases ?? 0) * 5} className="h-2" /> 
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Pending Tasks</span>
                                        <span className="font-semibold">{dashboardStats?.pendingTasks ?? 0}</span>
                                    </div>
                                    <Progress value={(dashboardStats?.pendingTasks ?? 0) * 10} className="h-2" />
                                </div>
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
