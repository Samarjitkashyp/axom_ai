import React from 'react';
import type { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/color-palette-generator';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedClient from '../../../components/tools/ToolEmbedClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function ColorPaletteGeneratorPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedClient toolKey="color-palette" buttonLabel="Generate Color Palette — Free" />
    </ToolPageTemplate>
  );
}
