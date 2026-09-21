import type { Metadata } from 'next';
import toolData from '../../../lib/toolData/extract-pdf-pages';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import ToolWorkspaceEmbed from '../../../components/tools/ToolWorkspaceEmbed';
import {
  Zap, Shield, ListFilter, FileOutput, GraduationCap, Briefcase,
  Building2, Scale, Monitor, Smartphone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function ExtractPdfPagesPage() {
  const data = {
    ...toolData,
    benefits: [
      { icon: <Zap size={20} />, title: 'Lightning-Fast Extraction', description: 'Server-side PyPDF engine extracts your selected pages in under 5 seconds — instant results.' },
      { icon: <Shield size={20} />, title: 'Privacy-First Architecture', description: 'Files are processed in memory and deleted immediately. We never store or share your documents.' },
      { icon: <ListFilter size={20} />, title: 'Flexible Page Selection', description: 'Specify individual pages, ranges, or any combination — e.g., 1, 3, 5-10, 15 — with intuitive input.' },
      { icon: <FileOutput size={20} />, title: 'Clean Output PDF', description: 'The extracted PDF contains only your selected pages with all content, images, and links preserved.' },
      { icon: <Monitor size={20} />, title: 'No Software Required', description: 'Works entirely in your browser. No Adobe Acrobat or desktop software needed.' },
      { icon: <Smartphone size={20} />, title: 'Mobile-Friendly', description: 'Fully responsive — extract PDF pages on Android, iOS, tablets, or desktops.' },
    ],
    useCases: [
      { icon: <GraduationCap size={20} />, title: 'Students & Researchers', description: 'Extract specific chapters or pages from textbooks and research papers for focused study or citation.', accent: 'purple' },
      { icon: <Scale size={20} />, title: 'Legal Professionals', description: 'Pull relevant pages from lengthy case files, contracts, or depositions for court submissions.', accent: 'emerald' },
      { icon: <Building2 size={20} />, title: 'Government & Administration', description: 'Extract required form pages or specific sections from compiled government document bundles.', accent: 'fuchsia' },
      { icon: <Briefcase size={20} />, title: 'Business & Operations', description: 'Pull specific pages from reports, proposals, or manuals to share with stakeholders without sending the entire document.', accent: 'blue' },
    ],
  };

  const toolConfig = {
    id: 'extract', name: 'Extract Pages', cat: 'Organize',
    accept: '.pdf', hint: 'PDF', ep: 'ai', op: 'extract', param: 'pages',
  };

  return (
    <ToolPageTemplate data={data}>
      <ToolWorkspaceEmbed tool={toolConfig} />
    </ToolPageTemplate>
  );
}
