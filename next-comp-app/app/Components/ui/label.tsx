// app/Components/ui/label.tsx
"use client"; // Radix UI components often require client-side context/hooks

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label"; // Import the Radix Label primitive
import { cn } from "@/lib/utils"; // Import your className merging utility

// Use React.forwardRef to allow refs to be passed down
const Label = React.forwardRef<
  // Type of the element the ref points to (the Radix Label root element)
  React.ElementRef<typeof LabelPrimitive.Root>,
  // Type of the props the component accepts, based on Radix Label props
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref} // Pass the ref to the Radix component
    className={cn(
      // Base Tailwind styles for the label
      "text-sm font-medium leading-none",
      // Accessibility: Style adjustments when the associated peer input is disabled
      // Assumes the associated input has the 'peer' class (e.g., <Input className="peer" />)
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className // Merge base styles with any custom classes passed via props
    )}
    {...props} // Pass down all other props (like htmlFor, children, etc.)
  />
));
Label.displayName = LabelPrimitive.Root.displayName; // Set display name for React DevTools

export { Label }; // Export the component for use