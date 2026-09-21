import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/ai-image-finder';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import ImageFinder from '../../../components/chat/ImageFinder';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function AiImageFinderPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Find Stock Images — Free">
        {({ onClose }) => <ImageFinder onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
