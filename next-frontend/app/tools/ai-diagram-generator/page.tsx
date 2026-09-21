import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/ai-diagram-generator';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedClient from '../../../components/tools/ToolEmbedClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function AiDiagramGeneratorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedClient toolKey="ai-diagram-generator" buttonLabel="Generate Diagram — Free" />
    </ToolPageTemplate>
  );
}
