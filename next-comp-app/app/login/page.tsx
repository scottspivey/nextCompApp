// app/login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react'; // useSession for redirecting if already logged in
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/app/Components/ui/button'; // Adjust path
import { Input } from '@/app/Components/ui/input';   // Adjust path
import { Label } from '@/app/Components/ui/label';   // Adjust path
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/Components/ui/card'; // Adjust path
import { useToast } from "@/app/Components/ui/use-toast"; // Adjust path
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: session, status } = useSession(); // Get session status

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard'); // Or your desired redirect path
    }
  }, [status, router]);

  // Check for error query parameter from NextAuth.js (e.g., if CredentialsSignin fails)
  useEffect(() => {
    const callbackError = searchParams.get('error');
    if (callbackError) {
      // Map common NextAuth.js errors to user-friendly messages
      if (callbackError === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
        toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
      } else {
        setError("An unexpected error occurred. Please try again.");
        toast({ title: "Login Error", description: "An unexpected error occurred.", variant: "destructive" });
      }
    }
  }, [searchParams, toast]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Handle redirect manually after checking result
        email: email,
        password: password,
      });

      if (result?.error) {
        console.error("SignIn error:", result.error);
        // Error messages are typically handled by the useEffect hook checking searchParams.get('error')
        // But you can set a generic one here if needed, or if specific errors aren't passed in URL
        setError(result.error === "CredentialsSignin" ? "Invalid email or password." : "Login failed. Please try again.");
        toast({ title: "Login Failed", description: result.error === "CredentialsSignin" ? "Invalid email or password." : "An unexpected error occurred.", variant: "destructive" });
      } else if (result?.ok && !result.error) {
        // Successful sign-in
        toast({ title: "Login Successful!", description: "Redirecting to dashboard..." });
        router.push('/dashboard'); // Or use result.url if provided and preferred
      } else {
        // Should not happen if redirect is false and no error, but as a fallback
        setError("An unexpected issue occurred during login.");
         toast({ title: "Login Error", description: "An unexpected issue occurred.", variant: "destructive" });
      }
    } catch (err) { // Catch network errors or other unexpected issues
      console.error("Login submission error:", err);
      const message = err instanceof Error ? err.message : "An unexpected network error occurred.";
      setError(message);
      toast({ title: "Login Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === 'loading' || status === 'authenticated') {
    // Show a loading state or null while checking session or redirecting
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Log In</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
