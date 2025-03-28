import Link from "next/link";
import { faqs } from "./data";

export default function FAQSection() {
  return (
    <section className="bg-gray-50 py-10 px-4 md:px-6 lg:px-8 rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link
          href="/faq"
          className="text-blue-600 font-semibold hover:underline"
        >
          View All FAQs →
        </Link>
      </div>
    </section>
  );
}