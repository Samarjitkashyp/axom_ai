import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/ai-image-finder';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedClient from '../../../components/tools/ToolEmbedClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function AiImageFinderPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedClient toolKey="ai-image-finder" buttonLabel="Find Stock Images — Free" />
    </ToolPageTemplate>
  );
}
