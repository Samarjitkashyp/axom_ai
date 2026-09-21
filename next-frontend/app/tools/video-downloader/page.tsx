import React from 'react';
import type { Metadata } from 'next';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import { toolData } from '../../../lib/toolData/video-downloader';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolEmbedWrapper from '../../../components/tools/ToolEmbedWrapper';
import VideoDownloader from '../../../components/chat/VideoDownloader';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildToolMetadata(toolData);
}

export default function VideoDownloaderPage() {
  return (
    <ToolPageTemplate data={toolData}>
      <ToolEmbedWrapper buttonLabel="Download Video — Free">
        {({ onClose }) => <VideoDownloader onClose={onClose} />}
      </ToolEmbedWrapper>
    </ToolPageTemplate>
  );
}
