// app/Components/Footer.tsx
"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form"; // Import react-hook-form
import { zodResolver } from "@hookform/resolvers/zod"; // Import resolver
import { z } from "zod"; // Import zod

// Import shadcn/ui components
import { Button } from "@/app/Components/ui/button";
import { Input } from "@/app/Components/ui/input";
import { useToast } from "@/app/Components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/Components/ui/form"; // Import Form components

// Import icons - can't use lucide-react for socials, use react-icons instead
import { SiX, SiLinkedin, SiFacebook } from "react-icons/si";
import { Loader2 } from "lucide-react"; // Added Loader2

// Zod Schema for the newsletter form
const NewsletterFooterSchema = z.object({
  email: z.string()
          .min(1, { message: "Email address is required." })
          .email({ message: "Please enter a valid email address." }),
});
type NewsletterFooterValues = z.infer<typeof NewsletterFooterSchema>;


export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isMounted, setIsMounted] = useState(false);
  // Remove useState for email, keep for submitting status
  // const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Setup react-hook-form
  const form = useForm<NewsletterFooterValues>({
    resolver: zodResolver(NewsletterFooterSchema),
    defaultValues: {
      email: "",
    },
  });

  // Ensure component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Updated onSubmit handler for react-hook-form
  const onSubmit = async (data: NewsletterFooterValues) => {
    setIsSubmitting(true);
    console.log("Subscribing email:", data.email); // Use data.email

    // --- Mock API Call ---
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // --- SUCCESS ---
      toast({
        title: "Subscribed!",
        description: "Thank you for joining our newsletter.",
      });
      form.reset(); // Reset form using react-hook-form's reset

    } catch (error) {
      // --- ERROR ---
      console.error("Subscription error:", error);
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
    // --- End Mock API Call ---
  };

  // Avoid rendering potentially mismatching year or form during SSR/hydration mismatch window
  if (!isMounted) {
     return (
        <footer className="bg-foreground border-t border-border">
             <div className="container mx-auto px-6 pt-12 pb-8 min-h-[300px]">
                {/* Placeholder content or skeleton */}
             </div>
        </footer>
     );
  }

  return (
    <footer className="bg-foreground text-muted border-t border-border">
      <div className="container mx-auto px-6 pt-12 pb-8">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: About & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-background">SC Workers&apos; Comp App</h3>
            <p className="text-muted mb-4 text-sm">
              Professional tools for accurate workers&apos; compensation calculations in South Carolina.
            </p>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-background transition-colors">
                <span className="sr-only">LinkedIn</span>
                <SiLinkedin className="h-5 w-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-background transition-colors">
                <span className="sr-only">Twitter</span>
                <SiX className="h-5 w-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-background transition-colors">
                <span className="sr-only">Facebook</span>
                <SiFacebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-background">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/Calculators" className="text-muted hover:text-background transition-colors">Calculators</Link></li>
              <li><Link href="/resources/laws" className="text-muted hover:text-background transition-colors">SC Comp Laws</Link></li>
              <li><Link href="/resources/guides" className="text-muted hover:text-background transition-colors">How-to Guides</Link></li>
              <li><Link href="/faq" className="text-muted hover:text-background transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Column 3: Pricing */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-background">Pricing</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing" className="text-muted hover:text-background transition-colors">Plans</Link></li>
              <li><Link href="/pricing/enterprise" className="text-muted hover:text-background transition-colors">Enterprise</Link></li>
              <li><Link href="/pricing/compare" className="text-muted hover:text-background transition-colors">Compare Plans</Link></li>
              <li><Link href="/contact" className="text-muted hover:text-background transition-colors">Contact Sales</Link></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-background">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted hover:text-background transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="text-muted hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted hover:text-background transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-muted hover:text-background transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscribe */}
        <div className="mt-12 border-t border-border/50 pt-8">
          <h3 className="text-lg font-semibold mb-4 text-background">Subscribe to Our Newsletter</h3>
          <p className="text-muted mb-4 text-sm">
            Get the latest updates on SC workers&apos; compensation laws and calculator improvements.
          </p>

          {/* Use shadcn/ui Form component */}
          <Form {...form}>
            {/* Use react-hook-form's handleSubmit */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row sm:items-end gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="youraddress@email.com"
                        className="bg-background/5 border-border text-background placeholder:text-muted" // Input styling for dark bg
                        disabled={isSubmitting}
                        aria-label="Email address for newsletter"
                        {...field} // Connect input to react-hook-form field state
                      />
                    </FormControl>
                    <FormMessage className="text-destructive pt-1 text-left" /> {/* Display validation errors */}
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="default" // Primary theme button (Teal)
                disabled={isSubmitting}
                className="sm:flex-shrink-0"
              >
                {/* Show loader when submitting */}
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>
          </Form>
           {/* Removed old message paragraph */}
        </div>

        {/* Bottom Bar: Copyright & Links */}
        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted text-sm mb-4 md:mb-0">
            &copy; {currentYear} SC Workers&apos; Comp Calculator. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-muted hover:text-background text-sm transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-muted hover:text-background text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
