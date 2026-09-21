import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/translate-pdf';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import InlineToolEmbed from '../../../components/tools/InlineToolEmbed';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

const TOOL_CONFIG = {
  id: 'translatepdf', name: 'Translate PDF', cat: 'AI Tools',
  accept: '.pdf', hint: 'PDF', ep: 'ai', op: 'translate', param: 'lang',
};

export default function TranslatePdfPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <InlineToolEmbed tool={TOOL_CONFIG} />
    </ToolPageTemplate>
  );
}
