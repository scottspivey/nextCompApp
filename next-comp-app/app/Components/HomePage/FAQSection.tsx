// app/Components/HomePage/FAQSection.tsx

// Add 'use client' directive because we need the useRouter hook
"use client";

import { useRouter } from 'next/navigation';

// Assuming faqs data is imported correctly and has structure:
// interface FAQ { id: string | number; question: string; answer: string; }
import { faqs } from "./data"; // Adjust path if needed

// Import Accordion components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/Components/ui/accordian"; // Adjust path if needed

// Import Button component for the link
import { Button } from "@/app/Components/ui/button"; // Adjust path if needed

export default function FAQSection() {
  // Initialize router hook
  const router = useRouter();

  return (
    // Use muted background for the section
    <section className="bg-muted py-16 md:py-20 lg:py-24 px-4 md:px-6 lg:px-8 rounded-lg">
      {/* Section Title - Use theme text color */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12 text-foreground">
        Frequently Asked Questions
      </h2>
      {/* Use Accordion component */}
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => ( // Using index for potential value if id isn't unique string/number
            (<AccordionItem key={faq.id} value={`item-${index + 1}`}>
              {/* Trigger contains the question */}
              <AccordionTrigger className="text-left text-lg hover:text-primary"> {/* Left align text, adjust size */}
                  {faq.question}
              </AccordionTrigger>
              {/* Content contains the answer */}
              <AccordionContent className="text-base"> {/* Adjust text size if needed */}
                {faq.answer}
              </AccordionContent>
            </AccordionItem>)
          ))}
        </Accordion>
      </div>
      {/* "View All" Link - Use themed Button with onClick */}
      <div className="text-center mt-10 md:mt-12">
        <Button
          variant="default"
          size="lg"
          className="text-secondary" // Keep link styling
          onClick={() => router.push('/faq')} // Use onClick for navigation
        >
          View All FAQs
        </Button>
      </div>
    </section>
  );
}
