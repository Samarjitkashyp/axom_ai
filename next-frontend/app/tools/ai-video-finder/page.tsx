import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/ai-video-finder';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import VideoFinder from '../../../components/chat/VideoFinder';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function AiVideoFinderPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Find Stock Videos — Free">
        {({ onClose }) => <VideoFinder onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
