// app/Components/HomePage/HeroSection.tsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/app/Components/ui/button"; // Adjust path if needed

export default function HeroSection() {
  const router = useRouter();

  return (
    // Keep relative
    <section className="relative text-center px-4 md:px-6 lg:px-8 py-20 md:py-28 lg:py-32">

      {/* Animated Form SVG - Positioned absolutely */}
      {/* responsive hiding and scaling */}
      <div
        aria-hidden="true"
        className={
          "absolute top-0 right-0 overflow-x-hidden overflow-y-visible form-animation " +
          "opacity-0 scale-75 rotate-[25deg] " + // Initial animation state
          "hidden sm:block " + // Hide below small, display as block at md+
          "sm:scale-50 md:scale-75 lg:scale-100 " + // Scale down on sm to 50, md to 75, back to normal on lg+
          "origin-top-right" // Set transform origin for scaling
        }
      >
        {/* SVG representing a form - Size 350x460 */}
        <svg
          width="350"
          height="460"
          viewBox="0 0 350 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Define drop shadow filter - Increased offset and blur */}
          <defs>
            <filter id="dropshadow" x="-20%" y="-10%" width="140%" height="140%"> {/* Increased height slightly */}
              <feGaussianBlur in="SourceAlpha" stdDeviation="5"/> {/* Increased blur */}
              <feOffset dx="5" dy="8" result="offsetblur"/> {/* Increased offset */}
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/> {/* Kept opacity */}
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Paper outline */}
          <rect
             x="10"
             y="10"
             width="330"
             height="440"
             rx="8"
             stroke="hsl(var(--border))"
             strokeWidth="1"
             fill="hsl(var(--card))"
             filter="url(#dropshadow)"
          />

            {/* NEW: "WCC" Text in top-left */}
            <text
            x="50" // Align with checkboxes/lines
            y="55" // Position in top margin area
            fontFamily="Arial, sans-serif"
            fontSize="30" //
            fontWeight="bold"
            fill="hsl(var(--muted-foreground))" // Use muted foreground color
            textAnchor="start" // Align text start to x coordinate
          >
            W C C
          </text>

          {/* State Seal Placeholder - Solid primary circle */}
          <circle cx="175" cy="45" r="18" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground)/0.5)" strokeWidth="1"/>

          {/* Palm Tree Icon Paths (Detailed) - Scaled and positioned inside the circle */}
          <g transform="translate(165, 35) scale(0.9)"> {/* Translate to center (175,45) - half of scaled size (24*0.83/2=10), then scale */}
             {/* Replaced simplified path with the 4 paths provided by user */}
             <path
                d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"
                stroke="hsl(var(--primary-foreground))" // Use contrast color
                strokeWidth="1.5" // Adjust stroke width as needed
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
             />
             <path
                 d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"
                 stroke="hsl(var(--primary-foreground))"
                 strokeWidth="1.5"
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 fill="none"
             />
             <path
                 d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35"
                 stroke="hsl(var(--primary-foreground))"
                 strokeWidth="1.5"
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 fill="none"
             />
             <path
                 d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"
                 stroke="hsl(var(--primary-foreground))"
                 strokeWidth="1.5"
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 fill="none"
             />
          </g>

          {/* Lines to the right of the seal */}
          <line x1="200" y1="35" x2="325" y2="35" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          <line x1="200" y1="50" x2="325" y2="50" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          <line x1="200" y1="65" x2="325" y2="65" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />


          {/* Header Box simulation */}
          <rect x="25" y="75" width="300" height="25" fill="hsl(var(--muted))" rx="2" />
         
          {/* Checkboxes and Lines */}
          {/* Row 1 */}
          <rect x="25" y="122" width="12" height="12" stroke="hsl(var(--foreground) / 0.3)" strokeWidth=".75" fill="none" rx="1"/>
          <line x1="45" y1="128" x2="325" y2="128" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          {/* Row 2 */}
          <line x1="25" y1="153" x2="325" y2="153" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          {/* Row 3 */}
          <line x1="25" y1="178" x2="325" y2="178" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          {/* Row 4 */}
          <rect x="25" y="197" width="12" height="12" stroke="hsl(var(--foreground) / 0.3)" strokeWidth=".75" fill="none" rx="1"/>
          <line x1="45" y1="203" x2="325" y2="203" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          {/* Row 5 */}
          <line x1="25" y1="228" x2="325" y2="228" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          {/* Row 6 */}
          <line x1="25" y1="253" x2="325" y2="253" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          {/* Row 7 */}
          <rect x="25" y="272" width="12" height="12" stroke="hsl(var(--foreground) / 0.3)" strokeWidth=".75" fill="none" rx="1"/>
          <line x1="45" y1="278" x2="325" y2="278" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          {/* Row 8 */}
          <line x1="25" y1="303" x2="325" y2="303" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          {/* Row 9 */}
          <line x1="25" y1="328" x2="325" y2="328" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />
          {/* Row 10 */}
          <line x1="25" y1="353" x2="325" y2="353" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.75" />


          {/* Signature Line */}
          <line x1="25" y1="390" x2="140" y2="390" stroke="hsl(var(--border))" strokeWidth="1" />
          {/* Fake Signature Squiggle - Extended path */}
          <path
             d="M 30 388 C 35 360, 45 378, 50 388 S 60 408, 70 388 C 80 375, 90 385, 95 388 S 120 395, 145 385" /* Extended path */
             stroke="hsl(var(--foreground) / 0.8)"
             strokeWidth="1"
             fill="none"
          />


          {/* "50" at the bottom center */}
          <text
            x="175"
            y="425"
            fontFamily="Arial, sans-serif"
            fontSize="36"
            fontWeight="bold"
            textAnchor="middle"
            fill="hsl(var(--foreground) / 0.6)"
          >
            50
          </text>
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground animate-in fade-in slide-in-from-top-10 duration-700">
            SC Worker&apos;s Compensation Calculators
          </h1>
          <p className="text-lg md:text-xl mb-8 md:mb-10 max-w-3xl mx-auto text-muted-foreground animate-in fade-in slide-in-from-top-10 duration-700 delay-200">
            Professional-grade tools to accurately calculate South Carolina workers&apos; compensation benefits and values.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in zoom-in-95 duration-700 delay-400">
            <Button
              size="lg"
              onClick={() => router.push('/signup')}
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              Start Free Trial
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/Calculators')}
            >
              Explore Calculators
            </Button>
          </div>
      </div>

      {/* Scoped CSS for the animation */}
      <style jsx>{`
        @keyframes floatIn {
          0% {
            /* Start off-screen top-right, rotated, scaled, transparent */
            /* Transform and opacity are now primarily handled by initial utility classes */
             top: -50%;
             right: -40%;
             /* Keep opacity: 0 here to ensure it overrides utility class if needed during animation */
             opacity: 0;
          }
          100% {
            /* End position on-screen, rotated, scaled, opaque */
            top: -5%;
            right: 10%;
            transform: rotate(-8deg) scale(1); /* Final transform state */
            opacity: 1;
          }
        }

        .form-animation {
           /* Apply animation */
          animation: floatIn 1.8s ease-out 0.5s forwards;
        }
      `}</style>
    </section>
  );
}
