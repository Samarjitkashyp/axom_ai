import React from 'react';
import type { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/color-palette-generator';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import ColorPaletteGen from '../../../components/chat/ColorPaletteGen';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function ColorPaletteGeneratorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Generate Color Palette — Free">
        {({ onClose }) => <ColorPaletteGen onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
