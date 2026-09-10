'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ChevronDown,
  X,
  MessageSquare,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

const ALL_FAQS: FAQItem[] = [
  // General
  {
    id: 1,
    question: 'What is Axom AI and who is it built for?',
    answer: 'Axom AI is Assam\'s premier artificial intelligence platform designed specifically for students, educators, writers, freelancers, businesses, and developers in Northeast India. It provides native Assamese chat, AI writing, PDF document analysis, FLUX image generation, and coding assistance tailored for regional workflows.',
    tags: ['overview', 'about', 'assam', 'platform']
  },
  {
    id: 2,
    question: 'How do I start using Axom AI?',
    answer: 'You can start completely free! Simply click "Open Chat" or "Sign in" at the top right of the website, create your account with your email or Google login, and immediately begin chatting with AI or using our 12+ creative tools.',
    tags: ['start', 'signup', 'free', 'account']
  },
  {
    id: 3,
    question: 'Do I need any technical or programming knowledge to use Axom AI?',
    answer: 'Not at all. Axom AI is designed with an intuitive, modern interface. You can type in natural English, Assamese (অসমীয়া), or Romanized Assamese (e.g. "Mur eta essay likhi diya") and the AI will understand and respond naturally.',
    tags: ['easy', 'beginner', 'assamese']
  },

  // Models & Capabilities
  {
    id: 4,
    question: 'Which AI models power Axom AI?',
    answer: 'Axom AI leverages world-class state-of-the-art models including Gemini 2.5 Pro / Flash for reasoning and web search, FLUX and Pollinations for high-definition image generation, Claude 3.5 Sonnet for advanced code writing, and fine-tuned IndicTrans2 models for high-accuracy Assamese translations.',
    tags: ['gemini', 'flux', 'claude', 'models', 'tech']
  },
  {
    id: 5,
    question: 'What types of documents can I upload and summarize?',
    answer: 'You can upload PDF files, Microsoft Word (.docx), Excel spreadsheets (.xlsx, .csv), plain text, and images. Axom AI extracts the text, answers questions based on your document, and generates executive summaries or translations.',
    tags: ['pdf', 'document', 'summary', 'analyzer']
  },
  {
    id: 6,
    question: 'How does live Web Search work in Axom AI?',
    answer: 'When you ask time-sensitive questions or regional inquiries (such as current news, exam schedules, government schemes in Assam, or local events), Axom AI performs real-time web retrieval via Tavily Search and synthesizes up-to-date answers with cited sources.',
    tags: ['web search', 'live', 'tavily', 'real-time']
  },
  {
    id: 7,
    question: 'Can I generate AI art and images with Axom AI?',
    answer: 'Yes! Our Image Generator tool lets you create photorealistic portraits, cinematic landscapes, Assamese cultural art, logos, and marketing creatives using top text-to-image models including FLUX.1 and Gemini Imagen.',
    tags: ['image', 'flux', 'art', 'graphics']
  },

  // Assamese & Regional Support
  {
    id: 8,
    question: 'How accurate is Axom AI in Assamese (অসমীয়া)?',
    answer: 'Axom AI uses dedicated regional fine-tuning and Indic language benchmarks to deliver natural, grammatically sound Assamese text without robotic or literal translation errors. It understands idioms, regional proverbs, and local Assam context.',
    tags: ['assamese', 'language', 'accuracy', 'nlp']
  },
  {
    id: 9,
    question: 'Can I write in English and get responses in Assamese (or vice-versa)?',
    answer: 'Absolutely! You can prompt in English and ask the AI to answer in Assamese, or paste Assamese text and receive English summaries. You can also mix languages freely in the same conversation.',
    tags: ['translation', 'bilingual', 'indic']
  },

  // Pricing & Billing
  {
    id: 10,
    question: 'How does the monthly word quota and free tier work?',
    answer: 'Every free and paid plan includes a generous monthly word limit. Each prompt and AI response counts toward your quota. Your quota automatically resets on the 1st day of every calendar month, and you can track your live balance in your user dashboard.',
    tags: ['quota', 'words', 'limit', 'free']
  },
  {
    id: 11,
    question: 'What payment methods do you accept?',
    answer: 'We accept all major Indian payment methods via Razorpay, including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay), Net Banking across 50+ banks, and popular digital wallets.',
    tags: ['payment', 'upi', 'razorpay', 'cards']
  },
  {
    id: 12,
    question: 'Can I upgrade, downgrade, or cancel my subscription anytime?',
    answer: 'Yes, there are no lock-ins. You can upgrade or cancel your plan at any time from your Account Settings. If you cancel, your premium features remain active until the end of your current billing cycle.',
    tags: ['cancel', 'upgrade', 'subscription', 'refund']
  },

  // Privacy & Security
  {
    id: 13,
    question: 'Is my personal data and document content kept confidential?',
    answer: 'Yes, user privacy is our highest priority. All communication is encrypted via 256-bit SSL/TLS in transit and encrypted at rest. We do not sell your personal data or use your private documents to train public third-party models.',
    tags: ['security', 'privacy', 'encryption', 'safety']
  },
  {
    id: 14,
    question: 'Can I delete my chat history and uploaded files?',
    answer: 'Yes. You can delete individual chats, clear your full history, or purge uploaded documents anytime directly from the chat interface and dashboard.',
    tags: ['delete', 'history', 'data']
  },

  // Support & Accounts
  {
    id: 15,
    question: 'How can I contact customer support if I face an issue?',
    answer: 'You can reach our support team via email at support@aiaxom.co.in or samarjitkashyp@gmail.com. Paid plan users also enjoy priority WhatsApp support and dedicated account management.',
    tags: ['support', 'contact', 'help', 'email']
  },
  {
    id: 16,
    question: 'What should I do if I forget my password or cannot log in?',
    answer: 'Click "Sign in" and select "Forgot Password" on the login page. Enter your registered email address to receive an instant password reset link. If you signed up via Google, simply click "Continue with Google".',
    tags: ['login', 'password', 'reset']
  }
];

export default function FAQPageContent({ serverFaqs, faqConfig }: { serverFaqs?: any[]; faqConfig?: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<number[]>([1, 4, 8, 10]); // Default open popular questions

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    let list = (serverFaqs && serverFaqs.length > 0) ? serverFaqs : ALL_FAQS;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item: any) =>
          (item.question && item.question.toLowerCase().includes(q)) ||
          (item.answer && item.answer.toLowerCase().includes(q)) ||
          (item.tags && Array.isArray(item.tags) && item.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [serverFaqs, searchQuery]);

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
            {faqConfig?.badge || 'Frequently Asked Questions'}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] mb-5">
            {faqConfig?.title_prefix || 'How Can We'}{' '}
            <span className="gradient-text">{faqConfig?.title_highlight || 'Help You Today?'}</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            {faqConfig?.subheading || 'Find instant answers to common questions about Axom AI tools, language accuracy, billing, models, security, and getting started.'}
          </p>

          {/* GLOWING SEARCH BAR */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600 rounded-full blur opacity-30 group-focus-within:opacity-85 transition duration-300 pointer-events-none" />

            <div className="relative w-full flex items-center rounded-full bg-slate-900/90 border border-white/15 group-focus-within:border-fuchsia-500/60 shadow-2xl transition-all">
              <div className="pl-5 pr-3 text-gray-400 text-sm">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-fuchsia-400 transition-colors" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={faqConfig?.search_placeholder || "Search any question, e.g. 'Assamese accuracy', 'UPI payment', 'PDF upload'..."}
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
        </div>
      </section>

      {/* FULL-WIDTH FAQ ACCORDION LIST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Results Notice (only if search is typed) */}
        {searchQuery && (
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
            <div className="text-sm text-gray-300">
              Found <strong className="text-white">{filteredFaqs.length}</strong> questions matching <span className="text-fuchsia-400 font-semibold">"{searchQuery}"</span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-semibold flex items-center gap-1"
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
                      <span className="font-semibold text-white text-base sm:text-lg lg:text-xl leading-snug">
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
                      <p className="mb-3">{faq.answer}</p>

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
              We couldn't find any questions matching "{searchQuery}". Try searching with different keywords.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="btn-primary inline-flex items-center gap-2 text-xs px-6 py-3 rounded-full"
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
                {faqConfig?.support_box_desc || "Can't find the answer you're looking for? Our support desk and developer community in Assam are ready to help."}
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 justify-end">
              <a
                href={faqConfig?.chat_button_url || "https://chat.aiaxom.co.in/"}
                className="btn-primary text-xs sm:text-sm px-5 py-3 rounded-full inline-flex items-center justify-center gap-2 text-center"
              >
                {faqConfig?.chat_button_text || 'Ask AI Assistant'} <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={faqConfig?.support_button_url || "mailto:support@aiaxom.co.in"}
                className="btn-ghost text-xs sm:text-sm px-5 py-3 rounded-full inline-flex items-center justify-center gap-2 text-center"
              >
                {faqConfig?.support_button_text || 'Email Support Team'}
              </a>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
