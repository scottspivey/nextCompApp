// app/Components/ui/progress.tsx
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils" // Adjust path if needed

// Use React.ComponentRef instead of deprecated React.ElementRef
const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    // Base styles for the progress bar background
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary", // Use secondary for background
      className
    )}
    {...props}
  >
    {/* Indicator showing the progress - uses primary color */}
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all" // Use primary for indicator
      // Calculate transform based on value prop
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

