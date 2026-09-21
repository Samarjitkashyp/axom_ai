import React from 'react';
import type { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/svg-editor';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import SvgEditor from '../../../components/chat/SvgEditor';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function SvgEditorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Open SVG Editor — Free">
        {({ onClose }) => <SvgEditor onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
