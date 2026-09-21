import type { Metadata } from 'next';
import toolData from '../../../lib/toolData/split-pdf';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import ToolWorkspaceEmbed from '../../../components/tools/ToolWorkspaceEmbed';
import {
  Zap, Shield, Scissors, Download, GraduationCap, Briefcase,
  Building2, Scale, Monitor, Smartphone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function SplitPdfPage() {
  const data = {
    ...toolData,
    benefits: [
      { icon: <Zap size={20} />, title: 'Lightning-Fast Splitting', description: 'Server-side PyPDF engine splits your PDF into individual pages in under 5 seconds.' },
      { icon: <Shield size={20} />, title: 'Privacy-First Architecture', description: 'Files are processed in memory and deleted immediately. We never store or share your documents.' },
      { icon: <Scissors size={20} />, title: 'Clean Page Separation', description: 'Each page becomes its own standalone PDF file with all content, images, and formatting preserved.' },
      { icon: <Download size={20} />, title: 'ZIP Download Option', description: 'Download all split pages as a single ZIP archive for convenience, or download individual pages.' },
      { icon: <Monitor size={20} />, title: 'No Software Required', description: 'Works entirely in your browser. No Adobe Acrobat or desktop software needed.' },
      { icon: <Smartphone size={20} />, title: 'Mobile-Friendly', description: 'Fully responsive — split PDFs on Android, iOS, tablets, or desktops.' },
    ],
    useCases: [
      { icon: <GraduationCap size={20} />, title: 'Students & Teachers', description: 'Split textbooks into individual chapter pages for focused study or distribute specific worksheet pages to students.', accent: 'purple' },
      { icon: <Scale size={20} />, title: 'Legal Professionals', description: 'Separate multi-page case files into individual document pages for filing, indexing, or evidence tagging.', accent: 'emerald' },
      { icon: <Building2 size={20} />, title: 'Government Offices', description: 'Break down compiled reports and multi-form PDFs into individual pages for departmental distribution.', accent: 'fuchsia' },
      { icon: <Briefcase size={20} />, title: 'Business & HR', description: 'Split payslip compilations, invoice bundles, or policy documents into individual employee or client pages.', accent: 'blue' },
    ],
  };

  const toolConfig = {
    id: 'split', name: 'Split PDF', cat: 'Organize',
    accept: '.pdf', hint: 'PDF', ep: 'ai', op: 'split',
  };

  return (
    <ToolPageTemplate data={data}>
      <ToolWorkspaceEmbed tool={toolConfig} />
    </ToolPageTemplate>
  );
}
