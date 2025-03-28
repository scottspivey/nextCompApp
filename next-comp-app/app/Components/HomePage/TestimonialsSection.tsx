import { testimonials } from "./data";

export default function TestimonialsSection() {
  return (
    <section className="bg-blue-50 py-10 px-4 md:px-6 lg:px-8 rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-8">What Professionals Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
              <div>
                <h4 className="font-semibold">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
            <p className="text-gray-700 italic">&ldquo;{testimonial.quote}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  );
}