// app/claims/[claimId]/edit/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/Components/ui/button';
import { Input } from '@/app/Components/ui/input';
import { Label } from '@/app/Components/ui/label';
import { Textarea } from '@/app/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/Components/ui/card';
import { useToast } from "@/app/Components/ui/use-toast";
import { Loader2, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { AlternativeDatePicker } from "@/app/Components/ui/date-picker";
import { isValid, parseISO } from 'date-fns';
// Removed: import type { ClaimFullDetail as ClaimViewData } from '../page'; 

// Define the necessary type structure for the data fetched for pre-filling the form
// This replaces the import from '../page' as ClaimFullDetail was not exported there.
interface ClaimViewData {
  id: string;
  wcc_file_number: string | null;
  carrier_file_number: string | null;
  date_of_injury: string; // From Prisma schema, it's DateTime (non-nullable)
  time_of_injury: string | null;
  place_of_injury: string | null;
  accident_description: string | null;
  part_of_body_injured: string | null;
  nature_of_injury: string | null;
  cause_of_injury: string | null;
  notice_given_date: string | null;
  average_weekly_wage: number | null;
  compensation_rate: number | null;
  date_disability_began: string | null;
  date_returned_to_work: string | null;
  mmi_date: string | null;
  initial_treatment_desc: string | null;
  current_work_status: string | null;
  permanent_impairment_rating: number | null;
  claimant_attorney_name: string | null;
  claimant_attorney_firm: string | null;
  claimant_attorney_address: string | null;
  claimant_attorney_phone: string | null;
  claimant_attorney_email: string | null;
  claim_status: string | null;
  employerId: string | null; // Only employerId is needed for the form
  employer?: { // Employer object is optional for pre-filling the form's state
    id: string;
    name?: string | null; // For display if needed, but form only needs employerId
  } | null;
  injuredWorker?: { // For display in the header
    first_name: string | null;
    last_name: string | null;
  } | null;
  // Add other fields from your Claim model if they are fetched and used for pre-filling
}


// Zod schema for editing a claim, aligned with API and Prisma schema
const editClaimFormSchema = z.object({
  wcc_file_number: z.string().optional().nullable(),
  carrier_file_number: z.string().optional().nullable(),
  
  // date_of_injury is required in DB. Zod makes it required for the form.
  date_of_injury: z.date({ required_error: "Date of injury is required.", invalid_type_error: "Invalid date of injury" }), 
  
  time_of_injury: z.string().optional().nullable(),
  place_of_injury: z.string().optional().nullable(),
  accident_description: z.string().optional().nullable(),
  part_of_body_injured: z.string().optional().nullable(),
  nature_of_injury: z.string().optional().nullable(),
  cause_of_injury: z.string().optional().nullable(),
  notice_given_date: z.date().optional().nullable(),

  average_weekly_wage: z.coerce.number({invalid_type_error: "AWW must be a number"}).positive("AWW must be positive").optional().nullable(),
  compensation_rate: z.coerce.number({invalid_type_error: "Comp rate must be a number"}).positive("Comp rate must be positive").optional().nullable(),
  date_disability_began: z.date().optional().nullable(),
  date_returned_to_work: z.date().optional().nullable(),
  mmi_date: z.date().optional().nullable(),

  initial_treatment_desc: z.string().optional().nullable(),
  current_work_status: z.string().optional().nullable(),
  permanent_impairment_rating: z.coerce.number().int({message: "Rating must be a whole number"}).min(0).optional().nullable(),

  claimant_attorney_name: z.string().optional().nullable(),
  claimant_attorney_firm: z.string().optional().nullable(),
  claimant_attorney_address: z.string().optional().nullable(),
  claimant_attorney_phone: z.string().optional().nullable().refine(val => !val || /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(val), {
    message: "Invalid phone number format or empty",
  }),
  claimant_attorney_email: z.string().email({ message: "Invalid email address" }).optional().nullable().or(z.literal('')),
  
  claim_status: z.string().optional().nullable(),
  employerId: z.string().uuid("Invalid employer ID format").optional().nullable(),
});

type EditClaimFormData = z.infer<typeof editClaimFormSchema>;

interface ApiErrorData {
    error?: string;
    details?: unknown; 
}
interface EmployerOption { 
    id: string;
    name: string | null;
}

interface FormItemProps {
  label?: string;
  id: string;
  children: React.ReactNode;
  error?: string;
  description?: string;
  className?: string; // Added className prop
}

const FormItem: React.FC<FormItemProps> = ({ label, id, children, error, description, className }) => (
  <div className={`space-y-1.5 ${className || ''}`}> {/* Applied className */}
    {label && <Label htmlFor={id} className={error ? 'text-destructive' : ''}>{label}</Label>}
    {children}
    {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

export default function EditClaimPage() {
  const router = useRouter();
  const params = useParams();
  const claimId = params.claimId as string;

  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();

  const [initialClaimData, setInitialClaimData] = useState<ClaimViewData | null>(null);
  const [employers, setEmployers] = useState<EmployerOption[]>([]); 
  const [pageStatus, setPageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors, isDirty }, reset } = useForm<EditClaimFormData>({
    resolver: zodResolver(editClaimFormSchema),
    defaultValues: { // Initialize all fields to prevent uncontrolled -> controlled warning
        wcc_file_number: '', carrier_file_number: '',
        date_of_injury: undefined, // Required, but DatePicker handles undefined as empty
        time_of_injury: '', place_of_injury: '', accident_description: '',
        part_of_body_injured: '', nature_of_injury: '', cause_of_injury: '',
        notice_given_date: undefined, average_weekly_wage: null, compensation_rate: null,
        date_disability_began: undefined, date_returned_to_work: undefined, mmi_date: undefined,
        initial_treatment_desc: '', current_work_status: '', permanent_impairment_rating: null,
        claimant_attorney_name: '', claimant_attorney_firm: '', claimant_attorney_address: '',
        claimant_attorney_phone: '', claimant_attorney_email: '',
        claim_status: '', employerId: null,
    }, 
  });

  // Updated parseDateIfNeeded to return Date | undefined
  const parseDateIfNeeded = useCallback((dateValue: string | Date | null | undefined): Date | undefined => {
    if (!dateValue) return undefined; // Return undefined for null or undefined input
    if (dateValue instanceof Date && isValid(dateValue)) return dateValue;
     if (typeof dateValue === 'string') {
      try {
        const parsed = parseISO(dateValue);
        return isValid(parsed) ? parsed : undefined; // Return undefined if parsing fails
      } catch { return undefined; }
    }
    return undefined; // Fallback
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.profileId && claimId) {
      setPageStatus('loading');
      setError(null);
      const fetchInitialData = async () => {
        try {
          const claimResponse = await fetch(`/api/claims/${claimId}`);
          if (!claimResponse.ok) {
            const errData = await claimResponse.json().catch(() => ({error: "Failed to parse error"}));
            throw new Error(errData.error || `Failed to fetch claim details for editing: ${claimResponse.statusText}`);
          }
          const data: ClaimViewData = await claimResponse.json();
          setInitialClaimData(data);

          // Placeholder for fetching employers
          // const employerResponse = await fetch(`/api/employers?profileId=${session.user.profileId}`);
          // if (employerResponse.ok) setEmployers(await employerResponse.json());

          reset({ 
            wcc_file_number: data.wcc_file_number || '', // Ensure string for input
            carrier_file_number: data.carrier_file_number || '',
            date_of_injury: parseDateIfNeeded(data.date_of_injury), // Will be Date or undefined
            time_of_injury: data.time_of_injury || '',
            place_of_injury: data.place_of_injury || '',
            accident_description: data.accident_description || '',
            part_of_body_injured: data.part_of_body_injured || '',
            nature_of_injury: data.nature_of_injury || '',
            cause_of_injury: data.cause_of_injury || '',
            notice_given_date: parseDateIfNeeded(data.notice_given_date),
            average_weekly_wage: data.average_weekly_wage, // Can be null
            compensation_rate: data.compensation_rate,   // Can be null
            date_disability_began: parseDateIfNeeded(data.date_disability_began),
            date_returned_to_work: parseDateIfNeeded(data.date_returned_to_work),
            mmi_date: parseDateIfNeeded(data.mmi_date),
            initial_treatment_desc: data.initial_treatment_desc || '',
            current_work_status: data.current_work_status || '',
            permanent_impairment_rating: data.permanent_impairment_rating, // Can be null
            claimant_attorney_name: data.claimant_attorney_name || '',
            claimant_attorney_firm: data.claimant_attorney_firm || '',
            claimant_attorney_address: data.claimant_attorney_address || '',
            claimant_attorney_phone: data.claimant_attorney_phone || '',
            claimant_attorney_email: data.claimant_attorney_email || '',
            claim_status: data.claim_status || '',
            employerId: data.employer?.id || null, // Can be null
          });
          setPageStatus('loaded');
        } catch (err) {
          const message = err instanceof Error ? err.message : "An unknown error occurred.";
          setError(message);
          setPageStatus('error');
        }
      };
      void fetchInitialData();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (sessionStatus === "authenticated" && !session?.user?.profileId) {
        setError("User profile not found. Cannot edit claim.");
        setPageStatus('error');
    }
  }, [sessionStatus, session?.user?.profileId, claimId, router, reset, parseDateIfNeeded, toast]); // Added toast to dependencies


  const onSubmit: SubmitHandler<EditClaimFormData> = async (formData) => {
    if (!claimId) return;
    setIsSubmitting(true);
    setError(null);

    // Since date_of_injury is required in DB, ensure it's a valid date before sending
    if (!formData.date_of_injury || !isValid(formData.date_of_injury)) {
        toast({ title: "Validation Error", description: "Date of Injury is required and must be a valid date.", variant: "destructive" });
        setIsSubmitting(false);
        // Manually set error for react-hook-form if needed, though Zod should catch this on schema level
        // errors.date_of_injury = { type: 'manual', message: 'Date of Injury is required.' };
        return;
    }

    try {
      const dataToSend = {
        ...formData,
        claimant_attorney_phone: formData.claimant_attorney_phone ? formData.claimant_attorney_phone.replace(/\D/g, '') : null,
        // date_of_injury is already a Date object from the form if valid, or undefined.
        // The API PUT schema handles optional date_of_injury. If it's sent, it must be valid.
        // If it's required, the form validation (Zod) ensures it's a Date.
      };

      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData: ApiErrorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        throw new Error(errorData.error || `Failed to update claim: ${response.statusText}`);
      }
      
      toast({ title: "Success!", description: "Claim details updated successfully." });
      router.push(`/claims/${claimId}`); 
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({ title: "Update Failed", description: message, variant: "destructive" });
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Conditional rendering for loading and error states
  if (pageStatus === 'loading') {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading claim data for editing...</p>
        </div>
    );
  }
  if (pageStatus === 'error' || !initialClaimData) {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
            <Card className="w-full max-w-lg bg-destructive/10 border-destructive">
                <CardHeader><CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5"/>Error</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-destructive-foreground">{error || "Could not load claim data for editing."}</p>
                    <Button variant="outline" onClick={() => router.push(`/claims/${claimId}`)} className="mt-4">Back to Claim View</Button>
                </CardContent>
            </Card>
        </div>
    );
  }


  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="flex items-center mb-6 space-x-3">
        <Button variant="outline" size="icon" onClick={() => router.push(`/claims/${claimId}`)} aria-label="Back to Claim View">
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Claim</h1>
            <p className="text-muted-foreground">
                WCC#: {initialClaimData?.wcc_file_number || "N/A"} for {initialClaimData?.injuredWorker?.first_name} {initialClaimData?.injuredWorker?.last_name}
            </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Update Claim Information</CardTitle>
            <CardDescription>Modify the details below. <span className="text-destructive">*</span> indicates required by database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Case Identifiers Section */}
            <h4 className="text-lg font-semibold pt-2 text-primary">Case Identifiers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormItem label="WCC File Number" id="wcc_file_number" error={errors.wcc_file_number?.message}>
                    <Input id="wcc_file_number" {...register("wcc_file_number")} />
                </FormItem>
                <FormItem label="Carrier File Number" id="carrier_file_number" error={errors.carrier_file_number?.message}>
                    <Input id="carrier_file_number" {...register("carrier_file_number")} />
                </FormItem>
            </div>

            {/* Incident Details Section */}
            <h4 className="text-lg font-semibold pt-4 border-t text-primary">Incident Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="md:col-span-2"> {/* Date of Injury spans full width on medium screens */}
                    <AlternativeDatePicker name="date_of_injury" control={control} label="Date of Injury *" />
                    {errors.date_of_injury && <p className="text-sm text-destructive">{errors.date_of_injury.message}</p>}
                </div>
                <FormItem label="Time of Injury" id="time_of_injury" error={errors.time_of_injury?.message}>
                    <Input id="time_of_injury" {...register("time_of_injury")} placeholder="HH:MM AM/PM"/>
                </FormItem>
                <FormItem label="Claim Status" id="claim_status" error={errors.claim_status?.message}>
                    <Controller name="claim_status" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={initialClaimData?.claim_status || ""}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Open"></SelectItem><SelectItem value="Closed">Closed</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem><SelectItem value="Denied">Denied</SelectItem>
                                <SelectItem value="Accepted">Accepted</SelectItem><SelectItem value="Investigating">Investigating</SelectItem>
                                <SelectItem value="In Litigation">In Litigation</SelectItem><SelectItem value="Pending Review">Pending Review</SelectItem>
                                <SelectItem value="Unknown">Unknown</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                </FormItem>
                 <FormItem label="Employer" id="employerId" error={errors.employerId?.message} description="Employer at time of injury.">
                    <Controller name="employerId" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={employers.length === 0} defaultValue={initialClaimData?.employer?.id || ""}>
                            <SelectTrigger><SelectValue placeholder={employers.length > 0 ? "Select an employer" : "No employers loaded"} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {employers.map(emp => (<SelectItem key={emp.id} value={emp.id}>{emp.name || `ID: ...${emp.id.slice(-6)}`}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    )} />
                </FormItem>
            </div>
            <FormItem label="Place of Injury" id="place_of_injury" error={errors.place_of_injury?.message}>
                <Textarea id="place_of_injury" {...register("place_of_injury")} />
            </FormItem>
            <FormItem label="Accident Description" id="accident_description" error={errors.accident_description?.message}>
                <Textarea id="accident_description" {...register("accident_description")} />
            </FormItem>
            <FormItem label="Part of Body Injured" id="part_of_body_injured" error={errors.part_of_body_injured?.message}>
                <Textarea id="part_of_body_injured" {...register("part_of_body_injured")} />
            </FormItem>
            <FormItem label="Nature of Injury" id="nature_of_injury" error={errors.nature_of_injury?.message}>
                <Textarea id="nature_of_injury" {...register("nature_of_injury")} />
            </FormItem>
            <FormItem label="Cause of Injury" id="cause_of_injury" error={errors.cause_of_injury?.message}>
                <Textarea id="cause_of_injury" {...register("cause_of_injury")} />
            </FormItem>
            
            {/* Compensation & Work Status Section */}
            <h4 className="text-lg font-semibold pt-4 border-t text-primary">Compensation & Work Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                    <AlternativeDatePicker name="notice_given_date" control={control} label="Date Notice Given to Employer" />
                    {errors.notice_given_date && <p className="text-sm text-destructive">{errors.notice_given_date.message}</p>}
                </div>
                <FormItem label="Average Weekly Wage ($)" id="average_weekly_wage" error={errors.average_weekly_wage?.message}>
                    <Input type="number" step="0.01" id="average_weekly_wage" {...register("average_weekly_wage")} />
                </FormItem>
                <FormItem label="Compensation Rate ($)" id="compensation_rate" error={errors.compensation_rate?.message}>
                    <Input type="number" step="0.01" id="compensation_rate" {...register("compensation_rate")} />
                </FormItem>
                <div>
                    <AlternativeDatePicker name="date_disability_began" control={control} label="Date Disability Began" />
                    {errors.date_disability_began && <p className="text-sm text-destructive">{errors.date_disability_began.message}</p>}
                </div>
                <div>
                    <AlternativeDatePicker name="date_returned_to_work" control={control} label="Date Returned to Work" />
                    {errors.date_returned_to_work && <p className="text-sm text-destructive">{errors.date_returned_to_work.message}</p>}
                </div>
                <div>
                    <AlternativeDatePicker name="mmi_date" control={control} label="MMI Date" />
                    {errors.mmi_date && <p className="text-sm text-destructive">{errors.mmi_date.message}</p>}
                </div>
                <FormItem label="Current Work Status" id="current_work_status" error={errors.current_work_status?.message}>
                    <Input id="current_work_status" {...register("current_work_status")} />
                </FormItem>
                <FormItem label="Permanent Impairment Rating (%)" id="permanent_impairment_rating" error={errors.permanent_impairment_rating?.message}>
                    <Input type="number" id="permanent_impairment_rating" {...register("permanent_impairment_rating")} />
                </FormItem>
            </div>
             <FormItem label="Initial Treatment Description" id="initial_treatment_desc" error={errors.initial_treatment_desc?.message}>
                <Textarea id="initial_treatment_desc" {...register("initial_treatment_desc")} />
            </FormItem>

            {/* Claimant's Attorney Section */}
            <h4 className="text-lg font-semibold pt-4 border-t text-primary">Claimant's Attorney (if any)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormItem label="Attorney Name" id="claimant_attorney_name" error={errors.claimant_attorney_name?.message}>
                    <Input id="claimant_attorney_name" {...register("claimant_attorney_name")} />
                </FormItem>
                <FormItem label="Attorney Firm" id="claimant_attorney_firm" error={errors.claimant_attorney_firm?.message}>
                    <Input id="claimant_attorney_firm" {...register("claimant_attorney_firm")} />
                </FormItem>
                <FormItem label="Attorney Phone" id="claimant_attorney_phone" error={errors.claimant_attorney_phone?.message}>
                    <Input type="tel" id="claimant_attorney_phone" {...register("claimant_attorney_phone")} placeholder="(XXX) XXX-XXXX"/>
                </FormItem>
                <FormItem label="Attorney Email" id="claimant_attorney_email" error={errors.claimant_attorney_email?.message}>
                    <Input type="email" id="claimant_attorney_email" {...register("claimant_attorney_email")} />
                </FormItem>
                <FormItem label="Attorney Address" id="claimant_attorney_address" error={errors.claimant_attorney_address?.message} description="Full address for attorney." className="md:col-span-2">
                    <Textarea id="claimant_attorney_address" {...register("claimant_attorney_address")} />
                </FormItem>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button variant="outline" type="button" onClick={() => router.push(`/claims/${claimId}`)} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
      {error && !isSubmitting && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}
    </div>
  );
}
