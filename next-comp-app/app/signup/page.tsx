// app/signup/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/Components/ui/button';
import { Input } from '@/app/Components/ui/input';
import { Label } from '@/app/Components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/Components/ui/card';
import { useToast } from "@/app/Components/ui/use-toast";
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firmName, setFirmName] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      const msg = "Password must be at least 6 characters long.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, firmName, role }),
      });

      // Attempt to parse the response body as JSON, regardless of status for now
      // This helps to get error messages from the API even on non-2xx responses
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonParseError) {
        // If response body is not JSON (e.g., unexpected server error page)
        console.error("Failed to parse response JSON:", jsonParseError);
        if (!response.ok) {
          // If it's an error status and not JSON, use a generic HTTP error
          const httpErrorMsg = `Registration failed: Server responded with status ${response.status} ${response.statusText}`;
          setError(httpErrorMsg);
          toast({ title: "Registration Failed", description: httpErrorMsg, variant: "destructive" });
        } else {
          // If it's a success status but not JSON (shouldn't happen with your API)
          const unexpectedSuccessMsg = "Registration response was not in the expected format.";
          setError(unexpectedSuccessMsg);
          toast({ title: "Registration Error", description: unexpectedSuccessMsg, variant: "destructive" });
        }
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        // We have a non-2xx response, but we successfully parsed JSON (responseData)
        const serverErrorMessage = responseData?.error || `Registration failed. Please try again. (Status: ${response.status})`;
        console.log("Server error message from API:", serverErrorMessage); // Log the specific error
        setError(serverErrorMessage);
        toast({ title: "Registration Failed", description: serverErrorMessage, variant: "destructive" });
      } else {
        // Successful registration (status 201)
        toast({ title: "Registration Successful!", description: "You can now log in." });
        router.push('/login');
      }
    } catch (networkOrOtherError) {
      // This catches errors from the fetch() call itself (e.g., network down)
      // or any other unexpected errors not caught by the specific JSON parsing try-catch.
      console.error("Registration submission network/other error:", networkOrOtherError);
      const message = networkOrOtherError instanceof Error ? networkOrOtherError.message : "An unexpected network error occurred.";
      setError(message);
      toast({ title: "Registration Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="firmName">Firm Name (Optional)</Label>
              <Input
                id="firmName"
                type="text"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="Acme Law LLC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role (Optional)</Label>
              <Input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Attorney, Paralegal"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
