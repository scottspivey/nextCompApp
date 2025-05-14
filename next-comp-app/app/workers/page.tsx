// app/workers/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/app/Components/ui/button';
import { Input } from '@/app/Components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/Components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/app/Components/ui/radio-group";
import { Label } from "@/app/Components/ui/label";
import { useToast } from "@/app/Components/ui/use-toast";
import { PlusCircle, Edit3, Loader2, AlertTriangle, Users, Briefcase, FileText, ArrowUpDown, Search } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

// Define the structure of a Claim for the worker summary
interface ClaimForWorkerSummary {
  id: string;
  wcc_file_number: string; 
  claim_status: string;    
  employerName: string;    
  date_of_injury?: Date | string | null;
}

// Updated structure for an Injured Worker for this page
interface InjuredWorkerSummary {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: Date | string | null; // Keep for data structure, though not sorting by it now
  ssn?: string | null; 
  city?: string | null;
  state?: string | null;
  claims: ClaimForWorkerSummary[]; 
  employerNames: string[]; 
}

// Type for API error responses
interface ApiErrorData {
    error?: string;
    details?: unknown; 
}

// Updated SortableWorkerKeys to include employerNames and remove date_of_birth for direct table sort
type SortableWorkerKeys = keyof Pick<InjuredWorkerSummary, 'last_name' | 'first_name'> | 'employerNames';


interface SortConfig {
    key: SortableWorkerKeys | null;
    direction: 'ascending' | 'descending';
}

// Define what constitutes an "open" or "active" claim status
const OPEN_CLAIM_STATUSES = ["Open", "Pending", "Active", "In Progress", "Unknown", "Accepted", "Investigating", "In Litigation", "Pending Review"];

export default function AllInjuredWorkersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();

  const [workers, setWorkers] = useState<InjuredWorkerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'last_name', direction: 'ascending' });
  const [claimFilter, setClaimFilter] = useState<'activeOnly' | 'includeAll'>('activeOnly');

  const fetchWorkers = useCallback(async (profileId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workers?profileId=${profileId}`);
      if (!response.ok) {
        let errorPayload: ApiErrorData = { error: `Failed to fetch workers: ${response.statusText}` };
        try {
            const parsedError: unknown = await response.json();
            if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError) {
                errorPayload = parsedError as ApiErrorData;
            }
        } catch (_e) { 
            console.warn("Failed to parse error JSON from API");
        }
        throw new Error(errorPayload.error || `Failed to fetch workers: ${response.statusText}`);
      }
      const responseData: unknown = await response.json();
      const data = responseData as InjuredWorkerSummary[]; 
      setWorkers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error fetching workers:", err);
      setError(message);
      toast({
        title: "Error Fetching Workers",
        description: message,
        variant: "destructive",
      });
      setWorkers([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.profileId) {
      void fetchWorkers(session.user.profileId); 
    } else if (sessionStatus === "unauthenticated") {
      void toast({ title: "Authentication Required", description: "Please log in to view injured workers." });
      router.push("/api/auth/signin"); 
    }
  }, [session, sessionStatus, fetchWorkers, router, toast]);

  const workerHasActiveClaims = useCallback((worker: InjuredWorkerSummary): boolean => {
    if (!worker.claims || worker.claims.length === 0) return false;
    return worker.claims.some(claim => OPEN_CLAIM_STATUSES.includes(claim.claim_status));
  }, []);

  const displayedWorkers = useMemo(() => {
    let processedWorkers = [...workers];

    if (claimFilter === 'activeOnly') {
      processedWorkers = processedWorkers.filter(workerHasActiveClaims);
    }

    if (searchTerm) {
      processedWorkers = processedWorkers.filter(worker => {
        const term = searchTerm.toLowerCase();
        return (
          worker.first_name.toLowerCase().includes(term) ||
          worker.last_name.toLowerCase().includes(term) ||
          (worker.ssn && worker.ssn.toLowerCase().includes(term)) ||
          worker.claims.some(claim => claim.wcc_file_number?.toLowerCase().includes(term)) ||
          worker.employerNames.some(name => name.toLowerCase().includes(term))
        );
      });
    }

    if (sortConfig.key !== null) {
      processedWorkers.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'employerNames') {
          // Sort by the first employer name, case-insensitive. Handle 'N/A' or empty arrays.
          const getFirstEmployer = (names: string[]) => (names && names.length > 0 && names[0] !== 'N/A' ? names[0].toLowerCase() : '');
          aValue = getFirstEmployer(a.employerNames);
          bValue = getFirstEmployer(b.employerNames);
        } else {
           // Accessing other sortable keys like 'last_name', 'first_name'
           aValue = a[sortConfig.key as keyof Omit<InjuredWorkerSummary, 'employerNames' | 'claims' | 'id' | 'ssn' | 'city' | 'state' | 'date_of_birth'>];
           bValue = b[sortConfig.key as keyof Omit<InjuredWorkerSummary, 'employerNames' | 'claims' | 'id' | 'ssn' | 'city' | 'state' | 'date_of_birth'>];
        }
        
        if (aValue === null || aValue === undefined) return 1; 
        if (bValue === null || bValue === undefined) return -1;
        
        // Generic string comparison for other keys (first_name, last_name)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const valA = aValue.toLowerCase();
            const valB = bValue.toLowerCase();
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }
        return 0;
      });
    }
    return processedWorkers;
  }, [workers, searchTerm, sortConfig, claimFilter, workerHasActiveClaims]);

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

  const displayClaimInfo = (claims: ClaimForWorkerSummary[]) => {
    if (!claims || claims.length === 0) return "No Claims";
    const openClaims = claims.filter(claim => OPEN_CLAIM_STATUSES.includes(claim.claim_status));
    if (openClaims.length === 0) return "No Open Claims";
    if (openClaims.length === 1) return `1 Open Claim: ${openClaims[0].wcc_file_number || openClaims[0].id.substring(0,8)}`;
    return `${openClaims.length} Open Claims`;
  };
  
  const displayEmployerInfo = (employerNames: string[]) => {
    if (!employerNames || employerNames.length === 0 || (employerNames.length === 1 && employerNames[0] === 'N/A')) return "N/A";
    return employerNames.join(', ');
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          {sessionStatus === "loading" ? "Loading session..." : "Fetching workers..."}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center self-start sm:self-center">
          <Users className="mr-3 h-8 w-8" /> Injured Workers
        </h1>
        <Button onClick={() => router.push('/workers/new')} className="self-end sm:self-center">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Worker
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:max-w-xs">
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
            value={claimFilter}
            onValueChange={(value: 'activeOnly' | 'includeAll') => setClaimFilter(value)}
            className="flex items-center space-x-2 sm:space-x-4"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="activeOnly" id="activeOnly" />
                <Label htmlFor="activeOnly" className="cursor-pointer">With Active Claims Only</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="includeAll" id="includeAll" />
                <Label htmlFor="includeAll" className="cursor-pointer">Include All Claims</Label>
            </div>
        </RadioGroup>
      </div>


      {error && (
        <Card className="mb-6 bg-destructive/10 border-destructive">
          <CardHeader><CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5" /> Error</CardTitle></CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => { if (session?.user?.profileId) void fetchWorkers(session.user.profileId);}} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Worker List</CardTitle>
          <CardDescription>
            A list of all injured workers associated with your profile. Click on a worker to view or edit details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayedWorkers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer group" onClick={() => requestSort('last_name')}>
                    Name <span className="inline-flex align-middle">{getSortIndicator('last_name')}</span>
                  </TableHead>
                  {/* Changed DOB to Employer for sorting */}
                  <TableHead className="cursor-pointer group" onClick={() => requestSort('employerNames')}>
                    Employer(s) <span className="inline-flex align-middle">{getSortIndicator('employerNames')}</span>
                  </TableHead>
                  <TableHead>Claim(s) Info</TableHead>
                  <TableHead>DOB</TableHead> {/* Moved DOB here, not sortable for now via header click */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedWorkers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">
                      <Link href={`/workers/${worker.id}`} className="hover:underline text-primary">
                        {worker.last_name}, {worker.first_name} 
                      </Link>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate" title={displayEmployerInfo(worker.employerNames)}>
                                {displayEmployerInfo(worker.employerNames)}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate" title={worker.claims.map(c => `${c.wcc_file_number} (${c.claim_status})`).join('; ')}>
                                {displayClaimInfo(worker.claims)}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell> {/* DOB is now here, not sortable by header click */}
                      {worker.date_of_birth && isValid(parseISO(worker.date_of_birth as string)) 
                        ? format(parseISO(worker.date_of_birth as string), 'MM/dd/yyyy') 
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/workers/${worker.id}`}>
                          <Edit3 className="mr-2 h-3 w-3" /> View/Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && <p className="text-muted-foreground">
                {searchTerm ? "No workers match your search criteria." : 
                 (claimFilter === 'activeOnly' && workers.length > 0) ? "No workers with active claims match your criteria." :
                 "No injured workers found for your profile. Add one to get started!"
                }
            </p>
          )}
        </CardContent>
        {displayedWorkers.length > 0 && (
            <CardFooter className="text-sm text-muted-foreground">
                Showing {displayedWorkers.length} of {workers.length} total worker(s) {claimFilter === 'activeOnly' ? "(matching claim filter)" : ""}.
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
