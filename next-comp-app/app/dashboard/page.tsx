// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/Components/ui/card';
import { Textarea } from '@/app/Components/ui/textarea';
import { Progress } from '@/app/Components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/Components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select";
import { Label } from "@/app/Components/ui/label";
import { useToast } from "@/app/Components/ui/use-toast";
import { useSession } from 'next-auth/react'; // Import useSession for client-side session access

import { PlusCircle, Settings, BookOpen, Calculator, StickyNote, FolderKanban, FileText, Download, AlertTriangle, Loader2 } from 'lucide-react';

// Dummy data imports (ensure these are correctly typed or replaced)
import { recentWorkersData as dummyRecentWorkersData, calculatorLinks as dummyCalculatorLinks } from '@/app/dashboard/data';

// Define types for fetched data
interface ClaimSummary {
    id: string; 
    wcc_file_number: string | null;
    claim_status: string | null; 
    date_of_injury?: Date | string | null; 
    injuredWorker: {
        id: string; 
        first_name: string;
        last_name: string;
    };
}

interface UserProfile { // This is the type for the data returned by /api/me/profile
    id: string; // This should be the Profile.id
    userId?: string; 
    full_name?: string | null;
}

interface RecentWorker {
    id: string | null | undefined;
    name: string | null | undefined; 
    claimNumber?: string | null | undefined; 
    lastAccessed: string | null | undefined;
}

interface CalculatorLink {
    id: string;
    name: string;
    path: string;
    premium?: boolean;
}

// Type for API error responses
interface ApiErrorData {
    error?: string;
    details?: unknown; 
}

const OPEN_CLAIM_STATUSES = ["Open", "Pending", "Active", "In Progress", "Unknown", "Accepted", "Investigating", "In Litigation", "Pending Review"];


export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { data: session, status: sessionStatus } = useSession(); // Get client-side session

    const [selectedFormType, setSelectedFormType] = useState<string>('');
    const [selectedClaimId, setSelectedClaimId] = useState<string>('');
    const [claims, setClaims] = useState<ClaimSummary[]>([]); 
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // This will hold Profile.id
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true); // True initially
    const [isLoadingClaims, setIsLoadingClaims] = useState<boolean>(false);

    const recentWorkersData: RecentWorker[] = dummyRecentWorkersData;
    const calculatorLinks: CalculatorLink[] = dummyCalculatorLinks;

    // fetchProfile now uses the profileId from the NextAuth session if available
    const fetchProfile = useCallback(async () => {
        if (sessionStatus === "loading") return; // Don't fetch if session is still loading

        if (sessionStatus === "unauthenticated") {
            toast({ title: "Authentication Required", description: "Please log in.", variant: "destructive" });
            router.push("/api/auth/signin"); // Or your login page
            setIsLoadingProfile(false);
            return;
        }

        // Use profileId from the session (ensure your NextAuth session callback adds it)
        const currentProfileId = session?.user?.profileId;

        if (!currentProfileId) {
            toast({ title: "Profile Error", description: "User profile ID not found in session.", variant: "destructive" });
            setUserProfile(null);
            setIsLoadingProfile(false);
            return;
        }
        
        // Set userProfile directly from session if it contains all needed info,
        // or fetch additional profile details if /api/me/profile provides more.
        // For this example, we'll assume session.user.profileId is the Profile.id
        // and we might not need a separate /api/me/profile call if all info is in session.
        // However, if /api/me/profile is still needed for other details:
        setIsLoadingProfile(true);
        try {
            // If your /api/me/profile uses the session on the backend, it doesn't need profileId in query
            const response = await fetch('/api/me/profile'); 
            if (!response.ok) {
                let errorPayload: ApiErrorData = { error: `Failed to fetch profile: ${response.statusText}` };
                try {
                    const parsedError: unknown = await response.json();
                    if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError) {
                        errorPayload = parsedError as ApiErrorData;
                    }
                } catch (_e) { 
                    console.warn("Failed to parse error JSON from /api/me/profile");
                }
                throw new Error(errorPayload.error || `Failed to fetch profile: ${response.statusText}`);
            }
            const responseData: unknown = await response.json();
            // Ensure the fetched profile ID matches the session's profile ID for consistency
            const fetchedProfile = responseData as UserProfile;
            if (fetchedProfile.id !== currentProfileId) {
                console.error("Session profileId and fetched profileId mismatch.");
                // Handle mismatch, perhaps by trusting the session or logging out.
                setUserProfile({ id: currentProfileId }); // Fallback to session's profileId
            } else {
                setUserProfile(fetchedProfile);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast({
                title: "Error Fetching Profile",
                description: error instanceof Error ? error.message : "Could not fetch user profile.",
                variant: "destructive",
            });
            setUserProfile(null); // Or fallback to session's profileId if appropriate
        } finally {
            setIsLoadingProfile(false);
        }
    }, [toast, session, sessionStatus, router]);

    const fetchClaims = useCallback(async (profileIdToFetch: string) => {
        // Removed mock-profile-id-replace-me check
        if (!profileIdToFetch) { 
            setClaims([]);
            setIsLoadingClaims(false);
            return;
        }
        setIsLoadingClaims(true);
        try {
            const response = await fetch(`/api/claims?profileId=${profileIdToFetch}`); 
            if (!response.ok) {
                let errorPayload: ApiErrorData = { error: `Failed to fetch claims: ${response.statusText}` };
                try {
                    const parsedError: unknown = await response.json();
                     if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError) {
                        errorPayload = parsedError as ApiErrorData;
                    }
                } catch (_e) { 
                     console.warn("Failed to parse error JSON from /api/claims");
                }
                throw new Error(errorPayload.error || `Failed to fetch claims: ${response.statusText}`);
            }
            const responseData: unknown = await response.json();
            setClaims(responseData as ClaimSummary[]);
        } catch (error) {
            console.error("Error fetching claims:", error);
            toast({
                title: "Error Fetching Claims",
                description: error instanceof Error ? error.message : "Could not fetch claims list.",
                variant: "destructive",
            });
            setClaims([]);
        } finally {
            setIsLoadingClaims(false);
        }
    }, [toast]);

    useEffect(() => {
        // Fetch profile when session status is determined
        if (sessionStatus !== "loading") {
            void fetchProfile();
        }
    }, [sessionStatus, fetchProfile]); // Depend on sessionStatus

    useEffect(() => {
        // Fetch claims once userProfile.id is available and valid
        if (userProfile?.id) { 
            void fetchClaims(userProfile.id); 
        } else if (!isLoadingProfile && !userProfile?.id && sessionStatus === "authenticated") {
            // This case means profile fetching finished, user is authenticated, but profile.id is still not set
            console.log("User is authenticated, but no valid user profile ID to fetch claims.");
            setClaims([]);
        }
    }, [userProfile?.id, isLoadingProfile, fetchClaims, sessionStatus]);


    const selectableClaimsForPdf = useMemo(() => {
        if (!claims.length) return [];
        const workersWithActiveClaims = new Set<string>();
        claims.forEach(claim => {
            if (claim.claim_status && OPEN_CLAIM_STATUSES.includes(claim.claim_status)) {
                workersWithActiveClaims.add(claim.injuredWorker.id);
            }
        });
        return claims.filter(claim => workersWithActiveClaims.has(claim.injuredWorker.id));
    }, [claims]);


    const hasPremiumAccess = () => true; 

    const handleGenerateForm = async () => {
        // Removed mock-profile-id-replace-me check
        if (!selectedFormType || !selectedClaimId || !userProfile?.id) {
            toast({
                title: "Missing Information",
                description: "Please select a form type, a valid claim, and ensure your profile is loaded.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        toast({
            title: "Generating Form...",
            description: `Preparing ${selectedFormType}. Please wait.`,
        });

        try {
            const requestBody = {
                formType: selectedFormType,
                claimId: selectedClaimId,
                profileId: userProfile.id, 
                additionalData: {} 
            };

            console.log("Sending to /api/generate-form:", requestBody);

            const response = await fetch('/api/generate-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData: unknown = await response.json();
                    if (typeof errorData === 'object' && errorData !== null) {
                        const typedErrorData = errorData as ApiErrorData;
                        let detailsString = "";
                        if (typedErrorData.details) {
                            if (typeof typedErrorData.details === 'string') {
                                detailsString = typedErrorData.details;
                            } else {
                                try {
                                    detailsString = JSON.stringify(typedErrorData.details);
                                } catch {
                                    detailsString = "Additional details present but could not be stringified.";
                                }
                            }
                        }
                        errorMsg = typedErrorData.error || detailsString || errorMsg;
                    }
                } catch { /* Ignore */ }
                throw new Error(errorMsg);
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `${selectedFormType}_${Date.now()}.pdf`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch?.[1]) filename = filenameMatch[1];
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast({ title: "Success!", description: `${filename} downloaded successfully.` });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("Error generating form:", error);
            toast({ title: "Generation Failed", description: message, variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    if (sessionStatus === "loading" || isLoadingProfile) { 
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">Loading user data...</p>
            </div>
        );
    }
    
    if (!userProfile && sessionStatus === "authenticated" && !isLoadingProfile) { 
         return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <p className="mt-4 text-lg text-destructive">Could not load user profile information.</p>
                <p className="text-sm text-muted-foreground">Your session is active, but profile details are missing. Please try refreshing or contact support.</p>
                <Button onClick={() => void fetchProfile()} className="mt-4">Try Again</Button>
            </div>
        );
    }
    // If still no userProfile after all checks (e.g. unauthenticated was handled by redirect)
    // This might be redundant if unauthenticated always redirects.
    if (!userProfile) {
        return (
             <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg text-muted-foreground">User profile not available.</p>
            </div>
        );
    }


    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Dashboard {userProfile.full_name ? `- ${userProfile.full_name}` : ''}
                </h1>
                <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Generate WCC Form
                        </CardTitle>
                        <CardDescription>Select a form and claim to generate a PDF. Only claims for workers with active cases are shown.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="formTypeSelect">Form Type</Label>
                            <Select value={selectedFormType} onValueChange={setSelectedFormType}>
                                <SelectTrigger id="formTypeSelect"><SelectValue placeholder="Select form..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SCWCC_Form21">Form 21 - Employer&apos;s Request for Hearing</SelectItem>
                                    <SelectItem value="SCWCC_Form27">Form 27 - Subpoena</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                             <Label htmlFor="claimSelectPdf">Claim (Worker with Active Cases)</Label>
                             <Select
                                value={selectedClaimId}
                                onValueChange={setSelectedClaimId}
                                disabled={isLoadingClaims || selectableClaimsForPdf.length === 0}
                             >
                                <SelectTrigger id="claimSelectPdf">
                                    <SelectValue placeholder={
                                        isLoadingClaims ? "Loading claims..." :
                                        selectableClaimsForPdf.length > 0 ? "Select claim..." : "No eligible claims"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectableClaimsForPdf.length > 0 ? (
                                        selectableClaimsForPdf.map(claim => (
                                            <SelectItem key={claim.id} value={claim.id}>
                                                {claim.wcc_file_number ? `${claim.wcc_file_number} - ` : `Claim ID: ${claim.id.substring(0,8)}... - `}
                                                {claim.injuredWorker.first_name} {claim.injuredWorker.last_name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="loading" disabled>
                                            {isLoadingClaims ? "Loading..." : "No claims for workers with active cases"}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                             </Select>
                        </div>

                        <Button
                            onClick={() => void handleGenerateForm()}
                            disabled={
                                !selectedFormType ||
                                !selectedClaimId ||
                                isGenerating ||
                                !userProfile?.id || 
                                isLoadingClaims ||
                                selectableClaimsForPdf.length === 0 
                            }
                            className="w-full"
                        >
                            {isGenerating ? (
                                <><Download className="mr-2 h-4 w-4 animate-pulse" /> Generating...</>
                            ) : (
                                <><Download className="mr-2 h-4 w-4" /> Generate PDF</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* ... other dashboard cards ... */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5" /> Overview</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-center">
                        <div><p className="text-2xl font-bold text-foreground">15</p><p className="text-xs text-muted-foreground">Active Cases</p></div>
                        <div><p className="text-2xl font-bold text-foreground">3</p><p className="text-xs text-muted-foreground">Deadlines This Week</p></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => router.push('/workers/new')}><PlusCircle className="mr-2 h-4 w-4" /> Add Injured Worker</Button>
                        <Button variant="secondary" size="sm" onClick={() => router.push('/Calculators')}><Calculator className="mr-2 h-4 w-4" /> Start Calculation</Button>
                    </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Training Progress</CardTitle><CardDescription>Your continuing education status.</CardDescription></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Current Course:</span><span className="font-medium text-foreground">Intro to AWW</span></div>
                        <Progress value={75} aria-label="Training progress for Intro to AWW at 75%" />
                        <p className="text-xs text-muted-foreground text-right">75% Complete</p>
                    </div>
                    <Button variant="secondary" size="sm" className="mt-4" onClick={() => void router.push('/training')} >View Training Library</Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>Recently accessed injured worker files.</CardDescription></CardHeader>
                  <CardContent>
                    {recentWorkersData.length > 0 ? (
                      <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Claim #</TableHead><TableHead className="text-right">Last Accessed</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {recentWorkersData.slice(0, 5).map((worker: RecentWorker) => (
                            <TableRow key={worker.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/workers/${worker.id}`)}>
                              <TableCell className="font-medium">{worker.name}</TableCell>
                              <TableCell>{worker.claimNumber ?? '-'}</TableCell>
                              <TableCell className="text-right text-muted-foreground">{worker.lastAccessed}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activity.</p>
                    )}
                      <Button variant="link" size="sm" className="mt-4 px-0" onClick={() => router.push('/workers')}>View All Workers</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Calculators</CardTitle><CardDescription>Quick access to calculation tools.</CardDescription></CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {calculatorLinks.slice(0, 4).map((calc: CalculatorLink) => (
                      <Button key={calc.id} variant="outline" size="sm" className="justify-start" onClick={() => void router.push(calc.path)} disabled={calc.premium && !hasPremiumAccess()}>
                        {calc.name}
                        {calc.premium && <span className="ml-auto text-xs font-semibold text-primary">(Premium)</span>}
                      </Button>
                    ))}
                    <Button variant="link" size="sm" className="mt-2 px-0 justify-start" onClick={() => router.push('/Calculators')}>View All Calculators</Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3">
                  <CardHeader><CardTitle className="flex items-center gap-2"><StickyNote className="h-5 w-5" /> Scratchpad</CardTitle><CardDescription>Quick notes for your current session. Not saved automatically.</CardDescription></CardHeader>
                  <CardContent><Textarea placeholder="Type your quick notes here..." className="min-h-[150px]" /></CardContent>
                </Card>
            </div>
        </div>
    );
}
