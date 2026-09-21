import type { Metadata } from 'next';
import toolData from '../../../lib/toolData/merge-pdf';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import {
  Zap, Shield, Layers, GripVertical, GraduationCap, Briefcase,
  Building2, Scale, Monitor, Smartphone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function MergePdfPage() {
  const data = {
    ...toolData,
    benefits: [
      { icon: <Zap size={20} />, title: 'Lightning-Fast Merging', description: 'Server-side PyPDF engine combines your PDF files in under 5 seconds — no waiting, no queues.' },
      { icon: <Shield size={20} />, title: 'Privacy-First Architecture', description: 'Files are processed in memory and deleted immediately after merging. We never store or share your documents.' },
      { icon: <GripVertical size={20} />, title: 'Drag & Drop Reordering', description: 'Easily rearrange the order of your PDF files before merging with intuitive drag-and-drop controls.' },
      { icon: <Layers size={20} />, title: 'Preserves All Content', description: 'Text, images, bookmarks, links, and annotations from all input PDFs are preserved in the merged output.' },
      { icon: <Monitor size={20} />, title: 'No Software Required', description: 'Works entirely in your browser. No Adobe Acrobat, no plugins, no desktop software needed.' },
      { icon: <Smartphone size={20} />, title: 'Mobile-Friendly', description: 'Fully responsive — merge PDFs on Android, iOS, tablets, or desktops.' },
    ],
    useCases: [
      { icon: <GraduationCap size={20} />, title: 'Students & Educators', description: 'Combine assignment pages, scanned notes, and reference materials into a single submission PDF.', accent: 'purple' },
      { icon: <Scale size={20} />, title: 'Legal Professionals', description: 'Merge case documents, affidavits, and evidence into unified court filing packets.', accent: 'emerald' },
      { icon: <Building2 size={20} />, title: 'Government & Administration', description: 'Consolidate multi-department reports, circulars, and forms into single archival documents.', accent: 'fuchsia' },
      { icon: <Briefcase size={20} />, title: 'Business & Sales', description: 'Assemble proposals, contracts, and appendices into polished client-ready document packages.', accent: 'blue' },
    ],
  };

  return <ToolPageTemplate data={data} />;
}
