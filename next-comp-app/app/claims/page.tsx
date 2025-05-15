// app/claims/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
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
import { Loader2, ArrowLeft, FileSearch, PlusCircle, AlertTriangle } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import type { AppUser } from '@/types/next-auth'; // Ensure this path is correct

// Define the structure of a claim object expected from the API
interface ClaimListItem {
  id: string;
  wcc_file_number: string | null;
  date_of_injury: string | null; // Assuming string from API, will format
  claim_status: string | null;
  injuredWorker: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  // Add other fields you might want to display in the list
}

export default function ClaimsListPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();

  const [claims, setClaims] = useState<ClaimListItem[]>([]);
  const [pageStatus, setPageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.profileId) {
      setPageStatus('loading');
      setError(null);

      const fetchClaims = async () => {
        try {
          // The GET /api/claims route should fetch claims for the logged-in user's profileId
          const response = await fetch('/api/claims');
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
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
      };
      void fetchClaims();
    } else if (sessionStatus === "unauthenticated") {
      toast({ title: "Authentication Required", description: "Please log in to view claims." });
      router.push("/login");
    } else if (sessionStatus === "authenticated" && !session?.user?.profileId) {
      toast({ title: "Profile Error", description: "User profile not found.", variant: "destructive" });
      setError("User profile not found. Cannot load claims.");
      setPageStatus('error');
    }
  }, [sessionStatus, session, router, toast]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'MM/dd/yyyy') : 'Invalid Date';
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
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} aria-label="Back to Dashboard">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">My Claims</h1>
        </div>
        <Button asChild>
          <Link href="/workers"> {/* Links to workers list to select worker then add claim */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Claim
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Claims</CardTitle>
          <CardDescription>
            A list of all claims associated with your profile. Select a claim to view its details.
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
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/claims/${claim.id}`}>
                          <FileSearch className="mr-2 h-4 w-4" /> View Details
                        </Link>
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
                <Link href="/workers"> {/* Links to workers list to select worker then add claim */}
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Claim
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
