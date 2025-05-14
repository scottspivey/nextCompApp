// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/Components/ui/card';
import { Textarea } from '@/app/Components/ui/textarea';
import { Progress } from '@/app/Components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/Components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select";
import { Label } from "@/app/Components/ui/label";
import { useToast } from "@/app/Components/ui/use-toast";

import { PlusCircle, Settings, BookOpen, Calculator, StickyNote, FolderKanban, FileText, Download, AlertTriangle, Loader2 } from 'lucide-react';

// Dummy data imports (ensure these are correctly typed or replaced)
import { recentWorkersData as dummyRecentWorkersData, calculatorLinks as dummyCalculatorLinks } from '@/app/dashboard/data';

// Define types for fetched data
interface ClaimSummary {
    id: string; 
    wcc_file_number: string | null;
    date_of_injury?: Date | string | null; 
    injuredWorker: {
        first_name: string;
        last_name: string;
    };
}

interface UserProfile {
    id: string; 
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


export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [selectedFormType, setSelectedFormType] = useState<string>('');
    const [selectedClaimId, setSelectedClaimId] = useState<string>('');
    const [claims, setClaims] = useState<ClaimSummary[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
    const [isLoadingClaims, setIsLoadingClaims] = useState<boolean>(false);

    const recentWorkersData: RecentWorker[] = dummyRecentWorkersData;
    const calculatorLinks: CalculatorLink[] = dummyCalculatorLinks;


    const fetchProfile = useCallback(async () => {
        setIsLoadingProfile(true);
        try {
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
            setUserProfile(responseData as UserProfile);
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast({
                title: "Error Fetching Profile",
                description: error instanceof Error ? error.message : "Could not fetch user profile.",
                variant: "destructive",
            });
            setUserProfile(null);
        } finally {
            setIsLoadingProfile(false);
        }
    }, [toast]);

    const fetchClaims = useCallback(async (profileId: string) => {
        if (!profileId || profileId === "mock-profile-id-replace-me") { 
            setClaims([]);
            setIsLoadingClaims(false);
            return;
        }
        setIsLoadingClaims(true);
        try {
            const response = await fetch(`/api/claims?profileId=${profileId}`);
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
        void fetchProfile(); 
    }, [fetchProfile]);

    useEffect(() => {
        if (userProfile?.id && userProfile.id !== "mock-profile-id-replace-me") { 
            void fetchClaims(userProfile.id); 
        } else if (!isLoadingProfile && !userProfile?.id) {
            console.log("No valid user profile ID to fetch claims.");
            setClaims([]);
        }
    }, [userProfile?.id, isLoadingProfile, fetchClaims]);

    const hasPremiumAccess = () => true; 

    const handleGenerateForm = async () => {
        if (!selectedFormType || !selectedClaimId || !userProfile?.id || userProfile.id === "mock-profile-id-replace-me") {
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
                } catch {
                    // Ignore if response is not JSON
                }
                throw new Error(errorMsg);
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `${selectedFormType}_${Date.now()}.pdf`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch?.[1]) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast({
                title: "Success!",
                description: `${filename} downloaded successfully.`,
            });

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("Error generating form:", error);
            toast({
                title: "Generation Failed",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoadingProfile) { 
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">Loading user profile...</p>
            </div>
        );
    }
    
    if (!userProfile && !isLoadingProfile) { 
         return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <p className="mt-4 text-lg text-destructive">Could not load user profile.</p>
                <p className="text-sm text-muted-foreground">Please try refreshing the page or contact support.</p>
                <Button onClick={() => void fetchProfile()} className="mt-4">Try Again</Button>
            </div>
        );
    }


    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Dashboard
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
                        <CardDescription>Select a form and claim to generate a PDF.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="formTypeSelect">Form Type</Label>
                            <Select value={selectedFormType} onValueChange={setSelectedFormType}>
                                <SelectTrigger id="formTypeSelect">
                                    <SelectValue placeholder="Select form..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SCWCC_Form21">Form 21 - Employer&apos;s Request for Hearing</SelectItem>
                                    <SelectItem value="SCWCC_Form27">Form 27 - Subpoena</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                             <Label htmlFor="claimSelect">Claim</Label>
                             <Select
                                value={selectedClaimId}
                                onValueChange={setSelectedClaimId}
                                disabled={isLoadingClaims || claims.length === 0}
                             >
                                <SelectTrigger id="claimSelect">
                                    <SelectValue placeholder={
                                        isLoadingClaims ? "Loading claims..." :
                                        claims.length > 0 ? "Select claim..." : "No claims found"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {claims.length > 0 ? (
                                        claims.map(claim => (
                                            <SelectItem key={claim.id} value={claim.id}>
                                                {claim.wcc_file_number ? `${claim.wcc_file_number} - ` : `Claim ID: ${claim.id.substring(0,8)}... - `}
                                                {claim.injuredWorker.first_name} {claim.injuredWorker.last_name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="loading" disabled>
                                            {isLoadingClaims ? "Loading..." : "No claims available for this profile"}
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
                                userProfile.id === "mock-profile-id-replace-me" || 
                                isLoadingClaims
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
                    <Button variant="secondary" size="sm" className="mt-4" onClick={() => void router.push('/training')} >View Training Library</Button> {/* Fixed line 338 */}
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
