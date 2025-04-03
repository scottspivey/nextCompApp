// components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils" // Utility for merging Tailwind classes

// Changed from interface to type alias to resolve no-empty-object-type rule
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base classes using theme-aware Tailwind utilities
          "flex h-10 w-full rounded-md border",
          "border-input",         // Uses --input variable for border color
          "bg-background",        // Uses --background variable for background color
          "px-3 py-2 text-sm",    // Standard padding and text size
          "ring-offset-background", // Uses --background for focus ring offset
          "file:border-0 file:bg-transparent file:text-sm file:font-medium", // File input specific styling
          "placeholder:text-muted-foreground", // Uses --muted-foreground for placeholder
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring", // Uses --ring variable for focus ring color
          "focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50", // Disabled state styling
          className // Allows merging additional classes passed via props
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
