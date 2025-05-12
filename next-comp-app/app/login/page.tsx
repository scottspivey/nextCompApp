// app/login/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/app/Components/ui/button';
import { Input } from '@/app/Components/ui/input';
import { Label } from '@/app/Components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/Components/ui/card';
import { useToast } from "@/app/Components/ui/use-toast";
import Link from 'next/link';

// New component to handle logic using useSearchParams
function LoginLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Check for error query parameter from NextAuth.js
  useEffect(() => {
    const callbackError = searchParams.get('error');
    if (callbackError) {
      if (callbackError === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
        toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
      } else if (callbackError === "OAuthAccountNotLinked") {
        setError("This email is already linked with another provider (e.g., Google). Please sign in with that provider.");
        toast({ title: "Login Failed", description: "Email already linked with another provider.", variant: "destructive" });
      }
      else {
        setError("An unexpected error occurred during login. Please try again.");
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
        redirect: false,
        email: email,
        password: password,
        // callbackUrl: '/dashboard' // You can specify a callbackUrl if needed
      });

      if (result?.error) {
        console.error("SignIn error from NextAuth:", result.error);
        // Error handling is now primarily done by the useEffect hook above,
        // but we can set a local error state for immediate feedback too.
        const friendlyError = result.error === "CredentialsSignin"
          ? "Invalid email or password."
          : "Login failed. Please check your credentials or try again later.";
        setError(friendlyError);
        // Toast is already handled by useEffect, but you could add another one here if desired
      } else if (result?.ok && !result.error) {
        toast({ title: "Login Successful!", description: "Redirecting to dashboard..." });
        router.push(searchParams.get('callbackUrl') || '/dashboard');
      } else {
        setError("An unexpected issue occurred during login.");
        toast({ title: "Login Error", description: "An unexpected issue occurred.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Login submission error:", err);
      const message = err instanceof Error ? err.message : "An unexpected network error occurred.";
      setError(message);
      toast({ title: "Login Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // If session is loading or user is already authenticated, show loading/redirect
  // This check should ideally be outside the component that uses useSearchParams
  // but for simplicity here, we handle it. A better approach might be a HOC or layout check.
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading session...</div>;
  }
  // If authenticated, useEffect will handle redirect, but this prevents rendering the form momentarily.
  if (status === 'authenticated') {
     return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
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
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
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

// Main LoginPage component that wraps LoginLogic with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading page...</div>}>
      <LoginLogic />
    </Suspense>
  );
}
