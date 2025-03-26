// app/Calculators/page.tsx
import React from 'react';
import { AwwCRCalculatorWrapper } from '@/app/Components/AwwCRCalculator';

const CalculatorsPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Workers&apos; Compensation Calculators</h1>
      <div className="mb-8">
        <AwwCRCalculatorWrapper />
      </div>
    </div>
  );
};

export default CalculatorsPage;