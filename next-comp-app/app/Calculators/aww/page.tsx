// app/Calculators/aww/page.tsx
// 'use client' // Required if you add paywall checks directly here

import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/app/Components/ui/button"; // Adjust path
import { AwwCRCalculator } from "@/app/Components/CalcComponents/AwwCRCalculator"; // Adjust path
// Import authentication/subscription checking hooks or functions if needed
// import { useAuth, useSubscription } from '@/app/hooks/...' // Example

export const metadata: Metadata = {
  title: "Average Weekly Wage Calculator | SC Workers&apos; Compensation",
  description: "Calculate your Average Weekly Wage (AWW) and Compensation Rate (CR) according to South Carolina workers&apos; compensation laws.",
  // Add other relevant meta tags if desired
};

export default function AwwCalculatorPage() {
  // --- Paywall Check Example ---
  // This is where you would typically check authentication and subscription status.
  // The exact implementation depends on your auth/subscription setup (e.g., context, hooks, server-side checks).

  // Example using hypothetical hooks:
  // const { isAuthenticated, isLoading: authLoading } = useAuth();
  // const { hasActiveSubscription, isLoading: subLoading } = useSubscription();

  // if (authLoading || subLoading) {
  //   return <div>Loading...</div>; // Or a proper loading skeleton
  // }

  // if (!isAuthenticated) {
  //   // Redirect to login or show a message/component prompting login
  //   // return <RedirectToLogin />;
  //   return (
  //       <div className="container mx-auto p-6 text-center">
  //           <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
  //           <p className="mb-4">Please log in to use the calculators.</p>
  //           <Link href="/login">
  //               <Button>Log In</Button>
  //           </Link>
  //       </div>
  //   );
  // }

  // if (!hasActiveSubscription) {
  //   // Show a message/component prompting subscription
  //   return (
  //       <div className="container mx-auto p-6 text-center">
  //           <h1 className="text-2xl font-semibold mb-4">Subscription Required</h1>
  //           <p className="mb-4">Access to calculators requires an active subscription.</p>
  //           <Link href="/subscribe">
  //               <Button>Subscribe Now</Button>
  //           </Link>
  //       </div>
  //   );
  // }

  // If authenticated and subscribed (or if it's a public calculator), render the content:
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8"> {/* Added responsive padding */}
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/Calculators" passHref legacyBehavior>
          <Button variant="outline" className="inline-flex items-center gap-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <ChevronLeft className="h-4 w-4" />
            Back to All Calculators
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Average Weekly Wage Calculator</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Estimate your Average Weekly Wage (AWW) and Compensation Rate (CR) based on
          South Carolina workers&apos; compensation laws (S.C. Code § 42-1-40).
        </p>
      </div>

      {/* Calculator Component */}
      <AwwCRCalculator />

      {/* Informational Section */}
      <div className="mt-12 bg-muted/50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4 text-foreground">About Average Weekly Wage Calculations in SC</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            South Carolina law defines the primary method for calculating the average weekly wage in <code className="font-mono bg-muted px-1 py-0.5 rounded">§ 42-1-40</code>.
            Generally, if the employee worked for the employer for the full four quarters immediately preceding the injury, the AWW is the total gross earnings during those four quarters divided by 52 weeks.
          </p>
          <p>
            The weekly compensation rate is typically two-thirds (66.67%) of the calculated AWW. However, this amount is subject to
            the <strong className="text-foreground">maximum weekly compensation rate</strong> set by the state for the specific year the injury occurred. Your compensation rate cannot exceed this maximum, regardless of how high your AWW is.
          </p>
          <p>
            The law also outlines <strong className="text-foreground">alternative calculation methods</strong> for situations where the employee worked less than four quarters, had concurrent employment, or falls into special categories (like certain volunteers). These methods can be more complex and may require information not included in this basic calculator.
          </p>
          <p>
             Always refer to the official statute or consult with a legal professional for guidance on specific cases.
          </p>
        </div>
      </div>
    </div>
  );
}