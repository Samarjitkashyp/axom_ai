const API_BASE =
  typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL || 'http://127.0.0.1:8000'
    : process.env.NEXT_PUBLIC_API_URL || 'https://aiaxom.co.in';

export interface HeaderNavItem {
  id: number;
  title: string;
  url: string;
  order: number;
}

export interface HeaderMegaMenuItem {
  id: number;
  title: string;
  description: string;
  icon_class: string;
  color_class: string;
  url: string;
  order: number;
}

export interface HeaderData {
  logo_image_url: string;
  logo_alt_text: string;
  logo_width?: string;
  logo_height?: string;
  logo_fit?: string;
  cta_signin_text: string;
  cta_signin_url: string;
  cta_chat_text: string;
  cta_chat_url: string;
  nav_items: HeaderNavItem[];
  mega_menu_items: HeaderMegaMenuItem[];
}

export interface FooterColumnLink {
  id: number;
  title: string;
  url: string;
  order: number;
  is_external: boolean;
}

export interface FooterColumn {
  id: number;
  title: string;
  order: number;
  links: FooterColumnLink[];
}

export interface FooterSocialLink {
  id: number;
  platform: string;
  icon_class: string;
  url: string;
  order: number;
}

export interface FooterData {
  logo_image_url: string;
  logo_width?: string;
  logo_height?: string;
  logo_fit?: string;
  description: string;
  tagline: string;
  copyright_text: string;
  columns: FooterColumn[];
  social_links: FooterSocialLink[];
}

export interface HeroConfig {
  badge_text: string;
  badge_link: string;
  main_heading_prefix: string;
  main_heading_highlight: string;
  subheading_assamese: string;
  subheading_english: string;
  cta_primary_text: string;
  cta_primary_url: string;
  cta_secondary_text: string;
  cta_secondary_url: string;
  trust_badge_1: string;
  trust_badge_2: string;
  logo_strip_headline: string;
  logo_strip_active: boolean;
}

export interface PartnerLogo {
  id: number;
  name: string;
  logo_image_url?: string;
  website_url?: string;
}

export interface LandingFeature {
  id: number;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  icon_class: string;
  gradient_color: string;
  action_url: string;
}

export interface UseCaseCard {
  title: string;
  desc: string;
  icon: string;
  color: string;
}

export interface UseCaseTab {
  id: number;
  tab_title: string;
  audience_key: string;
  icon_class: string;
  headline?: string;
  description?: string;
  bullet_points?: string[];
  cta_text?: string;
  cta_url?: string;
  cards: UseCaseCard[];
}

export interface Testimonial {
  id: number;
  name: string;
  role_designation: string;
  avatar_initials: string;
  quote_assamese: string;
  quote_english?: string;
  rating: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  icon_class?: string;
  color_class?: string;
  desc: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyWords?: string;
  cta: string;
  href: string;
  featured: boolean;
  features: string[];
}

export interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  category: string;
  category_label: string;
  excerpt: string;
  content_snippet?: string;
  read_time: string;
  cover_image_url?: string;
  gradient_from?: string;
  gradient_to?: string;
  author_name: string;
  published_at: string;
  link: string;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
  created_at: string;
  updated_at: string;
}

export interface LandingCMSData {
  header?: HeaderData;
  footer?: FooterData;
  hero: HeroConfig;
  banner?: {
    badge_label: string;
    message: string;
    action_text: string;
    action_url: string;
    is_active: boolean;
  } | null;
  logos: PartnerLogo[];
  explore: {
    badge: string;
    title_prefix: string;
    title_highlight: string;
    subheading: string;
    active: boolean;
    features: LandingFeature[];
  };
  usecases_header: {
    badge: string;
    title_prefix: string;
    title_highlight: string;
    subheading: string;
    active: boolean;
    tabs: UseCaseTab[];
  };
  testimonials_header: {
    badge: string;
    title_prefix: string;
    title_highlight: string;
    subheading: string;
    active: boolean;
    items: Testimonial[];
  };
  pricing_header: {
    badge: string;
    title_prefix: string;
    title_highlight: string;
    subheading: string;
    yearly_discount_badge: string;
    footer_note: string;
    active: boolean;
    plans: PricingPlan[];
  };
  insights_header: {
    badge: string;
    title_prefix: string;
    title_highlight: string;
    subheading: string;
    view_all_text: string;
    view_all_url: string;
    active: boolean;
    articles: ArticleSummary[];
  };
  faqs: Array<{
    id: number;
    question: string;
    answer: string;
    category: string;
  }>;
  all_faqs?: Array<{
    id: number;
    question: string;
    answer: string;
    category: string;
    order?: number;
  }>;
  faq_page?: {
    badge?: string;
    title_prefix?: string;
    title_highlight?: string;
    subheading?: string;
    search_placeholder?: string;
    meta_title?: string;
    meta_description?: string;
    support_box_title?: string;
    support_box_desc?: string;
    support_button_text?: string;
    support_button_url?: string;
    chat_button_text?: string;
    chat_button_url?: string;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_title: string;
    og_description: string;
    og_image_url: string;
    gtm_container_id: string;
    footer_tagline: string;
  };
}

export interface CategoryItem {
  val: string;
  label: string;
  count: number;
}

export async function getLandingCMS(): Promise<LandingCMSData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/cms/landing/`, {
      cache: 'no-store', // Real-time 0-second sync with CMS toggle
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch Landing CMS data:', err);
    return null;
  }
}

export async function getArticlesCMS(): Promise<{ articles: ArticleSummary[]; categories: CategoryItem[]; total_count: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/cms/articles/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch Articles CMS data:', err);
    return { articles: [], categories: [], total_count: 0 };
  }
}

export async function getArticleDetailCMS(slug: string): Promise<{ article: ArticleDetail; related_articles: ArticleSummary[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/cms/articles/${slug}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch article ${slug}:`, err);
    return null;
  }
}

export interface AboutCMSData {
  badge_text?: string;
  main_heading_prefix?: string;
  main_heading_highlight?: string;
  main_heading_suffix?: string;
  subheading_english?: string;
  subheading_assamese?: string;
  stat_1_val?: string;
  stat_1_label?: string;
  stat_2_val?: string;
  stat_2_label?: string;
  stat_3_val?: string;
  stat_3_label?: string;
  stat_4_val?: string;
  stat_4_label?: string;
  cta_primary_text?: string;
  cta_primary_url?: string;
  entity_badge?: string;
  entity_title?: string;
  entity_definition?: string;
  fact_entity_name?: string;
  fact_official_url?: string;
  fact_headquarters?: string;
  fact_founder?: string;
  fact_languages?: string;
  fact_architecture?: string;
  fact_coverage?: string;
  why_badge?: string;
  why_title?: string;
  why_subheading?: string;
  why_card_1_title?: string;
  why_card_1_desc?: string;
  why_card_2_title?: string;
  why_card_2_desc?: string;
  why_card_3_title?: string;
  why_card_3_desc?: string;
  pillars_badge?: string;
  pillars_title?: string;
  pillar_1_title?: string;
  pillar_1_desc?: string;
  pillar_2_title?: string;
  pillar_2_desc?: string;
  pillar_3_title?: string;
  pillar_3_desc?: string;
  pillar_4_title?: string;
  pillar_4_desc?: string;
  founder_badge?: string;
  founder_name?: string;
  founder_title?: string;
  founder_quote_title?: string;
  founder_quote?: string;
  founder_email?: string;
  cta_badge?: string;
  cta_title?: string;
  cta_desc?: string;
  cta_btn_text?: string;
  cta_btn_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export async function getAboutCMS(): Promise<AboutCMSData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/cms/about/`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch About CMS data:', err);
    return null;
  }
}

