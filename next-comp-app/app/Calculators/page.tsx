// app/Calculators/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/Components/ui/button'; // Import the themed Button
import { cn } from "@/lib/utils"; // Assuming you have this utility
// Import necessary Lucide icons
import {
  CircleDollarSign,
  Calculator,
  ShieldCheck,
  TrendingDown,
  Clock,
  AudioWaveform,
} from 'lucide-react';

// Define calculator types and their information
// Consider moving this data to a separate file (e.g., data/calculators.ts) if it grows
const calculators = [
 {
    id: 'aww',
    name: 'Average Weekly Wage & Comp Rate',
    description: 'Calculate the average weekly wage and compensation rate based on quarterly earnings.',
    // Use Lucide icon
    icon: <CircleDollarSign className="h-10 w-10 text-primary" strokeWidth={1.5} />,
    path: '/Calculators/aww',
    free: true
  },
  {
    id: 'commuted',
    name: 'Commuted Value Calculator',
    description: 'Calculate the present value of future compensation payments using current discount rates.',
    // Use Lucide icon
    icon: <Calculator className="h-10 w-10 text-primary" strokeWidth={1.5} />,
    path: '/Calculators/commuted',
    free: true
  },
  {
    id: 'indemnity',
    name: 'Indemnity Benefit Calculator',
    description: 'Calculate partial and total disability benefits based on impairment ratings and compensation rates.',
    // Use Lucide icon
    icon: <ShieldCheck className="h-10 w-10 text-primary" strokeWidth={1.5} />,
    path: '/Calculators/indemnity',
    free: false
  },
  {
    id: 'wage-loss',
    name: 'Wage Loss Calculator',
    description: 'Calculate wage loss benefits for injured workers with diminished earning capacity.',
    // Use Lucide icon
    icon: <TrendingDown className="h-10 w-10 text-primary" strokeWidth={1.5} />,
    path: '/Calculators/wage-loss',
    free: false
  },
  {
    id: 'life-expectancy',
    name: 'Life Expectancy Calculator',
    description: 'Calculate life expectancy for permanent total disability cases and lifetime benefits.',
    // Use Lucide icon
    icon: <Clock className="h-10 w-10 text-primary" strokeWidth={1.5} />,
    path: '/Calculators/life-expectancy',
    free: false
  },
  {
    id: 'hearing-loss',
    name: 'Hearing Loss Calculator',
    description: 'Calculate benefits for occupational hearing loss claims based on audiogram results.',
    // Use Lucide icon
    icon: <AudioWaveform className="h-10 w-10 text-primary" strokeWidth={1.5} />,
    path: '/Calculators/hearing-loss',
    free: false
  }
];

const CalculatorsPage = () => {
  const router = useRouter(); // Router is already initialized here
  const [filterFree, setFilterFree] = useState<boolean | null>(null);

  const filteredCalculators = filterFree === null
    ? calculators
    : calculators.filter(calc => calc.free === filterFree);

  const checkAccess = (calc: typeof calculators[0]): boolean => {
    if (calc.free) return true;
    const isLoggedIn = false; // Replace with actual auth check
    const isPremiumUser = false; // Replace with actual subscription check
    if (!isLoggedIn) {
      router.push(`/login?returnTo=${calc.path}`);
      return false;
    } else if (!isPremiumUser) {
      router.push('/pricing');
      return false;
    }
    return true;
  };

  const handleCalculatorClick = (calc: typeof calculators[0]) => {
    if (checkAccess(calc)) {
      router.push(calc.path);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:py-12 lg:py-16 bg-background">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Workers&apos; Compensation Calculators</h1>
          <p className="text-muted-foreground max-w-2xl">
            Professional-grade tools to accurately calculate South Carolina workers&apos; compensation
            benefits and settlement values.
          </p>
        </div>
        {/* Filter Buttons */}
        <div className="mt-4 md:mt-0 flex items-center space-x-1 p-1 bg-muted rounded-lg">
           <Button
             variant={filterFree === null ? 'default' : 'ghost'}
             size="sm"
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
            className={cn(
                "bg-card rounded-lg border border-border p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer group relative overflow-hidden",
                !calc.free && "border-t-4 border-primary"
            )}
          >
            <div className="flex items-start mb-4">
              {/* Icon container now renders Lucide icon */}
              <div className="mr-4 flex-shrink-0 p-2 bg-primary/10 rounded-full">
                {calc.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{calc.name}</h3>
                <p className="text-muted-foreground text-sm">{calc.description}</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
              <span className={cn(
                  "text-xs font-medium px-2.5 py-0.5 rounded-full",
                  calc.free
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-primary/10 text-primary'
              )}>
                {calc.free ? 'Free' : 'Premium'}
              </span>
              <span className="text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Use Calculator &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {!filteredCalculators.length && (
        <div className="text-center py-16">
          <h3 className="text-xl text-muted-foreground mb-4">No calculators match your filter.</h3>
          <Button
            onClick={() => setFilterFree(null)}
            variant="outline"
          >
            Show All Calculators
          </Button>
        </div>
      )}

      {/* "Need Help" Section */}
      <div className="mt-16 md:mt-20 lg:mt-24 bg-muted p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Need Help Choosing?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Not sure which calculator to use? Our guides can help you determine the right tool for your specific case.
        </p>
        <Button
            variant="secondary"
            onClick={() => router.push('/resources')}
        >
          View Calculation Guides &rarr;
        </Button>
      </div>
    </div>
  );
};

export default CalculatorsPage;

