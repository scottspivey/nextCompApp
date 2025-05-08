// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useRouter } from 'next/navigation';
import { Button } from '@/app/Components/ui/button'; // Adjust path
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/Components/ui/card'; // Adjust path
import { Textarea } from '@/app/Components/ui/textarea'; // Adjust path
import { Progress } from '@/app/Components/ui/progress'; // Adjust path
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/Components/ui/table"; // Adjust path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select"; // Import Select
import { Label } from "@/app/Components/ui/label"; // Import Label
import { useToast } from "@/app/Components/ui/use-toast"; // Import useToast for feedback

import { PlusCircle, Settings, BookOpen, Calculator, StickyNote, FolderKanban, FileText, Download } from 'lucide-react'; // Added more icons

// Import dummy data (adjust path as needed) - Keep for now, replace with real fetching
import { recentWorkersData, calculatorLinks } from '@/app/dashboard/data';

// Define types for fetched data (adjust based on your actual API/fetching)
interface ClaimSummary {
    id: string;
    wcc_file_number: string | null;
    injuredWorker: {
        first_name: string;
        last_name: string;
    };
}

interface UserProfile {
    id: string;
    // Add other profile fields if needed
}

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast(); // Initialize toast

    // State for Form Generation
    const [selectedFormType, setSelectedFormType] = useState<string>('');
    const [selectedClaimId, setSelectedClaimId] = useState<string>('');
    const [claims, setClaims] = useState<ClaimSummary[]>([]); // State to hold fetched claims
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // State for user profile
    const [isGenerating, setIsGenerating] = useState<boolean>(false); // Loading state for generation button

    // --- Data Fetching ---
    // Use useCallback for fetch functions to prevent recreation on every render
    const fetchProfile = useCallback(async () => {
        try {
            // Replace with your actual API call to get the logged-in user's profile ID
            // Example: const response = await fetch('/api/user/profile');
            // const data = await response.json();
            // setUserProfile(data);

            // --- MOCK PROFILE DATA ---
            setUserProfile({ id: "mock-profile-id-replace-me" }); // Replace with actual fetched profile ID
            // --- END MOCK PROFILE DATA ---

        } catch (error) {
            console.error("Error fetching profile:", error);
            toast({
                title: "Error",
                description: "Could not fetch user profile.",
                variant: "destructive",
            });
        }
    }, [toast]); // Dependency array includes toast

    const fetchClaims = useCallback(async (profileId: string) => { // Keep profileId param here
        try {
            // Replace with your actual API call to get claims for the profileId
            // Example: const response = await fetch(`/api/claims?profileId=${profileId}`);
            // const data = await response.json();
            // setClaims(data);

            // --- MOCK CLAIMS DATA ---
            const mockClaims: ClaimSummary[] = [
                { id: "claim-1", wcc_file_number: "WCC-12345", injuredWorker: { first_name: "John", last_name: "Doe" } },
                { id: "claim-2", wcc_file_number: "WCC-67890", injuredWorker: { first_name: "Jane", last_name: "Smith" } },
                { id: "claim-3", wcc_file_number: null, injuredWorker: { first_name: "Alice", last_name: "Brown" } },
            ];
            setClaims(mockClaims); // Replace with actual fetched claims
             // --- END MOCK CLAIMS DATA ---

        } catch (error) {
            console.error("Error fetching claims:", error);
             toast({
                title: "Error",
                description: "Could not fetch claims list.",
                variant: "destructive",
            });
        }
    }, [toast]); // Dependency array includes toast

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]); // Fetch profile on mount

    useEffect(() => {
        // Fetch claims only after profile is loaded and profileId exists
        if (userProfile?.id) {
            fetchClaims(userProfile.id);
        }
    }, [userProfile?.id, fetchClaims]); // Rerun effect if profile ID or fetchClaims changes


    // Placeholder function for premium checks
    const hasPremiumAccess = () => true; // Replace with actual logic

    // --- Form Generation Handler ---
    const handleGenerateForm = async () => {
        if (!selectedFormType || !selectedClaimId || !userProfile?.id) {
            toast({
                title: "Missing Information",
                description: "Please select a form type and a claim.",
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
                additionalData: {
                    // Add necessary additionalData here based on UI inputs
                }
            };

            const response = await fetch('/api/generate-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                // Try to parse error message from backend
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorData.details || errorMsg;
                } catch (parseError) {
                    // Ignore if response is not JSON
                }
                throw new Error(errorMsg);
            }

            // Handle the PDF blob response
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `${selectedFormType}_${Date.now()}.pdf`; // Default filename

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }

            // Create a link and trigger download
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

        } catch (error: unknown) { // Use unknown type for error
            const message = error instanceof Error ? error.message : String(error); // Safely get error message
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

            {/* Dashboard Grid - Adjusted layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* --- NEW: Generate Form Widget --- */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Generate WCC Form
                        </CardTitle>
                        <CardDescription>Select a form and claim to generate a PDF.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Form Type Selection */}
                        <div className="space-y-1">
                            <Label htmlFor="formTypeSelect">Form Type</Label>
                            <Select
                                value={selectedFormType}
                                onValueChange={setSelectedFormType}
                            >
                                <SelectTrigger id="formTypeSelect">
                                    <SelectValue placeholder="Select form..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SCWCC_Form21">Form 21 - Employer&apos;s Request for Hearing</SelectItem>
                                    <SelectItem value="SCWCC_Form27">Form 27 - Subpoena</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Claim Selection */}
                        <div className="space-y-1">
                             <Label htmlFor="claimSelect">Claim</Label>
                             <Select
                                value={selectedClaimId}
                                onValueChange={setSelectedClaimId}
                                disabled={claims.length === 0}
                             >
                                <SelectTrigger id="claimSelect">
                                     {/* Corrected: Use &apos; for apostrophe */}
                                    <SelectValue placeholder={claims.length > 0 ? "Select claim..." : "Loading claims..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {claims.length > 0 ? (
                                        claims.map(claim => (
                                            <SelectItem key={claim.id} value={claim.id}>
                                                {claim.wcc_file_number ? `${claim.wcc_file_number} - ` : ''}
                                                {claim.injuredWorker.first_name} {claim.injuredWorker.last_name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="loading" disabled>No claims found or loading...</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerateForm}
                            disabled={!selectedFormType || !selectedClaimId || isGenerating || !userProfile?.id}
                            className="w-full"
                        >
                            {isGenerating ? (
                                <>
                                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Generate PDF
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
                {/* --- END: Generate Form Widget --- */}


                {/* Quick Stats Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderKanban className="h-5 w-5" /> Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-foreground">15</p>
                            <p className="text-xs text-muted-foreground">Active Cases</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">3</p>
                            <p className="text-xs text-muted-foreground">Deadlines This Week</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => router.push('/workers/new')}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Injured Worker
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => router.push('/Calculators')}>
                            <Calculator className="mr-2 h-4 w-4" /> Start Calculation
                        </Button>
                    </CardContent>
                </Card>

                {/* Training Progress Widget */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" /> Training Progress
                    </CardTitle>
                    <CardDescription>Your continuing education status.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-2">
                          <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Current Course:</span>
                              <span className="font-medium text-foreground">Intro to AWW</span>
                          </div>
                          <Progress value={75} aria-label="Training progress for Intro to AWW at 75%" />
                          <p className="text-xs text-muted-foreground text-right">75% Complete</p>
                      </div>
                    <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.push('/training')} >
                        View Training Library
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Workers Widget */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Recently accessed injured worker files.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentWorkersData.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Claim #</TableHead>
                            <TableHead className="text-right">Last Accessed</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentWorkersData.slice(0, 5).map((worker) => (
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

                {/* Calculator Access Widget */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" /> Calculators
                    </CardTitle>
                    <CardDescription>Quick access to calculation tools.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                      {calculatorLinks.slice(0, 4).map(calc => (
                        <Button
                            key={calc.id}
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => router.push(calc.path)}
                            disabled={calc.premium && !hasPremiumAccess()}
                        >
                          {calc.name}
                          {calc.premium && <span className="ml-auto text-xs font-semibold text-primary">(Premium)</span>}
                        </Button>
                      ))}
                      <Button variant="link" size="sm" className="mt-2 px-0 justify-start" onClick={() => router.push('/Calculators')}>View All Calculators</Button>
                  </CardContent>
                </Card>

                {/* Notepad Widget */}
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <StickyNote className="h-5 w-5" /> Scratchpad
                      </CardTitle>
                      <CardDescription>Quick notes for your current session. Not saved automatically.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea placeholder="Type your quick notes here..." className="min-h-[150px]" />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
