// app/Components/HomePage/FeaturesCallout.tsx

import { featureItems } from '@/app/Components/HomePage/data'; // Import the feature data

// Reusable FeatureCard component (now internal or could be separate)
interface FeatureCardProps {
  icon: React.ElementType; // Accept the icon component type
  title: string;
  description: string;
}

function FeatureCard({ icon: IconComponent, title, description }: FeatureCardProps) {
  return (
    // Apply theme card styling
    <div className="bg-card border border-border rounded-lg shadow-sm p-6 transition-shadow hover:shadow-md flex flex-col items-center text-center">
      {/* Styled Icon Wrapper */}
      <div className="bg-primary/10 p-3 rounded-full inline-flex mb-4">
         {/* Render the passed icon component with theme styling */}
         <IconComponent className="w-8 h-8 text-primary" strokeWidth={1.5} />
      </div>
      {/* Use theme text colors */}
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

// Main FeaturesCallout component
export default function FeaturesCallout() {
  return (
    // Use theme muted background, adjust padding
    <div className="py-16 md:py-20 lg:py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Use theme text color */}
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-10 md:mb-12">
            Complete Compensation Solutions
          </h2>
        </div>
        <div className="mt-10">
          {/* Grid layout */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Map over the feature data */}
            {featureItems.map((feature) => (
              <FeatureCard
                key={feature.id}
                icon={feature.icon} // Pass the icon component from data
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
