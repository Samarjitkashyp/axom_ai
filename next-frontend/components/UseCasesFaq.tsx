'use client';

import React from 'react';
import FAQSection, { FAQItem } from './FAQSection';
import { USE_CASES_FAQS, UseCaseFaqItem } from './useCasesData';

interface UseCasesFaqProps {
  faqs?: UseCaseFaqItem[] | FAQItem[];
  badge?: string;
  title?: string;
  description?: string;
}

export default function UseCasesFaq({
  faqs = USE_CASES_FAQS,
  badge = 'Questions & Answers',
  title = 'Frequently Asked Questions',
  description = 'Clear, verified answers about how Axom AI fits your specific daily workflow, academic goals, and organization.',
}: UseCasesFaqProps) {
  return (
    <FAQSection
      faqs={faqs}
      badge={badge}
      title={title}
      titleHighlight=""
      description={description}
      supportTitle="Have Questions About Your Use Case?"
      supportDescription="Our Guwahati AI research team helps students, government departments, and businesses integrate indigenous AI."
      className="!py-6 !border-t-0 !bg-transparent"
    />
  );
}
