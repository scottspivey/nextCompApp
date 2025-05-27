// app/workers/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/app/Components/ui/button';
import { Input } from '@/app/Components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/Components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/app/Components/ui/radio-group";
import { Label } from "@/app/Components/ui/label";
import { useToast } from "@/app/Components/ui/use-toast";
import { 
    Edit3, 
    Loader2, 
    AlertTriangle, 
    Users, 
    ArrowUpDown, 
    Search, 
    UserPlus,
    Trash2,
    ArrowLeft
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

interface ClaimForWorkerSummary {
  id: string;
  wcc_file_number: string | null;
  claim_status: string;    
  employerName: string;    
  date_of_injury?: Date | string | null;
}

interface InjuredWorkerSummary {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  ssn?: string | null; 
  claims: ClaimForWorkerSummary[]; 
  employerNames: string[]; 
}

interface ApiErrorData {
    error?: string;
    details?: unknown; 
}

type SortableWorkerKeys = 'last_name' | 'first_name' | 'employerNames' | 'date_of_birth';

interface SortConfig {
    key: SortableWorkerKeys | null;
    direction: 'ascending' | 'descending';
}

// Define claim status groups
const OPEN_CLAIM_STATUSES: string[] = ["OPEN", "PENDING", "ACCEPTED", "INVESTIGATING", "IN_LITIGATION", "PENDING_REVIEW", "UNKNOWN"];
const CLOSED_CLAIM_STATUSES: string[] = ["CLOSED", "SETTLED", "DENIED", "FINALED"];

// Helper to safely render a value as a string. For debugging React Error 310.
const safeRenderToString = (value: any): string => {
    if (value === null || value === undefined) {
        return ''; // Or 'N/A' or some other placeholder
    }
    if (typeof value === 'object') {
        // This is a critical warning if you expect a primitive for rendering.
        console.warn("Attempting to render an object where a string or primitive was expected. This can cause React Error 310. Value:", value);
        // For debugging, you might show its type or a stringified version,
        // but the root cause (unexpected object) needs fixing.
        return `[Object: ${Object.prototype.toString.call(value)}]`; 
    }
    return String(value);
};


export default function AllInjuredWorkersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();

  const [allWorkers, setAllWorkers] = useState<InjuredWorkerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'last_name', direction: 'ascending' });
  const [workerClaimFilter, setWorkerClaimFilter] = useState<'all' | 'open' | 'closed'>('open');
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<InjuredWorkerSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workers`); 
      if (!response.ok) {
        let errData: ApiErrorData = { error: "Failed to parse error response" };
        try {
            const parsedError: unknown = await response.json();
            if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError && typeof (parsedError as ApiErrorData).error === 'string') {
                 errData = parsedError as ApiErrorData;
            }
        } catch (parseError) {
            console.warn("Failed to parse error JSON from API (workers):", parseError);
            errData.error = response.statusText || "Failed to fetch workers";
        }
        throw new Error(errData.error);
      }
      const data: InjuredWorkerSummary[] = await response.json() as InjuredWorkerSummary[]; 
      // For Debugging React Error 310: Log the fetched data structure.
      // console.log("Fetched workers data:", JSON.stringify(data, null, 2));
      setAllWorkers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error fetching workers:", err);
      setError(message);
      toast({
        title: "Error Fetching Workers",
        description: message,
        variant: "destructive",
      });
      setAllWorkers([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast]); 

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.profileId) {
      void fetchWorkers(); 
    } else if (sessionStatus === "unauthenticated") {
      toast({ title: "Authentication Required", description: "Please log in to view injured workers." });
      router.push("/login");
    }
  }, [sessionStatus, session?.user?.profileId, fetchWorkers, router, toast]);


  const workerHasOpenClaims = useCallback((worker: InjuredWorkerSummary): boolean => {
    if (!worker.claims || worker.claims.length === 0) return false;
    // Ensure claim_status is a string before using .includes()
    return worker.claims.some(claim => typeof claim.claim_status === 'string' && OPEN_CLAIM_STATUSES.includes(claim.claim_status));
  }, []);

  const workerHasAnyClosedClaims = useCallback((worker: InjuredWorkerSummary): boolean => {
    if (!worker.claims || worker.claims.length === 0) return false;
    // Ensure claim_status is a string before using .includes()
    return worker.claims.some(claim => typeof claim.claim_status === 'string' && CLOSED_CLAIM_STATUSES.includes(claim.claim_status));
  }, []);

  const displayedWorkers = useMemo(() => {
    let filteredByStatus = [...allWorkers];

    if (workerClaimFilter === 'open') {
        filteredByStatus = allWorkers.filter(workerHasOpenClaims);
    } else if (workerClaimFilter === 'closed') {
        filteredByStatus = allWorkers.filter(workerHasAnyClosedClaims);
    }

    let searchedWorkers = filteredByStatus;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      searchedWorkers = filteredByStatus.filter(worker => {
        // Ensure properties are strings before calling toLowerCase() or includes()
        const firstNameMatch = typeof worker.first_name === 'string' && worker.first_name.toLowerCase().includes(term);
        const lastNameMatch = typeof worker.last_name === 'string' && worker.last_name.toLowerCase().includes(term);
        const ssnMatch = worker.ssn && typeof worker.ssn === 'string' && worker.ssn.replace(/-/g, "").includes(term.replace(/-/g, ""));
        const claimWCCMatch = worker.claims.some(claim => typeof claim.wcc_file_number === 'string' && claim.wcc_file_number.toLowerCase().includes(term));
        const employerNameMatch = worker.employerNames.some(name => typeof name === 'string' && name.toLowerCase().includes(term));
        
        return firstNameMatch || lastNameMatch || ssnMatch || claimWCCMatch || employerNameMatch;
      });
    }

    let sortedWorkers = [...searchedWorkers];
    if (sortConfig.key !== null) {
      sortedWorkers.sort((a, b) => {
        let aValue: string | number | null | undefined;
        let bValue: string | number | null | undefined;

        switch (sortConfig.key) {
          case 'employerNames':
            const getFirstEmployer = (names: string[]) => (names && names.length > 0 && typeof names[0] === 'string' && names[0] !== 'N/A' ? names[0].toLowerCase() : '');
            aValue = getFirstEmployer(a.employerNames);
            bValue = getFirstEmployer(b.employerNames);
            break;
          case 'date_of_birth':
            aValue = typeof a.date_of_birth === 'string' ? parseISO(a.date_of_birth).getTime() : null;
            bValue = typeof b.date_of_birth === 'string' ? parseISO(b.date_of_birth).getTime() : null;
            break;
          default: 
            const key = sortConfig.key as 'first_name' | 'last_name'; 
            const rawA = a[key];
            const rawB = b[key];
            aValue = typeof rawA === 'string' ? rawA.toLowerCase() : '';
            bValue = typeof rawB === 'string' ? rawB.toLowerCase() : '';
        }

        if (aValue === null || aValue === undefined) return 1; 
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'number' && isNaN(aValue)) return 1;
        if (typeof bValue === 'number' && isNaN(bValue)) return -1;

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortedWorkers;
  }, [allWorkers, searchTerm, sortConfig, workerClaimFilter, workerHasOpenClaims, workerHasAnyClosedClaims]);

  const requestSort = (key: SortableWorkerKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableWorkerKeys) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50 group-hover:opacity-100 inline-block" />;
  };
  
  const formatDate = (dateStringInput: Date | string | null | undefined) => {
    if (!dateStringInput) return 'N/A';
    try {
        const date = typeof dateStringInput === 'string' ? parseISO(dateStringInput) : new Date(dateStringInput);
        return isValid(date) ? format(date, 'MM/dd/yyyy') : 'Invalid Date';
    } catch {
        return 'Invalid Date';
    }
  };

  const displayClaimInfo = (claims: ClaimForWorkerSummary[]) => {
    if (!claims || claims.length === 0) return "No Claims";
    const openClaims = claims.filter(claim => typeof claim.claim_status === 'string' && OPEN_CLAIM_STATUSES.includes(claim.claim_status));
    if (openClaims.length === 0) return "No Open Claims";
    if (openClaims.length === 1 && openClaims[0]) {
        const wccNum = typeof openClaims[0].wcc_file_number === 'string' ? openClaims[0].wcc_file_number : openClaims[0].id.substring(0,8);
        return `1 Open Claim: ${wccNum}`;
    }
    return `${openClaims.length} Open Claims`;
  };
  
  const displayEmployerInfo = (employerNames: string[]) => {
    if (!employerNames || employerNames.length === 0 || (employerNames.length === 1 && employerNames[0] === 'N/A')) return "N/A";
    return employerNames.filter(name => typeof name === 'string').join(', ');
  };

  const openDeleteConfirmation = (worker: InjuredWorkerSummary) => {
    setWorkerToDelete(worker);
    setShowDeleteDialog(true);
  };

  const confirmDeleteWorker = async () => {
    if (!workerToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workers/${workerToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        let errorData: ApiErrorData = { error: "An unknown error occurred during deletion." };
        try {
            const parsedError: unknown = await response.json();
             if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError && typeof (parsedError as ApiErrorData).error === 'string') {
                 errorData = parsedError as ApiErrorData;
            }
        } catch (parseError) {
            console.warn("Failed to parse error JSON from API during worker delete:", parseError);
            errorData.error = response.statusText || "Failed to delete worker";
        }
        throw new Error(errorData.error);
      }
      
      setAllWorkers(prevWorkers => prevWorkers.filter(w => w.id !== workerToDelete.id));
      toast({
        title: "Success!",
        description: `Worker ${safeRenderToString(workerToDelete.first_name)} ${safeRenderToString(workerToDelete.last_name)} has been deleted.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error deleting worker:", err);
      toast({
        title: "Deletion Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setWorkerToDelete(null);
    }
  };

  if (sessionStatus === "loading" || (isLoading && allWorkers.length === 0 && !error)) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          {sessionStatus === "loading" ? "Authenticating..." : "Loading workers..."}
        </p>
      </div>
    );
  }

  const filterDescription = useMemo(() => {
    if (workerClaimFilter === 'open') return "(filtered by: open claims)";
    if (workerClaimFilter === 'closed') return "(filtered by: closed claims)";
    return ""; 
  }, [workerClaimFilter]);

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-3 self-start sm:self-center">
              <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go Back">
                  <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                <Users className="mr-3 h-8 w-8" /> Injured Workers
              </h1>
          </div>
          <Button asChild className="self-end sm:self-center">
            <Link href="/workers/new">
                <UserPlus className="mr-2 h-4 w-4" /> Add New Worker
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:max-w-sm">
              <Input
                  type="text"
                  placeholder="Search workers, SSN, claims..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" 
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <RadioGroup
              value={workerClaimFilter}
              onValueChange={(value) => setWorkerClaimFilter(value as 'all' | 'open' | 'closed')}
              className="flex items-center space-x-2 sm:space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="filterAll" />
              <Label htmlFor="filterAll" className="cursor-pointer">All Workers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="open" id="filterOpen" />
              <Label htmlFor="filterOpen" className="cursor-pointer">Open Claims</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="closed" id="filterClosed" />
              <Label htmlFor="filterClosed" className="cursor-pointer">Closed Claims</Label>
            </div>
          </RadioGroup>
        </div>

        {error && !isLoading && (
          <Card className="mb-6 bg-destructive/10 border-destructive">
            <CardHeader><CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Workers</CardTitle></CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={() => { if (session?.user?.profileId) void fetchWorkers();}} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            {isLoading && displayedWorkers.length === 0 && !error ? (
                <div className="text-center py-10 text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
                    Loading workers...
                </div>
            ) : displayedWorkers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer group" onClick={() => requestSort('last_name')}>
                      Name <span className="inline-flex align-middle">{getSortIndicator('last_name')}</span>
                    </TableHead>
                    <TableHead className="cursor-pointer group" onClick={() => requestSort('employerNames')}>
                      Employer(s) <span className="inline-flex align-middle">{getSortIndicator('employerNames')}</span>
                    </TableHead>
                    <TableHead>Claim(s) Info</TableHead>
                    <TableHead className="cursor-pointer group" onClick={() => requestSort('date_of_birth')}>
                        DOB <span className="inline-flex align-middle">{getSortIndicator('date_of_birth')}</span>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedWorkers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-medium">
                        <Link href={`/workers/${worker.id}`} className="hover:underline text-primary">
                          {/* Use safeRenderToString for potentially problematic direct renders */}
                          {safeRenderToString(worker.last_name)}, {safeRenderToString(worker.first_name)} 
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="truncate" title={displayEmployerInfo(worker.employerNames)}>
                            {displayEmployerInfo(worker.employerNames)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="truncate" title={worker.claims.map(c => `${safeRenderToString(c.wcc_file_number) || 'N/A'} (${safeRenderToString(c.claim_status)})`).join('; ')}>
                            {displayClaimInfo(worker.claims)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatDate(worker.date_of_birth)}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/workers/${worker.id}`}>
                              <Edit3 className="mr-2 h-3 w-3" /> View/Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => openDeleteConfirmation(worker)}
                          aria-label={`Delete worker ${safeRenderToString(worker.first_name)} ${safeRenderToString(worker.last_name)}`}
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
                        {searchTerm || workerClaimFilter !== 'all' ? "No workers match your criteria." : "No injured workers found."}
                    </p>
                    {!(searchTerm || workerClaimFilter !== 'all') && !allWorkers.length && (
                        <Button className="mt-4" asChild>
                            <Link href="/workers/new">
                                <UserPlus className="mr-2 h-4 w-4" /> Add Your First Worker
                            </Link>
                        </Button>
                    )}
                </div>
              )
            )}
          </CardContent>
          {displayedWorkers.length > 0 && (
              <CardFooter className="text-sm text-muted-foreground justify-between">
                  <span>
                    Showing {displayedWorkers.length} of {allWorkers.length} total worker(s)
                    {filterDescription}.
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
              This action cannot be undone. This will permanently delete the worker:
              <span className="font-semibold"> {safeRenderToString(workerToDelete?.first_name)} {safeRenderToString(workerToDelete?.last_name)}</span>.
              This will also delete all claims associated with this worker.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkerToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDeleteWorker()} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isDeleting ? 'Deleting...' : 'Yes, delete worker'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
