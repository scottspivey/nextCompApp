// app/Components/HomePage/HowItWorksSection.tsx

// Assuming howItWorks data is imported correctly and has structure:
// interface HowItWorksStep { id: string | number; title: string; description: string; }
import { howItWorks } from "./data"; // Adjust path if needed

export default function HowItWorksSection() {
  return (
    // Padding is applied by the parent div in HomePage, but can add more if needed
    <section className="px-4 md:px-6 lg:px-8">
      {/* Section Title - Use theme text color */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12 text-foreground">
        How It Works
      </h2>
      {/* Container for the steps grid */}
      <div className="max-w-4xl mx-auto">
        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorks.map((step, index) => (
            // Apply card styling to each step
            <div key={step.id} className="bg-card border border-border rounded-lg p-6 flex flex-col items-center text-center shadow-sm transition-shadow hover:shadow-md">
              {/* Numbered Circle - Use theme primary colors */}
              <div className="bg-primary text-primary-foreground text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center mb-5 shadow">
                {index + 1}
              </div>
              {/* Step Title - Use theme text color */}
              <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
              {/* Step Description - Use theme muted text color */}
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
