// app/Calculators/aww/page.tsx
import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/app/Components/ui/button";
import { AwwCRCalculatorWrapper } from "@/app/Components/AwwCRCalculatorWrapper";

export const metadata: Metadata = {
  title: "Average Weekly Wage Calculator | SC Workers' Compensation",
  description: "Calculate your Average Weekly Wage and Compensation Rate according to South Carolina workers' compensation laws.",
};

export default function AwwCalculatorPage({
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/Calculators" passHref>
          <Button variant="outline" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to All Calculators
          </Button>
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Average Weekly Wage Calculator</h1>
        <p className="text-gray-600 mt-2">
          Calculate your Average Weekly Wage (AWW) and Compensation Rate (CR) based on 
          South Carolina workers&apos; compensation laws.
        </p>
      </div>
      
      <AwwCRCalculatorWrapper />
      
      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">About Average Weekly Wage Calculations</h2>
        <div className="space-y-4">
          <p>
            South Carolina law defines the average weekly wage calculation method in Section 42-1-40. 
            Generally, it is calculated by dividing the employee&apos;s total wages from the four quarters 
            immediately preceding the injury by 52.
          </p>
          <p>
            The compensation rate is typically 66.67% of the average weekly wage, subject to 
            the maximum compensation rate for the year of injury.
          </p>
          <p>
            Special cases, such as volunteer workers or recently hired employees, may be calculated 
            differently according to statutory provisions.
          </p>
        </div>
      </div>
    </div>
  );
}