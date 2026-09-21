'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const ToolWorkspace = dynamic(() => import('../chat/ToolWorkspace'), { ssr: false });

interface ToolConfig {
  id: string;
  name: string;
  cat: string;
  accept: string;
  hint: string;
  desc?: string;
  multi?: boolean;
  ep?: string;
  op?: string;
  target?: string;
  param?: string;
}

interface ToolWorkspaceEmbedProps {
  tool: ToolConfig;
  buttonLabel?: string;
}

export default function ToolWorkspaceEmbed({ tool, buttonLabel }: ToolWorkspaceEmbedProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return <ToolWorkspace tool={tool} onClose={() => setIsOpen(false)} />;
  }

  const label = buttonLabel || `Use ${tool.name} — Free`;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <button
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.03] transition-all duration-300"
      >
        <span>{label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
      <p className="text-slate-400 text-sm">100% Free • No Sign-up Required • Secure & Private</p>
    </div>
  );
}
