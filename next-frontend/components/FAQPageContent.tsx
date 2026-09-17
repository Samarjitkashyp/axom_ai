'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ChevronDown,
  X,
  MessageSquare,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Globe,
  Languages,
  ShieldCheck,
  CreditCard,
  Cpu
} from 'lucide-react';
import { FULL_FAQS_LIST, FullFaqItem } from './faqFullData';

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: Globe },
  { id: 'general', label: 'General & Overview', icon: Sparkles },
  { id: 'assamese', label: 'Assamese AI & Script', icon: Languages },
  { id: 'features', label: 'AI Tools & Models', icon: Cpu },
  { id: 'pricing', label: 'Pricing & UPI', icon: CreditCard },
  { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
  { id: 'assamese_native', label: 'অসমীয়া প্ৰশ্নোত্তৰ', icon: Languages },
];

export default function FAQPageContent({
  serverFaqs,
  faqConfig,
}: {
  serverFaqs?: any[];
  faqConfig?: any;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openIds, setOpenIds] = useState<number[]>([1, 2, 6, 17, 22]); // Default open popular questions

  // Filter FAQs based on category and search query
  const filteredFaqs = useMemo(() => {
    let list: FullFaqItem[] = FULL_FAQS_LIST;

    // Apply category filter
    if (selectedCategory !== 'all') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  // Toggle single FAQ
  const toggleFaq = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative hero-assam-bg pt-12 pb-16 border-b border-white/10 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            {faqConfig?.badge || 'Help Center & Frequently Asked Questions'}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] mb-5">
            {faqConfig?.title_prefix || 'Frequently Asked'}{' '}
            <span className="gradient-text">{faqConfig?.title_highlight || 'Questions & Answers'}</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 font-normal">
            {faqConfig?.subheading ||
              'Everything you need to know about Axom AI: Assamese language reasoning, AI models (Gemini, Claude, FLUX), pricing plans, scanned document OCR, and privacy.'}
          </p>

          {/* GLOWING SEARCH BAR */}
          <div className="max-w-2xl mx-auto relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600 rounded-full blur opacity-30 group-focus-within:opacity-85 transition duration-300 pointer-events-none" />

            <div className="relative w-full flex items-center rounded-full bg-slate-900/90 border border-white/15 group-focus-within:border-fuchsia-500/60 shadow-2xl transition-all">
              <div className="pl-5 pr-3 text-gray-400 text-sm">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-fuchsia-400 transition-colors" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  faqConfig?.search_placeholder ||
                  "Search any question, e.g. 'Assamese accuracy', 'UPI payment', 'PDF OCR'..."
                }
                className="w-full py-4 pr-24 bg-transparent text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="mr-2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white grid place-items-center text-xs transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="pr-4 hidden sm:flex items-center">
                <span className="px-3 py-1.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-[11px] font-semibold text-fuchsia-300 whitespace-nowrap">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'answer' : 'answers'}
                </span>
              </div>
            </div>
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              const isAssamese = cat.id === 'assamese_native';

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/25 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
                  } ${isAssamese ? 'font-assamese' : ''}`}
                >
                  <Icon size={13} className={isActive ? 'text-white' : 'text-fuchsia-400'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FULL-WIDTH FAQ ACCORDION LIST */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Results Notice (only if search is typed) */}
        {searchQuery && (
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
            <div className="text-sm text-gray-300">
              Found <strong className="text-white">{filteredFaqs.length}</strong> questions matching{' '}
              <span className="text-fuchsia-400 font-semibold">&quot;{searchQuery}&quot;</span>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Search
            </button>
          </div>
        )}

        {/* FAQs list */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIds.includes(faq.id);
              const isAssamese = faq.category === 'assamese_native';

              return (
                <div
                  key={faq.id}
                  className={`glass-card rounded-2xl overflow-hidden border transition-all duration-300 ${
                    isOpen
                      ? 'border-fuchsia-500/40 bg-slate-900/80 shadow-lg shadow-fuchsia-500/10'
                      : 'border-white/10 bg-slate-900/50 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <span className="w-7 h-7 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span
                        className={`font-semibold text-white text-base sm:text-lg lg:text-xl leading-snug ${
                          isAssamese ? 'font-assamese leading-relaxed' : ''
                        }`}
                      >
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-fuchsia-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-fuchsia-500/20 text-fuchsia-300' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 sm:px-8 pb-6 pt-2 text-sm sm:text-base text-gray-300 leading-relaxed border-t border-white/5 pl-16 sm:pl-20">
                      <p className={`mb-3 ${isAssamese ? 'font-assamese text-sm sm:text-base leading-relaxed' : ''}`}>
                        {faq.answer}
                      </p>

                      {faq.tags && faq.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5">
                          {faq.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-gray-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-2xl text-fuchsia-400 mx-auto mb-4 shadow-xl">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No matching questions found</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              We couldn&apos;t find any questions matching &quot;{searchQuery}&quot;. Try searching with different keywords.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="btn-primary inline-flex items-center gap-2 text-xs px-6 py-3 rounded-full cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Search &amp; View All
            </button>
          </div>
        )}

        {/* STILL HAVE QUESTIONS CARD */}
        <div className="mt-16 rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-purple-950/60 via-slate-900 to-fuchsia-950/60 border border-fuchsia-500/20 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                <MessageSquare className="w-3.5 h-3.5" /> Dedicated Assistance
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                {faqConfig?.support_box_title || 'Still have unanswered questions?'}
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {faqConfig?.support_box_desc ||
                  "Can't find the answer you're looking for? Our support desk and developer community in Assam are ready to help."}
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 justify-end">
              <a
                href={faqConfig?.chat_button_url || 'https://chat.aiaxom.co.in/'}
                className="btn-primary text-xs sm:text-sm px-5 py-3 rounded-full inline-flex items-center justify-center gap-2 text-center"
              >
                <span>{faqConfig?.chat_button_text || 'Ask AI Assistant'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={faqConfig?.support_button_url || 'mailto:support@aiaxom.co.in'}
                className="btn-ghost text-xs sm:text-sm px-5 py-3 rounded-full inline-flex items-center justify-center gap-2 text-center"
              >
                <span>{faqConfig?.support_button_text || 'Email Support Team'}</span>
              </a>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
