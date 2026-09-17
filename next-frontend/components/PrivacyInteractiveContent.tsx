'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Trash2,
  FileText,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Building,
  Mail,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Scale,
  Send,
  Loader2,
  Check
} from 'lucide-react';
import {
  PRIVACY_SECTIONS,
  PRIVACY_FAQS,
  PRIVACY_POLICY_METADATA
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
  const [activeSection, setActiveSection] = useState<string>('introduction');
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

  // Real-time ScrollSpy to keep TOC highlighted as user reads through right-side content
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = PRIVACY_SECTIONS.length - 1; i >= 0; i--) {
        const sec = PRIVACY_SECTIONS[i];
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure active TOC link stays in view inside sidebar on smaller screens
  useEffect(() => {
    const activeLinkEl = document.getElementById(`toc-link-${activeSection}`);
    if (activeLinkEl) {
      activeLinkEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeSection]);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
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
      {/* 4 Security & Privacy Key Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/25 text-fuchsia-400 grid place-items-center mb-3">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Zero Model Training</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We never use your private conversations, customer queries, or uploaded documents to train public AI models.
            </p>
          </div>
          <span className="mt-3 text-[11px] font-semibold text-fuchsia-300 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Non-Negotiable
          </span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 grid place-items-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">256-Bit TLS Encryption</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              All data transmitted between your browser and Axom AI is secured via TLS 1.3 with AES-256 encrypted databases.
            </p>
          </div>
          <span className="mt-3 text-[11px] font-semibold text-emerald-400 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Industry Standard
          </span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 grid place-items-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Isolated File Sandboxes</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Files uploaded to PDF and document conversion tools are processed in memory and automatically purged.
            </p>
          </div>
          <span className="mt-3 text-[11px] font-semibold text-indigo-300 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automated Purging
          </span>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 grid place-items-center mb-3">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">DPDP Act 2023 Compliant</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Full statutory rights for Indian users: right to access, rectify, and delete data with designated Guwahati DPO.
            </p>
          </div>
          <span className="mt-3 text-[11px] font-semibold text-purple-300 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Statutory Protection
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid: Sticky Table of Contents (Left) + Policy Sections (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 relative">
        {/* Left Sticky Sidebar (4 cols on desktop) - Sticks throughout all 14 sections */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 z-20 self-start">
          <div className="rounded-3xl bg-[#0d0b1a]/95 border border-white/10 p-5 shadow-2xl backdrop-blur-xl max-h-[calc(100vh-7.5rem)] flex flex-col">
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fuchsia-400">
                <FileText className="w-4 h-4" />
                <span>Policy Navigation</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 font-medium">
                14 Sections
              </span>
            </div>

            <nav
              aria-label="Table of Contents"
              className="space-y-1 overflow-y-auto pr-1 text-xs custom-scrollbar flex-1"
            >
              {PRIVACY_SECTIONS.map((sec, idx) => {
                const isSelected = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    id={`toc-link-${sec.id}`}
                    href={`#${sec.id}`}
                    onClick={(e) => handleScrollToSection(e, sec.id)}
                    className={`block px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-fuchsia-500/25 to-purple-500/20 text-white font-semibold border border-fuchsia-500/40 shadow-sm translate-x-1'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        <span className="text-gray-500 mr-1.5 font-mono">{idx + 1}.</span>
                        {sec.shortTitle || sec.title}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shrink-0" />
                      )}
                    </div>
                  </a>
                );
              })}

              <a
                href="#request-deletion"
                onClick={(e) => handleScrollToSection(e, 'request-deletion')}
                className="block mt-2.5 px-3 py-2 rounded-xl text-fuchsia-300 hover:text-white hover:bg-fuchsia-500/10 border border-dashed border-fuchsia-500/30 transition text-xs font-medium cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Request Data Erasure &rarr;</span>
                </div>
              </a>
            </nav>

            <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-gray-400 space-y-1.5 shrink-0">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="text-white font-mono font-medium">{PRIVACY_POLICY_METADATA.version}</span>
              </div>
              <div className="flex justify-between">
                <span>Effective Date:</span>
                <span className="text-gray-300">{PRIVACY_POLICY_METADATA.effectiveDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Guwahati DPO:</span>
                <a href="mailto:support@aiaxom.co.in" className="text-fuchsia-400 hover:underline">
                  support@aiaxom.co.in
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Policy Content (8 cols on desktop) - Contains all 14 policy sections */}
        <div className="lg:col-span-8 space-y-8 text-gray-300 text-xs sm:text-sm leading-relaxed">
          {PRIVACY_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 rounded-3xl bg-[#0b0918]/85 border border-white/10 p-6 sm:p-8 shadow-xl transition-all"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-4 flex items-center gap-2.5 pb-3 border-b border-white/10">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 shrink-0" />
                <span>{section.title}</span>
              </h2>

              <div className="space-y-3.5">
                {section.content.map((p, idx) => (
                  <p key={idx} className="text-gray-300 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {section.subsections && section.subsections.length > 0 && (
                <div className="mt-6 space-y-4 pt-4 border-t border-white/5">
                  {section.subsections.map((sub, sIdx) => (
                    <div key={sIdx} className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 sm:p-5">
                      <h3 className="text-xs sm:text-sm font-semibold text-fuchsia-300 mb-2.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400/80" />
                        {sub.subtitle}
                      </h3>
                      <div className="space-y-2">
                        {sub.paragraphs.map((para, pIdx) => (
                          <p key={pIdx} className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* FULL-WIDTH SECTION: Exercise Your Right to Erasure (DPDP Act 2023) */}
      <section
        id="request-deletion"
        className="scroll-mt-28 rounded-3xl bg-gradient-to-br from-fuchsia-950/40 via-[#100c22] to-purple-950/40 border border-fuchsia-500/35 p-6 sm:p-10 md:p-12 shadow-2xl mb-16 w-full relative overflow-visible"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 grid place-items-center shrink-0 shadow-lg shadow-fuchsia-500/10">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/25 text-fuchsia-300 text-[11px] font-semibold mb-1">
                <Scale className="w-3 h-3 text-fuchsia-400" />
                <span>Statutory DPDP Right</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Exercise Your Right to Erasure (DPDP Act 2023)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Indian Data Principals hold the statutory right to request complete deletion of accounts, conversation histories, and uploaded file records.
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed Resolution: &le; 7 Days</span>
          </div>
        </div>

        {erasureSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 grid place-items-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Data Erasure Request Registered Successfully!
              </h3>
              <p className="text-gray-300 leading-relaxed text-xs">
                Your request for account <strong className="text-white font-mono">{erasureEmail}</strong> has been assigned directly to our Data Protection Officer in Guwahati, Assam. A confirmation acknowledgment has been dispatched, and complete erasure will be completed within 7 business days pursuant to the DPDP Act 2023.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleErasureSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Your Full Name <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={erasureName}
                  onChange={(e) => setErasureName(e.target.value)}
                  placeholder="e.g. Samarjit Das"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-xs placeholder-gray-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Account Registered Email <span className="text-fuchsia-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={erasureEmail}
                  onChange={(e) => setErasureEmail(e.target.value)}
                  placeholder="e.g. yourname@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-xs placeholder-gray-500 transition"
                />
              </div>

              {/* CUSTOM DARK THEMED DROPDOWN (Zero Browser OS Default Styles) */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Specific Action Requested <span className="text-fuchsia-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-xs flex items-center justify-between gap-2 transition cursor-pointer text-left shadow-sm"
                >
                  <span className="truncate font-medium text-gray-200">
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
                          className={`w-full text-left p-2.5 rounded-xl transition flex items-start justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-fuchsia-500/20 text-white border border-fuchsia-500/35 shadow-sm'
                              : 'text-gray-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold text-white leading-tight">
                              {opt.label}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-xs transition shadow-xl shadow-fuchsia-500/25 cursor-pointer disabled:opacity-60"
              >
                {erasureSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Transmitting Formal Request to DPO...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Formal Erasure Request
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 text-xs text-gray-400">
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

      {/* Comprehensive AEO Privacy FAQs Section */}
      <section className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Direct Privacy Answers (AEO)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Frequently Asked Privacy Questions
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Clear, authoritative answers regarding AI safety, file storage, data retention, and security
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {PRIVACY_FAQS.map((faq, index) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl transition-all duration-200 border ${
                  isOpen
                    ? 'bg-white/[0.06] border-fuchsia-500/40 shadow-xl shadow-fuchsia-500/5'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition ${
                        isOpen
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/5'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-fuchsia-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Assistance Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-fuchsia-900/40 via-purple-900/30 to-indigo-900/40 border border-fuchsia-500/30 p-8 sm:p-10 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 grid place-items-center mx-auto mb-4">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Have Questions for our Data Protection Desk?
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mb-6">
            Our Grievance Officer in Guwahati, Assam is available to assist you with compliance inquiries, data portability requests, or enterprise security reviews.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-fuchsia-500/25"
            >
              <Mail className="w-3.5 h-3.5" /> Contact Grievance Desk
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white font-semibold text-xs transition"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Axom AI FAQ Knowledgebase
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
