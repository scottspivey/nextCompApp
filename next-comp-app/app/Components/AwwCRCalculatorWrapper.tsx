'use client';

import { AwwCRCalculator } from './AwwCRCalculator';
import { maxCompensationRates } from '@/app/CommonVariables';
import { useSearchParams } from 'next/navigation';

export function AwwCRCalculatorWrapper() {
  const searchParams = useSearchParams();
  
  // Convert searchParams to object format
  const paramsObject: { [key: string]: string | string[] } = {};
  searchParams.forEach((value, key) => {
    paramsObject[key] = value;
  });
  
  return <AwwCRCalculator maxCompensationRates={maxCompensationRates} searchParams={paramsObject} />;
}