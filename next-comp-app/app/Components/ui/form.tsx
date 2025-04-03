// components/ui/form.tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils"; // Adjust path if needed
import { Label } from "@/app/Components/ui/label"; // Adjust path if needed

// --- Form Provider ---
// Provides react-hook-form context to nested components
const Form = FormProvider

// --- Form Field Context ---
// Internal context to pass field state down
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

// --- FormField Component ---
// Connects react-hook-form state to a field
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

// --- Hooks for accessing context ---
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  // Get field state from react-hook-form context
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// --- FormItem Context ---
// Provides a unique ID for connecting label, description, and message via ARIA attributes
type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

// --- FormItem Component ---
// Wrapper for a single form field including label, input, description, message
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      {/* Default spacing for form items */}
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

// --- FormLabel Component ---
// Renders a label connected to the form field
const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>, // Use ElementRef here as Label is a primitive wrapper
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      // Apply destructive color if there's an error
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

// --- FormControl Component ---
// Wrapper for the actual input control (Input, Select, Textarea, etc.)
// Uses Slot to merge props and refs onto the immediate child
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}` // Describe by description and message if error
      }
      aria-invalid={!!error} // Set aria-invalid if error exists
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

// --- FormDescription Component ---
// Optional helper text for the field
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      // Use theme muted text color
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

// --- FormMessage Component ---
// Displays validation error messages
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  // Get message from react-hook-form state or use children if provided
  const body = error ? String(error?.message) : children

  if (!body) {
    return null // Don't render if no error and no children
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      // Use theme destructive text color
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body} {/* Display error message text */}
    </p>
  )
})
FormMessage.displayName = "FormMessage"


export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
