// app/Components/HomePage/TrustedBy.tsx

import Image from "next/image"; // Import Next.js Image component for optimization
import { trustedByLogos } from "./data"; // Import the logo data

export default function TrustedBy() {
  return (
    // Use theme background color
    <div className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl lg:max-w-none"> {/* Adjusted max-width */}
          {/* Use theme text color */}
          <h2 className="text-center text-lg font-semibold leading-8 text-foreground">
            Trusted by legal professionals across South Carolina
          </h2>
          {/* Grid for logos */}
          <div className="mx-auto mt-10 grid grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-4 lg:mx-0 lg:grid-cols-5">
            {/* Map over the logo data */}
            {trustedByLogos.map((logo) => (
              <Image
                key={logo.id}
                className="col-span-1 max-h-50 w-full object-contain grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition duration-300 ease-in-out" // Apply sizing, object-fit, and visual effects
                src={logo.logoUrl}
                alt={logo.name}
                width={158} // Provide appropriate width
                height={48} // Provide appropriate height
                unoptimized // Remove if logos are internal and optimized by Next.js
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
