// app/claims/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/Components/ui/button';
import { Input } from '@/app/Components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/Components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/app/Components/ui/radio-group";
import { Label } from "@/app/Components/ui/label";
import { useToast } from "@/app/Components/ui/use-toast";
import {
    Loader2,
    ArrowLeft,
    Edit3,
    FilePlus2,
    AlertTriangle,
    Trash2,
    FileText, // Icon for claims
    ArrowUpDown,
    Search
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
// import type { AppUser } from '@/types/next-auth'; // Not directly used in this component's logic

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
  employerName?: string | null;
}

interface ApiErrorData {
    error?: string;
    details?: unknown;
}

type SortableClaimKeys = 'wcc_file_number' | 'injuredWorkerName' | 'date_of_injury' | 'claim_status' | 'employerName';

interface SortConfig {
    key: SortableClaimKeys | null;
    direction: 'ascending' | 'descending';
}

const OPEN_CLAIM_STATUSES_FOR_CLAIMS: string[] = ["Open", "Pending", "Active", "In Progress", "Unknown", "Accepted", "Investigating", "In Litigation", "Pending Review"];
const CLOSED_CLAIM_STATUSES_FOR_CLAIMS: string[] = ["Closed", "Settled", "Denied", "Finaled"];


export default function ClaimsListPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();

  const [allClaims, setAllClaims] = useState<ClaimListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date_of_injury', direction: 'descending' });
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('open');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState<ClaimListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClaims = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/claims`);
      if (!response.ok) {
        let errData: ApiErrorData = { error: "Failed to parse error response" }; // Default error
        try {
            // Attempt to parse the error response, assuming it might be JSON
            const parsedError: unknown = await response.json();
            if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError && typeof (parsedError as ApiErrorData).error === 'string') {
                 errData = parsedError as ApiErrorData;
            }
        } catch (parseError) {
            // If parsing fails, stick with the default or use response status text
            console.warn("Failed to parse error JSON from API:", parseError);
            errData.error = response.statusText || "Failed to fetch claims";
        }
        throw new Error(errData.error);
      }
      const data: ClaimListItem[] = await response.json() as ClaimListItem[]; // Type assertion
      setAllClaims(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error fetching claims:", err);
      setError(message);
      toast({
        title: "Error Fetching Claims",
        description: message,
        variant: "destructive",
      });
      setAllClaims([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.profileId) {
      void fetchClaims();
    } else if (sessionStatus === "unauthenticated") {
      toast({ title: "Authentication Required", description: "Please log in to view claims." });
      router.push("/login");
    }
  }, [sessionStatus, session?.user?.profileId, fetchClaims, router, toast]);


  const displayedClaims = useMemo(() => {
    let processedClaims = [...allClaims];

    if (statusFilter === 'open') {
      processedClaims = processedClaims.filter(claim =>
        claim.claim_status && OPEN_CLAIM_STATUSES_FOR_CLAIMS.includes(claim.claim_status)
      );
    } else if (statusFilter === 'closed') {
      processedClaims = processedClaims.filter(claim =>
        claim.claim_status && CLOSED_CLAIM_STATUSES_FOR_CLAIMS.includes(claim.claim_status)
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      processedClaims = processedClaims.filter(claim => {
        const workerName = claim.injuredWorker
          ? `${claim.injuredWorker.first_name || ''} ${claim.injuredWorker.last_name || ''}`.toLowerCase()
          : '';
        return (
          (claim.wcc_file_number && claim.wcc_file_number.toLowerCase().includes(term)) ||
          workerName.includes(term) ||
          (claim.claim_status && claim.claim_status.toLowerCase().includes(term)) ||
          (claim.employerName && claim.employerName.toLowerCase().includes(term))
        );
      });
    }

    if (sortConfig.key !== null) {
      processedClaims.sort((a, b) => {
        let aValue: string | number | null | undefined;
        let bValue: string | number | null | undefined;

        switch (sortConfig.key) {
          case 'injuredWorkerName':
            aValue = a.injuredWorker ? `${a.injuredWorker.last_name || ''} ${a.injuredWorker.first_name || ''}`.trim().toLowerCase() : '';
            bValue = b.injuredWorker ? `${b.injuredWorker.last_name || ''} ${b.injuredWorker.first_name || ''}`.trim().toLowerCase() : '';
            break;
          case 'date_of_injury':
            aValue = a.date_of_injury ? parseISO(a.date_of_injury).getTime() : null;
            bValue = b.date_of_injury ? parseISO(b.date_of_injury).getTime() : null;
            break;
          case 'employerName':
             aValue = a.employerName?.toLowerCase() || '';
             bValue = b.employerName?.toLowerCase() || '';
             break;
          default:
            // Ensure type safety for direct property access
            const key = sortConfig.key as Exclude<SortableClaimKeys, 'injuredWorkerName' | 'date_of_injury' | 'employerName'>;
            aValue = a[key]?.toLowerCase() || '';
            bValue = b[key]?.toLowerCase() || '';
        }
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return processedClaims;
  }, [allClaims, searchTerm, sortConfig, statusFilter]);

  const requestSort = (key: SortableClaimKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableClaimKeys) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50 group-hover:opacity-100 inline-block" />;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'MM/dd/yyyy') : 'Invalid Date';
    } catch { // Removed _e as it's not used
        return 'Invalid Date';
    }
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
        let errorData: ApiErrorData = { error: "An unknown error occurred during deletion." }; // Default
        try {
            const parsedError: unknown = await response.json();
             if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError && typeof (parsedError as ApiErrorData).error === 'string') {
                 errorData = parsedError as ApiErrorData;
            }
        } catch (parseError) {
            console.warn("Failed to parse error JSON from API during delete:", parseError);
            errorData.error = response.statusText || "Failed to delete claim";
        }
        throw new Error(errorData.error);
      }
      
      setAllClaims(prevClaims => prevClaims.filter(c => c.id !== claimToDelete.id));
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

  if (sessionStatus === "loading" || (isLoading && allClaims.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          {sessionStatus === "loading" ? "Authenticating..." : "Loading claims..."}
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-3 self-start sm:self-center">
              <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go Back">
                  <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                <FileText className="mr-3 h-8 w-8" /> My Claims
              </h1>
          </div>
          <Button asChild className="self-end sm:self-center">
            <Link href="/claims/new">
              <FilePlus2 className="mr-2 h-4 w-4" /> Add New Claim
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:max-w-sm">
                <Input
                    type="text"
                    placeholder="Search claims, worker, status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <RadioGroup
                value={statusFilter}
                onValueChange={(value: 'all' | 'open' | 'closed') => setStatusFilter(value)}
                className="flex items-center space-x-2 sm:space-x-4"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="allClaims" />
                    <Label htmlFor="allClaims" className="cursor-pointer">All Claims</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="open" id="openClaims" />
                    <Label htmlFor="openClaims" className="cursor-pointer">Open Claims</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="closed" id="closedClaims" />
                    <Label htmlFor="closedClaims" className="cursor-pointer">Closed Claims</Label>
                </div>
            </RadioGroup>
        </div>
        
        {error && !isLoading && (
          <Card className="mb-6 bg-destructive/10 border-destructive">
            <CardHeader><CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Claims</CardTitle></CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={() => void fetchClaims()} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            {isLoading && displayedClaims.length === 0 && !error ? (
                 <div className="text-center py-10 text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
                    Loading claims...
                </div>
            ) : displayedClaims.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer group" onClick={() => requestSort('wcc_file_number')}>
                      WCC File # <span className="inline-flex align-middle">{getSortIndicator('wcc_file_number')}</span>
                    </TableHead>
                    <TableHead className="cursor-pointer group" onClick={() => requestSort('injuredWorkerName')}>
                      Injured Worker <span className="inline-flex align-middle">{getSortIndicator('injuredWorkerName')}</span>
                    </TableHead>
                    <TableHead className="cursor-pointer group" onClick={() => requestSort('date_of_injury')}>
                      Date of Injury <span className="inline-flex align-middle">{getSortIndicator('date_of_injury')}</span>
                    </TableHead>
                    <TableHead className="cursor-pointer group" onClick={() => requestSort('claim_status')}>
                      Status <span className="inline-flex align-middle">{getSortIndicator('claim_status')}</span>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedClaims.map((claim) => (
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
                            <Edit3 className="mr-2 h-3 w-3" /> View/Edit
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
              !error && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' ? "No claims match your criteria." : "No claims found."}
                  </p>
                  {!(searchTerm || statusFilter !== 'all') && (
                     <Button className="mt-4" asChild>
                        <Link href="/claims/new">
                            <FilePlus2 className="mr-2 h-4 w-4" /> Add Your First Claim
                        </Link>
                    </Button>
                  )}
                </div>
              )
            )}
          </CardContent>
          {displayedClaims.length > 0 && (
              <CardFooter className="text-sm text-muted-foreground justify-between">
                  <span>
                    Showing {displayedClaims.length} of {allClaims.length} total claim(s)
                    {statusFilter !== 'all' ? ` (matching status: ${statusFilter})` : ""}.
                  </span>
              </CardFooter>
          )}
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
            <AlertDialogAction onClick={() => void confirmDeleteClaim()} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isDeleting ? 'Deleting...' : 'Yes, delete claim'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}