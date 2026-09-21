import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/ocr-pdf';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolWorkspaceEmbed from '../../../components/tools/ToolWorkspaceEmbed';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

const TOOL_CONFIG = {
  id: 'ocr', name: 'OCR — Make Searchable', cat: 'OCR',
  accept: '.pdf', hint: 'PDF', ep: 'ai', op: 'ocr',
};

export default function OcrPdfPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolWorkspaceEmbed tool={TOOL_CONFIG} />
    </ToolPageTemplate>
  );
}
