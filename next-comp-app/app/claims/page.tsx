// app/claims/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/Components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Components/ui/table";
import { useToast } from "@/app/Components/ui/use-toast";
import { 
    Loader2, 
    ArrowLeft, 
    Edit3,      // Changed from FileSearch
    PlusCircle, 
    AlertTriangle,
    Trash2      // Added for delete
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/app/Components/ui/alert-dialog";
import { format, isValid, parseISO } from 'date-fns';
import type { AppUser } from '@/types/next-auth'; 

interface ClaimListItem {
  id: string;
  wcc_file_number: string | null;
  date_of_injury: string | null; 
  claim_status: string | null;
  injuredWorker: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface ApiErrorData {
    error?: string;
    details?: unknown; 
}

export default function ClaimsListPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();

  const [claims, setClaims] = useState<ClaimListItem[]>([]);
  const [pageStatus, setPageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState<ClaimListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Memoize fetchClaims to stabilize its reference if it were used in other useEffects,
  // though in this case, it's defined and called within the main data-fetching useEffect.
  // The primary benefit here is to clearly list its own dependencies.
  const fetchClaimsCallback = useCallback(async (profileId: string) => {
    setPageStatus('loading');
    setError(null);
    try {
      // This is the correct endpoint for fetching claims for the current user's profile
      const response = await fetch(`/api/claims`); 
      if (!response.ok) {
        const errData = await response.json().catch(() => ({error: "Failed to parse error response"}));
        throw new Error(errData.error || `Failed to fetch claims: ${response.statusText}`);
      }
      const data: ClaimListItem[] = await response.json();
      setClaims(data);
      setPageStatus('loaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error fetching claims:", err);
      setError(message);
      setPageStatus('error');
    }
  }, []); // No external dependencies needed for the fetch URL itself, as profileId is handled by session in API

  useEffect(() => {
    const userProfileId = session?.user?.profileId;

    if (sessionStatus === "authenticated") {
      if (userProfileId) {
        // console.log("ClaimsListPage: Authenticated with profileId, attempting to fetch claims.");
        void fetchClaimsCallback(userProfileId); 
      } else {
        // console.log("ClaimsListPage: Authenticated but profileId is missing.");
        toast({ title: "Profile Error", description: "User profile ID is missing. Cannot load claims.", variant: "destructive" });
        setError("User profile ID is missing. Cannot load claims.");
        setPageStatus('error');
      }
    } else if (sessionStatus === "unauthenticated") {
      // console.log("ClaimsListPage: Unauthenticated, redirecting to login.");
      toast({ title: "Authentication Required", description: "Please log in to view claims." });
      router.push("/login");
    } else if (sessionStatus === "loading") {
        // console.log("ClaimsListPage: Session status is loading.");
        setPageStatus('loading'); // Explicitly set page to loading while session loads
    }
  // Dependencies: these values trigger the effect when they change.
  // fetchClaimsCallback is memoized and stable.
  // router and toast are stable hooks.
  }, [sessionStatus, session?.user?.profileId, fetchClaimsCallback, router, toast]);


  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'MM/dd/yyyy') : 'Invalid Date';
  };

  const openDeleteConfirmation = (claim: ClaimListItem) => {
    setClaimToDelete(claim);
    setShowDeleteDialog(true);
  };

  const confirmDeleteClaim = async () => {
    if (!claimToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/claims/${claimToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData: ApiErrorData = await response.json().catch(() => ({ error: "An unknown error occurred during deletion."}));
        throw new Error(errorData.error || `Failed to delete claim: ${response.statusText}`);
      }
      
      setClaims(prevClaims => prevClaims.filter(c => c.id !== claimToDelete.id));
      toast({
        title: "Success!",
        description: `Claim (WCC#: ${claimToDelete.wcc_file_number || claimToDelete.id.substring(0,8)}) has been deleted.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error deleting claim:", err);
      toast({
        title: "Deletion Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setClaimToDelete(null);
    }
  };

  if (pageStatus === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          {sessionStatus === "loading" ? "Authenticating..." : "Loading claims..."}
        </p>
      </div>
    );
  }

  if (pageStatus === 'error') {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Card className="w-full max-w-lg bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error || "Claim data could not be loaded."}</p>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} aria-label="Back to Dashboard">
                  <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">My Claims</h1>
          </div>
          <Button asChild>
            <Link href="/claims/new"> {/* Updated Link to new claims page */}
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Claim
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Claims</CardTitle>
            <CardDescription>
              A list of all claims associated with your profile. Select a claim to view or edit its details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {claims.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WCC File #</TableHead>
                    <TableHead>Injured Worker</TableHead>
                    <TableHead>Date of Injury</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.wcc_file_number || 'N/A'}</TableCell>
                      <TableCell>
                        {claim.injuredWorker 
                          ? `${claim.injuredWorker.first_name || ''} ${claim.injuredWorker.last_name || ''}`.trim() 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(claim.date_of_injury)}</TableCell>
                      <TableCell>{claim.claim_status || 'Unknown'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/claims/${claim.id}`}>
                            <Edit3 className="mr-2 h-4 w-4" /> View/Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => openDeleteConfirmation(claim)}
                          aria-label={`Delete claim ${claim.wcc_file_number || claim.id}`}
                        >
                          <Trash2 className="mr-2 h-3 w-3" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No claims found.</p>
                <Button className="mt-4" asChild>
                  <Link href="/claims/new"> {/* Updated Link to new claims page */}
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Claim
                  </Link>
                </Button>
              </div>
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
              (WCC#: <span className="font-semibold">{claimToDelete?.wcc_file_number || `ID: ...${claimToDelete?.id.substring(0,8)}`}</span>)
              for <span className="font-semibold">{claimToDelete?.injuredWorker?.first_name} {claimToDelete?.injuredWorker?.last_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClaimToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
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
