import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/chat-with-pdf';
import { buildToolMetadata } from '../../../lib/toolPageTypes';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function ChatWithPdfPage() {
  return <ToolPageTemplate data={toolData} />;
}
