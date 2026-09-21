import React from 'react';
import type { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/sign-pdf';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedClient from '../../../components/tools/ToolEmbedClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function SignPdfPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedClient toolKey="sign-pdf" buttonLabel="Sign Your PDF — Free" />
    </ToolPageTemplate>
  );
}
