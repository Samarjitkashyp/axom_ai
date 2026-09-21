import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/ai-image-generator';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import ImageGenerator from '../../../components/chat/ImageGenerator';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function AiImageGeneratorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Generate AI Image — Free">
        {({ onClose }) => <ImageGenerator onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
