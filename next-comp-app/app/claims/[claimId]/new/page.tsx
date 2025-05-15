// app/claims/[claimId]/new/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/Components/ui/button';
import { Input } from '@/app/Components/ui/input';
import { Label } from '@/app/Components/ui/label';
import { Textarea } from '@/app/Components/ui/textarea'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/Components/ui/card';
import { useToast } from "@/app/Components/ui/use-toast";
import { Loader2, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { AlternativeDatePicker } from "@/app/Components/ui/date-picker";
import { useSession } from 'next-auth/react';

// Zod schema for the "Add Claim" form, aligned with API and Prisma schema
const addClaimFormSchema = z.object({
  // injuredWorkerId is from URL, employerId is selected
  employerId: z.string().uuid("Invalid employer ID").optional().nullable(), // Assuming UUID for employerId
  
  wcc_file_number: z.string().optional().nullable(),
  carrier_file_number: z.string().optional().nullable(),
  
  date_of_injury: z.date({ required_error: "Date of injury is required." }), // Required
  
  time_of_injury: z.string().optional().nullable(),
  place_of_injury: z.string().optional().nullable(),
  accident_description: z.string().optional().nullable(),
  part_of_body_injured: z.string().min(1, "Part of body injured is required.").optional().nullable(), // Example if you want to make it required on form
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
});

type AddClaimFormData = z.infer<typeof addClaimFormSchema>;

interface EmployerOption {
    id: string;
    name: string | null;
}

const FormItem = ({ label, id, children, error, description }: { label?: string, id: string, children: React.ReactNode, error?: string, description?: string }) => (
  <div className="space-y-1.5">
    {label && <Label htmlFor={id} className={error ? 'text-destructive' : ''}>{label}</Label>}
    {children}
    {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

export default function AddNewClaimPage() {
  const router = useRouter();
  const params = useParams();
  const workerId = params.workerId as string; 

  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [injuredWorkerName, setInjuredWorkerName] = useState<string | null>(null);
  const [employers, setEmployers] = useState<EmployerOption[]>([]);
  const [pageLoading, setPageLoading] = useState(true);


  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<AddClaimFormData>({
    resolver: zodResolver(addClaimFormSchema),
    defaultValues: {
      wcc_file_number: '',
      carrier_file_number: '',
      // date_of_injury: null, // Will be set by date picker, required by Zod
      time_of_injury: '',
      place_of_injury: '',
      accident_description: '',
      part_of_body_injured: '',
      nature_of_injury: '',
      cause_of_injury: '',
      notice_given_date: null,
      average_weekly_wage: null,
      compensation_rate: null,
      date_disability_began: null,
      date_returned_to_work: null,
      mmi_date: null,
      initial_treatment_desc: '',
      current_work_status: '',
      permanent_impairment_rating: null,
      claimant_attorney_name: '',
      claimant_attorney_firm: '',
      claimant_attorney_address: '',
      claimant_attorney_phone: '',
      claimant_attorney_email: '',
      claim_status: 'Open', 
      employerId: null,
    }
  });

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.profileId && workerId) {
        const fetchData = async () => {
            setPageLoading(true);
            try {
                // Fetch worker details (for name and authorization)
                const workerResponse = await fetch(`/api/workers/${workerId}`); 
                if (!workerResponse.ok) {
                    throw new Error("Failed to fetch worker details for claim association.");
                }
                const worker = await workerResponse.json();
                // @ts-ignore
                if (worker.profileId !== session.user.profileId) {
                    toast({ title: "Authorization Error", description: "You are not authorized to add claims for this worker.", variant: "destructive" });
                    router.push(`/workers`); 
                    return;
                }
                setInjuredWorkerName(`${worker.first_name} ${worker.last_name}`);

                // Fetch employers (assuming you have an API endpoint for this)
                // For now, this is a placeholder. You'll need an API like /api/employers?profileId=...
                // const employerResponse = await fetch(`/api/employers?profileId=${session.user.profileId}`);
                // if (!employerResponse.ok) throw new Error("Failed to fetch employers");
                // const employerData: EmployerOption[] = await employerResponse.json();
                // setEmployers(employerData);

            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ title: "Error", description: (error as Error).message || "Could not load required information.", variant: "destructive" });
                router.push(`/workers/${workerId}`); 
            } finally {
                setPageLoading(false);
            }
        };
        void fetchData();
    } else if (sessionStatus === "unauthenticated") {
        router.push("/login");
    } else if (sessionStatus === "authenticated" && !session?.user?.profileId) {
        toast({ title: "Profile Error", description: "User profile not found.", variant: "destructive"});
        router.push("/dashboard"); 
        setPageLoading(false);
    }
  }, [sessionStatus, session, workerId, router, toast]);


  const onSubmit: SubmitHandler<AddClaimFormData> = async (formData) => {
    if (!workerId) {
        toast({ title: "Error", description: "Worker ID is missing.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        injuredWorkerId: workerId,
        claimant_attorney_phone: formData.claimant_attorney_phone ? formData.claimant_attorney_phone.replace(/\D/g, '') : null,
      };

      const response = await fetch('/api/claims', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: { error?: string, details?: any } = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        throw new Error(errorData.error || `Failed to add claim: ${response.statusText}`);
      }

      const newClaim = await response.json();
      toast({ title: "Success!", description: `Claim added successfully for ${injuredWorkerName}. WCC File #: ${newClaim.wcc_file_number || 'N/A'}` });
      router.push(`/workers/${workerId}`); 
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      console.error("Failed to add claim:", error);
      toast({ title: "Submission Failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (pageLoading || sessionStatus === "loading") {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading form...</p>
        </div>
    );
  }
  
  if (!injuredWorkerName && !pageLoading) { 
      return (
          <div className="container mx-auto px-4 py-8 text-center">
              <Card className="w-full max-w-lg mx-auto bg-destructive/10 border-destructive">
                <CardHeader><CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5"/>Access Error</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-destructive-foreground">Could not load worker information or access denied.</p>
                    <Button variant="outline" onClick={() => router.push(`/workers/${workerId}`)} className="mt-4">
                        Back to Worker
                    </Button>
                </CardContent>
              </Card>
          </div>
      );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="flex items-center mb-6 space-x-3">
        <Button variant="outline" size="icon" onClick={() => router.push(`/workers/${workerId}`)} aria-label="Back to Worker Details">
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Claim</h1>
            <p className="text-muted-foreground">For Injured Worker: {injuredWorkerName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Claim Information</CardTitle>
            <CardDescription>Fill in the details for the new claim. <span className="text-destructive">*</span> indicates required fields.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormItem label="WCC File Number" id="wcc_file_number" error={errors.wcc_file_number?.message}>
                    <Input id="wcc_file_number" {...register("wcc_file_number")} />
                </FormItem>
                <FormItem label="Carrier File Number" id="carrier_file_number" error={errors.carrier_file_number?.message}>
                    <Input id="carrier_file_number" {...register("carrier_file_number")} />
                </FormItem>
                
                <div className="md:col-span-2">
                    <AlternativeDatePicker name="date_of_injury" control={control} label="Date of Injury *" />
                    {errors.date_of_injury && <p className="text-sm text-destructive">{errors.date_of_injury.message}</p>}
                </div>

                <FormItem label="Time of Injury (e.g., 10:30 AM)" id="time_of_injury" error={errors.time_of_injury?.message}>
                    <Input id="time_of_injury" {...register("time_of_injury")} placeholder="HH:MM AM/PM" />
                </FormItem>
                <FormItem label="Claim Status" id="claim_status" error={errors.claim_status?.message}>
                    <Controller
                        name="claim_status"
                        control={control}
                        defaultValue="Open"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || "Open"}>
                                <SelectTrigger id="claim_status"><SelectValue placeholder="Select status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Denied">Denied</SelectItem>
                                    <SelectItem value="Accepted">Accepted</SelectItem>
                                    <SelectItem value="Investigating">Investigating</SelectItem>
                                    <SelectItem value="In Litigation">In Litigation</SelectItem>
                                    <SelectItem value="Pending Review">Pending Review</SelectItem>
                                    <SelectItem value="Unknown">Unknown</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </FormItem>
                <FormItem label="Employer (at time of injury)" id="employerId" error={errors.employerId?.message} description="Select if applicable.">
                    <Controller
                        name="employerId"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""} disabled={employers.length === 0}>
                                <SelectTrigger id="employerId">
                                    <SelectValue placeholder={employers.length > 0 ? "Select an employer" : "No employers available"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {employers.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.name || `ID: ...${emp.id.slice(-6)}`}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {/* You might want a way to add a new employer if not in the list */}
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
             <FormItem label="Initial Treatment Description" id="initial_treatment_desc" error={errors.initial_treatment_desc?.message}>
              <Textarea id="initial_treatment_desc" {...register("initial_treatment_desc")} />
            </FormItem>

            <h4 className="text-md font-semibold pt-4 border-t">Compensation & Work Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormItem label="Average Weekly Wage ($)" id="average_weekly_wage" error={errors.average_weekly_wage?.message}>
                    <Input type="number" step="0.01" id="average_weekly_wage" {...register("average_weekly_wage")} />
                </FormItem>
                <FormItem label="Compensation Rate ($)" id="compensation_rate" error={errors.compensation_rate?.message}>
                    <Input type="number" step="0.01" id="compensation_rate" {...register("compensation_rate")} />
                </FormItem>
                <div>
                    <AlternativeDatePicker name="notice_given_date" control={control} label="Date Notice Given to Employer" />
                    {errors.notice_given_date && <p className="text-sm text-destructive">{errors.notice_given_date.message}</p>}
                </div>
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
            
            <h4 className="text-md font-semibold pt-4 border-t">Claimant's Attorney (if any)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormItem label="Attorney Name" id="claimant_attorney_name" error={errors.claimant_attorney_name?.message}>
                    <Input id="claimant_attorney_name" {...register("claimant_attorney_name")} />
                </FormItem>
                <FormItem label="Attorney Firm" id="claimant_attorney_firm" error={errors.claimant_attorney_firm?.message}>
                    <Input id="claimant_attorney_firm" {...register("claimant_attorney_firm")} />
                </FormItem>
                <FormItem label="Attorney Phone" id="claimant_attorney_phone" error={errors.claimant_attorney_phone?.message}>
                    <Input type="tel" id="claimant_attorney_phone" {...register("claimant_attorney_phone")} placeholder="(XXX) XXX-XXXX" />
                </FormItem>
                <FormItem label="Attorney Email" id="claimant_attorney_email" error={errors.claimant_attorney_email?.message}>
                    <Input type="email" id="claimant_attorney_email" {...register("claimant_attorney_email")} />
                </FormItem>
                <FormItem label="Attorney Address" id="claimant_attorney_address" error={errors.claimant_attorney_address?.message} description="Full address for attorney.">
                    <Textarea id="claimant_attorney_address" {...register("claimant_attorney_address")} className="md:col-span-2"/>
                </FormItem>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Adding Claim...' : 'Add Claim'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
