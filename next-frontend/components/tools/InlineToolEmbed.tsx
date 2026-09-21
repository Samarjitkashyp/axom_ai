'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { ToolConfig } from './InlineToolConverter';

const InlineToolConverter = dynamic(() => import('./InlineToolConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-3xl p-1 bg-gradient-to-b from-fuchsia-500/30 via-purple-600/20 to-slate-900/40">
        <div className="rounded-[22px] bg-[#0c0d16]/95 p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <p className="text-slate-400 text-sm">Loading tool...</p>
        </div>
      </div>
    </div>
  ),
});

interface InlineToolEmbedProps {
  tool: ToolConfig;
  maxFileSizeMb?: number;
  heading?: string;
  subheading?: string;
}

export default function InlineToolEmbed(props: InlineToolEmbedProps) {
  return <InlineToolConverter {...props} />;
}
