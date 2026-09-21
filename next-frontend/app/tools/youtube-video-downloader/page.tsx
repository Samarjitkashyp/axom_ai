import React from 'react';
import type { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/youtube-video-downloader';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedClient from '../../../components/tools/ToolEmbedClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function YoutubeVideoDownloaderPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedClient toolKey="youtube-downloader" buttonLabel="Download YouTube Video — Free" />
    </ToolPageTemplate>
  );
}
