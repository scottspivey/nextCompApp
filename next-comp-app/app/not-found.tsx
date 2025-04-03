// app/not-found.tsx
"use client"; // Needed for useRouter hook


import { useRouter } from 'next/navigation';
import { Button } from '@/app/Components/ui/button'; // Adjust path if needed
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react'; // Import icons

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center bg-background px-4 py-12 text-center">
      {/* Icon */}
      <AlertTriangle className="h-16 w-16 text-primary mb-6" strokeWidth={1.5} />

      {/* Heading */}
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        404 - Page Not Found
      </h1>

      {/* Message */}
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        Oops! Looks like the page you were searching for doesn't exist or has been moved.
      </p>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()} // Go back to previous page
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button
          onClick={() => router.push('/')} // Go to homepage
        >
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
