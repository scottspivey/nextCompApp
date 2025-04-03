// app/Pricing/page.tsx
"use client"; // Needed for useRouter hook

import React from 'react';
// import { Metadata } from 'next'; // Metadata export might need adjustment in Client Components depending on Next.js version/setup
// import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import router for button navigation

// Import themed components
import { Button } from '@/app/Components/ui/button'; // Adjust path
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Components/ui/table"; // Adjust path
import { Card, CardContent, CardHeader, CardTitle } from "@/app/Components/ui/card"; // Adjust path

// Import data
import { comparisonFeatures, pricingFaqs } from './data'; // Adjust path if data file is elsewhere
import TrustedBy from '@/app/Components/HomePage/TrustedBy'; // Adjust path
import PricingPlans from '@/app/Pricing/PricingPlans'; // Adjust path

// Import icons
import { Check, X } from 'lucide-react';

// Metadata can still be exported from Client Components in Next.js 13+
// export const metadata: Metadata = { ... }; // Keep metadata export

export default function PricingPage() {
  const router = useRouter(); // Initialize router

  // Helper to render checkmark, cross, or text
  const renderFeatureCell = (featureValue: string | boolean) => {
    if (typeof featureValue === 'boolean') {
      return featureValue ?
        <Check className="h-5 w-5 text-primary mx-auto" /> : // Centered check
        <X className="h-5 w-5 text-muted-foreground mx-auto" />; // Centered cross
    }
    return <span className="text-sm">{featureValue}</span>; // Render text directly
  };

  return (
    // Use theme background
    <div className="bg-background">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          {/* Header */}
          
          {/* Pricing Plans Component (Assumed to be styled separately) */}
          <PricingPlans />

          {/* Trusted By Section */}
          <div className="my-16 md:my-20 lg:my-24">
            <TrustedBy />
          </div>

          {/* Compare Plan Features Section */}
          <Card className="mt-16 md:mt-20 lg:mt-24 overflow-hidden"> {/* Use Card component */}
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl text-center md:text-left"> {/* Use CardTitle */}
                Compare Plan Features
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0"> {/* Remove Card padding, table handles it */}
              <div className="overflow-x-auto">
                {/* Use shadcn/ui Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px] font-semibold uppercase text-muted-foreground">Feature</TableHead>
                      <TableHead className="text-center font-semibold uppercase text-muted-foreground">Basic</TableHead>
                      <TableHead className="text-center font-semibold uppercase text-muted-foreground bg-muted/50">Professional</TableHead>
                      <TableHead className="text-center font-semibold uppercase text-muted-foreground">Enterprise</TableHead>
                    </TableRow>
                  </TableHeader>
                  {/* Ensure no extra whitespace within TableBody or TableRow */}
                  <TableBody>{/* No whitespace before map */}
                    {comparisonFeatures.map((item) => (
                      // No whitespace between map and TableRow
                      <TableRow key={item.id}>{/* No whitespace after TableRow opening tag */}
                        <TableCell className="font-medium text-foreground">{item.feature}</TableCell>{/* No whitespace between TableCells */}
                        <TableCell className="text-center">{renderFeatureCell(item.basic)}</TableCell>{/* No whitespace between TableCells */}
                        <TableCell className="text-center bg-muted/50">{renderFeatureCell(item.professional)}</TableCell>{/* No whitespace between TableCells */}
                        <TableCell className="text-center">{renderFeatureCell(item.enterprise)}</TableCell>
                      {/* No whitespace before TableRow closing tag */}</TableRow>
                    // No whitespace after TableRow closing tag
                    ))}{/* No whitespace after map */}
                    {/* Row for Buttons */}
                    <TableRow className="bg-background hover:bg-background">{/* No whitespace */}
                       <TableCell className="font-medium text-foreground">Choose Your Plan</TableCell>{/* No whitespace */}
                       <TableCell className="text-center px-2 py-4">
                           <Button onClick={() => router.push('/signup?plan=basic')} variant="outline" size="sm" className="w-full">Choose Basic</Button>
                       </TableCell>{/* No whitespace */}
                       <TableCell className="text-center px-2 py-4 bg-muted/50">
                           <Button onClick={() => router.push('/signup?plan=professional')} variant="default" size="sm" className="w-full">Choose Pro</Button>
                       </TableCell>{/* No whitespace */}
                       <TableCell className="text-center px-2 py-4">
                           <Button onClick={() => router.push('/signup?plan=enterprise')} variant="outline" size="sm" className="w-full">Choose Ent.</Button>
                       </TableCell>
                    {/* No whitespace */}</TableRow>
                  {/* No whitespace */}</TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Custom Solution CTA Section */}
          <div className="mt-16 md:mt-20 lg:mt-24 bg-primary text-primary-foreground rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8 sm:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">Need a Custom Solution?</h2>
                  <p className="text-primary-foreground/90">
                    Contact us for custom enterprise solutions or special requirements
                    for your firm or organization.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => router.push('/contact')}
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing FAQ Section */}
          <div className="mt-16 md:mt-20 lg:mt-24 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pricingFaqs.map((faq) => (
                <Card key={faq.id} className="bg-card text-card-foreground">
                    <CardHeader>
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
             <div className="text-center mt-8">
                {/* Note: Using onClick workaround for this button as asChild caused issues before */}
                <Button
                  variant="default"
                  size="lg"
                  className="text-secondary" // Keep link styling
                  onClick={() => router.push('/faq')} // Use onClick for navigation
                >
                  View All Pricing FAQs
                </Button>
              </div>
          </div>
        </div>
    </div>
  );
}
