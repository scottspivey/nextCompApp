// components/ui/radio-group.tsx
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

// Use React.ComponentRef instead of deprecated React.ElementRef
const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      // Base layout for the group
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

// Use React.ComponentRef instead of deprecated React.ElementRef
const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        // Base styles for the radio item circle
        "aspect-square h-4 w-4 rounded-full border",
        // Use neutral border color by default (theme-aware)
        "border-border",
        // Keep text-primary so the indicator inherits it when shown (theme-aware)
        "text-primary",
        // Focus and disabled styles (theme-aware)
        "ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* Indicator wrapper - shown when checked */}
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        {/* The actual indicator icon (circle) */}
        {/* fill-current and text-current make it inherit the parent's text color (text-primary) */}
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

