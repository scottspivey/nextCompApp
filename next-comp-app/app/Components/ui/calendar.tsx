// app/Components/ui/calendar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Controller, Control, FieldValues, Path, RegisterOptions, PathValue } from 'react-hook-form';
import { DayPicker, SelectSingleEventHandler } from 'react-day-picker';
// Ensure 'react-day-picker/dist/style.css' is imported in your global CSS
// or that the styles are otherwise made available.
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/app/Components/ui/button'; // Assuming this path is correct
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/Components/ui/popover'; // Assuming this path is correct

// A basic cn utility. If you have one from clsx + tailwind-merge, prefer that.
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Interface for our Calendar (formerly CustomDatePicker) props
interface CalendarProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>
> {
    name: TName;
    control: Control<TFieldValues>;
    rules?: Omit<RegisterOptions<TFieldValues, TName>, 'valueAsDate' | 'setValueAs' | 'disabled'>;
    placeholder?: string;
}

// Renamed CustomDatePicker to Calendar and made it a named export
export function Calendar<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>
>({
    name,
    control,
    rules,
    placeholder = "Pick a date"
}: CalendarProps<TFieldValues, TName>) {
  const [isOpen, setIsOpen] = useState(false);
  const internalPopoverRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the popover to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        internalPopoverRef.current &&
        event.target instanceof Node && // Type guard for event.target
        !internalPopoverRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    } else {
        document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, internalPopoverRef]);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        let selectedDate: Date | undefined = undefined;

        // Determine selectedDate from the field value (Date object or ISO string)
        if ((value as any) instanceof Date) {
            if (isValid(value)) {
                selectedDate = value;
            }
        } else if (typeof value === 'string') {
            const parsed = parseISO(value);
            if (isValid(parsed)) {
                selectedDate = parsed;
            }
        }

        // Handler for when a date is selected in the DayPicker
        const handleSelectDate: SelectSingleEventHandler = (date) => {
          onChange(date || null); // Pass Date object or null to react-hook-form
          setIsOpen(false); // Close the popover
        };

        // Handler to clear the selected date
        const clearDate = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation(); // Prevent popover from toggling
          onChange(null);
        }

        // Determine a sensible default month for the calendar view
        let monthForView: Date | undefined = selectedDate;

        if (!monthForView) {
            const formDefaultValue = control._defaultValues[name] as PathValue<TFieldValues, TName>;
            if ((formDefaultValue as any) instanceof Date) {
                if (isValid(formDefaultValue)) {
                    monthForView = formDefaultValue;
                }
            } else if (typeof formDefaultValue === 'string') {
                const parsedDefault = parseISO(formDefaultValue);
                if (isValid(parsedDefault)) {
                    monthForView = parsedDefault;
                }
            }
            if (!monthForView) { // Fallback to current date if no valid default
                monthForView = new Date();
            }
        }

        return (
          <div className="w-full" ref={internalPopoverRef}> {/* Ref for outside click detection */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <div className="relative"> {/* Container for button and clear icon */}
                  <Button
                    variant="outline"
                    type="button" // Important for forms
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 px-3 py-2 text-sm",
                      !selectedDate && "text-muted-foreground", // Style for empty state
                      error && "border-destructive" // Style for error state
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" /> {/* Calendar icon */}
                    {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
                  </Button>
                  {selectedDate && ( // Show clear button only if a date is selected
                     <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={clearDate}
                        aria-label="Clear date"
                      >
                        <X className="h-4 w-4" /> {/* Clear icon */}
                      </Button>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DayPicker
                  mode="single" // Only allow selecting a single date
                  selected={selectedDate}
                  onSelect={handleSelectDate}
                  defaultMonth={monthForView} // Set the initial month to display
                  captionLayout="dropdown" // Use dropdowns for month/year navigation
                  fromYear={1900} // Earliest year selectable
                  toYear={new Date().getFullYear() + 5} // Latest year selectable
                  fromDate={new Date(1900, 0, 1)} // Earliest date selectable
                  toDate={new Date(new Date().getFullYear() + 5, 11, 31)} // Latest date selectable
                  initialFocus // Focus the calendar when it opens
                />
              </PopoverContent>
            </Popover>
            {error && <p className="mt-1 text-xs text-destructive">{error.message}</p>} {/* Display validation error */}
          </div>
        );
      }}
    />
  );
}

// The MyFormWithDatePicker example component has been removed from this file.
// It was for demonstration and should not be part of the reusable UI component.
// You can keep that example code in the page/component where you are using the Calendar,
// or in a separate storybook/documentation file.
