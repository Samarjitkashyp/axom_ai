import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/ai-diagram-generator';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import DiagramGenerator from '../../../components/chat/DiagramGenerator';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function AiDiagramGeneratorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Generate Diagram — Free">
        {({ onClose }) => <DiagramGenerator onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
