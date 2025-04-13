// app/Components/HomePage/BenefitsSection.tsx

// Assuming benefitsList is imported correctly and has the structure:
// interface Benefit { id: string | number; iconType: string; title: string; description: string; }
import { benefitsList } from "@/app/Components/HomePage/data"; // Adjust path if needed

// Import specific icons from lucide-react
import { CheckCircle2, Clock, Scale, Info } from 'lucide-react';

export default function BenefitsSection() {
  // Function now renders imported Lucide components
  const renderIcon = (iconType: string) => {
    const iconProps = {
      className: "h-8 w-8 text-primary", // Apply theme color and size via className
      strokeWidth: 1.5 // Adjust stroke width as desired
    };

    switch (iconType) {
      case 'checkmark':
        // Use imported CheckCircle2 component
        return <CheckCircle2 {...iconProps} />;
      case 'clock':
        // Use imported Clock component
        return <Clock {...iconProps} />;
      case 'scale':
        // Use imported Scale component
        return <Scale {...iconProps} />;
      default: // Default icon (e.g., Info)
        // Use imported Info component
        return <Info {...iconProps} />;
    }
  };

  return (
    // Add vertical padding to the section
    <section className="px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
      {/* Section Title - Use theme text color */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-foreground">
        Why Choose Our Platform?
      </h2>
      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefitsList.map((benefit) => (
          // Apply card styling to each benefit item
          (<div key={benefit.id} className="bg-card border border-border rounded-lg p-6 text-center flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Icon Wrapper - Use themed background */}
            <div className="bg-primary/10 p-4 rounded-full mb-5 inline-flex">
              {/* Render the Lucide icon */}
              {renderIcon(benefit.iconType)}
            </div>
            {/* Benefit Title - Use theme text color */}
            <h3 className="text-xl font-semibold mb-2 text-foreground">{benefit.title}</h3>
            {/* Benefit Description - Use theme muted text color */}
            <p className="text-muted-foreground text-sm">{benefit.description}</p>
          </div>)
        ))}
      </div>
    </section>
  );
}
