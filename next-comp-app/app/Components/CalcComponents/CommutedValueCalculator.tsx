// app/Components/CommutedValueCalculator.tsx
'use client';

import React, { useState, useEffect } from "react";
import { useCommutedValueStore } from "@/app/stores/commutedValueStore"; // Adjust path if needed
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Import shadcn/ui components (adjust paths as needed)
import { Button } from "@/app/Components/ui/button";
import { Input } from "@/app/Components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/Components/ui/form";
import { ArrowLeft, ArrowRight, RotateCcw, Printer } from "lucide-react";

// Prop type
type MaxCompensationRates = Record<number, number>;
interface CommutedValueCalculatorProps {
  maxCompensationRates: MaxCompensationRates;
}

// --- Zod Schemas ---
// Step 1: Year of Injury Schema
const YearOfInjurySchema = z.object({
  yearOfInjury: z.string().refine((val) => {
    const year = parseInt(val);
    const currentYear = new Date().getFullYear();
    return !isNaN(year) && year >= 1979 && year <= currentYear;
  }, { message: `Year must be between 1979 and ${new Date().getFullYear()}` })
});
type YearOfInjuryValues = z.infer<typeof YearOfInjurySchema>;

// Step 2: Compensation Rate Schema (Using z.coerce.number)
const CompRateSchema = z.object({
  compRate: z.coerce // Attempt to convert input to number first
    .number({
      required_error: "Compensation Rate is required.",
      invalid_type_error: "Compensation Rate must be a valid number.",
    })
    .positive({ message: "Rate must be positive." })
    .gt(0, { message: "Rate must be greater than 0." })
});
type CompRateValues = z.infer<typeof CompRateSchema>;

// Step 3: TTD and Credits Schema (Using z.coerce.number and optional)
const WeeksSchema = z.object({
  ttdPaidToDate: z.coerce // Attempt to convert input to number first
    .number({ invalid_type_error: "TTD Paid must be a valid number." })
    .min(0, { message: "Cannot be negative." })
    .max(500, { message: "Cannot exceed 500 weeks." })
    .optional(), // Make field optional (allows undefined)
  otherCredit: z.coerce // Attempt to convert input to number first
    .number({ invalid_type_error: "Other Credit must be a valid number." })
    .min(0, { message: "Cannot be negative." })
    .max(500, { message: "Cannot exceed 500 weeks." })
    .optional(), // Make field optional (allows undefined)
}).refine(data => (data.ttdPaidToDate ?? 0) + (data.otherCredit ?? 0) <= 500, { // Use ?? 0 in refine
    message: "Total weeks (TTD Paid + Other Credit) cannot exceed 500.",
    path: ["ttdPaidToDate"],
});
// Type now includes undefined
type WeeksValues = z.infer<typeof WeeksSchema>; // { ttdPaidToDate?: number | undefined; otherCredit?: number | undefined; }


// --- Component ---
const CommutedValueCalculator: React.FC<CommutedValueCalculatorProps> = ({ maxCompensationRates }) => {
  // Zustand store state and actions...
  const {
    yearOfInjury, compRate, ttdPaidToDate, otherCredit, currentStep,
    weeksRemaining, discountRate, discountedWeeks, commutedValue,
    ttdPaidToDateValue, commutedValue95, commutedValue90,
    setYearOfInjury, setCompRate, setTtdPaidToDate, setOtherCredit,
    nextStep, prevStep, resetCalculator, calculateResults
  } = useCommutedValueStore();

  const [customStepError, setCustomStepError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1979 + 1 },
    (_, i) => (currentYear - i).toString()
  );

  // --- Forms ---
  const yearForm = useForm<YearOfInjuryValues>({
    resolver: zodResolver(YearOfInjurySchema),
    defaultValues: { yearOfInjury: yearOfInjury || currentYear.toString() }
  });

  const compRateForm = useForm<CompRateValues>({
    resolver: zodResolver(CompRateSchema),
    defaultValues: { compRate: compRate || undefined }
  });

  // UseForm generic should align with the optional schema output
  const weeksForm = useForm<WeeksValues>({
    resolver: zodResolver(WeeksSchema),
    // Default values can be undefined, matching the optional schema
    defaultValues: {
        ttdPaidToDate: ttdPaidToDate ?? undefined,
        otherCredit: otherCredit ?? undefined
    }
  });

  // --- Effects for Resetting Forms ---
  useEffect(() => {
    yearForm.reset({ yearOfInjury: yearOfInjury || currentYear.toString() });
  }, [yearOfInjury, yearForm, currentYear]);

  useEffect(() => {
    compRateForm.reset({ compRate: compRate || undefined });
  }, [compRate, compRateForm]);

  useEffect(() => {
    weeksForm.reset({ ttdPaidToDate: ttdPaidToDate ?? undefined, otherCredit: otherCredit ?? undefined });
  }, [ttdPaidToDate, otherCredit, weeksForm]);


  // --- Submission Handlers ---
  const handleStep1Submit = (data: YearOfInjuryValues) => {
    setYearOfInjury(data.yearOfInjury);
    setCustomStepError(null);
    nextStep();
  };

  const handleStep2Submit = (data: CompRateValues) => {
    const year = parseInt(yearOfInjury);
    const maxRate = maxCompensationRates[year] || 1134.43;

    if (data.compRate > maxRate) {
      compRateForm.setError("compRate", {
        type: "manual",
        message: `Rate cannot exceed max of $${maxRate.toLocaleString('en-US')} for ${yearOfInjury}`
      });
      return;
    }
    setCompRate(data.compRate);
    setCustomStepError(null);
    nextStep();
  };

  // data type is now { ttdPaidToDate?: number; otherCredit?: number }
  const handleStep3Submit = (data: WeeksValues) => {
    // Use ?? 0 when setting store state to ensure a number is passed
    setTtdPaidToDate(data.ttdPaidToDate ?? 0);
    setOtherCredit(data.otherCredit ?? 0);
    setCustomStepError(null);
    calculateResults();
    nextStep();
  };

  // --- Render Logic ---
  return (
    <div className="space-y-8">

      {/* Step 1: Year of Injury */}
      {currentStep === 1 && (
        <Form {...yearForm}>
          <form onSubmit={yearForm.handleSubmit(handleStep1Submit)} className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Step 1: Year of Injury</h3>
            <FormField
              control={yearForm.control}
              name="yearOfInjury"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Year of Injury</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {customStepError && <p className="text-sm font-medium text-destructive">{customStepError}</p>}
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="destructive" onClick={resetCalculator}>
                 <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button type="submit">
                 Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 2: Compensation Rate */}
      {currentStep === 2 && (
        <Form {...compRateForm}>
          <form onSubmit={compRateForm.handleSubmit(handleStep2Submit)} className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Step 2: Compensation Rate</h3>
            <FormField
              control={compRateForm.control}
              name="compRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compensation Rate ($)</FormLabel>
                   <FormDescription>
                     Max Rate for {yearOfInjury}: ${(maxCompensationRates[parseInt(yearOfInjury)] || 1134.43).toLocaleString('en-US')}
                   </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter weekly comp rate"
                      {...field}
                      // Ensure undefined is passed if input is empty
                      onChange={event => field.onChange(event.target.value === '' ? undefined : event.target.value)}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {customStepError && <p className="text-sm font-medium text-destructive">{customStepError}</p>}
            <div className="flex justify-between">
               <Button type="button" variant="outline" onClick={prevStep}>
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back
               </Button>
               <Button type="submit">
                 Next <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 3: Weeks Paid/Credit */}
      {currentStep === 3 && (
         <Form {...weeksForm}>
          {/* handleSubmit type should now match */}
          <form onSubmit={weeksForm.handleSubmit(handleStep3Submit)} className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Step 3: Weeks Paid & Credit</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                   control={weeksForm.control} // control type should now match
                   name="ttdPaidToDate"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>TTD Paid to Date (weeks)</FormLabel>
                       <FormControl>
                         <Input
                           type="number"
                           step="0.01"
                           min="0"
                           max="500"
                           placeholder="e.g., 52.14"
                            {...field}
                            // Ensure undefined is passed if input is empty
                            onChange={event => field.onChange(event.target.value === '' ? undefined : event.target.value)}
                            value={field.value ?? ''} // Display state value or empty string
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={weeksForm.control} // control type should now match
                   name="otherCredit"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Other Credit (weeks)</FormLabel>
                       <FormControl>
                         <Input
                           type="number"
                           step="0.01"
                           min="0"
                           max="500"
                           placeholder="e.g., 10"
                           {...field}
                           // Ensure undefined is passed if input is empty
                           onChange={event => field.onChange(event.target.value === '' ? undefined : event.target.value)}
                           value={field.value ?? ''} // Display state value or empty string
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
             </div>
             {customStepError && <p className="text-sm font-medium text-destructive">{customStepError}</p>}
             {/* Display Zod refinement error if present */}
             {weeksForm.formState.errors.ttdPaidToDate?.type === 'refine' && (
                 <p className="text-sm font-medium text-destructive">{weeksForm.formState.errors.ttdPaidToDate.message}</p>
             )}
            <div className="flex justify-between">
               <Button type="button" variant="outline" onClick={prevStep}>
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back
               </Button>
               <Button type="submit">
                 Calculate Results <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
          </form>
        </Form>
      )}

       {/* Step 4: Results Display */}
       {currentStep === 4 && weeksRemaining !== null && (
         <div className="space-y-6">
           <h3 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">Summary Results</h3>
           {/* Input Summary Card */}
           <div className="bg-muted border border-border/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3">Input Values</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Year of Injury:</span> <span className="font-medium text-foreground">{yearOfInjury}</span>
                    <span className="text-muted-foreground">Comp Rate:</span> <span className="font-medium text-foreground">${compRate?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A'}</span>
                    {/* Use ?? 0 for display if needed, as store might hold number */}
                    <span className="text-muted-foreground">TTD Weeks Paid:</span> <span className="font-medium text-foreground">{ttdPaidToDate ?? 0}</span>
                    <span className="text-muted-foreground">Other Credit Weeks:</span> <span className="font-medium text-foreground">{otherCredit ?? 0}</span>
                </div>
           </div>
            {/* Calculation Results Card */}
           <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-foreground mb-3">Calculation Details</h4>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-muted-foreground">TTD Value Paid:</span> <span className="font-medium text-foreground">${ttdPaidToDateValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A'}</span>
                    <span className="text-muted-foreground">Weeks Remaining:</span> <span className="font-medium text-foreground">{weeksRemaining?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'}</span>
                    <span className="text-muted-foreground">Discount Rate:</span> <span className="font-medium text-foreground">{(discountRate != null ? discountRate * 100 : NaN).toFixed(2)}%</span>
                    <span className="text-muted-foreground">Discounted Weeks:</span> <span className="font-medium text-foreground">{discountedWeeks?.toFixed(4) ?? 'N/A'}</span>
                </div>
           </div>
           {/* Settlement Values Card */}
           <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-3">Settlement Values</h4>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-primary font-semibold">Commuted Value (100%):</span>
                        <span className="font-bold text-lg text-primary">${commutedValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A'}</span>
                    </div>
                     <div className="flex justify-between items-center text-muted-foreground">
                        <span>95% of Commuted Value:</span>
                        <span className="font-medium">${commutedValue95?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A'}</span>
                    </div>
                     <div className="flex justify-between items-center text-muted-foreground">
                        <span>90% of Commuted Value:</span>
                        <span className="font-medium">${commutedValue90?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 'N/A'}</span>
                    </div>
                </div>
           </div>
           {/* Action Buttons */}
           <div className="flex flex-wrap justify-start gap-3 pt-4">
             <Button variant="outline" onClick={prevStep}>
               <ArrowLeft className="mr-2 h-4 w-4" /> Back
             </Button>
             <Button variant="destructive" onClick={resetCalculator}>
               <RotateCcw className="mr-2 h-4 w-4" /> Start New
             </Button>
             <Button variant="secondary" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print Results
             </Button>
           </div>
         </div>
       )}
    </div>
  );
};

export default CommutedValueCalculator;
