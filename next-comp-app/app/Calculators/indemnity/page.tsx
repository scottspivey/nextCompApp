'use client';

import Link from 'next/link';

export default function IndemnityCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/Calculators" className="text-blue-600 hover:underline">
          ← Back to All Calculators
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Indemnity Benefits Calculator</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          This premium calculator helps you determine indemnity benefits for permanent or temporary 
          disability claims in South Carolina workers&apos; compensation cases.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Premium Feature</h2>
        <p className="text-gray-700 mb-6">
          The Indemnity Benefits Calculator is available exclusively to premium subscribers.
          Upgrade your account to access this and other advanced calculators.
        </p>
        
        <Link 
          href="/signup" 
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          Upgrade Now
        </Link>
      </div>
      
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">About Indemnity Benefits</h2>
        
        <p className="text-gray-700 mb-4">
          South Carolina workers&apos; compensation law provides several types of indemnity benefits:
        </p>
        
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>Temporary Total Disability (TTD):</strong> Payments while the worker is completely 
            unable to work during recovery.
          </li>
          <li>
            <strong>Temporary Partial Disability (TPD):</strong> Payments when a worker can perform 
            limited duties with reduced earnings during recovery.
          </li>
          <li>
            <strong>Permanent Partial Disability (PPD):</strong> Payments for permanent impairment 
            after reaching maximum medical improvement.
          </li>
          <li>
            <strong>Permanent Total Disability (PTD):</strong> Payments when a worker is permanently 
            unable to work due to their injury.
          </li>
        </ul>
        
        <p className="mt-4 text-gray-700">
          Our premium calculator accounts for South Carolina&apos;s specific scheduled injury values, 
          maximum compensation periods, and current rates to provide accurate benefit calculations.
        </p>
      </div>
    </div>
  );
}