import { howItWorks } from "./data";

export default function HowItWorksSection() {
  return (
    <section className="px-4 md:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorks.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div className="bg-blue-600 text-white text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}