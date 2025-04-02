// app/Calculators/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
//import { maxCompensationRates } from '@/app/CommonVariables';
import { useRouter } from 'next/navigation';

// Define calculator types and their information
const calculators = [
  {
    id: 'aww',
    name: 'Average Weekly Wage & Comp Rate',
    description: 'Calculate the average weekly wage and compensation rate based on quarterly earnings.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    path: '/Calculators/aww',
    free: true
  },
  {
    id: 'commuted',
    name: 'Commuted Value Calculator',
    description: 'Calculate the present value of future compensation payments using current discount rates.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    path: '/Calculators/commuted',
    free: true
  },
  {
    id: 'indemnity',
    name: 'Indemnity Benefit Calculator',
    description: 'Calculate partial and total disability benefits based on impairment ratings and compensation rates.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.205-2.04-.582-2.95z" />
      </svg>
    ),
    path: '/Calculators/indemnity',
    free: false
  },
  {
    id: 'wage-loss',
    name: 'Wage Loss Calculator',
    description: 'Calculate wage loss benefits for injured workers with diminished earning capacity.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    path: '/Calculators/wage-loss',
    free: false
  },
  {
    id: 'life-expectancy',
    name: 'Life Expectancy Calculator',
    description: 'Calculate life expectancy for permanent total disability cases and lifetime benefits.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    path: '/Calculators/life-expectancy',
    free: false
  },
  {
    id: 'hearing-loss',
    name: 'Hearing Loss Calculator',
    description: 'Calculate benefits for occupational hearing loss claims based on audiogram results.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    path: '/Calculators/hearing-loss',
    free: false
  }
];

const CalculatorsPage = () => {
  const router = useRouter();
  const [filterFree, setFilterFree] = useState<boolean | null>(null);
  
  // Filter calculators based on the free/premium filter
  const filteredCalculators = filterFree === null 
    ? calculators 
    : calculators.filter(calc => calc.free === filterFree);
  
  const handleCalculatorClick = (calc: typeof calculators[0]) => {
    if (!calc.free) {
      // For premium calculators, check if user is logged in
      // This is a placeholder - in a real app you'd check auth state
      const isLoggedIn = false; // Replace with actual auth check
      const isPremiumUser = false; // Replace with actual subscription check
      
      if (!isLoggedIn) {
        // Redirect to login page with return URL
        router.push(`/login?returnTo=${calc.path}`);
        return;
      } else if (!isPremiumUser) {
        // Redirect to upgrade page
        router.push('/pricing');
        return;
      }
    }
    
    // Navigate to calculator
    router.push(calc.path);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Workers&apos; Compensation Calculators</h1>
          <p className="text-gray-600 max-w-2xl">
            Professional-grade tools to accurately calculate South Carolina workers&apos; compensation 
            benefits and settlement values.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
            <button 
              onClick={() => setFilterFree(null)}
              className={`px-3 py-1 rounded ${filterFree === null ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterFree(true)}
              className={`px-3 py-1 rounded ${filterFree === true ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Free
            </button>
            <button 
              onClick={() => setFilterFree(false)}
              className={`px-3 py-1 rounded ${filterFree === false ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Premium
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCalculators.map((calc) => (
          <div 
            key={calc.id}
            onClick={() => handleCalculatorClick(calc)}
            className={`bg-white rounded-lg shadow-md p-6 transition-transform duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${!calc.free ? 'border-t-4 border-yellow-500' : ''}`}
          >
            <div className="flex items-start mb-4">
              <div className="mr-4">
                {calc.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-1">{calc.name}</h3>
                <p className="text-gray-600 text-sm">{calc.description}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className={`text-xs font-medium px-2 py-1 rounded ${calc.free ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {calc.free ? 'Free' : 'Premium'}
              </span>
              <span className="text-blue-600 font-medium text-sm">Use Calculator →</span>
            </div>
          </div>
        ))}
      </div>
      
      {!filteredCalculators.length && (
        <div className="text-center py-12">
          <h3 className="text-xl text-gray-600">No calculators match your filter.</h3>
          <button 
            onClick={() => setFilterFree(null)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Show All Calculators
          </button>
        </div>
      )}
      
      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Need Help Choosing?</h2>
        <p className="text-gray-700 mb-4">
          Not sure which calculator to use? Our guides can help you determine the right tool for your specific case.
        </p>
        <Link href="/resources" className="text-blue-600 font-medium hover:underline">
          View Calculation Guides →
        </Link>
      </div>
    </div>
  );
};

export default CalculatorsPage;