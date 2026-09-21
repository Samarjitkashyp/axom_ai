import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import { toolData } from '../../../lib/toolData/video-compressor';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import VideoCompressor from '../../../components/chat/VideoCompressor';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function VideoCompressorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Compress Your Video — Free">
        {({ onClose }) => <VideoCompressor onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
