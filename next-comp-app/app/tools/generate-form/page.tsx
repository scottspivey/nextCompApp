// app/tools/generate-form/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/Components/ui/button';
import { Input } from '@/app/Components/ui/input';
import { Label } from '@/app/Components/ui/label';
import { Textarea } from '@/app/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select";
import { Checkbox } from "@/app/Components/ui/checkbox"; // Assuming you have a Checkbox component
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/Components/ui/card';
import { useToast } from "@/app/Components/ui/use-toast";
import { Loader2, ArrowLeft, FileText, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { AlternativeDatePicker } from "@/app/Components/ui/date-picker"; // Ensure this path is correct


// Define available form types for this page
interface FormTypeOption {
  id: string; // Should match keys in your backend formMappings (e.g., "SCWCC_Form27")
  displayNumber: string; // User-friendly number e.g., "Form 27"
  title: string;
}

const availableFormTypes: FormTypeOption[] = [
  { id: 'none', displayNumber: '', title: 'Select a form to generate...' },
  { id: 'SCWCC_Form18', displayNumber: 'Form 18', title: 'Notice of Accident to Employer and Claim of Employee' },
  { id: 'SCWCC_Form21', displayNumber: 'Form 21', title: "Employer's Request for Hearing" },
  { id: 'SCWCC_Form27', displayNumber: 'Form 27', title: 'Subpoena' },
  { id: 'SCWCC_Form50', displayNumber: 'Form 50', title: "Employee's Claim" },
  { id: 'SCWCC_FormOther', displayNumber: 'Other', title: 'Other (Specify Below)' },
];

// Zod schema for the Generate Form page
const generateFormSchema = z.object({
  claimId: z.string().uuid({ message: "Associated Claim ID must be a valid UUID."}).optional().nullable(),
  selectedFormTypeId: z.string({ required_error: "Please select a form type."}).min(1, "Please select a form type.").refine(val => val !== 'none', { message: "Please select a valid form type."}),

  // Form 21 Specific Additional Data
  comp_current_date: z.date().optional().nullable(),
  form17_refused_date: z.date().optional().nullable(),
  termination_basis: z.string().optional().nullable(),
  amendment_adding_party_details: z.string().optional().nullable(),
  amendment_removing_party_details: z.string().optional().nullable(),
  amendment_other_details: z.string().optional().nullable(),
  checkbox_stop_payment: z.boolean(),
  checkbox_II_A: z.boolean(),
  checkbox_II_B: z.boolean(),
  checkbox_III_determine_comp: z.boolean(),
  checkbox_IV_credit: z.boolean(),
  checkbox_V_fatality: z.boolean(),
  checkbox_amendment: z.boolean(),


  // Form 27 Specific Additional Data
  subpoena_to_person: z.string().optional().nullable(),
  testimony_place: z.string().optional().nullable(),
  testimony_room: z.string().optional().nullable(),
  testimony_datetime: z.string().optional().nullable(),
  deposition_place: z.string().optional().nullable(),
  deposition_datetime: z.string().optional().nullable(),
  documents_list: z.string().optional().nullable(),
  documents_inspection_place: z.string().optional().nullable(),
  documents_inspection_datetime: z.string().optional().nullable(),
  premises_address: z.string().optional().nullable(),
  premises_inspection_datetime: z.string().optional().nullable(),
  checkbox_appear_hearing: z.boolean(),
  checkbox_appear_deposition: z.boolean(),
  checkbox_produce_documents: z.boolean(),
  checkbox_inspect_premises: z.boolean(),

  // For "Other" form type
  otherFormDescription: z.string().optional().nullable(),
});

type GenerateFormData = z.infer<typeof generateFormSchema>;

interface ClaimOption {
    id: string;
    wcc_file_number?: string | null;
    carrier_file_number?: string | null;
    // Assuming your API returns these for the worker associated with the claim
    injuredWorkerFirstName?: string | null;
    injuredWorkerLastName?: string | null;
}

interface FormItemProps {
  label?: string;
  id: string;
  children: React.ReactNode;
  error?: string;
  description?: string;
  className?: string;
}

const FormItem: React.FC<FormItemProps> = ({ label, id, children, error, description, className }) => (
  <div className={`space-y-1.5 ${className || ''}`}>
    {label && <Label htmlFor={id} className={error ? 'text-destructive' : ''}>{label}</Label>}
    {children}
    {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

export default function GenerateFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();

  const [isGenerating, setIsGenerating] = useState(false);
  const [claims, setClaims] = useState<ClaimOption[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      claimId: null,
      selectedFormTypeId: 'none',
      comp_current_date: null,
      form17_refused_date: null,
      termination_basis: '',
      amendment_adding_party_details: '',
      amendment_removing_party_details: '',
      amendment_other_details: '',
      checkbox_stop_payment: false,
      checkbox_II_A: false,
      checkbox_II_B: false,
      checkbox_III_determine_comp: false,
      checkbox_IV_credit: false,
      checkbox_V_fatality: false,
      checkbox_amendment: false,
      subpoena_to_person: '',
      testimony_place: '',
      testimony_room: '',
      testimony_datetime: '',
      deposition_place: '',
      deposition_datetime: '',
      documents_list: '',
      documents_inspection_place: '',
      documents_inspection_datetime: '',
      premises_address: '',
      premises_inspection_datetime: '',
      checkbox_appear_hearing: false,
      checkbox_appear_deposition: false,
      checkbox_produce_documents: false,
      checkbox_inspect_premises: false,
      otherFormDescription: '',
    }
  });

  const watchedFormTypeId = watch("selectedFormTypeId");

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.profileId) {
        const fetchClaimsData = async () => {
            setPageLoading(true);
            try {
                // Ensure this API endpoint returns ClaimOption structure including
                // injuredWorkerFirstName and injuredWorkerLastName
                const response = await fetch(`/api/claims?minimal=true`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch claims list.' }));
                    throw new Error(errorData.error || 'Failed to fetch claims list.');
                }
                const claimsData = await response.json() as ClaimOption[];
                // Optional: Log to verify data structure during development
                // if (claimsData.length > 0) {
                //   console.log("Fetched claim data for dropdown:", claimsData[0]);
                // }
                setClaims(claimsData);
            } catch (error) {
                console.error("Error fetching claims:", error);
                toast({ title: "Error Loading Claims", description: error instanceof Error ? error.message : "Could not load claims.", variant: "destructive" });
            } finally {
                setPageLoading(false);
            }
        };
        void fetchClaimsData();
    } else if (sessionStatus === "unauthenticated") {
        router.push("/login");
    } else if (sessionStatus !== "loading") { 
        setPageLoading(false);
    }
  }, [sessionStatus, session?.user?.profileId, router, toast]);


  const onSubmit: SubmitHandler<GenerateFormData> = async (formData) => {
    if (formData.selectedFormTypeId === 'none' || !formData.selectedFormTypeId) {
        toast({ title: "Selection Missing", description: "Please select a form type to generate.", variant: "destructive" });
        return;
    }
    setIsGenerating(true);
    const selectedFormInfo = availableFormTypes.find(f => f.id === formData.selectedFormTypeId);
    toast({ title: "Generating Form...", description: `Preparing ${selectedFormInfo?.displayNumber || 'selected form'}. Please wait.`});

    const additionalDataPayload: Record<string, unknown> = {};

    if (formData.selectedFormTypeId === 'SCWCC_Form21') {
        additionalDataPayload.comp_current_date = formData.comp_current_date;
        additionalDataPayload.form17_refused_date = formData.form17_refused_date;
        additionalDataPayload.termination_basis = formData.termination_basis;
        additionalDataPayload.amendment_adding_party_details = formData.amendment_adding_party_details;
        additionalDataPayload.amendment_removing_party_details = formData.amendment_removing_party_details;
        additionalDataPayload.amendment_other_details = formData.amendment_other_details;
        additionalDataPayload.checkbox_stop_payment = formData.checkbox_stop_payment;
        additionalDataPayload.checkbox_II_A = formData.checkbox_II_A;
        additionalDataPayload.checkbox_II_B = formData.checkbox_II_B;
        additionalDataPayload.checkbox_III_determine_comp = formData.checkbox_III_determine_comp;
        additionalDataPayload.checkbox_IV_credit = formData.checkbox_IV_credit;
        additionalDataPayload.checkbox_V_fatality = formData.checkbox_V_fatality;
        additionalDataPayload.checkbox_amendment = formData.checkbox_amendment;
    } else if (formData.selectedFormTypeId === 'SCWCC_Form27') {
        additionalDataPayload.subpoena_to_person = formData.subpoena_to_person;
        additionalDataPayload.testimony_place = formData.testimony_place;
        additionalDataPayload.testimony_room = formData.testimony_room;
        additionalDataPayload.testimony_datetime = formData.testimony_datetime;
        additionalDataPayload.deposition_place = formData.deposition_place;
        additionalDataPayload.deposition_datetime = formData.deposition_datetime;
        additionalDataPayload.documents_list = formData.documents_list;
        additionalDataPayload.documents_inspection_place = formData.documents_inspection_place;
        additionalDataPayload.documents_inspection_datetime = formData.documents_inspection_datetime;
        additionalDataPayload.premises_address = formData.premises_address;
        additionalDataPayload.premises_inspection_datetime = formData.premises_inspection_datetime;
        additionalDataPayload.checkbox_appear_hearing = formData.checkbox_appear_hearing;
        additionalDataPayload.checkbox_appear_deposition = formData.checkbox_appear_deposition;
        additionalDataPayload.checkbox_produce_documents = formData.checkbox_produce_documents;
        additionalDataPayload.checkbox_inspect_premises = formData.checkbox_inspect_premises;
    } else if (formData.selectedFormTypeId === 'SCWCC_FormOther') {
        additionalDataPayload.other_form_description = formData.otherFormDescription;
    }

    const payload = {
        formType: formData.selectedFormTypeId,
        claimId: formData.claimId, 
        additionalData: additionalDataPayload,
    };

    try {
      const response = await fetch('/api/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const blob = await response.blob();
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `${formData.selectedFormTypeId}_generated.pdf`; 
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
            if (filenameMatch && filenameMatch.length > 1) {
                filename = filenameMatch[1];
            }
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast({ title: "Form Generated Successfully", description: `${filename} has started downloading.` });
      } else {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred while generating the form."}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred during form generation.";
      console.error("Failed to generate form:", error);
      toast({ title: "Generation Failed", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (pageLoading || sessionStatus === "loading") {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="flex items-center mb-6 space-x-3">
        <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go Back">
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
            <h1 className="flex items-center text-3xl font-bold tracking-tight">
                <FileText className="mr-3 h-8 w-8" /> Generate Document
            </h1>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
        <Card>
          <CardHeader>
            <CardTitle>Select Form and Options</CardTitle>
            <CardDescription>Choose a form to generate and provide any necessary information. Fields marked with <span className="text-destructive">*</span> are required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormItem label="Select Form Type *" id="selectedFormTypeId" error={errors.selectedFormTypeId?.message}>
                <Controller
                    name="selectedFormTypeId"
                    control={control}
                    render={({ field }) => (
                        <Select
                            onValueChange={(value) => {
                                field.onChange(value);
                                reset({
                                  ...control._defaultValues, 
                                  claimId: watch("claimId"), 
                                  selectedFormTypeId: value, 
                                  comp_current_date: null, form17_refused_date: null, termination_basis: '',
                                  amendment_adding_party_details: '', amendment_removing_party_details: '', amendment_other_details: '',
                                  checkbox_stop_payment: false, checkbox_II_A: false, checkbox_II_B: false, checkbox_III_determine_comp: false,
                                  checkbox_IV_credit: false, checkbox_V_fatality: false, checkbox_amendment: false,
                                  subpoena_to_person: '', testimony_place: '', testimony_room: '', testimony_datetime: '',
                                  deposition_place: '', deposition_datetime: '', documents_list: '', documents_inspection_place: '',
                                  documents_inspection_datetime: '', premises_address: '', premises_inspection_datetime: '',
                                  checkbox_appear_hearing: false, checkbox_appear_deposition: false, checkbox_produce_documents: false,
                                  checkbox_inspect_premises: false, otherFormDescription: '',
                                });
                            }}
                            value={field.value || "none"}
                        >
                            <SelectTrigger id="selectedFormTypeId">
                                <SelectValue placeholder="Select a form to generate..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableFormTypes.map(formType => (
                                    <SelectItem key={formType.id} value={formType.id} disabled={formType.id === 'none'}>
                                        {formType.displayNumber ? `${formType.displayNumber} - ${formType.title}` : formType.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </FormItem>

            <FormItem label="Associate with Claim (Optional)" id="claimId" error={errors.claimId?.message} description="Link this form to an existing claim.">
                <Controller
                    name="claimId"
                    control={control}
                    render={({ field }) => (
                        <Select
                            onValueChange={(value) => field.onChange(value === "NO_CLAIM_SELECTED" ? null : value)}
                            value={field.value || ""}
                            disabled={claims.length === 0 && !pageLoading}
                        >
                            <SelectTrigger id="claimId">
                                <SelectValue placeholder={claims.length > 0 ? "Select a claim..." : (pageLoading ? "Loading claims..." : "No claims available")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NO_CLAIM_SELECTED">None</SelectItem>
                                {claims.map(claim => {
                                    const workerName = (claim.injuredWorkerFirstName || claim.injuredWorkerLastName)
                                        ? `${claim.injuredWorkerFirstName || ''} ${claim.injuredWorkerLastName || ''}`.trim()
                                        : 'N/A';
                                    return (
                                        <SelectItem key={claim.id} value={claim.id}>
                                            {`WCC#: ${claim.wcc_file_number || 'N/A'} - Worker: ${workerName}`}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    )}
                />
            </FormItem>

            {/* Conditional Fields for SCWCC_Form21 */}
            {watchedFormTypeId === 'SCWCC_Form21' && (
                <div className="space-y-4 p-4 border rounded-md">
                    <h3 className="text-lg font-medium">Form 21 Details</h3>
                    <FormItem label="Compensation Payments Current As Of Date" id="comp_current_date" error={errors.comp_current_date?.message}>
                        <AlternativeDatePicker name="comp_current_date" control={control} />
                    </FormItem>
                    <FormItem label="Form 17 Offered/Refused Date" id="form17_refused_date" error={errors.form17_refused_date?.message}>
                         <AlternativeDatePicker name="form17_refused_date" control={control} />
                    </FormItem>
                    <FormItem label="Basis For Termination/Suspension" id="termination_basis" error={errors.termination_basis?.message}>
                        <Textarea {...register("termination_basis")} />
                    </FormItem>
                    <FormItem label="Amendment: Adding Party Details" id="amendment_adding_party_details" error={errors.amendment_adding_party_details?.message}>
                        <Textarea {...register("amendment_adding_party_details")} />
                    </FormItem>
                    <FormItem label="Amendment: Removing Party Details" id="amendment_removing_party_details" error={errors.amendment_removing_party_details?.message}>
                        <Textarea {...register("amendment_removing_party_details")} />
                    </FormItem>
                    <FormItem label="Amendment: Other Details" id="amendment_other_details" error={errors.amendment_other_details?.message}>
                        <Textarea {...register("amendment_other_details")} />
                    </FormItem>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormItem id="checkbox_stop_payment" error={errors.checkbox_stop_payment?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_stop_payment" control={control} render={({ field }) => <Checkbox id="checkbox_stop_payment" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_stop_payment" className="font-normal">Stop Payment of Compensation</Label>
                        </FormItem>
                        <FormItem id="checkbox_II_A" error={errors.checkbox_II_A?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_II_A" control={control} render={({ field }) => <Checkbox id="checkbox_II_A" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_II_A" className="font-normal">II.A: Pursuant to §42-9-260(E)</Label>
                        </FormItem>
                         <FormItem id="checkbox_II_B" error={errors.checkbox_II_B?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_II_B" control={control} render={({ field }) => <Checkbox id="checkbox_II_B" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_II_B" className="font-normal">II.B: After 150 Day Period</Label>
                        </FormItem>
                        <FormItem id="checkbox_III_determine_comp" error={errors.checkbox_III_determine_comp?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_III_determine_comp" control={control} render={({ field }) => <Checkbox id="checkbox_III_determine_comp" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_III_determine_comp" className="font-normal">III: Determine Compensation Due</Label>
                        </FormItem>
                         <FormItem id="checkbox_IV_credit" error={errors.checkbox_IV_credit?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_IV_credit" control={control} render={({ field }) => <Checkbox id="checkbox_IV_credit" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_IV_credit" className="font-normal">IV: Request Credit for Overpayment</Label>
                        </FormItem>
                        <FormItem id="checkbox_V_fatality" error={errors.checkbox_V_fatality?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_V_fatality" control={control} render={({ field }) => <Checkbox id="checkbox_V_fatality" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_V_fatality" className="font-normal">V: Determine Compensation (Fatality)</Label>
                        </FormItem>
                         <FormItem id="checkbox_amendment" error={errors.checkbox_amendment?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_amendment" control={control} render={({ field }) => <Checkbox id="checkbox_amendment" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_amendment" className="font-normal">Amendment to Prior Request</Label>
                        </FormItem>
                    </div>
                </div>
            )}

            {/* Conditional Fields for SCWCC_Form27 */}
            {watchedFormTypeId === 'SCWCC_Form27' && (
                <div className="space-y-4 p-4 border rounded-md">
                    <h3 className="text-lg font-medium">Form 27 Subpoena Details</h3>
                    <FormItem label="Subpoena To (Person/Entity Name)" id="subpoena_to_person" error={errors.subpoena_to_person?.message}>
                        <Input {...register("subpoena_to_person")} />
                    </FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem label="Testimony Place (Address)" id="testimony_place" error={errors.testimony_place?.message}>
                            <Input {...register("testimony_place")} />
                        </FormItem>
                        <FormItem label="Testimony Room" id="testimony_room" error={errors.testimony_room?.message}>
                            <Input {...register("testimony_room")} />
                        </FormItem>
                    </div>
                    <FormItem label="Testimony Date & Time" id="testimony_datetime" error={errors.testimony_datetime?.message} description="e.g., MM/DD/YYYY HH:MM AM/PM">
                        <Input {...register("testimony_datetime")} placeholder="MM/DD/YYYY HH:MM AM/PM" />
                    </FormItem>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem label="Deposition Place (Address)" id="deposition_place" error={errors.deposition_place?.message}>
                            <Input {...register("deposition_place")} />
                        </FormItem>
                        <FormItem label="Deposition Date & Time" id="deposition_datetime" error={errors.deposition_datetime?.message} description="e.g., MM/DD/YYYY HH:MM AM/PM">
                            <Input {...register("deposition_datetime")} placeholder="MM/DD/YYYY HH:MM AM/PM" />
                        </FormItem>
                    </div>
                    <FormItem label="List of Documents to Produce" id="documents_list" error={errors.documents_list?.message}>
                        <Textarea {...register("documents_list")} rows={3} />
                    </FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem label="Documents Inspection Place (Address)" id="documents_inspection_place" error={errors.documents_inspection_place?.message}>
                            <Input {...register("documents_inspection_place")} />
                        </FormItem>
                        <FormItem label="Documents Inspection Date & Time" id="documents_inspection_datetime" error={errors.documents_inspection_datetime?.message} description="e.g., MM/DD/YYYY HH:MM AM/PM">
                            <Input {...register("documents_inspection_datetime")} placeholder="MM/DD/YYYY HH:MM AM/PM"/>
                        </FormItem>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem label="Premises to Inspect (Address)" id="premises_address" error={errors.premises_address?.message}>
                            <Input {...register("premises_address")} />
                        </FormItem>
                        <FormItem label="Premises Inspection Date & Time" id="premises_inspection_datetime" error={errors.premises_inspection_datetime?.message} description="e.g., MM/DD/YYYY HH:MM AM/PM">
                            <Input {...register("premises_inspection_datetime")} placeholder="MM/DD/YYYY HH:MM AM/PM"/>
                        </FormItem>
                    </div>
                    <p className="text-sm font-medium mt-2">Subpoena Commands (Check all that apply):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormItem id="checkbox_appear_hearing" error={errors.checkbox_appear_hearing?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_appear_hearing" control={control} render={({ field }) => <Checkbox id="checkbox_appear_hearing" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_appear_hearing" className="font-normal">Appear for Hearing Testimony</Label>
                        </FormItem>
                        <FormItem id="checkbox_appear_deposition" error={errors.checkbox_appear_deposition?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_appear_deposition" control={control} render={({ field }) => <Checkbox id="checkbox_appear_deposition" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_appear_deposition" className="font-normal">Appear for Deposition Testimony</Label>
                        </FormItem>
                        <FormItem id="checkbox_produce_documents" error={errors.checkbox_produce_documents?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_produce_documents" control={control} render={({ field }) => <Checkbox id="checkbox_produce_documents" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_produce_documents" className="font-normal">Produce Documents</Label>
                        </FormItem>
                        <FormItem id="checkbox_inspect_premises" error={errors.checkbox_inspect_premises?.message} className="flex flex-row items-center space-x-3 space-y-0">
                             <Controller name="checkbox_inspect_premises" control={control} render={({ field }) => <Checkbox id="checkbox_inspect_premises" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="checkbox_inspect_premises" className="font-normal">Inspect Premises</Label>
                        </FormItem>
                    </div>
                </div>
            )}

            {/* Conditional Field for SCWCC_FormOther */}
            {watchedFormTypeId === 'SCWCC_FormOther' && (
                 <FormItem
                    label="Describe Other Form Type"
                    id="otherFormDescription"
                    error={errors.otherFormDescription?.message}
                    description="Please provide a description or title for this 'Other' form."
                >
                    <Textarea
                        id="otherFormDescription"
                        {...register("otherFormDescription")}
                        rows={3}
                    />
                </FormItem>
            )}

          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isGenerating || watchedFormTypeId === 'none' || !watchedFormTypeId || pageLoading}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isGenerating ? "Generating..." : "Generate Form"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
