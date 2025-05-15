// app/tools/generate-form/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/Components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select";
import { Label } from '@/app/Components/ui/label';
import { useToast } from "@/app/Components/ui/use-toast";
import { Loader2, ArrowLeft, FileText, Download, AlertTriangle } from 'lucide-react';
import { formMappings } from '@/lib/formMappings'; // Assuming this holds your form type definitions

// Define the structure of a claim object for the dropdown
interface ClaimForSelection {
  id: string;
  wcc_file_number: string | null;
  injuredWorker: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

// Define the structure for additionalData (this will likely need to be more dynamic)
interface AdditionalFormData {
  [key: string]: any; // Simple for now, can be refined
}

export default function GenerateFormPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();

  const [claims, setClaims] = useState<ClaimForSelection[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
  const [selectedFormType, setSelectedFormType] = useState<string>('');
  const [additionalData, setAdditionalData] = useState<AdditionalFormData>({}); // For form-specific fields
  
  const [isLoadingClaims, setIsLoadingClaims] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch claims for the dropdown
  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.profileId) {
      setIsLoadingClaims(true);
      const fetchUserClaims = async () => {
        try {
          const response = await fetch('/api/claims'); // Your existing API to get user's claims
          if (!response.ok) throw new Error('Failed to fetch claims');
          const data: ClaimForSelection[] = await response.json();
          setClaims(data);
        } catch (err) {
          console.error("Error fetching claims for form generation:", err);
          toast({ title: "Error", description: "Could not load your claims.", variant: "destructive" });
          setError("Could not load claims for selection.");
        } finally {
          setIsLoadingClaims(false);
        }
      };
      void fetchUserClaims();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (sessionStatus === "authenticated" && !session?.user?.profileId) {
        toast({ title: "Profile Error", description: "User profile not found.", variant: "destructive"});
        setError("User profile not found.");
        setIsLoadingClaims(false);
    }
  }, [sessionStatus, session, router, toast]);

  const handleGenerateForm = async () => {
    if (!selectedClaimId || !selectedFormType) {
      toast({ title: "Missing Selections", description: "Please select a claim and a form type.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: selectedClaimId,
          formType: selectedFormType,
          // profileId is handled by the session in the API route
          additionalData: additionalData, // Send any collected additional data
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Form generation failed." }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${selectedFormType}_${Date.now()}.pdf`; // Default filename
      if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (filenameMatch && filenameMatch.length === 2)
              filename = filenameMatch[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: "Success", description: `${filename} has been downloaded.` });

    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("Error generating form:", err);
      toast({ title: "Generation Failed", description: message, variant: "destructive" });
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Get available form types from formMappings
  const availableFormTypes = Object.keys(formMappings);

  if (sessionStatus === "loading" || isLoadingClaims) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  if (error && !isLoadingClaims) { // Show error if claims failed to load
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
            <Card className="w-full max-w-lg bg-destructive/10 border-destructive">
                <CardHeader><CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5"/>Error</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-destructive-foreground">{error}</p>
                    <Button variant="outline" onClick={() => router.push('/dashboard')} className="mt-4">Back to Dashboard</Button>
                </CardContent>
            </Card>
        </div>
    );
  }


  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="flex items-center mb-8 space-x-3">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} aria-label="Back to Dashboard">
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Generate SCWCC Form</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Selection</CardTitle>
          <CardDescription>Choose a claim and a form type to generate the PDF document.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="claim-select">Select Claim</Label>
            <Select value={selectedClaimId} onValueChange={setSelectedClaimId} disabled={claims.length === 0}>
              <SelectTrigger id="claim-select">
                <SelectValue placeholder={claims.length > 0 ? "Choose a claim..." : "No claims available"} />
              </SelectTrigger>
              <SelectContent>
                {claims.map((claim) => (
                  <SelectItem key={claim.id} value={claim.id}>
                    {claim.wcc_file_number || `Claim ID: ...${claim.id.slice(-6)}`} (
                    {claim.injuredWorker ? `${claim.injuredWorker.first_name || ''} ${claim.injuredWorker.last_name || ''}`.trim() : 'N/A'}
                    )
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {claims.length === 0 && !isLoadingClaims && <p className="text-sm text-muted-foreground">You have no claims to select from. Please add a claim first.</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="form-type-select">Select Form Type</Label>
            <Select value={selectedFormType} onValueChange={setSelectedFormType}>
              <SelectTrigger id="form-type-select">
                <SelectValue placeholder="Choose a form type..." />
              </SelectTrigger>
              <SelectContent>
                {availableFormTypes.map((formKey) => (
                  <SelectItem key={formKey} value={formKey}>
                    {formKey.replace(/_/g, ' ')} {/* Make it more readable */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Placeholder for additionalData fields - This will need dynamic rendering based on selectedFormType */}
          {selectedFormType && (
            <div className="p-4 border rounded-md bg-muted/20">
              <h4 className="font-medium mb-2 text-sm">Additional Data for {selectedFormType.replace(/_/g, ' ')}:</h4>
              <p className="text-xs text-muted-foreground">
                (Input fields for form-specific additional data will appear here. This section needs further implementation based on each form's requirements.)
              </p>
              {/* Example:
              if (selectedFormType === 'SCWCC_Form21') {
                // Render inputs for Form 21 additionalData
              }
              */}
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleGenerateForm} disabled={isGenerating || !selectedClaimId || !selectedFormType}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isGenerating ? 'Generating...' : 'Generate & Download PDF'}
          </Button>
        </CardFooter>
      </Card>
      {error && !isGenerating && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}
    </div>
  );
}
