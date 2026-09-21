import { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/screenshot-to-code';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import ScreenshotToCode from '../../../components/chat/ScreenshotToCode';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function ScreenshotToCodePage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Convert Screenshot to Code — Free">
        {({ onClose }) => <ScreenshotToCode onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
