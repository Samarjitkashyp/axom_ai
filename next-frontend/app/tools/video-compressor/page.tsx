import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import { toolData } from '../../../lib/toolData/video-compressor';
import ToolEmbedClient from '../../../components/tools/ToolEmbedClient';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function VideoCompressorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedClient toolKey="video-compressor" buttonLabel="Compress Your Video — Free" />
    </ToolPageTemplate>
  );
}
