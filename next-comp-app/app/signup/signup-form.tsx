// app/api/auth/[...nextauth]/signup/signup-form.tsx

'use client'; // This component needs client-side interactivity

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation'; // Use App Router's navigation

import { Button } from '@/app/Components/ui/button'; // Adjust path if needed
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/Components/ui/form'; // Adjust path if needed
import { Input } from '@/app/Components/ui/input'; // Adjust path if needed
import { useToast } from "@/hooks/use-toast"


// Define the validation schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  // Add other fields like firmName, role if needed for profile creation
  firmName: z.string().optional(),
  role: z.string().optional(),
});

type SignUpFormValues = z.infer<typeof formSchema>;

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  // 1. Define your form.
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      firmName: '',
      role: '',
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: SignUpFormValues) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      // Handle success
      console.log('Registration successful:', result);
      toast({
        title: "Registration Successful",
        description: "Please log in with your new account.",
      });
      router.push('/login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Registration failed:', error);
        toast({
          title: "Registration Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      } else {
        console.error('Unknown error:', error);
        toast({
          title: "Registration Failed",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         {/* Optional: Firm Name Field */}
         <FormField
          control={form.control}
          name="firmName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firm Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Example Law Firm" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         {/* Optional: Role Field */}
         <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role (Optional)</FormLabel>
              <FormControl>
                {/* Consider using a Select component here if roles are predefined */}
                <Input placeholder="Attorney, Adjuster, etc." {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}