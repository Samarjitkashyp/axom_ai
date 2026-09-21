import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import { toolData } from '../../../lib/toolData/remove-watermark';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function RemoveWatermarkPage() {
  return <ToolPageTemplate data={toolData} />;
}
