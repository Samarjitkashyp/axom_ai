'use client';

import React, { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export function XetuCodeBlock({ code, filename }: { code: string; filename: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden bg-[#090f1d] border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.04] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="ml-2 text-xs font-mono font-medium text-slate-400">{filename}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-white border border-white/15 hover:border-emerald-500/50 transition-all duration-200"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 sm:p-5 overflow-x-auto text-[13px] sm:text-[13.5px] font-mono leading-relaxed text-slate-200">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function XetuFaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0); // 1st FAQ open by default

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-3.5 my-6 sm:my-8">
      {faqs.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl transition-all duration-200 overflow-hidden border ${
              isOpen
                ? 'bg-white/90 dark:bg-slate-900/80 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/20'
                : 'bg-white/70 dark:bg-slate-900/40 border-slate-200/90 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 shadow-xs'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-bold text-sm sm:text-base text-emerald-950 dark:text-white leading-snug">
                {faq.question}
              </span>
              <span
                className={`p-1.5 rounded-lg transition-transform duration-200 shrink-0 ${
                  isOpen
                    ? 'rotate-180 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <ChevronDown size={18} />
              </span>
            </button>
            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 pt-0 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

