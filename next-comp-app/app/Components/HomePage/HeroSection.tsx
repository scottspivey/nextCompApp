import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="text-center px-4 md:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-700">
        SC Worker&apos;s Compensation Calculators
      </h1>
      <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-600">
        Professional-grade tools to accurately calculate South Carolina workers&apos; compensation benefits and values.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/signup"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          Start Free Trial
        </Link>
        <Link
          href="/Calculators"
          className="bg-gray-100 text-blue-600 font-semibold px-6 py-3 rounded-lg shadow border border-gray-300 hover:bg-gray-200 transition-colors"
        >
          Try Calculators
        </Link>
      </div>
    </section>
  );
}