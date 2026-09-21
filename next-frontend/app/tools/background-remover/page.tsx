import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/background-remover';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedClient from '../../../components/tools/ToolEmbedClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function BackgroundRemoverPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedClient toolKey="background-remover" buttonLabel="Remove Background — Free" />
    </ToolPageTemplate>
  );
}
