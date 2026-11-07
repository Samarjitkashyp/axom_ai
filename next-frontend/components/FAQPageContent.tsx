'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ChevronDown,
  X,
  RotateCcw,
  Globe,
  Languages,
  ShieldCheck,
  CreditCard,
  Cpu,
} from 'lucide-react';
import { FULL_FAQS_LIST, FullFaqItem } from './faqFullData';

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: Globe },
  { id: 'general', label: 'General & Overview', icon: Sparkles },
  { id: 'assamese', label: 'Assamese AI & Script', icon: Languages },
  { id: 'features', label: 'AI Tools & Models', icon: Cpu },
  { id: 'pricing', label: 'Pricing & UPI', icon: CreditCard },
  { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
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
      {/* HERO SECTION — EXACT MATCH WITH /BLOG HERO DESIGN */}
      <section className="relative hero-assam-bg pt-12 sm:pt-16 pb-16 sm:pb-20 border-b border-emerald-900/15 dark:border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {faqConfig?.badge || 'Help Center & Frequently Asked Questions'}
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto mb-4 sm:mb-6">
            {faqConfig?.title_prefix || 'Frequently Asked'}{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              {faqConfig?.title_highlight || 'Questions & Answers'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8 font-normal">
            {faqConfig?.subheading ||
              'Everything you need to know about Axom AI: Assamese language reasoning, sovereign AI foundation models (Xuna STT, Puhor Voice, Xetu Translation), pricing plans, scanned document OCR, and privacy.'}
          </p>

          {/* PROPERLY STYLED AJAX SEARCH BAR (MATCHING /BLOG) */}
          <div className="max-w-2xl mx-auto relative group mb-8">
            <div className="relative flex items-center">
              {/* Glowing Accent Ring on Search Bar */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full blur opacity-25 group-focus-within:opacity-75 transition duration-300 pointer-events-none" />

              <div className="relative w-full flex items-center rounded-full bg-white/95 dark:bg-slate-900/95 border border-emerald-900/20 dark:border-white/15 group-focus-within:border-emerald-500/60 shadow-xl transition-all">
                {/* Search Icon */}
                <div className="pl-5 pr-3 text-slate-500 dark:text-slate-400 text-sm">
                  <Search size={18} />
                </div>

                {/* Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    faqConfig?.search_placeholder ||
                    "Search any question, e.g. 'Assamese accuracy', 'UPI payment', 'PDF OCR'..."
                  }
                  className="w-full py-3.5 sm:py-4 pr-24 bg-transparent text-emerald-950 dark:text-white placeholder-slate-400 text-xs sm:text-sm md:text-base focus:outline-none"
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="mr-2 w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 grid place-items-center text-xs transition"
                  >
                    <X size={14} />
                  </button>
                )}

                {/* Live Counter Badge */}
                <div className="pr-3 hidden sm:flex items-center">
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                    {filteredFaqs.length} {filteredFaqs.length === 1 ? 'answer' : 'answers'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm scale-105 border border-emerald-600'
                      : 'bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/10 dark:border-white/5'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FULL-WIDTH FAQ ACCORDION LIST (MAX-W-7XL WITH PROPER GUTTERS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Search Results Notice (only if search is typed) */}
        {searchQuery && (
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-emerald-900/15 dark:border-white/10">
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Found <strong className="text-emerald-950 dark:text-white">{filteredFaqs.length}</strong> questions matching{' '}
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">&quot;{searchQuery}&quot;</span>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Search
            </button>
          </div>
        )}

        {/* FAQs list */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4 max-w-5xl mx-auto">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIds.includes(faq.id);

              return (
                <div
                  key={faq.id}
                  className={`glass-card rounded-2xl overflow-hidden border transition-all duration-300 ${
                    isOpen
                      ? 'border-emerald-500/40 bg-white/90 dark:bg-slate-900/90 shadow-md'
                      : 'border-slate-200 dark:border-white/10 bg-white/75 dark:bg-slate-900/50 hover:border-emerald-500/30'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' : ''
                      }`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-7 pb-5 pt-2 text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pl-14 sm:pl-16">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="text-center py-16 px-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 grid place-items-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4 shadow-sm">
              <Search size={22} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              No matching questions found
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              We couldn&apos;t find any questions matching &quot;{searchQuery}&quot;. Try searching with different keywords.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="inline-flex items-center gap-2 text-xs px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm cursor-pointer"
            >
              <RotateCcw size={13} /> Clear Search &amp; View All
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
