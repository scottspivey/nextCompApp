export default function AboutPage() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">About Us</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            Our mission is to provide South Carolina workers&apos; compensation professionals with accurate, 
            reliable, and easy-to-use calculators that simplify the complex calculations required in 
            workers&apos; compensation cases.
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Why We Created This Platform</h2>
          <p className="text-gray-700 mb-4">
            As experienced workers&apos; compensation attorneys in South Carolina, we recognized the 
            challenges of performing accurate calculations for AWW, compensation rates, and commuted 
            values. These calculations are crucial but time-consuming and error-prone when done manually.
          </p>
          <p className="text-gray-700 mb-4">
            We developed this platform to streamline these calculations, ensuring accuracy and saving 
            time for attorneys, adjusters, and other professionals in the field.
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Calculators</h2>
          <p className="text-gray-700 mb-4">
            Our calculators are specifically designed for South Carolina workers&apos; compensation laws 
            and regulations. They incorporate the latest maximum compensation rates and follow 
            methodologies approved by the South Carolina Workers&apos; Compensation Commission.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            Have questions or suggestions? We&apos;d love to hear from you. Please reach out to our 
            team at <a href="mailto:support@scworkerscomp.com" className="text-blue-600 hover:underline">
            support@scworkerscomp.com</a>
          </p>
        </div>
      </div>
    );
  }