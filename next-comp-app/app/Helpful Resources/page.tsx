import Link from 'next/link';

export default function HelpfulResourcesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Helpful Resources</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">SC Workers&apos; Comp Commission</h2>
          <p className="text-gray-700 mb-4">
            Access official forms, regulations, and resources from the South Carolina Workers&apos; Compensation Commission.
          </p>
          <a 
            href="https://wcc.sc.gov/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 font-medium hover:underline"
          >
            Visit Website →
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">SC Code of Laws</h2>
          <p className="text-gray-700 mb-4">
            Review Title 42 of the South Carolina Code of Laws covering workers&apos; compensation statutes.
          </p>
          <a 
            href="https://www.scstatehouse.gov/code/title42.php" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 font-medium hover:underline"
          >
            Access Laws →
          </a>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Calculation Guides</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-2">Average Weekly Wage Calculation</h3>
          <p className="text-gray-700 mb-4">
            South Carolina law defines the average weekly wage calculation method in Section 42-1-40. 
            Generally, it is calculated by dividing the employee&apos;s total wages from the four quarters 
            immediately preceding the injury by 52.
          </p>
          <Link href="/Calculators/aww" className="block mt-4 text-blue-600 font-medium hover:underline">
            Use Full AWW Calculator →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Commuted Value Calculation</h3>
          <p className="text-gray-700 mb-4">
            Under Section 42-9-301, parties may agree to commute future compensation payments to present value, 
            calculated using an appropriate discount rate. Our calculator uses the most current court-approved 
            discount rates.
          </p>
          <Link href="/Calculators/commuted" className="text-blue-600 font-medium hover:underline">
            Use Commuted Value Calculator →
          </Link>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Educational Resources</h2>
        
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">SC Bar Association Workers&apos; Comp Section</h3>
            <p className="text-gray-700 mb-4">
              Access resources, events, and continuing education opportunities through the South Carolina 
              Bar Association&apos;s Workers&apos; Compensation Section.
            </p>
            <a 
              href="https://www.scbar.org/lawyers/sections-committees-divisions/sections/workers-compensation-section/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline"
            >
              Learn More →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Annual Maximum Compensation Rates</h3>
            <p className="text-gray-700 mb-4">
              The South Carolina Workers&apos; Compensation Commission updates the maximum weekly compensation 
              rate annually. Our calculators automatically incorporate these updates.
            </p>
            <a 
              href="https://wcc.sc.gov/insurance-and-medical-services/compensation-rates" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline"
            >
              View Current Rates →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}