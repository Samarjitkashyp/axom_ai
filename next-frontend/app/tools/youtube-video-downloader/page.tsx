import React from 'react';
import type { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/youtube-video-downloader';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import YouTubeDownloader from '../../../components/chat/YouTubeDownloader';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function YoutubeVideoDownloaderPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Download YouTube Video — Free">
        {({ onClose }) => <YouTubeDownloader onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
