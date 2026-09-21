import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import { toolData } from '../../../lib/toolData/compress-pdf';
import InlineToolEmbed from '../../../components/tools/InlineToolEmbed';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

const toolConfig = {
  id: 'compress', name: 'Compress PDF', cat: 'Optimize',
  accept: '.pdf', hint: 'PDF', op: 'compress',
};

export default function CompressPdfPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <InlineToolEmbed tool={toolConfig} heading="Compress PDF — Reduce File Size" />
    </ToolPageTemplate>
  );
}
