import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import { toolData } from '../../../lib/toolData/compress-pdf';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import PdfCompressor from '../../../components/chat/PdfCompressor';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function CompressPdfPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Compress Your PDF — Free">
        {({ onClose }) => <PdfCompressor onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
