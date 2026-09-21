import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/qr-code-generator';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import QrGenerator from '../../../components/chat/QrGenerator';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function QrCodeGeneratorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Generate QR Code — Free">
        {({ onClose }) => <QrGenerator onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
