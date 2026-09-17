'use client';

import dynamic from 'next/dynamic';

const ChatApp = dynamic(() => import('@/components/chat/ChatApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0b0b14] flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-sm font-semibold text-white">Axom AI Workspace</div>
      <p className="text-xs text-slate-400">Loading your AI chat, models & tools...</p>
    </div>
  ),
});

export default function ChatPage() {
  return <ChatApp />;
}
