import Link from "next/link";
import { featuredCalculators } from "./data";

export default function FeaturedCalculators() {
  return (
    <section className="bg-gray-50 py-10 px-4 md:px-6 lg:px-8 rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-8">Featured Calculators</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredCalculators.map((calc) => (
          <div key={calc.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">{calc.name}</h3>
            <p className="text-gray-600 mb-4 flex-grow">{calc.description}</p>
            <Link
              href={calc.path}
              className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
            >
              Try Calculator →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}