// app/Components/HomePage/PricingPlans.tsx
"use client"; // Needed for state and router

import React, { useState } from 'react';
//import Link from "next/link"; // Keep for internal links if needed
import { useRouter } from 'next/navigation'; // Import for navigation
import { pricingTiers } from "./data"; // Import data (adjust path if needed)
import { Button } from "@/app/Components/ui/button"; // Import themed Button
import { Switch } from "@/app/Components/ui/switch";   // Import themed Switch
import { Label } from "@/app/Components/ui/label";   // Import themed Label
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/Components/ui/card"; // Import Card components
import { Check } from "lucide-react"; // Import Check icon
import { cn } from "@/lib/utils"; // Assuming you have this utility

type Frequency = "monthly" | "annually";

export default function PricingPlans() {
  const router = useRouter();
  const [frequency, setFrequency] = useState<Frequency>("monthly");

  const toggleFrequency = () => {
    setFrequency(prev => prev === "monthly" ? "annually" : "monthly");
  };

  return (
    // Use theme background, adjust padding
    <div className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Use theme colors */}
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Plans for every professional
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
          Choose the perfect plan to streamline your workers&apos; compensation calculations
          and stay compliant with South Carolina regulations.
        </p>

        {/* Monthly/Annually Toggle */}
        <div className="mt-10 flex justify-center items-center space-x-3">
          <Label htmlFor="frequency-toggle" className={cn("text-sm font-medium", frequency === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>
            Monthly
          </Label>
          <Switch
            id="frequency-toggle"
            checked={frequency === 'annually'}
            onCheckedChange={toggleFrequency}
            aria-label="Switch between monthly and annual pricing"
          />
          <Label htmlFor="frequency-toggle" className={cn("text-sm font-medium", frequency === 'annually' ? 'text-foreground' : 'text-muted-foreground')}>
            Annually <span className="text-xs text-primary">(Save ~15%)</span> {/* Example save text */}
          </Label>
        </div>

        {/* Pricing Grid */}
        {/* Adjust max-width and alignment if needed */}
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              // Highlight most popular plan with primary border
              className={cn(
                "flex flex-col rounded-3xl", // Ensure flex column layout
                tier.mostPopular ? "border-2 border-primary shadow-lg" : "border border-border shadow-sm"
              )}
            >
              <CardHeader className="p-8">
                <div className="flex items-center justify-between gap-x-4">
                  {/* Use theme colors */}
                  <CardTitle
                    id={tier.id}
                    className={cn(
                      "text-lg font-semibold leading-8",
                       tier.mostPopular ? "text-primary" : "text-foreground"
                    )}
                  >
                    {tier.name}
                  </CardTitle>
                  {/* Styled "Most Popular" badge */}
                  {tier.mostPopular && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                      Most popular
                    </span>
                  )}
                </div>
                {/* Use theme muted color */}
                <CardDescription className="mt-4 text-sm leading-6 text-muted-foreground">
                    {tier.description}
                </CardDescription>
                {/* Price display */}
                <div className="mt-6 flex items-baseline gap-x-1">
                  {/* Use theme foreground color */}
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {frequency === 'monthly' ? tier.priceMonthly : tier.priceAnnually}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                </div>
                 {/* Annual billing hint */}
                 {frequency === 'monthly' && (
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">
                        Billed monthly, or save with annual plan.
                    </p>
                 )}
                 {frequency === 'annually' && (
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">
                        Billed annually ({tier.priceMonthly} monthly).
                    </p>
                 )}
              </CardHeader>
              {/* Use CardContent for features list */}
              <CardContent className="p-8 pt-0 flex-grow"> {/* Use flex-grow */}
                 <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3 items-center"> {/* Align items center */}
                      {/* Use Lucide Check icon with primary color */}
                      <Check className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              {/* Use CardFooter for the button */}
              <CardFooter className="p-8 pt-0 mt-auto"> {/* Push footer down */}
                {/* Use themed Button with onClick workaround */}
                
                <Button
                  size="lg" // Larger button for pricing card
                  variant={tier.mostPopular ? "default" : "outline"} // Default for popular, outline for others
                  className="w-full" // Full width button
                  onClick={() => router.push(tier.href)}
                  aria-describedby={tier.id}
                >
                  Get started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
