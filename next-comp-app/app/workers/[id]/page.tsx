// app/workers/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/Components/ui/button';
import { Input } from '@/app/Components/ui/input';
import { Label } from '@/app/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/Components/ui/card';
import { useToast } from "@/app/Components/ui/use-toast";
import { Loader2, ArrowLeft, Edit, Save, XCircle, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react'; // Added PlusCircle, Trash2
import { AlternativeDatePicker } from "@/app/Components/ui/date-picker";
import Link from 'next/link';
import { subYears, format, isValid, parseISO } from 'date-fns';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/app/Components/ui/alert-dialog";


// Zod schema for form validation
const workerFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, "Last name is required"),
  suffix: z.string().optional().nullable(),
  ssn: z.string().optional().nullable().refine(val => {
    if (!val) return true; // Allow empty or null
    const cleanVal = val.replace(/-/g, '');
    return /^\d{9}$/.test(cleanVal) || /^XXX-XX-\d{4}$/.test(val); // Allow full or masked format
  }, {
    message: "SSN must be 9 digits (XXXXXXXXX), XXX-XX-XXXX, or the masked format if not changing.",
  }),
  date_of_birth: z.date({ invalid_type_error: "Invalid date" }).optional().nullable(),
  gender: z.string().optional().nullable(), 
  marital_status: z.string().optional().nullable(), 
  address_line1: z.string().optional().nullable(),
  address_line2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable().refine(val => !val || (val.length === 2 && /^[A-Z]+$/.test(val.toUpperCase())), {
    message: "State must be a 2-letter uppercase abbreviation or empty",
  }),
  zip_code: z.string().optional().nullable().refine(val => !val || /^\d{5}(-\d{4})?$/.test(val), {
    message: "Zip code must be in XXXXX or XXXXX-XXXX format or empty",
  }),
  phone_number: z.string().optional().nullable().refine(val => !val || /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(val), {
    message: "Invalid phone number format or empty",
  }),
  work_phone_number: z.string().optional().nullable().refine(val => !val || /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(val), {
    message: "Invalid phone number format or empty",
  }),
  email: z.string().email({ message: "Invalid email address" }).optional().nullable().or(z.literal('')),
  occupation: z.string().optional().nullable(),
  num_dependents: z.coerce.number({ invalid_type_error: "Must be a number" }).int().min(0).optional().nullable(),
});

type WorkerFormData = z.infer<typeof workerFormSchema>;

interface ClaimDetail {
  id: string;
  wcc_file_number: string | null;
  claim_status: string | null;
  date_of_injury: string | null; 
  employer?: { name: string | null } | null;
}
interface InjuredWorkerDetail extends WorkerFormData {
  id: string;
  profileId: string;
  createdAt: string; 
  updatedAt: string; 
  claims?: ClaimDetail[]; 
}

interface ApiErrorData {
  error?: string;
  details?: unknown;
}

interface ZodErrorDetailItem {
  message: string;
}
interface ZodErrorStructure {
  body?: ZodErrorDetailItem[];
}

const FormItem = ({ label, id, children, error, description }: { label?: string, id: string, children: React.ReactNode, error?: string, description?: string }) => (
  <div className="space-y-1.5">
    {label && <Label htmlFor={id} className={error ? 'text-destructive' : ''}>{label}</Label>}
    {children}
    {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

export default function IndividualWorkerPage() {
  const router = useRouter();
  const params = useParams();
  const workerId = params.id as string;

  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();

  const [workerData, setWorkerData] = useState<InjuredWorkerDetail | null>(null);
  const [pageStatus, setPageStatus] = useState<'loading' | 'authenticated' | 'error' | 'idle'>('loading');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalSsn, setOriginalSsn] = useState<string | null | undefined>(null);
  
  // State for delete confirmation dialog (already existed in previous version, just ensure it's used)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<InjuredWorkerDetail | null>(null); // Changed type to InjuredWorkerDetail
  const [isDeleting, setIsDeleting] = useState(false);


  const { register, handleSubmit, control, formState: { errors, isDirty }, reset, getValues } = useForm<WorkerFormData>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      first_name: '', middle_name: null, last_name: '', suffix: null, ssn: null,
      date_of_birth: null, gender: null, marital_status: null, address_line1: null,
      address_line2: null, city: null, state: null, zip_code: null, phone_number: null,
      work_phone_number: null, email: null, occupation: null, num_dependents: null,
    }
  });

  const parseDateIfNeeded = useCallback((dateValue: string | Date | null | undefined): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date && isValid(dateValue)) return dateValue;
    if (typeof dateValue === 'string') {
      try {
        const parsed = parseISO(dateValue);
        return isValid(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const formatDateForDisplay = useCallback((dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return 'N/A';
    const date = parseDateIfNeeded(dateInput);
    return date && isValid(date) ? format(date, 'MM/dd/yyyy') : 'N/A';
  }, [parseDateIfNeeded]);


  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.profileId && workerId) {
      setPageStatus('loading'); 
      setError(null);

      const fetchData = async () => {
        try {
          const response = await fetch(`/api/workers/${workerId}`);
          if (!response.ok) {
            let errorPayload: ApiErrorData = { error: `Failed to fetch worker details: ${response.statusText}` };
            try {
              const parsedError: unknown = await response.json();
              if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError) {
                errorPayload = parsedError as ApiErrorData;
              }
            } catch {
              console.warn("Failed to parse error JSON from API (fetchData)");
            }
            throw new Error(errorPayload.error || `Error ${response.status}: ${response.statusText}`);
          }
          const responseData: unknown = await response.json();
          const data = responseData as InjuredWorkerDetail;
          
          setWorkerData(data);
          setOriginalSsn(data.ssn); 
          reset({
            ...data,
            date_of_birth: parseDateIfNeeded(data.date_of_birth),
            num_dependents: data.num_dependents === null || data.num_dependents === undefined ? null : Number(data.num_dependents),
            ssn: data.ssn, 
          });
          setPageStatus('authenticated'); 
        } catch (err) {
          const message = err instanceof Error ? err.message : "An unknown error occurred while fetching data.";
          console.error("Error fetching worker details:", err);
          setError(message);
          setPageStatus('error');
        }
      };
      void fetchData();
    } else if (sessionStatus === "authenticated" && !session?.user?.profileId) {
      toast({ title: "Profile Error", description: "User profile ID is missing. Cannot fetch worker details.", variant: "destructive" });
      setError("User profile ID is missing.");
      setPageStatus('error');
    } else if (sessionStatus === "unauthenticated") {
      toast({ title: "Authentication Required", description: "Please log in to view worker details." });
      router.push("/login"); 
    } else if (sessionStatus === "loading") {
        setPageStatus('loading'); 
    }
  }, [sessionStatus, session?.user?.profileId, workerId, router, toast, reset, parseDateIfNeeded]);


  const onSubmit: SubmitHandler<WorkerFormData> = async (formData) => {
    if (!workerData?.id) { 
        toast({ title: "Error", description: "Worker data not loaded, cannot save.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
      let ssnPayload: string | null | undefined = formData.ssn; 
      
      if (formData.ssn === originalSsn && originalSsn?.startsWith('XXX-XX-')) {
        ssnPayload = undefined;
      } else if (formData.ssn && formData.ssn.trim() !== '') { 
        const cleanSsn = formData.ssn.replace(/-/g, '');
        if (/^\d{9}$/.test(cleanSsn)) {
          ssnPayload = cleanSsn; 
        } else {
          toast({ title: "Invalid SSN", description: "If changing SSN, please provide 9 digits (XXXXXXXXX).", variant: "destructive" });
          setIsSaving(false);
          return;
        }
      } else { 
        ssnPayload = null; 
      }

      const payload = {
        ...formData,
        ssn: ssnPayload, 
        num_dependents: formData.num_dependents === null || formData.num_dependents === undefined || isNaN(Number(formData.num_dependents)) 
                            ? null 
                            : Number(formData.num_dependents),
        phone_number: formData.phone_number ? formData.phone_number.replace(/\D/g, '') : null, 
        work_phone_number: formData.work_phone_number ? formData.work_phone_number.replace(/\D/g, '') : null, 
        state: formData.state ? formData.state.toUpperCase() : null, 
      };
      
      const response = await fetch(`/api/workers/${workerData.id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorPayload: ApiErrorData = { error: `Failed to update worker: ${response.statusText}` };
        try {
            const parsedError: unknown = await response.json();
            if (typeof parsedError === 'object' && parsedError !== null) {
                const typedError = parsedError as ApiErrorData;
                let detailsMessage = "";
                if (typedError.details && typeof typedError.details === 'object' && typedError.details !== null) {
                    const potentialZodError = typedError.details as Partial<ZodErrorStructure>;
                    if (potentialZodError.body && Array.isArray(potentialZodError.body) && potentialZodError.body.length > 0) {
                        const firstErrorItem = potentialZodError.body[0];
                        if (typeof firstErrorItem === 'object' && firstErrorItem !== null && 'message' in firstErrorItem && typeof firstErrorItem.message === 'string') {
                            detailsMessage = firstErrorItem.message;
                        }
                    }
                }
                if (!detailsMessage && typedError.details) {
                    if (typeof typedError.details === 'string') detailsMessage = typedError.details;
                    else try { detailsMessage = JSON.stringify(typedError.details); } catch { detailsMessage = "Additional error details present."; }
                }
                throw new Error(typedError.error || detailsMessage || errorPayload.error);
            } else {
                 throw new Error(errorPayload.error);
            }
        } catch (_e) { 
            if (_e instanceof Error) throw _e; 
            throw new Error(errorPayload.error); 
        }
      }
      const responseData: unknown = await response.json(); 
      const updatedWorker = responseData as InjuredWorkerDetail; 

      toast({ title: "Success!", description: `${updatedWorker.first_name} ${updatedWorker.last_name} updated successfully.` });
      setIsEditing(false);
      
      setWorkerData(updatedWorker); 
      setOriginalSsn(updatedWorker.ssn); 
      reset({ 
        ...updatedWorker,
        date_of_birth: parseDateIfNeeded(updatedWorker.date_of_birth),
        num_dependents: updatedWorker.num_dependents === null || updatedWorker.num_dependents === undefined ? null : Number(updatedWorker.num_dependents),
        ssn: updatedWorker.ssn, 
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred during save.";
      console.error("Failed to update worker:", error);
      toast({ title: "Update Failed", description: message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (workerData) { 
        reset({
            ...workerData,
            date_of_birth: parseDateIfNeeded(workerData.date_of_birth),
            num_dependents: workerData.num_dependents === null || workerData.num_dependents === undefined ? null : Number(workerData.num_dependents),
            ssn: originalSsn, 
        });
    }
  };

  const openDeleteWorkerDialog = () => {
    if (workerData) {
      setWorkerToDelete(workerData); // Set the current worker to be deleted
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteWorker = async () => {
    if (!workerToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workers/${workerToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        // ... (existing error handling for delete)
        let errorData: ApiErrorData = { error: "An unknown error occurred during deletion." };
        try {
            const parsedError: unknown = await response.json();
             if (typeof parsedError === 'object' && parsedError !== null && 'error' in parsedError && typeof (parsedError as ApiErrorData).error === 'string') {
                 errorData = parsedError as ApiErrorData;
            }
        } catch (parseError) {
            console.warn("Failed to parse error JSON from API during worker delete:", parseError);
            errorData.error = response.statusText || "Failed to delete worker";
        }
        throw new Error(errorData.error);
      }
      
      toast({
        title: "Success!",
        description: `Worker ${workerToDelete.first_name} ${workerToDelete.last_name} has been deleted.`,
      });
      router.push('/workers'); // Redirect to workers list after successful deletion
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error deleting worker:", err);
      toast({
        title: "Deletion Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setWorkerToDelete(null);
    }
  };


  const today = new Date();
  const minBirthDate = subYears(today, 120);

  if (pageStatus === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          {sessionStatus === "loading" ? "Authenticating..." : "Loading worker details..."}
        </p>
      </div>
    );
  }

  if (pageStatus === 'error') {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Card className="w-full max-w-md bg-destructive/10 border-destructive">
          <CardHeader><CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5" /> Error</CardTitle></CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error || "An unexpected error occurred."}</p>
            <Button variant="outline" onClick={() => router.push('/workers')} className="mt-4 ml-2">Back to Worker List</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageStatus !== 'authenticated' || !workerData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Worker data is currently unavailable. You may need to authenticate.</p>
        <Button variant="outline" onClick={() => router.push('/workers')} className="mt-4">Back to Worker List</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Button variant="outline" size="sm" onClick={() => router.push('/workers')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Worker List
      </Button>

      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-x-4">
            <div>
              <CardTitle className="text-2xl font-semibold">
                {isEditing ? (getValues("first_name") || '') : (workerData.first_name || '')} {isEditing ? (getValues("last_name") || '') : (workerData.last_name || '')}
              </CardTitle>
              <CardDescription>View or edit injured worker details. {isEditing ? "You are in edit mode." : ""}</CardDescription>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0"> {/* Group buttons */}
              {!isEditing && (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)} type="button">
                    <Edit className="mr-2 h-4 w-4" /> Edit Worker
                  </Button>
                  <Button variant="default" asChild>
                    <Link href={`/claims/new?workerId=${workerId}`}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Claim
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Personal Information Section */}
            <section>
              <h3 className="text-xl font-semibold border-b pb-3 mb-6 text-foreground">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormItem label="First Name *" id="first_name" error={errors.first_name?.message}>
                  <Input id="first_name" {...register("first_name")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="Last Name *" id="last_name" error={errors.last_name?.message}>
                  <Input id="last_name" {...register("last_name")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="Middle Name" id="middle_name" error={errors.middle_name?.message}>
                  <Input id="middle_name" {...register("middle_name")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="Suffix" id="suffix" error={errors.suffix?.message}>
                  <Input id="suffix" {...register("suffix")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem 
                    label="Social Security Number" 
                    id="ssn" 
                    error={errors.ssn?.message} 
                    description={!isEditing && originalSsn ? "SSN is masked." : (isEditing ? "Format: XXX-XX-XXXX or XXXXXXXXX" : "N/A")}
                >
                  <Input 
                    id="ssn" 
                    {...register("ssn")} 
                    placeholder={isEditing ? "XXX-XX-XXXX" : (originalSsn || "N/A")} 
                    readOnly={!isEditing} 
                    className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""}
                  />
                </FormItem>
                <div className="space-y-1.5">
                  <AlternativeDatePicker 
                    name="date_of_birth" 
                    control={control} 
                    label="Date of Birth" 
                    minDate={minBirthDate} maxDate={today} 
                    showYearDropdown showMonthDropdown dropdownMode="select" 
                    disabled={!isEditing} 
                  />
                  {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>}
                </div>
                <FormItem label="Gender" id="gender" error={errors.gender?.message}>
                  <Controller name="gender" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""} disabled={!isEditing}>
                      <SelectTrigger id="gender" className={!isEditing ? "border-none px-0 data-[disabled]:opacity-100 data-[disabled]:cursor-default data-[disabled]:focus:ring-0 data-[disabled]:shadow-none" : ""}><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </FormItem>
                <FormItem label="Marital Status" id="marital_status" error={errors.marital_status?.message}>
                  <Controller name="marital_status" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""} disabled={!isEditing}>
                      <SelectTrigger id="marital_status" className={!isEditing ? "border-none px-0 data-[disabled]:opacity-100 data-[disabled]:cursor-default data-[disabled]:focus:ring-0 data-[disabled]:shadow-none" : ""}><SelectValue placeholder="Select marital status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem>
                        <SelectItem value="Separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </FormItem>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold border-b pb-3 mb-6 text-foreground">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormItem label="Address Line 1" id="address_line1" error={errors.address_line1?.message}>
                  <Input id="address_line1" {...register("address_line1")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="Address Line 2" id="address_line2" error={errors.address_line2?.message}>
                  <Input id="address_line2" {...register("address_line2")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="City" id="city" error={errors.city?.message}>
                  <Input id="city" {...register("city")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="State (2-letter)" id="state" error={errors.state?.message}>
                  <Input id="state" {...register("state")} maxLength={2} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="Zip Code" id="zip_code" error={errors.zip_code?.message}>
                  <Input id="zip_code" {...register("zip_code")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="Primary Phone" id="phone_number" error={errors.phone_number?.message}>
                  <Input id="phone_number" type="tel" {...register("phone_number")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="Work Phone" id="work_phone_number" error={errors.work_phone_number?.message}>
                  <Input id="work_phone_number" type="tel" {...register("work_phone_number")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="Email Address" id="email" error={errors.email?.message}> 
                  <Input id="email" type="email" {...register("email")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none md:col-span-2" : "md:col-span-2"} />
                </FormItem>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold border-b pb-3 mb-6 text-foreground">Employment & Other</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormItem label="Occupation / Job Title" id="occupation" error={errors.occupation?.message}>
                  <Input id="occupation" {...register("occupation")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
                <FormItem label="Number of Dependents" id="num_dependents" error={errors.num_dependents?.message}>
                  <Input id="num_dependents" type="number" {...register("num_dependents")} readOnly={!isEditing} className={!isEditing ? "border-none px-0 read-only:focus:ring-0 read-only:shadow-none" : ""} />
                </FormItem>
              </div>
            </section>
            
            {isEditing && (
              <CardFooter className="px-0 pt-8 flex justify-between items-center"> {/* Changed to justify-between */}
                <Button 
                  variant="destructive" 
                  type="button" 
                  onClick={openDeleteWorkerDialog} // Updated to call the new handler
                  disabled={isSaving || isDeleting}
                >
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  {isDeleting ? 'Deleting...' : 'Delete Worker'}
                </Button>
                <div className="flex space-x-3">
                    <Button variant="outline" type="button" onClick={handleCancelEdit} disabled={isSaving}>
                      <XCircle className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving || !isDirty}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
              </CardFooter>
            )}
          </CardContent> 
        </Card>
      </form> 

      {/* Section to display related claims */}
      {workerData.claims && workerData.claims.length > 0 && (
        <section className="mt-12">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Associated Claims</h3>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WCC File #</TableHead>
                    <TableHead>Date of Injury</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workerData.claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.wcc_file_number || 'N/A'}</TableCell>
                      <TableCell>
                        {formatDateForDisplay(claim.date_of_injury)}
                      </TableCell>
                      <TableCell>{claim.employer?.name || 'N/A'}</TableCell>
                      <TableCell>{claim.claim_status || 'Unknown'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/claims/${claim.id}`}> 
                            View Claim
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Delete Worker Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the worker:
              <span className="font-semibold"> {workerToDelete?.first_name} {workerToDelete?.last_name}</span>.
              This will also delete all associated claims.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkerToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDeleteWorker()} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isDeleting ? 'Deleting...' : 'Yes, delete worker'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div> 
  );
}
