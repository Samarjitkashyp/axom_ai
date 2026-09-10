import type { Metadata } from 'next';
import './chat.css';

export const metadata: Metadata = {
  title: 'Axom AI Workspace — Intelligent AI Chat, Tools & Studio',
  description: "Experience Axom AI's powerful AI models, high-speed document tools, image generator, and interactive workspace designed for Assam and beyond.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
