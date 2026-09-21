import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import { toolData } from '../../../lib/toolData/unlock-pdf';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function UnlockPdfPage() {
  return <ToolPageTemplate data={toolData} />;
}
