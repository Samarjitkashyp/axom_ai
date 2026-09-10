'use client';

import React, { useState } from 'react';
import { Sparkles, GraduationCap, Briefcase, Building, Palette, Check, ArrowRight } from 'lucide-react';
import { UseCaseTab } from '@/lib/api';

const CHAT_URL = 'https://chat.aiaxom.co.in/';

const ICON_MAP: Record<string, React.ElementType> = {
  'fa-solid fa-graduation-cap': GraduationCap,
  'fa-solid fa-briefcase': Briefcase,
  'fa-solid fa-building': Building,
  'fa-solid fa-palette': Palette,
};

interface UseCasesSectionProps {
  header: {
    badge: string;
    title_prefix: string;
    title_highlight: string;
    subheading: string;
    active: boolean;
    tabs: UseCaseTab[];
  };
}

export default function UseCasesSection({ header }: UseCasesSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!header.active || !header.tabs || header.tabs.length === 0) return null;

  const current = header.tabs[activeTab] || header.tabs[0];

  return (
    <section id="usecases" className="py-20 md:py-28 relative border-t border-white/5 bg-[#06060b]">
      <div className="max-w-7xl mx-auto px-5 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> {header.badge || 'Use Cases'}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {header.title_prefix || 'Built for'}{' '}
            <span className="gradient-text">{header.title_highlight || 'Real People, Real Impact'}</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {header.subheading || "Whoever you are, wherever you're from — Axom AI adapts to your work."}
          </p>
        </div>

        {/* Audience Tab Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-12">
          {header.tabs.map((tab, i) => {
            const Icon = ICON_MAP[tab.icon_class] || GraduationCap;
            const isActive = activeTab === i;
            return (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30 scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.tab_title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Cards */}
        {current && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {current.cards.map((card, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-7 flex flex-col justify-between border border-white/10 hover:border-fuchsia-500/40 transition"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 border border-fuchsia-500/30 grid place-items-center mb-5 text-xl">
                    <i className={card.icon + ' ' + card.color}></i>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">{card.desc}</p>
                </div>

                <a
                  href={current.cta_url || CHAT_URL}
                  className="inline-flex items-center gap-2 text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 group"
                >
                  <span>{current.cta_text || 'Start for Free'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
