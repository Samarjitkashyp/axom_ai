import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/ai-video-finder';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedClient from '../../../components/tools/ToolEmbedClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function AiVideoFinderPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedClient toolKey="ai-video-finder" buttonLabel="Find Stock Videos — Free" />
    </ToolPageTemplate>
  );
}
