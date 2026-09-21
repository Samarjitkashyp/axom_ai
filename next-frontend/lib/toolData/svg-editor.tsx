import React from 'react';
import {
  PenTool,
  Square,
  Type,
  Layers,
  ZoomIn,
  Grid3X3,
  Download,
  Lock,
  Zap,
  Smartphone,
  Brush,
  Globe2,
} from 'lucide-react';
import type { ToolPageData } from '../toolPageTypes';

export const toolData: ToolPageData = {
  slug: 'svg-editor',
  metaTitle: 'SVG Editor Online Free — Create & Edit Vector Graphics | Axom AI',
  metaDescription:
    'Free online SVG editor. Create and edit vector graphics with shapes, text, freehand drawing, layers, zoom, grid snapping. Export as SVG, PNG, or JPG. No signup required.',
  canonicalUrl: 'https://aiaxom.co.in/tools/svg-editor',
  keywords: [
    'svg editor',
    'svg editor online',
    'free svg editor',
    'online svg editor',
    'svg editor online free',
    'vector graphics editor',
    'free vector editor online',
    'svg maker',
    'svg creator online',
    'edit svg file online',
    'svg drawing tool',
    'online vector editor',
    'svg design tool',
    'create svg online',
    'svg image editor',
    'vector graphics maker',
    'svg file editor',
    'svg editor no download',
    'svg editor browser',
    'free svg design tool',
    'how to edit SVG files online',
    'how to create SVG graphics',
    'how to make SVG images free',
    'what is an SVG editor',
    'how to draw vector graphics online',
    'how to export SVG as PNG',
    'how to add text to SVG',
    'how to use layers in SVG editor',
    'can I edit SVG files without Illustrator',
    'how to create SVG for websites',
    'best free SVG editor online',
    'SVG editor alternative to Illustrator',
    'SVG editor no signup',
    'lightweight SVG editor',
    'browser-based vector editor',
    'SVG editor with layers',
    'SVG editor with zoom and grid',
    'SVG editor export PNG JPG',
    'freehand SVG drawing tool',
    'SVG editor for web developers',
    'SVG editor for designers',
    'SVG editor for icons',
    'SVG editor for logos',
    'SVG path editor online',
    'SVG shape tool online',
    'SVG text editor',
    'inkscape alternative online',
    'figma alternative free SVG',
    'svg editor India',
    'free design tools India',
    'online vector tools India',
    'svg editor for beginners',
    'svg editor with snap to grid',
  ],
  breadcrumbName: 'SVG Editor',
  heroBadgeText: 'Free SVG Editor -- No Download Required',
  heroHeadingPrefix: 'Free Online',
  heroHeadingHighlight: 'SVG Editor',
  heroHeadingSuffix: '& Vector Graphics Tool',
  heroDescription:
    'Create and edit vector graphics directly in your browser. Draw shapes, add text, use freehand tools, manage layers, zoom, snap to grid, and export as SVG, PNG, or JPG. Free, no signup.',
  heroTags: [
    'Shapes, Text & Freehand',
    'Layers & Grid Snap',
    'SVG / PNG / JPG Export',
    '100% Free',
  ],
  aeoTitle: 'What is Axom AI SVG Editor?',
  aeoDescription:
    '<strong>Axom AI SVG Editor</strong> is a free browser-based vector graphics editor for creating and editing <strong>SVG files</strong> without installing software. It includes <strong>shape tools</strong> (rectangles, circles, lines, polygons), <strong>text editing</strong>, <strong>freehand drawing</strong>, a full <strong>layers panel</strong>, <strong>zoom controls</strong>, and <strong>grid snapping</strong>. Export your work as <strong>SVG</strong>, <strong>PNG</strong>, or <strong>JPG</strong>. No signup, no watermarks, no file size limits on export.',
  aeoHighlights: ['Full Shape & Text Tools', 'Layer Management', 'SVG/PNG/JPG Export'],

  steps: [
    {
      title: 'Open the Editor',
      description:
        'Launch the SVG editor in your browser. Start with a blank canvas or import an existing SVG file to edit.',
    },
    {
      title: 'Create & Design',
      description:
        'Use shape tools, text, freehand drawing, and layers. Arrange elements with grid snapping and zoom for precision.',
    },
    {
      title: 'Export Your Work',
      description:
        'Download your design as a scalable SVG file, or export as PNG or JPG at your chosen resolution.',
    },
  ],

  benefits: [
    {
      icon: <Square size={20} />,
      title: 'Complete Shape Library',
      description:
        'Rectangles, circles, ellipses, lines, polygons, and stars with customizable fill, stroke, opacity, and dimensions.',
    },
    {
      icon: <PenTool size={20} />,
      title: 'Freehand & Path Drawing',
      description:
        'Draw freeform paths with adjustable stroke width and color. Edit SVG paths with precision point controls.',
    },
    {
      icon: <Layers size={20} />,
      title: 'Layer Management',
      description:
        'Organize elements across multiple layers. Reorder, lock, hide, and group layers for complex designs.',
    },
    {
      icon: <Grid3X3 size={20} />,
      title: 'Grid & Snap-to-Grid',
      description:
        'Toggle grid overlay and snap-to-grid for pixel-perfect alignment. Configurable grid size and spacing.',
    },
    {
      icon: <ZoomIn size={20} />,
      title: 'Zoom & Pan Controls',
      description:
        'Zoom in up to 800% for detailed work. Pan across the canvas with smooth scrolling and keyboard shortcuts.',
    },
    {
      icon: <Download size={20} />,
      title: 'Multi-Format Export',
      description:
        'Export as SVG (vector), PNG (raster with transparency), or JPG. Choose custom dimensions for raster exports.',
    },
  ],

  useCases: [
    {
      icon: <Brush size={24} />,
      title: 'Icon & Logo Design',
      description:
        'Create scalable vector icons and logos for websites, apps, and brand materials. Export crisp SVGs that scale to any size.',
      accent: 'purple',
    },
    {
      icon: <Globe2 size={24} />,
      title: 'Web Development SVGs',
      description:
        'Design inline SVG graphics, illustrations, and decorative elements for websites. Copy SVG code directly into HTML.',
      accent: 'emerald',
    },
    {
      icon: <Type size={24} />,
      title: 'Diagrams & Infographics',
      description:
        'Build flowcharts, diagrams, and infographic elements with shapes, text, and connecting lines on a precise grid.',
      accent: 'fuchsia',
    },
    {
      icon: <PenTool size={24} />,
      title: 'Quick SVG File Edits',
      description:
        'Open and modify existing SVG files without installing Illustrator or Inkscape. Change colors, text, and positions instantly.',
      accent: 'blue',
    },
  ],

  comparisonRows: [
    {
      feature: 'Price',
      axom: 'Completely Free',
      other: 'Free with watermarks',
      paid: '$10-55/month',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Installation Required',
      axom: 'No (browser-based)',
      other: 'Some require download',
      paid: 'Desktop install required',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Layer Support',
      axom: 'Full layer management',
      other: 'Basic or none',
      paid: 'Advanced layers',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Export Formats',
      axom: 'SVG, PNG, JPG',
      other: 'SVG only',
      paid: 'SVG, PNG, JPG, PDF, EPS',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Account Required',
      axom: 'No signup needed',
      other: 'Often required',
      paid: 'Required + subscription',
      axom_check: true,
      other_check: false,
    },
    {
      feature: 'Grid & Snap',
      axom: 'Yes with configurable grid',
      other: 'Rarely available',
      paid: 'Yes',
      axom_check: true,
      other_check: false,
    },
  ],

  techSpecs: [
    { label: 'Drawing Tools', value: 'Shapes, Text, Freehand, Paths' },
    { label: 'Export Formats', value: 'SVG, PNG, JPG' },
    { label: 'Canvas Features', value: 'Layers, Grid, Snap, Zoom (800%)' },
    { label: 'Platform', value: 'Browser-based, all devices' },
  ],

  regionalDescription:
    'Axom AI SVG Editor is proudly built in <strong>India</strong> with fast CDN delivery. Ideal for Indian web developers, graphic designers, and students who need a free Illustrator alternative. Supports <strong>Unicode text</strong> including <strong>Assamese</strong>, <strong>Hindi</strong>, and <strong>Bengali</strong> scripts in SVG text elements.',
  regionalTitle: 'Free SVG Editor for Indian Designers & Developers',

  faqs: [
    {
      q: 'Is the Axom AI SVG Editor completely free?',
      a: 'Yes, 100% free with no feature restrictions. Create, edit, and export SVG, PNG, and JPG files without paying or signing up.',
    },
    {
      q: 'Can I edit existing SVG files?',
      a: 'Yes. Import any SVG file into the editor to modify shapes, colors, text, paths, and layer ordering. Then re-export the updated file.',
    },
    {
      q: 'What shapes can I draw?',
      a: 'Rectangles, circles, ellipses, lines, polylines, polygons, and stars. Each shape has customizable fill color, stroke color, stroke width, and opacity.',
    },
    {
      q: 'Does it support layers?',
      a: 'Yes. The editor has a full layers panel where you can create, reorder, lock, hide, and group layers for organizing complex designs.',
    },
    {
      q: 'Can I add text to my SVG?',
      a: 'Yes. Add text elements with customizable font family, size, color, weight, and alignment. Unicode scripts including Hindi, Assamese, and Bengali are supported.',
    },
    {
      q: 'What export formats are available?',
      a: 'Export as SVG (scalable vector), PNG (raster with transparency support), or JPG (raster). For PNG/JPG you can set custom width and height dimensions.',
    },
    {
      q: 'Is this a good alternative to Adobe Illustrator or Inkscape?',
      a: 'For quick edits, icon design, and web graphics, yes. It runs in the browser with no install needed. For complex print-ready vector work, desktop tools may offer more features.',
    },
    {
      q: 'Does the grid snap feature work?',
      a: 'Yes. Enable the grid overlay and snap-to-grid from the toolbar. Elements automatically align to grid points when you drag or resize them.',
    },
    {
      q: 'Can I use it on my phone?',
      a: 'Yes, the editor is responsive and works on mobile browsers. However, for detailed vector editing, a desktop or tablet with more screen space is recommended.',
    },
    {
      q: 'Do I need to install any software or plugin?',
      a: 'No. Everything runs in your web browser using HTML5 Canvas and SVG rendering. No downloads, plugins, or extensions required.',
    },
  ],

  ctaTitle: 'Start Creating Vector Graphics Now',
  ctaDescription:
    'Design, edit, and export SVG files directly in your browser. Free, fast, no signup.',
  ctaPrimaryText: 'Open SVG Editor',
  ctaPrimaryUrl: '/tools',
  ctaSecondaryText: 'Explore All AI & Design Tools',
  ctaSecondaryUrl: '/tools',

  appName: 'Axom AI SVG Editor',
  appAlternateNames: ['Online SVG Editor Free', 'Vector Graphics Editor', 'Free SVG Maker'],
  appCategory: 'DesignApplication, MultimediaApplication',
  appFeatureList: [
    'Shape tools: rectangle, circle, ellipse, line, polygon, star',
    'Text editing with Unicode and web font support',
    'Freehand drawing and path editing',
    'Layer management with reorder, lock, hide',
    'Grid overlay and snap-to-grid alignment',
    'Zoom up to 800% with pan controls',
    'Export as SVG, PNG, or JPG',
  ],
  appRatingValue: '4.7',
  appReviewCount: '1520',
  howToSchemaName: 'How to Create and Edit SVG Graphics Online',
  howToSchemaDescription:
    'Step-by-step guide to creating vector graphics using the free Axom AI SVG Editor.',
  howToTotalTime: 'PT30S',
  howToToolName: 'Axom AI SVG Editor',
};
