import type { Metadata } from 'next';
import toolData from '../../../lib/toolData/office-to-pdf';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import InlineToolEmbed from '../../../components/tools/InlineToolEmbed';
import {
  Zap, Shield, Globe, FileText, GraduationCap, Code2,
  Building2, BookOpen, Monitor, Smartphone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function OfficeToPdfPage() {
  const data = {
    ...toolData,
    benefits: [
      { icon: <Zap size={20} />, title: 'Lightning-Fast Conversion', description: 'Server-side LibreOffice renders ODT, HTML, EPUB, and RTF documents in under 10 seconds with full formatting.' },
      { icon: <Shield size={20} />, title: 'Privacy-First Architecture', description: 'Files are processed in memory and deleted immediately. We never store, analyze, or share your documents.' },
      { icon: <Globe size={20} />, title: 'Full Indic Unicode Support', description: 'Assamese, Hindi, Bengali, Tamil, and Telugu text renders perfectly across all supported formats.' },
      { icon: <FileText size={20} />, title: 'Multi-Format Support', description: 'One tool handles ODT, HTML, EPUB, and RTF — no need for separate converters for each format.' },
      { icon: <Monitor size={20} />, title: 'No Software Required', description: 'Works entirely in your browser. No LibreOffice, Calibre, or plugins needed.' },
      { icon: <Smartphone size={20} />, title: 'Mobile-Friendly', description: 'Fully responsive interface works on Android, iOS, tablets, and desktops.' },
    ],
    useCases: [
      { icon: <GraduationCap size={20} />, title: 'Students & Academics', description: 'Convert ODT thesis drafts and EPUB textbook chapters to PDF for submission, annotation, or printing.', accent: 'purple' },
      { icon: <Code2 size={20} />, title: 'Developers & Technical Writers', description: 'Export HTML documentation, API references, and technical specs to clean, print-ready PDFs.', accent: 'emerald' },
      { icon: <Building2 size={20} />, title: 'Government & Public Sector', description: 'Convert ODT and RTF official documents to PDF for archival, e-filing, and public distribution.', accent: 'fuchsia' },
      { icon: <BookOpen size={20} />, title: 'Publishers & Readers', description: 'Transform EPUB e-books into PDF format for printing, offline reading, or archival purposes.', accent: 'blue' },
    ],
  };

  const toolConfig = {
    id: 'office2pdf', name: 'Office → PDF', cat: 'Office',
    accept: '.docx,.doc,.pptx,.ppt,.xlsx,.xls,.odt,.odp,.ods,.rtf,.txt,.csv,.html',
    hint: 'DOC, PPT, XLS, ODT, etc.', ep: 'convert', target: 'pdf',
  };

  return (
    <ToolPageTemplate data={data}>
      <InlineToolEmbed tool={toolConfig} />
    </ToolPageTemplate>
  );
}
