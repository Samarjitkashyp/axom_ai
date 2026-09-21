import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/qr-code-generator';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedClient from '../../../components/tools/ToolEmbedClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function QrCodeGeneratorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedClient toolKey="qr-code-generator" buttonLabel="Generate QR Code — Free" />
    </ToolPageTemplate>
  );
}
