import type { Metadata } from 'next';
import toolData from '../../../lib/toolData/excel-to-pdf';
import { buildToolMetadata } from '../../../lib/toolPageTypes';
import ToolPageTemplate from '../../../components/tools/ToolPageTemplate';
import {
  Zap, Shield, Globe, Table, GraduationCap, Briefcase,
  Building2, Calculator, Monitor, Smartphone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildToolMetadata(toolData);
}

export default function ExcelToPdfPage() {
  const data = {
    ...toolData,
    benefits: [
      { icon: <Zap size={20} />, title: 'Lightning-Fast Conversion', description: 'Server-side LibreOffice renders your spreadsheets in under 10 seconds — tables, formulas, and charts intact.' },
      { icon: <Shield size={20} />, title: 'Privacy-First Architecture', description: 'Files are processed in memory and deleted immediately. We never store, analyze, or share your spreadsheet data.' },
      { icon: <Globe size={20} />, title: 'Full Indic Unicode Support', description: 'Assamese, Hindi, Bengali, Tamil, and Telugu cell data renders perfectly — ideal for Indian financial reports.' },
      { icon: <Table size={20} />, title: 'Preserves Table Formatting', description: 'Cell borders, merged cells, column widths, colors, number formats, and conditional formatting are faithfully reproduced.' },
      { icon: <Monitor size={20} />, title: 'No Software Required', description: 'Works entirely in your browser. No need to install Excel, LibreOffice, or any plugins.' },
      { icon: <Smartphone size={20} />, title: 'Mobile-Friendly', description: 'Fully responsive interface works on Android, iOS, tablets, and desktops.' },
    ],
    useCases: [
      { icon: <GraduationCap size={20} />, title: 'Students & Researchers', description: 'Convert data tables, lab results, and statistical worksheets to PDF for thesis submissions and presentations.', accent: 'purple' },
      { icon: <Calculator size={20} />, title: 'Accountants & Finance', description: 'Export GST invoices, balance sheets, and financial reports as clean, print-ready PDFs for clients and auditors.', accent: 'emerald' },
      { icon: <Building2 size={20} />, title: 'Government & Administration', description: 'Convert census data, budget worksheets, and official reports with Indic language headers to archival PDFs.', accent: 'fuchsia' },
      { icon: <Briefcase size={20} />, title: 'Business & HR', description: 'Share salary sheets, inventory reports, and KPI dashboards as universally readable PDF documents.', accent: 'blue' },
    ],
  };

  return <ToolPageTemplate data={data} />;
}
