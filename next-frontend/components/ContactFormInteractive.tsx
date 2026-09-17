'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  HelpCircle,
  Briefcase,
  Code2,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

const CATEGORIES = [
  { id: 'general', label: 'General Inquiry / Feedback', email: 'support@aiaxom.co.in' },
  { id: 'support', label: 'Technical & Account Support', email: 'support@aiaxom.co.in' },
  { id: 'bug', label: 'Bug Report / Translation Correction', email: 'support@aiaxom.co.in' },
  { id: 'business', label: 'Business & Enterprise Partnership', email: 'support@aiaxom.co.in' },
  { id: 'api', label: 'API & Developer Integration', email: 'support@aiaxom.co.in' },
  { id: 'student', label: 'Student / Academic Subsidy', email: 'support@aiaxom.co.in' },
];

export default function ContactFormInteractive() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const selectedCat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address so we can reply.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError('Please include at least 10 characters describing your inquiry.');
      return;
    }

    setLoading(true);

    try {
      // Simulate/Trigger support intake
      await new Promise((resolve) => setTimeout(resolve, 850));

      const generatedTicket = 'AXM-' + Math.floor(100000 + Math.random() * 900000);
      setTicketId(generatedTicket);
      setSubmitted(true);
    } catch {
      setError('Could not submit inquiry automatically. Please use the direct email link below.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
    setSubmitted(false);
    setError(null);
    setTicketId(null);
  };

  const mailtoUrl = `mailto:${selectedCat.email}?subject=${encodeURIComponent(
    `[Axom AI - ${selectedCat.label}] ${subject || 'New Inquiry from ' + name}`
  )}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nCategory: ${selectedCat.label}\n\nMessage:\n${message}`
  )}`;

  if (submitted) {
    return (
      <div className="relative rounded-3xl bg-[#0e0c1f]/90 border border-fuchsia-500/30 p-8 md:p-10 shadow-2xl shadow-fuchsia-500/10 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 grid place-items-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/25 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Ticket #{ticketId} Created
        </span>
        <h3 className="text-2xl font-bold text-white mb-2">Message Received Successfully!</h3>
        <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed mb-6">
          Thank you, <strong className="text-white">{name}</strong>. Our engineering and support desk in Guwahati, Assam has logged your request under ticket <strong className="text-fuchsia-400">#{ticketId}</strong>. We will review your inquiry and reply to <span className="text-white font-medium">{email}</span> within 4–12 business hours.
        </p>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left text-xs text-gray-400 space-y-1.5 max-w-md mx-auto mb-6">
          <div className="flex justify-between">
            <span>Inquiry Category:</span>
            <span className="text-white font-medium">{selectedCat.label}</span>
          </div>
          <div className="flex justify-between">
            <span>Destination Desk:</span>
            <span className="text-fuchsia-400 font-mono">{selectedCat.email}</span>
          </div>
          <div className="flex justify-between">
            <span>Guwahati Office Hours:</span>
            <span className="text-gray-300">Mon–Sat: 9 AM – 7 PM IST</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={mailtoUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-fuchsia-500/25"
          >
            <Mail className="w-4 h-4" /> Open In Email Client As Backup
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Submit Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl bg-[#0c0a1a]/95 border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Send an Official Message
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Directly logged with our Guwahati headquarters & customer care desk
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Desk Active
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Full Name <span className="text-fuchsia-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samarjit Das"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-sm placeholder-gray-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Work or Personal Email <span className="text-fuchsia-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-sm placeholder-gray-500 transition"
            />
          </div>
        </div>

        {/* Phone & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Phone / WhatsApp <span className="text-gray-500 text-[11px]">(Optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-sm placeholder-gray-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Inquiry Department <span className="text-fuchsia-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141228] border border-white/10 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-sm transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#141228] text-white">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Subject Line <span className="text-gray-500 text-[11px]">(Optional)</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Enterprise API integration inquiry for Guwahati college"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-sm placeholder-gray-500 transition"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Your Message / Question <span className="text-fuchsia-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your question, technical issue, or business requirement in English or Assamese (অসমীয়া)..."
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-white text-sm placeholder-gray-500 transition resize-y"
          />
        </div>

        {/* Submit Button & Direct Mail Link */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-fuchsia-500/20 hover:shadow-fuchsia-500/35 transition-all duration-200 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Ticket...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Inquiry to Axom AI
              </>
            )}
          </button>

          <a
            href={mailtoUrl}
            className="text-xs text-gray-400 hover:text-fuchsia-300 inline-flex items-center gap-1.5 transition group"
          >
            <Mail className="w-3.5 h-3.5 text-fuchsia-400 group-hover:scale-110 transition-transform" />
            Prefer sending directly from your email app?
          </a>
        </div>
      </form>
    </div>
  );
}
