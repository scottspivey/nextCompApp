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
import { PlusCircle, Edit3, Loader2, AlertTriangle, Users } from 'lucide-react';
import { format } from 'date-fns'; // For formatting dates

// Define the structure of an Injured Worker for this page
interface InjuredWorkerSummary {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: Date | string | null;
  ssn?: string | null; // Will be masked
  city?: string | null;
  state?: string | null;
  // claims?: Array<{ wcc_file_number?: string | null; claim_status?: string | null; }>; // Example if fetching related claim
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch workers: ${response.statusText}`);
      }
      const data: InjuredWorkerSummary[] = await response.json();
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
      setWorkers([]); // Clear workers on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.profileId) {
      fetchWorkers(session.user.profileId);
    } else if (sessionStatus === "unauthenticated") {
      // Redirect or show message if user is not authenticated
      toast({ title: "Authentication Required", description: "Please log in to view injured workers." });
      router.push("/api/auth/signin"); // Or your login page
    }
    // If sessionStatus is "loading", isLoading will remain true until session resolves
  }, [session, sessionStatus, fetchWorkers, router, toast]);

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
            <Button variant="outline" size="sm" onClick={() => session?.user?.profileId && fetchWorkers(session.user.profileId)} className="mt-4">
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
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>SSN (Last 4)</TableHead>
                  <TableHead>Location</TableHead>
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
                      {worker.date_of_birth ? format(new Date(worker.date_of_birth), 'MM/dd/yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>{worker.ssn || 'N/A'}</TableCell>
                    <TableCell>{worker.city && worker.state ? `${worker.city}, ${worker.state}` : worker.city || worker.state || 'N/A'}</TableCell>
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
