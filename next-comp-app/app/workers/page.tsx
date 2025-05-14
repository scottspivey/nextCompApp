// app/workers/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/app/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/Components/ui/table";
import { useToast } from "@/app/Components/ui/use-toast";
import { PlusCircle, Edit3, Loader2, AlertTriangle, Users, Briefcase, FileText } from 'lucide-react';
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
  date_of_birth?: Date | string | null;
  ssn?: string | null; 
  city?: string | null;
  state?: string | null;
  claims: ClaimForWorkerSummary[]; 
  employerNames: string[]; 
}

// Type for error data from API responses
interface ApiErrorData {
    error?: string;
    details?: unknown; // Changed from any to unknown for better type safety
}


export default function AllInjuredWorkersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();

  const [workers, setWorkers] = useState<InjuredWorkerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async (profileId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workers?profileId=${profileId}`);
      if (!response.ok) {
        let errorPayload: ApiErrorData = { error: `Failed to fetch workers: ${response.statusText}` };
        try {
            // Attempt to parse the error response body
            const parsedError: unknown = await response.json();
            // Check if parsedError is an object and has an 'error' property
            if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError) {
                errorPayload = parsedError as ApiErrorData;
            }
        } catch (e) {
            // If parsing fails, stick with the initial error message based on status text
            console.warn("Failed to parse error JSON from API");
        }
        throw new Error(errorPayload.error || `Failed to fetch workers: ${response.statusText}`);
      }
      // Assign to unknown first, then assert the type.
      const responseData: unknown = await response.json();
      const data = responseData as InjuredWorkerSummary[]; // Asserting from unknown
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

  const displayClaimInfo = (claims: ClaimForWorkerSummary[]) => {
    if (!claims || claims.length === 0) {
      return "No Claims";
    }
    const openStatuses = ["Open", "Pending", "Active", "In Progress", "Unknown"]; 
    const openClaims = claims.filter(claim => openStatuses.includes(claim.claim_status));

    if (openClaims.length === 0) {
      return "No Open Claims";
    }
    if (openClaims.length === 1) {
      return `1 Open Claim: ${openClaims[0].wcc_file_number || openClaims[0].id.substring(0,8)}`;
    }
    return `${openClaims.length} Open Claims`;
  };
  
  const displayEmployerInfo = (employerNames: string[]) => {
    if (!employerNames || employerNames.length === 0 || (employerNames.length === 1 && employerNames[0] === 'N/A')) {
        return "N/A";
    }
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Users className="mr-3 h-8 w-8" /> Injured Workers
        </h1>
        <Button onClick={() => router.push('/workers/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Worker
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (session?.user?.profileId) {
                  void fetchWorkers(session.user.profileId); 
                }
              }} 
              className="mt-4"
            >
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
          {workers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Employer(s)</TableHead>
                  <TableHead>Claim(s) Info</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">
                      <Link href={`/workers/${worker.id}`} className="hover:underline text-primary">
                        {worker.first_name} {worker.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {worker.date_of_birth && isValid(parseISO(worker.date_of_birth as string)) 
                        ? format(parseISO(worker.date_of_birth as string), 'MM/dd/yyyy') 
                        : 'N/A'}
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
            !error && <p className="text-muted-foreground">No injured workers found for your profile. Add one to get started!</p>
          )}
        </CardContent>
        {workers.length > 0 && (
            <CardFooter className="text-sm text-muted-foreground">
                Showing {workers.length} worker(s).
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
