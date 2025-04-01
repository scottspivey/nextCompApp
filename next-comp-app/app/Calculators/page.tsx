// app/Calculators/page.tsx
import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  Calculator, 
  Calendar, 
  DollarSign, 
  Ear, 
  Activity, 
  ArrowRight,
  Scale,
  Clock
} from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, } from '@/app/Components/ui/card';
//import { CardContent } from '@/app/Components/ui/card';
import { Button } from '@/app/Components/ui/button';

export const metadata: Metadata = {
  title: "Workers' Compensation Calculators | SC Workers' Comp Tools",
  description: "Professional-grade calculators for South Carolina workers' compensation cases including AWW, commuted value, and more.",
};

interface CalculatorData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isAvailable: boolean;
  comingSoon?: boolean;
  premiumOnly?: boolean;
}

// Define the calculator data
const calculators: CalculatorData[] = [
  {
    id: 'aww',
    title: 'Average Weekly Wage',
    description: 'Calculate Average Weekly Wage and Compensation Rate based on earnings history.',
    icon: <DollarSign className="h-12 w-12 text-blue-600" />,
    href: '/Calculators/aww',
    isAvailable: true,
  },
  {
    id: 'commuted',
    title: 'Commuted Value',
    description: 'Calculate present value of future compensation payments using approved discount rates.',
    icon: <Calculator className="h-12 w-12 text-blue-600" />,
    href: '/Calculators/commuted',
    isAvailable: true,
  },
  {
    id: 'indemnity',
    title: 'Indemnity Calculator',
    description: 'Determine indemnity benefits for permanent or temporary disability claims.',
    icon: <Activity className="h-12 w-12 text-blue-600" />,
    href: '/Calculators/indemnity',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'hearing-loss',
    title: 'Hearing Loss Calculator',
    description: 'Calculate compensation for occupational hearing loss claims.',
    icon: <Ear className="h-12 w-12 text-blue-600" />,
    href: '/Calculators/hearing-loss',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'time-calculator',
    title: 'Time Calculator',
    description: 'Calculate time periods for statutes of limitations and procedural deadlines.',
    icon: <Calendar className="h-12 w-12 text-blue-600" />,
    href: '/Calculators/time',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'um-calculator',
    title: 'UM Credit Calculator',
    description: "Calculate Uninsured Motorist credits for workers' comp cases involving auto accidents.",
    icon: <Scale className="h-12 w-12 text-blue-600" />,
    href: '/Calculators/um-credit',
    isAvailable: false,
    comingSoon: true,
    premiumOnly: true,
  },
  {
    id: 'life-expectancy',
    title: 'Life Expectancy Calculator',
    description: 'Calculate life expectancy for future medical treatment projections.',
    icon: <Clock className="h-12 w-12 text-blue-600" />,
    href: '/Calculators/life-expectancy',
    isAvailable: false,
    comingSoon: true,
    premiumOnly: true,
  },
];

const CalculatorsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Workers&apos; Compensation Calculators</h1>
        <p className="text-xl text-gray-600">
          Professional tools for accurate South Carolina workers&apos; compensation calculations.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {calculators.map((calc) => (
          <Card key={calc.id} className={`overflow-hidden transition-all duration-200 ${!calc.isAvailable ? 'opacity-70' : 'hover:shadow-lg'}`}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-50 rounded-lg">
                  {calc.icon}
                </div>
                {calc.premiumOnly && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Premium
                  </span>
                )}
                {calc.comingSoon && !calc.isAvailable && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
              <CardTitle className="text-xl mt-4">{calc.title}</CardTitle>
              <CardDescription>{calc.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              {calc.isAvailable ? (
                <Link href={calc.href} passHref>
                  <Button className="w-full flex items-center justify-center gap-2">
                    Use Calculator
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button disabled className="w-full flex items-center justify-center gap-2">
                  {calc.comingSoon ? 'Coming Soon' : 'Not Available'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">About Our Calculators</h2>
        <p className="mb-4">
          Our calculators are designed specifically for South Carolina workers&apos; compensation cases, 
          following methodologies approved by the South Carolina Workers&apos; Compensation Commission.
        </p>
        <p>
          <span className="font-semibold">Premium features</span> are available to subscribed users only. 
          <Link href="/pricing" className="text-blue-600 hover:underline ml-2">
            View our pricing plans
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CalculatorsPage;