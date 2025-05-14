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
    minDate?: Date | null;
    maxDate?: Date | null;
    showMonthDropdown?: boolean;
    showYearDropdown?: boolean;
    dropdownMode?: "scroll" | "select";
    disabled?: boolean; // Optional disabled prop
}

// Custom Input for react-datepicker to make it look like a ShadCN input
const CustomDatePickerInput = forwardRef<
    HTMLInputElement,
    { value?: string; onClick?: () => void; placeholder?: string, error?: boolean, disabled?: boolean}
>(({ value, onClick, placeholder, error, disabled }, ref) => (
    <div className="relative">
        <Input
            value={value}
            onClick={onClick}
            ref={ref}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && "border-destructive")}
            readOnly // Make input read-only to encourage use of picker
        />
        <LucideCalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
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
    className,
    minDate,
    maxDate,
    showMonthDropdown = false, // Default to false, enable as needed when using component
    showYearDropdown = false,  // Default to false, enable as needed when using component
    dropdownMode = "scroll",   // Default to scroll, can be "select"
    disabled,
}: AlternativeDatePickerProps<TFieldValues, TName>) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
                // Determine the selected date for the DatePicker component
                // Handles cases where value might be a Date object, a string, or null/undefined
                let currentDate: Date | null = null;
                if (value) {
                    // Check if value is a Date-like object (more robust than instanceof Date across realms)
                    if (typeof value === 'object' && value !== null && typeof (value as Date).getTime === 'function' && !isNaN((value as Date).getTime())) {
                        currentDate = value as Date;
                    } else if (typeof value === 'string') {
                        const parsedDate = new Date(value);
                        if (!isNaN(parsedDate.getTime())) {
                            currentDate = parsedDate;
                        }
                    }
                    // Add more parsing logic if value could be a number (timestamp), etc.
                }

                return (
                    <div className={cn("w-full", className)}>
                        {label && <Label htmlFor={name} className={cn("mb-1 block", error && "text-destructive")}>{label}</Label>}
                        <DatePicker
                            selected={currentDate} // Use the processed currentDate
                            onChange={(date: Date | null) => onChange(date)}
                            onBlur={onBlur}
                            disabled={disabled}
                            dateFormat={dateFormat}
                            placeholderText={placeholder}
                            showPopperArrow={showPopperArrow}
                            customInput={<CustomDatePickerInput error={!!error} placeholder={placeholder} disabled={disabled} />}
                            wrapperClassName="w-full"
                            popperPlacement="bottom-start"
                            minDate={minDate || undefined} // Pass minDate, defaulting to undefined if null
                            maxDate={maxDate || undefined} // Pass maxDate, defaulting to undefined if null
                            showMonthDropdown={showMonthDropdown}
                            showYearDropdown={showYearDropdown}
                            dropdownMode={dropdownMode}
                            // Adjust number of years in dropdown. If minDate/maxDate are close, this prevents an overly long list.
                            // For DOB, minDate might be 120 years ago, maxDate today.
                            yearDropdownItemNumber={maxDate && minDate ? (maxDate.getFullYear() - minDate.getFullYear() + 1) : 100}
                            scrollableYearDropdown={dropdownMode === 'scroll'} // Enable scroll for year dropdown if mode is 'scroll'
                        />
                        {error && <p className="mt-1 text-xs text-destructive">{error.message}</p>}
                    </div>
                );
            }}
        />
    );
}
