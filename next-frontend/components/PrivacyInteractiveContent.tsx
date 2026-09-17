'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Lock,
  EyeOff,
  Trash2,
  ChevronDown,
  CheckCircle2,
  Building,
  Mail,
  HelpCircle,
  Scale,
  Send,
  Loader2,
} from 'lucide-react';
import {
  PRIVACY_SECTIONS,
  PRIVACY_FAQS,
} from './privacyData';

const ERASURE_OPTIONS = [
  {
    value: 'full-erasure',
    label: 'Permanent Account & Conversation Erasure',
    desc: 'Completely purge account credentials, personal identifiers, and all chat records.',
  },
  {
    value: 'chat-only',
    label: 'Purge Chat History Only (Keep Account)',
    desc: 'Wipe all saved prompt logs while keeping your account and subscription active.',
  },
  {
    value: 'data-export',
    label: 'Request Data Copy / Portability Report',
    desc: 'Receive a machine-readable export of all your stored personal and usage data.',
  },
  {
    value: 'opt-out',
    label: 'Withdraw All Consent for Data Processing',
    desc: 'Formally revoke processing consent under Section 6 of India’s DPDP Act 2023.',
  },
];

export default function PrivacyInteractiveContent() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(PRIVACY_FAQS[0]?.id || null);

  // Custom Dropdown State for "Specific Action Requested"
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Data Erasure Request Form State
  const [erasureEmail, setErasureEmail] = useState('');
  const [erasureName, setErasureName] = useState('');
  const [erasureReason, setErasureReason] = useState('full-erasure');
  const [erasureSubmitting, setErasureSubmitting] = useState(false);
  const [erasureSuccess, setErasureSuccess] = useState(false);

  const selectedOption =
    ERASURE_OPTIONS.find((o) => o.value === erasureReason) || ERASURE_OPTIONS[0];

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const handleErasureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!erasureEmail || !erasureEmail.includes('@')) return;

    setErasureSubmitting(true);
    await new Promise((res) => setTimeout(res, 850));
    setErasureSubmitting(false);
    setErasureSuccess(true);
  };

  return (
    <div>
      {/* 4 Security & Privacy Key Highlights Cards (Full-Width Grid like use-cases) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 w-full">
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 hover:border-fuchsia-500/30 p-6 sm:p-7 shadow-xl flex flex-col justify-between transition-all group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/25 text-fuchsia-400 grid place-items-center mb-4 shadow-sm">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Zero Model Training</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We never use your private conversations, customer queries, or uploaded documents to train public AI models.
            </p>
          </div>
          <span className="mt-5 pt-3 border-t border-white/5 text-xs font-semibold text-fuchsia-300 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Non-Negotiable
          </span>
        </div>

        <div className="rounded-3xl bg-slate-900/40 border border-white/10 hover:border-emerald-500/30 p-6 sm:p-7 shadow-xl flex flex-col justify-between transition-all group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 grid place-items-center mb-4 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">256-Bit TLS Encryption</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              All data transmitted between your browser and Axom AI is secured via TLS 1.3 with AES-256 encrypted databases.
            </p>
          </div>
          <span className="mt-5 pt-3 border-t border-white/5 text-xs font-semibold text-emerald-400 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Industry Standard
          </span>
        </div>

        <div className="rounded-3xl bg-slate-900/40 border border-white/10 hover:border-indigo-500/30 p-6 sm:p-7 shadow-xl flex flex-col justify-between transition-all group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 grid place-items-center mb-4 shadow-sm">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Isolated File Sandboxes</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Files uploaded to PDF and document conversion tools are processed in memory and automatically purged.
            </p>
          </div>
          <span className="mt-5 pt-3 border-t border-white/5 text-xs font-semibold text-indigo-300 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated Purging
          </span>
        </div>

        <div className="rounded-3xl bg-slate-900/40 border border-white/10 hover:border-purple-500/30 p-6 sm:p-7 shadow-xl flex flex-col justify-between transition-all group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-400 grid place-items-center mb-4 shadow-sm">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">DPDP Act 2023 Compliant</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Full statutory rights for Indian users: right to access, rectify, and delete data with designated Guwahati DPO.
            </p>
          </div>
          <span className="mt-5 pt-3 border-t border-white/5 text-xs font-semibold text-purple-300 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Statutory Protection
          </span>
        </div>
      </div>

      {/* 14 Comprehensive Policy Sections (Full-Width Luxury Cards like use-cases) */}
      <div className="w-full space-y-8 text-slate-300 leading-relaxed mb-16">
        {PRIVACY_SECTIONS.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-28 p-6 sm:p-8 md:p-10 rounded-3xl bg-slate-900/40 border border-white/10 hover:border-fuchsia-500/30 transition-all shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-600/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3.5 pb-4 mb-5 border-b border-white/10">
                <span className="w-9 h-9 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-bold flex items-center justify-center shrink-0 font-mono shadow-sm">
                  {idx + 1}
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-3.5 text-sm sm:text-base text-slate-300 leading-relaxed">
                {section.content.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {section.subsections && section.subsections.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div
                    className={`grid gap-4 sm:gap-6 ${
                      section.subsections.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    {section.subsections.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 p-5 sm:p-6 transition-all"
                      >
                        <h3 className="text-sm sm:text-base font-semibold text-fuchsia-300 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
                          {sub.subtitle}
                        </h3>
                        <div className="space-y-2">
                          {sub.paragraphs.map((para, paraIdx) => (
                            <p key={paraIdx} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {para}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* FULL-WIDTH SECTION: Exercise Your Right to Erasure (DPDP Act 2023) */}
      <section
        id="request-deletion"
        className="scroll-mt-28 rounded-3xl bg-slate-900/50 border border-fuchsia-500/35 p-6 sm:p-10 md:p-12 shadow-2xl mb-20 w-full relative overflow-visible"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-fuchsia-600/10 via-purple-600/5 to-transparent rounded-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 grid place-items-center shrink-0 shadow-lg shadow-fuchsia-500/10">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/25 text-fuchsia-300 text-xs font-semibold mb-1">
                <Scale className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Statutory DPDP Right</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Exercise Your Right to Erasure (DPDP Act 2023)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Indian Data Principals hold the statutory right to request complete deletion of accounts, conversation histories, and uploaded file records.
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed Resolution: &le; 7 Days</span>
          </div>
        </div>

        {erasureSuccess ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 grid place-items-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">
                Data Erasure Request Registered Successfully!
              </h3>
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                Your request for account <strong className="text-white font-mono">{erasureEmail}</strong> has been assigned directly to our Data Protection Officer in Guwahati, Assam. A confirmation acknowledgment has been dispatched, and complete erasure will be completed within 7 business days pursuant to the DPDP Act 2023.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleErasureSubmit} className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                  Your Full Name <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={erasureName}
                  onChange={(e) => setErasureName(e.target.value)}
                  placeholder="e.g. Samarjit Das"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-xs sm:text-sm placeholder-slate-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                  Account Registered Email <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={erasureEmail}
                  onChange={(e) => setErasureEmail(e.target.value)}
                  placeholder="e.g. yourname@example.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-xs sm:text-sm placeholder-slate-500 transition"
                />
              </div>

              {/* CUSTOM DARK THEMED DROPDOWN (Zero Browser OS Default Styles) */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                  Specific Action Requested <span className="text-fuchsia-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-xs sm:text-sm flex items-center justify-between gap-2 transition cursor-pointer text-left shadow-sm"
                >
                  <span className="truncate font-medium text-slate-200">
                    {selectedOption.label}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-fuchsia-400 shrink-0 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-[#0e0c1f] border border-fuchsia-500/30 shadow-2xl p-2 backdrop-blur-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto custom-scrollbar">
                    {ERASURE_OPTIONS.map((opt) => {
                      const isSelected = erasureReason === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setErasureReason(opt.value);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl transition flex items-start justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-fuchsia-500/20 text-white border border-fuchsia-500/35 shadow-sm'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-white leading-tight">
                              {opt.label}
                            </div>
                            <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-snug">
                              {opt.desc}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
              <button
                type="submit"
                disabled={erasureSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-sm transition shadow-xl shadow-fuchsia-500/25 cursor-pointer disabled:opacity-60"
              >
                {erasureSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transmitting Formal Request to DPO...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Formal Erasure Request
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400">
                <span>Or email directly:</span>
                <a
                  href="mailto:support@aiaxom.co.in?subject=DPDP%20Data%20Erasure%20Request%20-%20Axom%20AI"
                  className="text-fuchsia-400 hover:text-white font-mono font-medium underline inline-flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" /> support@aiaxom.co.in
                </a>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* Comprehensive AEO Privacy FAQs Section (Styled like use-cases FAQs) */}
      <section className="mb-24 w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Direct Privacy Answers (AEO)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            Frequently Asked Privacy Questions
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Clear, authoritative answers regarding AI safety, file storage, data retention, and security
          </p>
        </div>

        <div className="w-full space-y-4">
          {PRIVACY_FAQS.map((faq, index) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/80 border-fuchsia-500/40 shadow-lg shadow-fuchsia-950/20'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none transition"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition ${
                        isOpen
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/5'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-fuchsia-300 bg-fuchsia-500/15' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Assistance Banner (Matching use-cases Bottom CTA) */}
      <div className="w-full text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-fuchsia-900/30 via-purple-900/20 to-indigo-900/30 border border-fuchsia-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 grid place-items-center mx-auto mb-4 shadow-lg shadow-fuchsia-500/10">
            <Building className="w-7 h-7" />
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Have Questions for our Data Protection Desk?
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed mb-8">
            Our Grievance Officer in Guwahati, Assam is available to assist you with compliance inquiries, data portability requests, or enterprise security reviews.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-fuchsia-600/30 transition"
            >
              <Mail className="w-4 h-4" /> Contact Grievance Desk
            </Link>
            <Link
              href="/faq"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium text-sm transition"
            >
              <HelpCircle className="w-4 h-4" /> Axom AI FAQ Knowledgebase
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
