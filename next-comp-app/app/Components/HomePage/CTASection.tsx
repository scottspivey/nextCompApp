import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-blue-700 text-white py-12 px-4 md:px-8 rounded-lg text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Streamline Your Calculations?</h2>
      <p className="text-xl mb-8 max-w-3xl mx-auto">
        Join attorneys and adjusters across South Carolina who trust our platform for accurate workers&apos; compensation calculations.
      </p>
      <Link
        href="/signup"
        className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors inline-block"
      >
        Start Your Free Trial Today
      </Link>
    </section>
  );
}