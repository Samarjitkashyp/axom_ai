import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/summarize';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedClient from '../../../components/tools/ToolEmbedClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function SummarizePage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedClient toolKey="summarize" buttonLabel="Summarize Text — Free" />
    </ToolPageTemplate>
  );
}
