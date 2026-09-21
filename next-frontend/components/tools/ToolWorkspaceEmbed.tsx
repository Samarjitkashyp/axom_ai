'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ToolWorkspace = dynamic(() => import('../chat/ToolWorkspace'), { ssr: false });

interface ToolConfig {
  id: string;
  name: string;
  cat: string;
  accept: string;
  hint: string;
  desc: string;
  multi?: boolean;
  ep?: string;
  op?: string;
  target?: string;
  param?: string;
}

interface ToolWorkspaceEmbedProps {
  tool: ToolConfig;
}

export default function ToolWorkspaceEmbed({ tool }: ToolWorkspaceEmbedProps) {
  const handleClose = () => {
    window.history.back();
  };

  return <ToolWorkspace tool={tool} onClose={handleClose} />;
}
