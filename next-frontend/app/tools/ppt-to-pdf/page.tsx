import type { Metadata } from 'next';
import toolData from '../../../lib/toolData/ppt-to-pdf';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import {
  Zap, Shield, Globe, Layers, GraduationCap, Briefcase,
  Building2, Scale, Monitor, Smartphone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function PptToPdfPage() {
  const data = {
    ...toolData,
    benefits: [
      { icon: <Zap size={20} />, title: 'Lightning-Fast Conversion', description: 'Server-side LibreOffice rendering converts your presentations in under 10 seconds — no waiting, no queues.' },
      { icon: <Shield size={20} />, title: 'Privacy-First Architecture', description: 'Your files are processed in memory and deleted immediately after conversion. We never store, analyze, or share your presentations.' },
      { icon: <Globe size={20} />, title: 'Full Indic Unicode Support', description: 'Assamese, Hindi, Bengali, Tamil, Telugu and other Indic scripts render perfectly — no tofu characters or broken fonts.' },
      { icon: <Layers size={20} />, title: 'Preserves Slide Formatting', description: 'Layouts, fonts, images, charts, shapes, and embedded media are faithfully reproduced in the PDF output.' },
      { icon: <Monitor size={20} />, title: 'No Software Required', description: 'Works entirely in your browser. No need to install PowerPoint, LibreOffice, or any plugins.' },
      { icon: <Smartphone size={20} />, title: 'Mobile-Friendly', description: 'Fully responsive interface works on Android, iOS, tablets, and desktop browsers.' },
    ],
    useCases: [
      { icon: <GraduationCap size={20} />, title: 'Students & Educators', description: 'Convert lecture slides and project presentations to PDF for submission, printing, or sharing with classmates who lack PowerPoint.', accent: 'purple' },
      { icon: <Briefcase size={20} />, title: 'Business Professionals', description: 'Share pitch decks and reports as universally readable PDFs that preserve your branding and layout across all devices.', accent: 'emerald' },
      { icon: <Building2 size={20} />, title: 'Government & NGOs', description: 'Convert training materials and policy presentations into archival-quality PDFs with full Indic script support.', accent: 'fuchsia' },
      { icon: <Scale size={20} />, title: 'Legal & Compliance', description: 'Produce PDF versions of presentation evidence and regulatory briefings that are tamper-evident and print-ready.', accent: 'blue' },
    ],
  };

  return <ToolPageTemplate data={data} />;
}
