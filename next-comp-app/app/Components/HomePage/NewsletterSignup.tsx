// app/Components/HomePage/NewsletterSignup.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/app/Components/ui/button"; // Import themed Button
import { Input } from "@/app/Components/ui/input";   // Import themed Input
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/Components/ui/form"; // Import Form components
import { useToast } from "@/app/Components/ui/use-toast"; // Import useToast hook
import { Loader2 } from "lucide-react"; // Import loader icon

// Define Zod schema for validation
const NewsletterSchema = z.object({
  email: z.string()
          .min(1, { message: "Email address is required." })
          .email({ message: "Please enter a valid email address." }),
});

type NewsletterFormValues = z.infer<typeof NewsletterSchema>;

export default function NewsletterSignup() {
  // State for submission status (still useful for async operations)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast(); // Initialize toast hook

  // Setup react-hook-form
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(NewsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: NewsletterFormValues) => {
    setIsSubmitting(true);

    // --- Mock API Call ---
    console.log("Submitting email:", data.email);
    // Replace this with your actual API call logic
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // --- SUCCESS ---
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
        // variant: "success" // Add custom success variant if needed
      });
      form.reset(); // Reset form fields on success

    } catch (error) {
      // --- ERROR ---
      console.error("Subscription error:", error);
      toast({
        variant: "destructive", // Use destructive variant for errors
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your subscription. Please try again.",
      });
    } finally {
      // --- ALWAYS ---
      setIsSubmitting(false); // Reset submitting state
    }
    // --- End Mock API Call ---
  };

  return (
    // Use muted background, consistent padding and rounding
    <div className="bg-muted py-12 px-4 sm:px-6 lg:px-8 rounded-lg">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Stay Updated on Workers&apos; Compensation Laws
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Subscribe for the latest updates on SC workers&apos; compensation laws,
          site improvements, and tips.
        </p>
        <div className="mt-8 max-w-md mx-auto">
          {/* Use shadcn/ui Form component */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="sm:flex sm:gap-3 sm:items-end">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full"> {/* Allow item to take full width */}
                    {/* Label is visually hidden but available for screen readers */}
                    <FormLabel className="sr-only">Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        disabled={isSubmitting}
                        aria-label="Email address for newsletter"
                        {...field} // Spread field props (value, onChange, onBlur, ref)
                      />
                    </FormControl>
                    {/* FormMessage will display Zod validation errors */}
                    <FormMessage className="text-left" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="mt-3 w-full sm:mt-0 sm:w-auto sm:flex-shrink-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          </Form>
          {/* Removed the old paragraph for messages - Toasts handle this now */}
        </div>
      </div>
    </div>
  );
}
