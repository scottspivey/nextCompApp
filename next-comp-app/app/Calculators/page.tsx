// app/Calculators/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/Components/ui/button'; // Import the themed Button
import { cn } from "@/lib/utils"; // Assuming you have this utility

// Define calculator types and their information
// Consider moving this data to a separate file (e.g., data/calculators.ts) if it grows
const calculators = [
  {
    id: 'aww',
    name: 'Average Weekly Wage & Comp Rate',
    description: 'Calculate the average weekly wage and compensation rate based on quarterly earnings.',
    // Updated icon color to use primary theme color
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    path: '/Calculators/aww',
    free: true
  },
  {
    id: 'commuted',
    name: 'Commuted Value Calculator',
    description: 'Calculate the present value of future compensation payments using current discount rates.',
    // Updated icon color
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    path: '/Calculators/commuted',
    free: true
  },
  {
    id: 'indemnity',
    name: 'Indemnity Benefit Calculator',
    description: 'Calculate partial and total disability benefits based on impairment ratings and compensation rates.',
     // Updated icon color
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.205-2.04-.582-2.95z" />
       </svg>
    ),
    path: '/Calculators/indemnity',
    free: false
  },
  {
    id: 'wage-loss',
    name: 'Wage Loss Calculator',
    description: 'Calculate wage loss benefits for injured workers with diminished earning capacity.',
     // Updated icon color
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>
    ),
    path: '/Calculators/wage-loss',
    free: false
  },
  {
    id: 'life-expectancy',
    name: 'Life Expectancy Calculator',
    description: 'Calculate life expectancy for permanent total disability cases and lifetime benefits.',
     // Updated icon color
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>
    ),
    path: '/Calculators/life-expectancy',
    free: false
  },
  {
    id: 'hearing-loss',
    name: 'Hearing Loss Calculator',
    description: 'Calculate benefits for occupational hearing loss claims based on audiogram results.',
     // Updated icon color
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
       </svg>
    ),
    path: '/Calculators/hearing-loss',
    free: false
  }
];

const CalculatorsPage = () => {
  const router = useRouter();
  const [filterFree, setFilterFree] = useState<boolean | null>(null); // null = All, true = Free, false = Premium

  // Filter calculators based on the free/premium filter
  const filteredCalculators = filterFree === null
    ? calculators
    : calculators.filter(calc => calc.free === filterFree);

  // Placeholder for authentication/subscription check
  const checkAccess = (calc: typeof calculators[0]): boolean => {
    if (calc.free) {
      return true; // Free calculators are always accessible
    }
    // --- Placeholder Logic ---
    // In a real app, replace these with actual checks using your auth context/state
    const isLoggedIn = false; // Example: Replace with actual check
    const isPremiumUser = false; // Example: Replace with actual check
    // --- End Placeholder ---

    if (!isLoggedIn) {
      router.push(`/login?returnTo=${calc.path}`); // Redirect to login
      return false;
    } else if (!isPremiumUser) {
      router.push('/pricing'); // Redirect to pricing/upgrade
      return false;
    }
    return true; // User is logged in and premium
  };


  const handleCalculatorClick = (calc: typeof calculators[0]) => {
    if (checkAccess(calc)) {
      router.push(calc.path); // Navigate if access granted
    }
  };

  return (
    // Use theme background color
    <div className="container mx-auto py-8 px-4 md:py-12 lg:py-16 bg-background">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 pb-6 border-b border-border">
        <div>
          {/* Use theme colors for text */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Workers&apos; Compensation Calculators</h1>
          <p className="text-muted-foreground max-w-2xl">
            Professional-grade tools to accurately calculate South Carolina workers&apos; compensation
            benefits and settlement values.
          </p>
        </div>

        {/* Filter Buttons - Using themed Button component */}
        <div className="mt-4 md:mt-0 flex items-center space-x-1 p-1 bg-muted rounded-lg">
           <Button
             variant={filterFree === null ? 'default' : 'ghost'} // Active state uses 'default' variant
             size="sm" // Smaller buttons for filter group
             onClick={() => setFilterFree(null)}
             className={cn("transition-colors", filterFree !== null && "text-muted-foreground")}
           >
             All
           </Button>
           <Button
             variant={filterFree === true ? 'default' : 'ghost'}
             size="sm"
             onClick={() => setFilterFree(true)}
             className={cn("transition-colors", filterFree !== true && "text-muted-foreground")}
           >
             Free
           </Button>
           <Button
             variant={filterFree === false ? 'default' : 'ghost'}
             size="sm"
             onClick={() => setFilterFree(false)}
             className={cn("transition-colors", filterFree !== false && "text-muted-foreground")}
           >
             Premium
           </Button>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCalculators.map((calc) => (
          <div
            key={calc.id}
            onClick={() => handleCalculatorClick(calc)}
            // Use theme colors for card, border, shadow, hover effects
            className={cn(
                "bg-card rounded-lg border border-border p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer group relative overflow-hidden",
                !calc.free && "border-t-4 border-primary" // Use primary color border for premium
            )}
          >
            {/* Premium Indicator Ribbon (Optional Alternative) */}
            {/* {!calc.free && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-bl-md">PREMIUM</div>
            )} */}

            <div className="flex items-start mb-4">
              {/* Icon container */}
              <div className="mr-4 flex-shrink-0 p-2 bg-primary/10 rounded-full">
                {calc.icon}
              </div>
              {/* Text content */}
              <div>
                 {/* Use theme colors */}
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{calc.name}</h3>
                <p className="text-muted-foreground text-sm">{calc.description}</p>
              </div>
            </div>

            {/* Footer with Badge and Link */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
               {/* Styled Badges */}
              <span className={cn(
                  "text-xs font-medium px-2.5 py-0.5 rounded-full", // Adjusted padding/shape
                  calc.free
                    ? 'bg-secondary text-secondary-foreground' // Use secondary for free
                    : 'bg-primary/10 text-primary' // Use primary accent for premium
              )}>
                {calc.free ? 'Free' : 'Premium'}
              </span>
              {/* Use theme color for link */}
              <span className="text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Use Calculator &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {!filteredCalculators.length && (
        <div className="text-center py-16"> {/* Increased padding */}
          <h3 className="text-xl text-muted-foreground mb-4">No calculators match your filter.</h3>
           {/* Use themed Button */}
          <Button
            onClick={() => setFilterFree(null)}
            variant="outline" // Use outline variant
          >
            Show All Calculators
          </Button>
        </div>
      )}

      {/* "Need Help" Section */}
      <div className="mt-16 md:mt-20 lg:mt-24 bg-muted p-8 rounded-lg text-center"> {/* Increased margin, padding */}
        <h2 className="text-2xl font-bold text-foreground mb-4">Need Help Choosing?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Not sure which calculator to use? Our guides can help you determine the right tool for your specific case.
        </p>
         {/* Use themed Button */}
        <Button asChild variant="secondary"> {/* Use secondary variant */}
          <Link href="/resources">
            View Calculation Guides &rarr;
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CalculatorsPage;
