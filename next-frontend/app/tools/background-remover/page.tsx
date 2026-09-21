import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/background-remover';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import BackgroundRemover from '../../../components/chat/BackgroundRemover';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function BackgroundRemoverPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Remove Background — Free">
        {({ onClose }) => <BackgroundRemover onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
