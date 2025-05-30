// app/claims/new/page.tsx
import React from 'react';
import NewClaimFormPage from '@/app/claims/new/NewClaimFormPage'; // Assuming NewClaimFormPage.tsx is in the same directory
import { Loader2 } from 'lucide-react'; // Or your preferred loader component

// Fallback component to display while the client component is loading
function PageLoader() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">Loading form...</p>
    </div>
  );
}

// This page remains a Server Component by default (no "use client" here)
export default function NewClaimPage() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <NewClaimFormPage />
    </React.Suspense>
  );
}
