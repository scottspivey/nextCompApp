// app/Pricing/page.tsx
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import PricingPlans from '@/app/Components/PricingPlans';
import TrustedBy from '@/app/Components/TrustedBy';

export const metadata: Metadata = {
  title: 'Pricing | SC Worker\'s Compensation App',
  description: 'Choose the perfect plan to streamline your workers\' compensation calculations and stay compliant with South Carolina regulations.',
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Pricing Plans</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose a plan that fits your needs. All plans include access to our core calculators
          and regular updates to match South Carolina&apos;s workers&apos; compensation regulations.
        </p>
      </div>
      
      <PricingPlans />
      
      <div className="my-16">
        <TrustedBy />
      </div>
      
      <div className="mt-16 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            Compare Plan Features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-4 px-6 bg-gray-50 font-semibold text-sm text-gray-700 uppercase">Feature</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-700 uppercase">Basic</th>
                  <th className="py-4 px-6 bg-blue-50 font-semibold text-sm text-gray-700 uppercase">Professional</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-700 uppercase">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">AWW Calculator</td>
                  <td className="py-4 px-6">✓</td>
                  <td className="py-4 px-6 bg-blue-50">✓</td>
                  <td className="py-4 px-6">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Commuted Value Calculator</td>
                  <td className="py-4 px-6">✓</td>
                  <td className="py-4 px-6 bg-blue-50">✓</td>
                  <td className="py-4 px-6">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Indemnity Calculator</td>
                  <td className="py-4 px-6">✗</td>
                  <td className="py-4 px-6 bg-blue-50">✓</td>
                  <td className="py-4 px-6">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Hearing Loss Calculator</td>
                  <td className="py-4 px-6">✗</td>
                  <td className="py-4 px-6 bg-blue-50">✓</td>
                  <td className="py-4 px-6">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Life Expectancy Calculator</td>
                  <td className="py-4 px-6">✗</td>
                  <td className="py-4 px-6 bg-blue-50">✓</td>
                  <td className="py-4 px-6">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Uninsured Employer Tools</td>
                  <td className="py-4 px-6">✗</td>
                  <td className="py-4 px-6 bg-blue-50">✓</td>
                  <td className="py-4 px-6">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Save Calculations</td>
                  <td className="py-4 px-6">10 max</td>
                  <td className="py-4 px-6 bg-blue-50">50 max</td>
                  <td className="py-4 px-6">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Professional Reports</td>
                  <td className="py-4 px-6">Basic</td>
                  <td className="py-4 px-6 bg-blue-50">Custom Branding</td>
                  <td className="py-4 px-6">Advanced Customization</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Client/Case Organization</td>
                  <td className="py-4 px-6">✗</td>
                  <td className="py-4 px-6 bg-blue-50">✓</td>
                  <td className="py-4 px-6">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Team Members</td>
                  <td className="py-4 px-6">1</td>
                  <td className="py-4 px-6 bg-blue-50">1</td>
                  <td className="py-4 px-6">Up to 5</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Email Support</td>
                  <td className="py-4 px-6">✓</td>
                  <td className="py-4 px-6 bg-blue-50">Priority</td>
                  <td className="py-4 px-6">Priority</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">Phone Support</td>
                  <td className="py-4 px-6">✗</td>
                  <td className="py-4 px-6 bg-blue-50">✗</td>
                  <td className="py-4 px-6">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50 font-medium">API Access</td>
                  <td className="py-4 px-6">✗</td>
                  <td className="py-4 px-6 bg-blue-50">✗</td>
                  <td className="py-4 px-6">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 bg-gray-50"></td>
                  <td className="py-4 px-6">
                    <Link
                      href="/signup?plan=basic"
                      className="inline-block w-full py-2 px-4 border border-blue-600 text-blue-600 font-medium rounded-md text-center hover:bg-blue-50"
                    >
                      Choose Basic
                    </Link>
                  </td>
                  <td className="py-4 px-6 bg-blue-50">
                    <Link
                      href="/signup?plan=professional"
                      className="inline-block w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md text-center hover:bg-blue-700"
                    >
                      Choose Professional
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <Link
                      href="/signup?plan=enterprise"
                      className="inline-block w-full py-2 px-4 border border-blue-600 text-blue-600 font-medium rounded-md text-center hover:bg-blue-50"
                    >
                      Choose Enterprise
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-16 bg-blue-700 text-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Need a Custom Solution?</h2>
              <p className="text-blue-100">
                Contact us for custom enterprise solutions or special requirements
                for your firm or organization.
              </p>
            </div>
            <div>
              <Link
                href="/contact"
                className="inline-block py-3 px-6 bg-white text-blue-700 font-medium rounded-md hover:bg-gray-100"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">
          Frequently Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Can I cancel my subscription at any time?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. Your access will continue until the end of your 
              current billing period.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">How accurate are the calculators?</h3>
            <p className="text-gray-600">
              Our calculators use formulas and methodologies specifically designed for South Carolina workers&apos; 
              compensation law and are regularly updated to reflect current rates and legal standards.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Can I switch between plans?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, 
              while downgrades will be applied at the start of your next billing cycle.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Is my data secure?</h3>
            <p className="text-gray-600">
              Yes, all your data is encrypted and stored securely. We never share your information with 
              third parties. Our platform is HIPAA-compliant for handling sensitive claimant information.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Can I export my calculations?</h3>
            <p className="text-gray-600">
              Yes, all plans allow you to export your calculations as PDF reports. Professional and Enterprise 
              plans offer additional export options and customization features.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              Yes, we offer a 14-day free trial of our Professional plan so you can experience all the features 
              before making a decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}