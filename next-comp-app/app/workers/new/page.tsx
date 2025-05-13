// app/workers/new/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/Components/ui/button';
import { Input } from '@/app/Components/ui/input';
import { Label } from '@/app/Components/ui/label';
import { Textarea } from '@/app/Components/ui/textarea'; // For multi-line fields like address
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/Components/ui/card';
import { useToast } from "@/app/Components/ui/use-toast";
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/Components/ui/popover';
import { Calendar } from "@/app/Components/ui/calendar";
import { format } from 'date-fns';
import Link from 'next/link';

// Define the Zod schema for validation based on your Prisma model
// Making most fields optional for now, adjust as per your business logic for required fields
const workerFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  ssn: z.string().optional().refine(val => !val || /^\d{3}-\d{2}-\d{4}$/.test(val) || /^\d{9}$/.test(val), {
    message: "SSN must be in XXX-XX-XXXX or XXXXXXXXX format or empty",
  }),
  date_of_birth: z.date().optional().nullable(),
  gender: z.string().optional(),
  marital_status: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional().refine(val => !val || val.length === 2, {
    message: "State must be a 2-letter abbreviation or empty",
  }),
  zip_code: z.string().optional().refine(val => !val || /^\d{5}(-\d{4})?$/.test(val), {
    message: "Zip code must be in XXXXX or XXXXX-XXXX format or empty",
  }),
  phone_number: z.string().optional().refine(val => !val || /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(val), {
    message: "Invalid phone number format or empty",
  }),
  work_phone_number: z.string().optional().refine(val => !val || /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(val), {
    message: "Invalid phone number format or empty",
  }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')), // Allow empty string or valid email
  occupation: z.string().optional(),
  num_dependents: z.coerce.number().int().min(0).optional().nullable(), // Coerce to number, ensure integer
});

type WorkerFormData = z.infer<typeof workerFormSchema>;

// Mock user profile ID - replace with actual fetching in a real app
// This would typically come from useSession() or a similar auth context
interface UserProfile {
    id: string;
}

export default function AddInjuredWorkerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // For profileId

  // TODO: Fetch the actual user profile to get the profileId
  useEffect(() => {
    // Example: Fetch profile from an API route
    // async function fetchProfile() {
    //   try {
    //     const response = await fetch('/api/me/profile'); // Assuming you have this route
    //     if (!response.ok) throw new Error('Failed to fetch profile');
    //     const data = await response.json();
    //     setUserProfile(data);
    //   } catch (error) {
    //     toast({ title: "Error", description: "Could not load user profile.", variant: "destructive" });
    //   }
    // }
    // fetchProfile();
    // For now, using a mock ID. Replace this!
    setUserProfile({ id: "mock-profile-id-for-new-worker" });
  }, [toast]);


  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<WorkerFormData>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      ssn: "",
      date_of_birth: null,
      gender: "",
      marital_status: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      zip_code: "",
      phone_number: "",
      work_phone_number: "",
      email: "",
      occupation: "",
      num_dependents: null,
    }
  });

  const dateOfBirthValue = watch("date_of_birth");

  const onSubmit: SubmitHandler<WorkerFormData> = async (data) => {
    if (!userProfile?.id) {
        toast({ title: "Error", description: "User profile not loaded. Cannot save worker.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        profileId: userProfile.id, // Add profileId to the payload
        // Ensure num_dependents is number or null, not empty string
        num_dependents: data.num_dependents === null || data.num_dependents === undefined || isNaN(Number(data.num_dependents)) ? null : Number(data.num_dependents),
        ssn: data.ssn ? data.ssn.replace(/-/g, '') : undefined, // Store SSN without hyphens
        phone_number: data.phone_number ? data.phone_number.replace(/\D/g, '') : undefined,
        work_phone_number: data.work_phone_number ? data.work_phone_number.replace(/\D/g, '') : undefined,
      };

      const response = await fetch('/api/workers', { // API route we will create next
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add injured worker.');
      }

      toast({ title: "Success!", description: `${data.first_name} ${data.last_name} added successfully.` });
      router.push('/dashboard'); // Or to a page listing all workers, e.g., /workers

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      console.error("Failed to add worker:", error);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper for consistent form item structure
  const FormItem = ({ label, id, children, error }: { label: string, id: string, children: React.ReactNode, error?: string }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );


  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Add New Injured Worker</CardTitle>
          <CardDescription>Enter the details for the new injured worker. Fields marked with * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem label="First Name *" id="first_name" error={errors.first_name?.message}>
                <Input id="first_name" {...register("first_name")} placeholder="John" />
              </FormItem>
              <FormItem label="Last Name *" id="last_name" error={errors.last_name?.message}>
                <Input id="last_name" {...register("last_name")} placeholder="Doe" />
              </FormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem label="Middle Name" id="middle_name" error={errors.middle_name?.message}>
                <Input id="middle_name" {...register("middle_name")} placeholder="Michael" />
              </FormItem>
              <FormItem label="Suffix (e.g., Jr., Sr., III)" id="suffix" error={errors.suffix?.message}>
                <Input id="suffix" {...register("suffix")} placeholder="Jr." />
              </FormItem>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormItem label="Social Security Number" id="ssn" error={errors.ssn?.message}>
                    <Input id="ssn" {...register("ssn")} placeholder="XXX-XX-XXXX" />
                </FormItem>
                <FormItem label="Date of Birth" id="date_of_birth" error={errors.date_of_birth?.message}>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${
                            !dateOfBirthValue && "text-muted-foreground"
                        }`}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirthValue ? format(dateOfBirthValue, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={dateOfBirthValue || undefined}
                        onSelect={(date) => setValue("date_of_birth", date || null, { shouldValidate: true })}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1920}
                        toYear={new Date().getFullYear()}
                        />
                    </PopoverContent>
                    </Popover>
                </FormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormItem label="Gender" id="gender" error={errors.gender?.message}>
                    <Select onValueChange={(value) => setValue("gender", value)} defaultValue={watch("gender")}>
                        <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
                <FormItem label="Marital Status" id="marital_status" error={errors.marital_status?.message}>
                     <Select onValueChange={(value) => setValue("marital_status", value)} defaultValue={watch("marital_status")}>
                        <SelectTrigger id="marital_status">
                            <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                            <SelectItem value="Separated">Separated</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            </div>

            <FormItem label="Address Line 1" id="address_line1" error={errors.address_line1?.message}>
              <Input id="address_line1" {...register("address_line1")} placeholder="123 Main St" />
            </FormItem>
            <FormItem label="Address Line 2" id="address_line2" error={errors.address_line2?.message}>
              <Input id="address_line2" {...register("address_line2")} placeholder="Apt #101" />
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormItem label="City" id="city" error={errors.city?.message}>
                <Input id="city" {...register("city")} placeholder="Columbia" />
              </FormItem>
              <FormItem label="State (2-letter)" id="state" error={errors.state?.message}>
                <Input id="state" {...register("state")} placeholder="SC" maxLength={2}/>
              </FormItem>
              <FormItem label="Zip Code" id="zip_code" error={errors.zip_code?.message}>
                <Input id="zip_code" {...register("zip_code")} placeholder="29201" />
              </FormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem label="Primary Phone" id="phone_number" error={errors.phone_number?.message}>
                <Input id="phone_number" type="tel" {...register("phone_number")} placeholder="(XXX) XXX-XXXX" />
              </FormItem>
              <FormItem label="Work Phone" id="work_phone_number" error={errors.work_phone_number?.message}>
                <Input id="work_phone_number" type="tel" {...register("work_phone_number")} placeholder="(XXX) XXX-XXXX" />
              </FormItem>
            </div>
            
            <FormItem label="Email Address" id="email" error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} placeholder="john.doe@example.com" />
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormItem label="Occupation / Job Title" id="occupation" error={errors.occupation?.message}>
                <Input id="occupation" {...register("occupation")} placeholder="Software Engineer" />
                </FormItem>
                <FormItem label="Number of Dependents" id="num_dependents" error={errors.num_dependents?.message}>
                <Input id="num_dependents" type="number" {...register("num_dependents")} placeholder="0" />
                </FormItem>
            </div>

            <CardFooter className="px-0 pt-6 flex justify-end space-x-3">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? 'Saving...' : 'Save Injured Worker'}
                </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
       <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have this worker?{' '}
        <Link href="/workers" className="underline hover:text-primary">
          View all workers
        </Link>
      </p>
    </div>
  );
}
