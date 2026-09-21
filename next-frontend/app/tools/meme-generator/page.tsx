import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/meme-generator';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import MemeGenerator from '../../../components/chat/MemeGenerator';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function MemeGeneratorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Create Meme — Free">
        {({ onClose }) => <MemeGenerator onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
