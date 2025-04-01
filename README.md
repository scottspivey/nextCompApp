## SC Workers' Compensation Calculator Enhancement

## Overview

This project enhances the South Carolina Workers' Compensation Calculator application, specifically focusing on the Average Weekly Wage (AWW) calculator functionality. The enhancements include:

1. State management with Zustand
2. Form validation with Zod
3. Enhanced UI components with shadcn/ui
4. Improved user experience with multi-step forms
5. Better error handling and user feedback
6. Responsive design improvements

## Components Structure

### Core Components

1. **AwwCRCalculator (`app/Components/AwwCRCalculator.tsx`)**
   - Main calculator component that handles the calculation logic
   - Utilizes the Zustand store for state management
   - Provides responsive UI with shadcn/ui components

2. **CalculatorForm (`app/Components/CalculatorForm.tsx`)**
   - Multi-step form component that collects user input
   - Each step has specific validation rules
   - Includes tooltips and help text for better user guidance

3. **StepNavigation (`app/Components/StepNavigation.tsx`)**
   - Provides navigation controls for moving between form steps
   - Shows progress indicators
   - Handles form validation feedback

4. **AWW Calculator Wrapper (`app/Components/AwwCRCalculatorWrapper.tsx`)**
   - Client component that passes necessary props to the main calculator

### State Management

1. **AWW Calculator Store (`app/stores/awwCalculatorStore.ts`)**
   - Manages all calculator state using Zustand
   - Implements validation rules using Zod
   - Handles calculation logic for AWW and compensation rate

### Pages

1. **Calculators Page (`app/Calculators/page.tsx`)**
   - Lists all available calculators with descriptions
   - Uses a card-based layout for better organization
   - Indicates which calculators are premium/coming soon

2. **AWW Calculator Page (`app/Calculators/aww/page.tsx`)**
   - Dedicated page for the AWW calculator
   - Includes metadata for SEO
   - Provides context and educational information

### UI Components

1. **shadcn/ui Components (`components/ui/`)**
   - Button
   - Card
   - Input
   - Label
   - RadioGroup
   - Tooltip
   - Other UI primitives

2. **Utils (`lib/utils.ts`)**
   - Utility functions for CSS class merging

## Calculation Logic

The AWW calculator follows South Carolina workers' compensation laws:

1. Collects date of injury to determine applicable maximum compensation rate
2. Identifies special employment situations that affect calculations
3. Determines if the employee was employed for all four quarters prior to injury
4. Calculates the average weekly wage based on earnings from the four quarters
5. Applies the 66.67% rule to determine the compensation rate
6. Caps the compensation rate at the maximum for the year of injury

## Features

1. **Multi-step Form**
   - Guided process for data collection
   - Step indicators to show progress
   - Validation at each step before proceeding

2. **Validation**
   - Field-level validation with error messages
   - Form-level validation before calculations
   - Date validation to ensure it's within valid range

3. **Results Display**
   - Clear presentation of calculation results
   - Details about calculation method used
   - Information about maximum rates and limitations

4. **Responsive Design**
   - Mobile-friendly layout
   - Adaptive UI for different screen sizes
   - Accessible form controls

5. **Educational Content**
   - Information about SC workers' comp laws
   - Context for calculations
   - Links to additional resources

## Future Enhancements

1. **Save Calculations**
   - Allow logged-in users to save calculation results
   - History of previous calculations

2. **Print/Export**
   - Export results to PDF
   - Print-friendly formatting

3. **Additional Calculators**
   - Implement other planned calculators
   - Integrate data between different calculators

4. **Profile Integration**
   - User profiles with saved information
   - Client/case organization

## Getting Started

To run this project locally:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000/Calculators/aww](http://localhost:3000/Calculators/aww) to see the AWW calculator in action.

## Dependencies

- Next.js
- TypeScript
- React
- Zustand (state management)
- Zod (validation)
- shadcn/ui (UI components)
- Tailwind CSS (styling)
- Lucide React (icons)
- date-fns (date formatting)

## Best Practices

This implementation follows these best practices:

1. **Component Structure**
   - Each component has a single responsibility
   - Components are reusable and maintainable

2. **State Management**
   - Centralized state with Zustand
   - Clean separation of concerns

3. **Form Handling**
   - Clear validation rules
   - Helpful error messages
   - Intuitive UI flow

4. **Responsive Design**
   - Mobile-first approach
   - Adaptive layouts

5. **Accessibility**
   - Semantic HTML
   - ARIA attributes
   - Keyboard navigation
   - Focus management

6. **Performance**
   - Optimized rendering
   - Efficient state updates