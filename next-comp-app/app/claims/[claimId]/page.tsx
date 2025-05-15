// app/claims/[claimId]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/Components/ui/card';
import { useToast } from "@/app/Components/ui/use-toast";
import { Loader2, ArrowLeft, Edit, Trash2, User, Building, FileText, AlertTriangle } from 'lucide-react'; // Added more icons
import Link from 'next/link';
import { format, isValid, parseISO } from 'date-fns';

// Define the structure of the claim data expected from the API
interface EmployerDetail {
    id: string;
    name: string | null;
    fein?: string | null; // Optional
    // Add other employer fields you might fetch
}

interface InjuredWorkerForClaim {
    id: string;
    first_name: string | null;
    last_name: string | null;
    date_of_birth: string | null; // Assuming string from API, will format
    ssn: string | null; // Masked SSN from API
}

interface ClaimFullDetail {
    id: string;
    wcc_file_number: string | null;
    carrier_file_number: string | null;
    date_of_injury: string | null; // Assuming string from API, will format
    body_parts_injured: string | null;
    claim_status: string | null;
    createdAt: string; // Assuming string from API
    updatedAt: string; // Assuming string from API
    injuredWorker: InjuredWorkerForClaim | null;
    employer: EmployerDetail | null; // If you include employer details
    // Add any other fields your API returns for a claim
    // For example:
    // type_of_injury: string | null;
    // accident_description: string | null;
}

// Helper component for displaying detail items
const DetailItem = ({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) => {
    if (value === null || value === undefined || value.trim() === '') {
        return null; // Don't render if value is not meaningful
    }
    return (
        <div className="flex flex-col">
            <dt className="text-sm font-medium text-muted-foreground flex items-center">
                {icon && <span className="mr-2">{icon}</span>}
                {label}
            </dt>
            <dd className="mt-1 text-sm text-foreground sm:mt-0">{value}</dd>
        </div>
    );
};


export default function IndividualClaimPage() {
    const router = useRouter();
    const params = useParams();
    const claimId = params.claimId as string;

    const { toast } = useToast();
    const { data: session, status: sessionStatus } = useSession();

    const [claimData, setClaimData] = useState<ClaimFullDetail | null>(null);
    const [pageStatus, setPageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    // const [isDeleting, setIsDeleting] = useState(false); // For future delete functionality

    useEffect(() => {
        if (sessionStatus === "authenticated" && session?.user?.profileId && claimId) {
            setPageStatus('loading');
            setError(null);

            const fetchClaimDetails = async () => {
                try {
                    const response = await fetch(`/api/claims/${claimId}`);
                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        throw new Error(errData.error || `Failed to fetch claim details: ${response.statusText}`);
                    }
                    const data: ClaimFullDetail = await response.json();
                    setClaimData(data);
                    setPageStatus('loaded');
                } catch (err) {
                    const message = err instanceof Error ? err.message : "An unknown error occurred.";
                    console.error("Error fetching claim details:", err);
                    setError(message);
                    setPageStatus('error');
                }
            };
            void fetchClaimDetails();
        } else if (sessionStatus === "unauthenticated") {
            toast({ title: "Authentication Required", description: "Please log in." });
            router.push("/login");
        } else if (sessionStatus === "authenticated" && !session?.user?.profileId) {
            toast({ title: "Profile Error", description: "User profile not found.", variant: "destructive" });
            setError("User profile not found. Cannot load claim.");
            setPageStatus('error');
        }
    }, [sessionStatus, session?.user?.profileId, claimId, router, toast]);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'MM/dd/yyyy') : 'Invalid Date';
    };
    
    // Placeholder for delete functionality
    // const handleDeleteClaim = async () => { /* ... */ };

    if (pageStatus === 'loading') {
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">
                    {sessionStatus === "loading" ? "Authenticating..." : "Loading claim details..."}
                </p>
            </div>
        );
    }

    if (pageStatus === 'error' || !claimData) {
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center">
                <Card className="w-full max-w-lg bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center text-destructive">
                            <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Claim
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive-foreground">{error || "Claim data could not be loaded or access was denied."}</p>
                        <Button variant="outline" onClick={() => router.back()} className="mt-4">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const worker = claimData.injuredWorker;
    const employer = claimData.employer;

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
            <div className="mb-6 flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {/* Placeholder for Edit/Delete buttons */}
                <div className="space-x-2">
                    {/* <Button variant="outline" size="sm" onClick={() => router.push(`/claims/${claimData.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Claim
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDeleteClaim} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete
                    </Button> */}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">
                        Claim Details: {claimData.wcc_file_number || claimData.carrier_file_number || `ID: ${claimData.id.substring(0,8)}...`}
                    </CardTitle>
                    <CardDescription>
                        Filed on: {formatDate(claimData.createdAt)} | Last updated: {formatDate(claimData.updatedAt)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <section>
                        <h3 className="text-lg font-medium text-foreground mb-3 border-b pb-2">General Information</h3>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                            <DetailItem label="WCC File Number" value={claimData.wcc_file_number} icon={<FileText size={16} />} />
                            <DetailItem label="Carrier File Number" value={claimData.carrier_file_number} icon={<FileText size={16} />} />
                            <DetailItem label="Date of Injury" value={formatDate(claimData.date_of_injury)} />
                            <DetailItem label="Claim Status" value={claimData.claim_status} />
                            <DetailItem label="Body Part(s) Injured" value={claimData.body_parts_injured} />
                            {/* Add more general claim fields here */}
                        </dl>
                    </section>

                    {worker && (
                        <section>
                            <h3 className="text-lg font-medium text-foreground mb-3 border-b pb-2">Injured Worker</h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <DetailItem 
                                    label="Name" 
                                    value={`${worker.first_name || ''} ${worker.last_name || ''}`.trim()} 
                                    icon={<User size={16} />} 
                                />
                                <DetailItem label="Date of Birth" value={formatDate(worker.date_of_birth)} />
                                <DetailItem label="SSN (Masked)" value={worker.ssn} /> 
                                {/* Link to worker detail page */}
                                <div className="sm:col-span-2">
                                     <Button variant="link" size="sm" asChild className="p-0 h-auto">
                                        <Link href={`/workers/${worker.id}`}>View Full Worker Details</Link>
                                    </Button>
                                </div>
                            </dl>
                        </section>
                    )}

                    {employer && (
                        <section>
                            <h3 className="text-lg font-medium text-foreground mb-3 border-b pb-2">Employer (at time of injury)</h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <DetailItem label="Employer Name" value={employer.name} icon={<Building size={16} />} />
                                <DetailItem label="FEIN" value={employer.fein} />
                                {/* Add more employer details if available and needed */}
                            </dl>
                        </section>
                    )}
                </CardContent>
                <CardFooter>
                    {/* Could add actions like "Generate Form for this Claim" if applicable */}
                </CardFooter>
            </Card>
        </div>
    );
}
