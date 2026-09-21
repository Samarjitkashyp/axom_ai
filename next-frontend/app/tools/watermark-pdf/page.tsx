import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import { toolData } from '../../../lib/toolData/watermark-pdf';
import ToolWorkspaceEmbed from '../../../components/tools/ToolWorkspaceEmbed';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

const TOOL_CONFIG = {
  id: 'watermark', name: 'Watermark PDF', cat: 'Optimize',
  accept: '.pdf', hint: 'PDF', ep: 'ai', op: 'watermark', param: 'text',
};

export default function WatermarkPdfPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolWorkspaceEmbed tool={TOOL_CONFIG} />
    </ToolPageTemplate>
  );
}
