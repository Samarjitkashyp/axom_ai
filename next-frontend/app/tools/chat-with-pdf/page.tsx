import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/chat-with-pdf';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolWorkspaceEmbed from '../../../components/tools/ToolWorkspaceEmbed';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

const TOOL_CONFIG = {
  id: 'chatpdf', name: 'Chat with PDF', cat: 'AI Tools',
  accept: '.pdf', hint: 'PDF', ep: 'ai', op: 'chat', param: 'question',
};

export default function ChatWithPdfPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolWorkspaceEmbed tool={TOOL_CONFIG} />
    </ToolPageTemplate>
  );
}
