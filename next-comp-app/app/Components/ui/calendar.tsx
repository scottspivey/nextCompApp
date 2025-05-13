// app/Components/ui/calendar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller, Control, FieldValues, Path, RegisterOptions, PathValue } from 'react-hook-form';
import { DayPicker, SelectSingleEventHandler } from 'react-day-picker';
// Make sure this CSS is imported, or react-day-picker styles are globally available via your globals.css
// import 'react-day-picker/dist/style.css';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/app/Components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/Components/ui/popover';

// A basic cn utility. If you have one from clsx + tailwind-merge, prefer that.
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Interface for our CustomDatePicker props
interface CustomDatePickerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>
> {
    name: TName;
    control: Control<TFieldValues>;
    rules?: Omit<RegisterOptions<TFieldValues, TName>, 'valueAsDate' | 'setValueAs' | 'disabled'>;
    placeholder?: string;
}

// Our Custom Date Picker Component
function CustomDatePicker<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>
>({
    name,
    control,
    rules,
    placeholder = "Pick a date"
}: CustomDatePickerProps<TFieldValues, TName>) {
  const [isOpen, setIsOpen] = useState(false);
  const internalPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        internalPopoverRef.current &&
        event.target instanceof Node &&
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

        // Determine selectedDate from the field value
        if (Object.prototype.toString.call(value) === "[object Date]") { // Check if it's a Date object
            if (isValid(value)) {
                selectedDate = value;
            }
        } else if (typeof value === 'string') { // Check if it's a string to be parsed
            const parsed = parseISO(value);
            if (isValid(parsed)) {
                selectedDate = parsed;
            }
        }
        // If value is null, undefined, number, or other object types, selectedDate remains undefined.

        const handleSelectDate: SelectSingleEventHandler = (date) => {
          onChange(date || null);
          setIsOpen(false);
        };

        const clearDate = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          onChange(null);
        }

        // Determine a sensible default month for the calendar view
        let monthForView: Date | undefined = selectedDate; // Start with selectedDate

        if (!monthForView) { // If selectedDate didn't provide a month
            const formDefaultValue = control._defaultValues[name] as PathValue<TFieldValues, TName>;
            if (formDefaultValue && typeof formDefaultValue === 'object' && (formDefaultValue as any) instanceof Date) { // Check if default is a Date object
                if (isValid(formDefaultValue as Date)) {
                    monthForView = formDefaultValue;
                }
            } else if (typeof formDefaultValue === 'string') { // Check if default is a string
                const parsedDefault = parseISO(formDefaultValue);
                if (isValid(parsedDefault)) {
                    monthForView = parsedDefault;
                }
            }
            // Fallback if no valid date from value or formDefaultValue
            if (!monthForView) {
                monthForView = new Date(); // Default to current date
            }
        }

        return (
          <div className="w-full" ref={internalPopoverRef}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 px-3 py-2 text-sm",
                      !selectedDate && "text-muted-foreground",
                      error && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
                  </Button>
                  {selectedDate && (
                     <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={clearDate}
                        aria-label="Clear date"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSelectDate}
                  defaultMonth={monthForView}
                  captionLayout="dropdown"
                  fromYear={1900}
                  toYear={new Date().getFullYear() + 5}
                  fromDate={new Date(1900, 0, 1)}
                  toDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {error && <p className="mt-1 text-xs text-destructive">{error.message}</p>}
          </div>
        );
      }}
    />
  );
}

// Define the shape of your form values for type safety
interface MyFormValues {
  eventDate: Date | null;
  anotherDate: Date | null;
}

// Example Usage within a Form
export default function MyFormWithDatePicker() {
  const { handleSubmit, control, watch } = useForm<MyFormValues>({
    defaultValues: {
      eventDate: null,
      anotherDate: new Date(),
    }
  });

  const onSubmit = (data: MyFormValues) => {
    console.log("Form Data:", data);
    // Check isValid for data properties if they can be Invalid Date objects
    if (data.eventDate && isValid(data.eventDate)) {
        console.log("Event Date (formatted):", format(data.eventDate, "yyyy-MM-dd"));
    }
    if (data.anotherDate && isValid(data.anotherDate)) {
        console.log("Another Date (formatted):", format(data.anotherDate, "yyyy-MM-dd"));
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-background min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">Date Picker Form</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-foreground mb-1">
            Event Date
          </label>
          <CustomDatePicker<MyFormValues>
            name="eventDate"
            control={control}
            rules={{ required: "Event date is required" }}
            placeholder="Select event date"
          />
        </div>

        <div>
          <label htmlFor="anotherDate" className="block text-sm font-medium text-foreground mb-1">
            Another Date (with default)
          </label>
          <CustomDatePicker<MyFormValues>
            name="anotherDate"
            control={control}
            placeholder="Select another date"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
        >
          Submit
        </Button>
      </form>

      <div className="mt-8 p-4 bg-muted rounded-md">
        <h2 className="text-lg font-medium text-foreground">Current Form Values:</h2>
        <pre className="mt-2 text-sm text-muted-foreground overflow-x-auto">
          {JSON.stringify(watch(), (key, value) => {
            // Ensure to handle Date objects correctly during stringification
            if (value instanceof Date && isValid(value)) {
              return format(value, "PPPpp");
            }
            return value;
          }, 2)}
        </pre>
      </div>
    </div>
  );
}
