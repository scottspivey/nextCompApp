// app/Components/HomePage/TestimonialsSection.tsx

// Assuming testimonials data has structure:
// interface Testimonial { id: string | number; name: string; role: string; quote: string; avatarUrl?: string; }
import { testimonials } from "./data"; // Adjust path if needed

// Import Avatar components
import { Avatar, AvatarFallback, AvatarImage } from "@/app/Components/ui/avatar"; // Adjust path if needed

// Helper function to get initials from name for Avatar Fallback
function getInitials(name: string): string {
    const names = name.split(' ');
    if (names.length === 0) return '?';
    if (names.length === 1) return names[0][0]?.toUpperCase() ?? '?';
    return (names[0][0]?.toUpperCase() ?? '') + (names[names.length - 1][0]?.toUpperCase() ?? '');
}


export default function TestimonialsSection() {
  return (
    // Use background color (or muted), add vertical padding
    <section className="bg-background py-16 md:py-20 lg:py-24 px-4 md:px-6 lg:px-8 rounded-lg">
      {/* Section Title - Use theme text color */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12 text-foreground">
        What Professionals Say
      </h2>
      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto"> {/* Limit max width */}
        {testimonials.map((testimonial) => (
          // Apply card styling
          (<div key={testimonial.id} className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border flex flex-col">
            {/* Author Info */}
            <div className="flex items-center mb-4">
              {/* Use Avatar component */}
              <Avatar className="h-12 w-12 mr-4">
                {/* Attempt to load image, show fallback if missing/error */}
                <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                {/* Fallback uses initials */}
                <AvatarFallback>{getInitials(testimonial.name)}</AvatarFallback>
              </Avatar>
              <div>
                {/* Use theme text colors */}
                <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
            {/* Quote - Use theme text color, maybe slightly less emphasis */}
            <p className="text-card-foreground/90 italic flex-grow">&ldquo;{testimonial.quote}&rdquo;</p>
          </div>)
        ))}
      </div>
    </section>
  );
}
