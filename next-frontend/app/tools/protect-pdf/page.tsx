import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import { toolData } from '../../../lib/toolData/protect-pdf';
import InlineToolEmbed from '../../../components/tools/InlineToolEmbed';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

const TOOL_CONFIG = {
  id: 'protect', name: 'Protect PDF', cat: 'Security',
  accept: '.pdf', hint: 'PDF', ep: 'ai', op: 'protect', param: 'password',
};

export default function ProtectPdfPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <InlineToolEmbed tool={TOOL_CONFIG} />
    </ToolPageTemplate>
  );
}
