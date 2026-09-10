'use client';

import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const defaultFaqs: FAQItem[] = [
    {
      id: 1,
      question: 'How does the monthly word limit work?',
      answer: 'Each prompt and AI response counts towards your monthly quota. The counter resets on the 1st of every calendar month, and you can track your usage in real-time on your dashboard.',
      category: 'general',
    },
    {
      id: 2,
      question: 'Can I switch or cancel my plan anytime?',
      answer: 'Yes. Upgrade, downgrade, or cancel in a click. If you cancel, your paid benefits stay active until the end of the billing period.',
      category: 'pricing',
    },
    {
      id: 3,
      question: 'What payment methods are supported?',
      answer: 'All major Indian methods via Razorpay: UPI (GPay, PhonePe, Paytm), Credit/Debit (Visa, MasterCard, RuPay), Netbanking, and Wallets.',
      category: 'pricing',
    },
    {
      id: 4,
      question: 'Is my data safe?',
      answer: 'Yes — HTTPS end-to-end, CSRF-protected payments, all files encrypted at rest. You can export or delete your data anytime.',
      category: 'privacy',
    },
    {
      id: 5,
      question: 'How is Axom AI different from ChatGPT or Gemini?',
      answer: 'Axom AI is Assamese-first: every reply is naturally in অসমীয়া (unless requested otherwise), backed by curated knowledge bases for accurate regional answers.',
      category: 'features',
    },
  ];

  const items = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section id="faq" className="py-20 md:py-28 relative border-t border-white/5 bg-[#06060b]">
      <div className="max-w-3xl mx-auto px-5 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Questions &amp; Answers
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={f.id || i}
                className="border border-white/10 rounded-2xl overflow-hidden bg-slate-900/60 transition hover:border-white/20"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-semibold text-white text-sm sm:text-base">{f.question}</span>
                  <span
                    className={`text-fuchsia-400 text-xl font-bold transition-transform shrink-0 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-gray-300 leading-relaxed border-t border-white/5">
                    {f.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
