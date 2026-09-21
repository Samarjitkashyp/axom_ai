import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/ai-image-generator';
import { buildToolMetadata } from '../../../lib/toolPageTypes';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function AiImageGeneratorPage() {
  return <ToolPageTemplate data={toolData} />;
}
