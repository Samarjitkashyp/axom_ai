import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import { toolData } from '../../../lib/toolData/unlock-pdf';
import InlineToolEmbed from '../../../components/tools/InlineToolEmbed';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

const TOOL_CONFIG = {
  id: 'unlock', name: 'Unlock PDF', cat: 'Security',
  accept: '.pdf', hint: 'PDF', ep: 'ai', op: 'unlock', param: 'password',
};

export default function UnlockPdfPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <InlineToolEmbed tool={TOOL_CONFIG} />
    </ToolPageTemplate>
  );
}
