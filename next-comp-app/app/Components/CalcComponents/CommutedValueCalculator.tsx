// app/Components/CalcComponents/CommutedValueCalculator.tsx
'use client';

import React, { useState, useEffect } from "react";
import { useCommutedValueStore } from "@/app/stores/commutedValueStore"; // Adjust path if needed
// Import Controller from react-hook-form for manual input control
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// --- Import Schemas and Types ---
import {
  YearOfInjurySchema, YearOfInjuryValues,
  CompRateSchema, CompRateValues,
  WeeksSchema, WeeksValues
} from "@/app/schemas/commutedValueSchemas"; // Adjust path if needed

// --- Import Helper Functions ---
import { formatCurrency, parseCurrency } from "@/app/utils/formatting"; // Adjust path if needed

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

// --- Prop Types ---
// Interface defining the props expected by this component
interface CommutedValueCalculatorProps {
  // Use Record<number, number> directly
  maxCompensationRates: Record<number, number>; // Historical max rates passed from server
  currentMarketDiscountRate: number | null; // Current variable discount rate passed from server
}

// --- Component ---
const CommutedValueCalculator: React.FC<CommutedValueCalculatorProps> = ({
  maxCompensationRates,
  currentMarketDiscountRate // Receive the props
}) => {
  // Zustand store state and actions...
  // Add calculationDate to destructuring
  const {
    yearOfInjury, compRate, ttdPaidToDate, otherCredit, currentStep,
    weeksRemaining, discountRate, discountedWeeks, commutedValue,
    ttdPaidToDateValue, commutedValue95, commutedValue90, calculationDate, // Added calculationDate
    setYearOfInjury, setCompRate, setTtdPaidToDate, setOtherCredit,
    nextStep, prevStep, resetCalculator, calculateResults
  } = useCommutedValueStore();

  // Local state for custom step errors (if needed beyond Zod)
  const [customStepError, setCustomStepError] = useState<string | null>(null);
  // Generate list of years for the dropdown
  const currentYear = new Date().getFullYear(); // Use currentYear for static default
  const years = Array.from(
    { length: currentYear - 1979 + 1 },
    (_, i) => (currentYear - i).toString()
  );

  // --- Forms Setup ---
  // Initialize forms with static defaults to prevent hydration mismatch.
  // useEffect hooks will sync them with the store state after client mount.
  const yearForm = useForm<YearOfInjuryValues>({
    resolver: zodResolver(YearOfInjurySchema),
    // Use static current year as initial default for hydration consistency
    defaultValues: { yearOfInjury: currentYear.toString() }
  });

  const compRateForm = useForm<CompRateValues>({
    resolver: zodResolver(CompRateSchema),
    // Use static undefined as initial default
    defaultValues: { compRate: undefined }
  });

  const weeksForm = useForm<WeeksValues>({
    resolver: zodResolver(WeeksSchema),
    // Use static undefined as initial defaults
    defaultValues: {
        ttdPaidToDate: undefined,
        otherCredit: undefined
    }
  });

  // --- Local State for Formatted Comp Rate Display ---
  // Initialize based on the static default (undefined) -> empty string
  const [displayCompRate, setDisplayCompRate] = useState<string>(() =>
    formatCurrency(undefined) // Initialize with empty state
  );
  const [isCompRateFocused, setIsCompRateFocused] = useState(false);

  // --- Effects ---

  // Effect to update displayCompRate when form state changes externally or focus changes
  useEffect(() => {
    const currentFormValue = compRateForm.getValues('compRate');
    if (!isCompRateFocused) {
      setDisplayCompRate(formatCurrency(currentFormValue));
    } else {
      setDisplayCompRate(currentFormValue?.toString() ?? '');
    }
    // Watch the form value itself for changes
  }, [compRateForm.watch('compRate'), isCompRateFocused, compRateForm]);


  // Effects for syncing Forms with Store AFTER initial hydration
  useEffect(() => {
    // Reset form based on store value (runs only on client after mount)
    yearForm.reset({ yearOfInjury: yearOfInjury || currentYear.toString() });
  }, [yearOfInjury, yearForm, currentYear]); // Keep dependencies

  useEffect(() => {
    // Reset form based on store value
    compRateForm.reset({ compRate: compRate ?? undefined });
    // Display update will be handled by the effect watching the form value
  }, [compRate, compRateForm]); // Keep dependencies

  useEffect(() => {
     // Reset form based on store value
    weeksForm.reset({
      ttdPaidToDate: ttdPaidToDate ?? undefined,
      otherCredit: otherCredit ?? undefined
    });
  }, [ttdPaidToDate, otherCredit, weeksForm]); // Keep dependencies


  // --- Submission Handlers ---
  const handleStep1Submit = (data: YearOfInjuryValues) => {
    setYearOfInjury(data.yearOfInjury);
    setCustomStepError(null);
    nextStep();
  };

  const handleStep2Submit = (data: CompRateValues) => {
    // Get year from store (should be synced by useEffect)
    const year = parseInt(useCommutedValueStore.getState().yearOfInjury); // Read latest from store
    const maxRate = maxCompensationRates[year] || 0;

    // Manual validation against fetched max rate
    if (data.compRate > maxRate) {
      compRateForm.setError("compRate", {
        type: "manual",
        message: `Rate cannot exceed max $${maxRate.toLocaleString('en-US')} for ${year}.` // Use store value for year
      });
      return;
    }
    setCompRate(data.compRate); // Update store
    setCustomStepError(null);
    nextStep();
  };

  const handleStep3Submit = (data: WeeksValues) => {
    // Update store state, defaulting undefined optional fields to 0
    setTtdPaidToDate(data.ttdPaidToDate ?? 0);
    setOtherCredit(data.otherCredit ?? 0);
    setCustomStepError(null);

    // Call the calculateResults action, passing the fetched discount rate
    calculateResults(currentMarketDiscountRate);

    nextStep(); // Move to the results step
  };

  // --- Render Logic ---
  // Note: The initial render uses static defaults, useEffects sync with store for client interaction
  return (
    // Add a container ID for print styling parent
    <div id="commuted-value-calculator-container">
      {/* Inject CSS for printing */}
      <style jsx global>{`
        /* Default screen styles */
        .print-only {
          display: none; /* Hide elements marked for print only */
        }

        @media print {
          body * {
            visibility: hidden; /* Hide everything by default */
          }
          /* Make only the results area and its children visible */
          #commuted-value-results, #commuted-value-results * {
            visibility: visible;
          }
          /* Position the results area at the top left of the print page */
          #commuted-value-results {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%; /* Ensure it takes full width */
            padding: 1rem; /* Add some padding for print */
            border: none; /* Remove borders for print */
            box-shadow: none; /* Remove shadows for print */
            margin: 0; /* Reset margin */
            font-size: 10pt; /* Adjust font size for print */
          }
          /* Hide buttons specifically within the results area when printing */
          #commuted-value-results .print-hide-button {
             visibility: hidden;
             display: none;
          }
           /* Ensure result cards stack nicely */
           #commuted-value-results > div:not(.print-only) { /* Exclude disclaimer div from margin */
             margin-bottom: 1rem; /* Add space between cards */
           }
           /* Show elements marked as print-only */
           #commuted-value-results .print-only {
             display: block !important; /* Override default 'display: none' */
             visibility: visible !important;
             margin-top: 2rem; /* Add space above disclaimers */
             padding-top: 1rem; /* Add padding above disclaimers */
             border-top: 1px solid #ccc; /* Add separator line */
           }
           /* Ensure paragraphs within print-only are visible */
            #commuted-value-results .print-only p {
              visibility: visible !important;
            }
        }
      `}</style>

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
                    <Select onValueChange={field.onChange} value={field.value}>
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
              <div className="flex flex-wrap justify-start gap-3 pt-4">
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
              <Controller
                  name="compRate"
                  control={compRateForm.control}
                  render={({ field, fieldState }) => (
                      <FormItem>
                          <FormLabel>Compensation Rate</FormLabel>
                           <FormDescription>
                              Max Rate for {useCommutedValueStore.getState().yearOfInjury}: {formatCurrency(maxCompensationRates[parseInt(useCommutedValueStore.getState().yearOfInjury)] || 0)}
                          </FormDescription>
                          <FormControl>
                              <Input
                                  type="text"
                                  placeholder="Enter the compensation rate..."
                                  inputMode="decimal"
                                  value={displayCompRate}
                                  onFocus={() => {
                                      setIsCompRateFocused(true);
                                      setDisplayCompRate(compRateForm.getValues('compRate')?.toString() ?? '');
                                  }}
                                  onBlur={() => {
                                      setIsCompRateFocused(false);
                                      compRateForm.trigger("compRate").then(isValid => {
                                        const formValue = compRateForm.getValues('compRate');
                                        if(isValid) {
                                          setDisplayCompRate(formatCurrency(formValue));
                                        } else {
                                          setDisplayCompRate(formValue?.toString() ?? '');
                                        }
                                      });
                                      field.onBlur();
                                  }}
                                  onChange={(e) => {
                                      const inputValue = e.target.value;
                                      setDisplayCompRate(inputValue);
                                      const parsedValue = parseCurrency(inputValue);
                                      field.onChange(parsedValue === undefined ? undefined : parsedValue);
                                  }}
                                  ref={field.ref}
                              />
                          </FormControl>
                          <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                  )}
              />
              {customStepError && <p className="text-sm font-medium text-destructive">{customStepError}</p>}
              <div className="flex flex-wrap justify-start gap-3 pt-4">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
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

        {/* Step 3: Weeks Paid/Credit */}
        {currentStep === 3 && (
           <Form {...weeksForm}>
            <form onSubmit={weeksForm.handleSubmit(handleStep3Submit)} className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Step 3: Weeks Paid & Credit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={weeksForm.control}
                  name="ttdPaidToDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TTD Paid to Date (weeks)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          max="500"
                          placeholder="e.g., 52.14"
                          {...field}
                          onChange={event => field.onChange(event.target.value === '' ? undefined : event.target.value)}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={weeksForm.control}
                  name="otherCredit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Credit (weeks)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          max="500"
                          placeholder="e.g., 10"
                          {...field}
                          onChange={event => field.onChange(event.target.value === '' ? undefined : event.target.value)}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {customStepError && <p className="text-sm font-medium text-destructive">{customStepError}</p>}
              {weeksForm.formState.errors.ttdPaidToDate?.type === 'refine' && (
                <p className="text-sm font-medium text-destructive">{weeksForm.formState.errors.ttdPaidToDate.message}</p>
              )}
              <div className="flex flex-wrap justify-start gap-3 pt-4">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="button" variant="destructive" onClick={resetCalculator}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <Button type="submit">
                  Calculate Results <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Step 4: Results Display */}
        {/* Add id="commuted-value-results" for print styling target */}
        {currentStep === 4 && weeksRemaining !== null && (
          <div id="commuted-value-results" className="space-y-6">
            <h3 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">Commuted Value Calculation Results</h3>
            {/* Input Summary Card */}
            <div className="bg-muted border border-border/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3">Input Values</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Year of Injury:</span> <span className="font-medium text-foreground">{useCommutedValueStore.getState().yearOfInjury}</span>
                    <span className="text-muted-foreground">Compensation Rate:</span> <span className="font-medium text-foreground">{formatCurrency(useCommutedValueStore.getState().compRate) || 'N/A'}</span>
                    <span className="text-muted-foreground">TTD Weeks Paid to Date:</span> <span className="font-medium text-foreground">{useCommutedValueStore.getState().ttdPaidToDate ?? 0}</span>
                    <span className="text-muted-foreground">Other Credit Weeks:</span> <span className="font-medium text-foreground">{useCommutedValueStore.getState().otherCredit ?? 0}</span>
                </div>
            </div>
            {/* Calculation Results Card */}
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-foreground mb-3">Calculation Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Calculation Date:</span>
                    <span className="font-medium text-foreground">
                      {calculationDate ? new Date(calculationDate).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="text-muted-foreground">TTD Value Paid:</span> <span className="font-medium text-foreground">{formatCurrency(ttdPaidToDateValue) || 'N/A'}</span>
                    <span className="text-muted-foreground">Weeks Remaining:</span> <span className="font-medium text-foreground">{weeksRemaining?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'}</span>
                    <span className="text-muted-foreground">Discount Rate Applied:</span> <span className="font-medium text-foreground">{(discountRate != null ? discountRate * 100 : NaN).toFixed(2)}%</span>
                    <span className="text-muted-foreground">Discounted Weeks:</span> <span className="font-medium text-foreground">{discountedWeeks?.toFixed(6) ?? 'N/A'}</span>
                </div>
            </div>
            {/* Key Values Card */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-3">Key Values</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-primary font-semibold">Commuted Value (100%):</span>
                        <span className="font-bold text-lg text-primary">{formatCurrency(commutedValue) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>95% of Commuted Value:</span>
                        <span className="font-medium">{formatCurrency(commutedValue95) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>90% of Commuted Value:</span>
                        <span className="font-medium">{formatCurrency(commutedValue90) || 'N/A'}</span>
                    </div>
                </div>
            </div>
            {/* Action Buttons for Step 4 */}
            {/* Add 'print-hide-button' class to buttons we want to hide when printing */}
            <div className="flex flex-wrap justify-start gap-3 pt-4 print-hide-button">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button variant="destructive" onClick={resetCalculator}>
                <RotateCcw className="mr-2 h-4 w-4" /> Start New
              </Button>
              {/* Use standard window.print() - CSS handles what's printed */}
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print Results
              </Button>
            </div>

            {/* Disclaimers Section - Moved inside results div, styled for print only */}
            <div className="print-only text-xs text-muted-foreground space-y-2">
                <p>
                    <strong>Disclaimer:</strong> This calculator is intended for informational purposes only and does not constitute legal advice.
                    While efforts have been made to ensure accuracy based on current South Carolina regulations and rates, users should independently
                    verify all calculations and consult with qualified legal counsel before making any decisions based on these results. <strong>Reliance on
                    this tool is solely at the user&apos;s own risk.</strong>
                </p>
                <p>
                    <strong>Note on Rounding:</strong> The South Carolina Workers&apos; Compensation Commission&apos;s official Net Present Value (NPV) tables
                    round conversion factors to four decimal places. This calculator performs calculations using higher precision, which may result
                    in minor variations compared to the official WCC published values.
                </p>
                <p>
                    <strong>Note on NPV Formula Adjustment:</strong> To align with the methodology used in the official South Carolina Workers&apos; 
                    Compensation Commission&apos;s Net Present Value (NPV) tables, this calculator incorporates an adjustment to the standard present value annuity 
                    formula for calculations involving 101 to 500 weeks. Specifically, an additional week is included in the time period exponent, 
                    mirroring the Commission&apos;s published factors. While this differs from standard financial calculations, it ensures results are consistent 
                    with those expected based on the Commission&apos;s tables.
                </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CommutedValueCalculator;