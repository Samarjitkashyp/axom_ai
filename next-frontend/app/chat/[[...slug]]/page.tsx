'use client';

import dynamic from 'next/dynamic';

const ChatApp = dynamic(() => import('@/components/chat/ChatApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faff] via-[#fdf4ff] to-[#f5f3ff] flex flex-col items-center justify-center p-4 text-center">
      <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_10px_30px_rgba(112,26,117,0.08)] flex flex-col items-center gap-4 max-w-sm w-full">
        <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-base font-bold text-slate-900">Axom AI Workspace</div>
        <p className="text-xs text-slate-600">Loading your AI chat, models & tools...</p>
      </div>
    </div>
  ),
});

export default function ChatPage() {
  return <ChatApp />;
}
