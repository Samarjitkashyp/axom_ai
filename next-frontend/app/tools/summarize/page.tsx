import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/summarize';
import { buildToolMetadata } from '../../../lib/toolPageTypes';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function SummarizePage() {
  return <ToolPageTemplate data={toolData} />;
}
