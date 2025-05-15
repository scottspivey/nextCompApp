// app/claims/[claimId]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/Components/ui/card';
import { useToast } from "@/app/Components/ui/use-toast";
import { 
    Loader2, ArrowLeft, Edit, Trash2, User, Building, FileText, AlertTriangle,
    CalendarDays, Briefcase, MessageSquare, Phone, Mail, DollarSign, Percent, Clock, MapPin, ShieldQuestion, BookUser 
} from 'lucide-react';
import Link from 'next/link';
import { format, isValid, parseISO } from 'date-fns';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/app/Components/ui/alert-dialog";

// Define the structure of the claim data expected from the API
interface EmployerDetail {
    id: string;
    name: string | null;
    fein?: string | null;
}

interface InjuredWorkerForClaim {
    id: string;
    first_name: string | null;
    last_name: string | null;
    date_of_birth: string | null; 
    ssn: string | null; // Masked
}

interface ClaimFullDetail {
    id: string;
    wcc_file_number: string | null;
    carrier_file_number: string | null;
    date_of_injury: string; 
    time_of_injury: string | null;
    place_of_injury: string | null;
    accident_description: string | null;
    part_of_body_injured: string | null;
    nature_of_injury: string | null;
    cause_of_injury: string | null;
    notice_given_date: string | null;
    average_weekly_wage: number | null; 
    compensation_rate: number | null;   
    date_disability_began: string | null;
    date_returned_to_work: string | null;
    mmi_date: string | null;
    initial_treatment_desc: string | null;
    current_work_status: string | null;
    permanent_impairment_rating: number | null; 
    claimant_attorney_name: string | null;
    claimant_attorney_firm: string | null;
    claimant_attorney_address: string | null;
    claimant_attorney_phone: string | null;
    claimant_attorney_email: string | null;
    claim_status: string | null;
    createdAt: string; 
    updatedAt: string; 
    injuredWorker: InjuredWorkerForClaim | null;
    employer: EmployerDetail | null;
}

interface ApiErrorData {
    error?: string;
    details?: unknown; 
}

// Updated DetailItemProps to include className
interface DetailItemProps {
    label: string;
    value: string | number | null | undefined;
    icon?: React.ReactNode;
    isLongText?: boolean;
    isCurrency?: boolean;
    isPercent?: boolean;
    className?: string; // Added className prop
}

const DetailItem: React.FC<DetailItemProps> = ({ 
    label, value, icon, isLongText = false, isCurrency = false, isPercent = false, className 
}) => {
    let displayValue = value;
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        displayValue = 'N/A';
    } else {
        if (isCurrency && typeof value === 'number') {
            displayValue = `$${value.toFixed(2)}`;
        } else if (isPercent && typeof value === 'number') {
            displayValue = `${value}%`;
        }
    }

    // Combine internal logic for col-span with externally provided className
    const combinedClassName = `flex flex-col ${isLongText && !className?.includes('col-span') ? 'sm:col-span-2' : ''} ${className || ''}`.trim();

    return (
        <div className={combinedClassName}>
            <dt className="text-sm font-medium text-muted-foreground flex items-center">
                {icon && <span className="mr-2 h-4 w-4 flex-shrink-0">{icon}</span>}
                {label}
            </dt>
            <dd className={`mt-1 text-sm text-foreground sm:mt-0 ${isLongText ? 'whitespace-pre-wrap break-words' : 'truncate'}`} title={typeof displayValue === 'string' ? displayValue : String(displayValue)}>
                {displayValue}
            </dd>
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
    
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (sessionStatus === "authenticated" && session?.user?.profileId && claimId) {
            setPageStatus('loading');
            setError(null);
            const fetchClaimDetails = async () => {
                try {
                    const response = await fetch(`/api/claims/${claimId}`);
                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({error: "Failed to parse error response"}));
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
            // toast({ title: "Authentication Required", description: "Please log in." }); // Toast can be annoying on redirect
            router.push("/login");
        } else if (sessionStatus === "authenticated" && !session?.user?.profileId) {
            toast({ title: "Profile Error", description: "User profile not found.", variant: "destructive" });
            setError("User profile not found. Cannot load claim.");
            setPageStatus('error');
        }
    }, [sessionStatus, session?.user?.profileId, claimId, router, toast]);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return null; 
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'MM/dd/yyyy') : 'Invalid Date';
    };
    
    const formatPhoneNumber = (phone: string | null | undefined) => {
        if (!phone) return null;
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
        return phone; 
    };

    const openDeleteConfirmation = () => {
        if (claimData) { // Ensure claimData is loaded before trying to delete
            setShowDeleteDialog(true);
        } else {
            toast({ title: "Error", description: "Claim data not available for deletion.", variant: "destructive"});
        }
    };

    const confirmDeleteClaim = async () => {
        if (!claimData) return; // Should not happen if openDeleteConfirmation checks claimData
        setIsDeleting(true);
        try {
          const response = await fetch(`/api/claims/${claimData.id}`, { method: 'DELETE' });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Deletion failed" }));
            throw new Error(errorData.error || `Failed to delete claim: ${response.statusText}`);
          }
          toast({ title: "Success!", description: `Claim deleted successfully.`});
          router.push('/claims'); 
        } catch (err) {
          const message = err instanceof Error ? err.message : "An unknown error occurred.";
          toast({ title: "Deletion Failed", description: message, variant: "destructive" });
        } finally {
          setIsDeleting(false);
          setShowDeleteDialog(false);
        }
    };

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

    // This guard ensures claimData is not null for the rest of the render.
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

    // From this point onwards, claimData is guaranteed to be non-null.
    const worker = claimData.injuredWorker;
    const employer = claimData.employer;

    return (
        <>
            <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
                <div className="mb-6 flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/claims/${claimData.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Claim
                        </Button>
                        <Button variant="destructive" size="sm" onClick={openDeleteConfirmation} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Delete
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">
                            Claim: {claimData.wcc_file_number || claimData.carrier_file_number || `ID: ...${claimData.id.substring(0,8)}`}
                        </CardTitle>
                        <CardDescription>
                            Filed on: {formatDate(claimData.createdAt)} | Last updated: {formatDate(claimData.updatedAt)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 divide-y divide-border">
                        
                        <section className="pt-6">
                            <h3 className="text-xl font-semibold text-foreground mb-4">General Information</h3>
                            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
                                <DetailItem label="WCC File Number" value={claimData.wcc_file_number} icon={<FileText />} />
                                <DetailItem label="Carrier File Number" value={claimData.carrier_file_number} icon={<FileText />} />
                                <DetailItem label="Date of Injury" value={formatDate(claimData.date_of_injury)} icon={<CalendarDays />} />
                                <DetailItem label="Time of Injury" value={claimData.time_of_injury} icon={<Clock />} />
                                <DetailItem label="Claim Status" value={claimData.claim_status} icon={<ShieldQuestion />} />
                                <DetailItem label="Part of Body Injured" value={claimData.part_of_body_injured} icon={<Briefcase />} isLongText className="md:col-span-2"/>
                                <DetailItem label="Place of Injury" value={claimData.place_of_injury} icon={<MapPin />} isLongText className="md:col-span-3"/>
                                <DetailItem label="Nature of Injury" value={claimData.nature_of_injury} icon={<Briefcase />} isLongText className="md:col-span-3"/>
                                <DetailItem label="Cause of Injury" value={claimData.cause_of_injury} icon={<Briefcase />} isLongText className="md:col-span-3"/>
                                <DetailItem label="Accident Description" value={claimData.accident_description} icon={<MessageSquare />} isLongText className="md:col-span-3"/>
                            </dl>
                        </section>

                        <section className="pt-6">
                            <h3 className="text-xl font-semibold text-foreground mb-4">Compensation & Work Status</h3>
                            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
                                <DetailItem label="Date Notice Given" value={formatDate(claimData.notice_given_date)} icon={<CalendarDays />} />
                                <DetailItem label="Avg. Weekly Wage" value={claimData.average_weekly_wage} icon={<DollarSign />} isCurrency />
                                <DetailItem label="Compensation Rate" value={claimData.compensation_rate} icon={<DollarSign />} isCurrency />
                                <DetailItem label="Date Disability Began" value={formatDate(claimData.date_disability_began)} icon={<CalendarDays />} />
                                <DetailItem label="Date Returned to Work" value={formatDate(claimData.date_returned_to_work)} icon={<CalendarDays />} />
                                <DetailItem label="MMI Date" value={formatDate(claimData.mmi_date)} icon={<CalendarDays />} />
                                <DetailItem label="Current Work Status" value={claimData.current_work_status} />
                                <DetailItem label="Perm. Impairment Rating" value={claimData.permanent_impairment_rating} icon={<Percent />} isPercent />
                                <DetailItem label="Initial Treatment" value={claimData.initial_treatment_desc} icon={<MessageSquare />} isLongText className="md:col-span-3"/>
                            </dl>
                        </section>
                        
                        {worker && (
                            <section className="pt-6">
                                <h3 className="text-xl font-semibold text-foreground mb-4">Injured Worker</h3>
                                <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
                                    <DetailItem 
                                        label="Name" 
                                        value={`${worker.first_name || ''} ${worker.last_name || ''}`.trim()} 
                                        icon={<User />} 
                                    />
                                    <DetailItem label="Date of Birth" value={formatDate(worker.date_of_birth)} icon={<CalendarDays />} />
                                    <DetailItem label="SSN (Masked)" value={worker.ssn} /> 
                                    <div className="sm:col-span-full mt-2">
                                        <Button variant="link" size="sm" asChild className="p-0 h-auto text-sm">
                                            <Link href={`/workers/${worker.id}`}>View Full Worker Details</Link>
                                        </Button>
                                    </div>
                                </dl>
                            </section>
                        )}

                        {employer && (
                            <section className="pt-6">
                                <h3 className="text-xl font-semibold text-foreground mb-4">Employer (at time of injury)</h3>
                                <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
                                    <DetailItem label="Employer Name" value={employer.name} icon={<Building />} />
                                    <DetailItem label="FEIN" value={employer.fein} />
                                </dl>
                            </section>
                        )}
                        
                        {(claimData.claimant_attorney_name || claimData.claimant_attorney_firm || claimData.claimant_attorney_phone || claimData.claimant_attorney_email || claimData.claimant_attorney_address) && (
                            <section className="pt-6">
                                <h3 className="text-xl font-semibold text-foreground mb-4">Claimant's Attorney</h3>
                                <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                                    <DetailItem label="Attorney Name" value={claimData.claimant_attorney_name} icon={<BookUser />} />
                                    <DetailItem label="Attorney Firm" value={claimData.claimant_attorney_firm} icon={<Building />} />
                                    <DetailItem label="Attorney Phone" value={formatPhoneNumber(claimData.claimant_attorney_phone)} icon={<Phone />} />
                                    <DetailItem label="Attorney Email" value={claimData.claimant_attorney_email} icon={<Mail />} />
                                    <DetailItem label="Attorney Address" value={claimData.claimant_attorney_address} icon={<MapPin />} isLongText className="sm:col-span-2" />
                                </dl>
                            </section>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the claim
                    (WCC#: <span className="font-semibold">{claimData?.wcc_file_number || `ID: ...${claimData?.id?.substring(0,8)}`}</span>)
                    for <span className="font-semibold">{claimData?.injuredWorker?.first_name} {claimData?.injuredWorker?.last_name}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteClaim} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    {isDeleting ? 'Deleting...' : 'Yes, delete claim'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
