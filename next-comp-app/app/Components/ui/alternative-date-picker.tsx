// app/Components/ui/alternative-date-picker.tsx
"use client";

import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Import default styles
import { Controller, Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { Input } from '@/app/Components/ui/input'; // Assuming your ShadCN input path
import { Label } from '@/app/Components/ui/label'; // Assuming your ShadCN label path
import { CalendarIcon as LucideCalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility from ShadCN setup

// Interface for our AlternativeDatePicker props
interface AlternativeDatePickerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>
> {
    name: TName;
    control: Control<TFieldValues>;
    label?: string; // Optional label for the date picker
    rules?: Omit<RegisterOptions<TFieldValues, TName>, 'valueAsDate' | 'setValueAs' | 'disabled'>;
    placeholder?: string;
    dateFormat?: string;
    showPopperArrow?: boolean;
    className?: string; // Allow passing custom class to the wrapper
}

// Custom Input for react-datepicker to make it look like a ShadCN input
const CustomDatePickerInput = forwardRef<
    HTMLInputElement,
    { value?: string; onClick?: () => void; placeholder?: string, error?: boolean }
>(({ value, onClick, placeholder, error }, ref) => (
    <div className="relative">
        <Input
            value={value}
            onClick={onClick}
            ref={ref}
            placeholder={placeholder}
            className={cn(error && "border-destructive")}
        />
        <LucideCalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
));
CustomDatePickerInput.displayName = "CustomDatePickerInput";


export function AlternativeDatePicker<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>
>({
    name,
    control,
    label,
    rules,
    placeholder = "Select a date",
    dateFormat = "MM/dd/yyyy",
    showPopperArrow = false,
    className
}: AlternativeDatePickerProps<TFieldValues, TName>) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <div className={cn("w-full", className)}>
                    {label && <Label htmlFor={name} className={cn(error && "text-destructive")}>{label}</Label>}
                    <DatePicker
                        selected={value ? ((value as unknown) instanceof Date ? value : new Date(value as string)) : null}
                        onChange={(date: Date | null) => onChange(date)}
                        onBlur={onBlur}
                        dateFormat={dateFormat}
                        placeholderText={placeholder}
                        showPopperArrow={showPopperArrow}
                        customInput={<CustomDatePickerInput error={!!error} />}
                        wrapperClassName="w-full" // Ensure the wrapper takes full width
                        popperPlacement="bottom-start" // Adjust as needed
                        // You can add more react-datepicker props here as needed:
                        // showMonthDropdown
                        // showYearDropdown
                        // dropdownMode="select"
                        // isClearable
                    />
                    {error && <p className="mt-1 text-xs text-destructive">{error.message}</p>}
                </div>
            )}
        />
    );
}
