from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Count, Q
from .models import (
    SiteHeroConfig, PartnerLogo, AnnouncementBanner,
    InsightArticle, LandingFeature, LandingUseCase,
    Testimonial, LandingFAQ, FAQPageConfig, SiteSEOSetting, LandingPricingPlan,
    HeaderSettings, HeaderNavItem, HeaderMegaMenuItem,
    FooterSettings, FooterColumn, FooterColumnLink, FooterSocialLink,
    AboutPageConfig
)


@require_GET
def cms_landing_api(request):
    """API returning all landing page content in structured JSON for Next.js."""
    hero = SiteHeroConfig.objects.filter(is_active=True).first()
    banner = AnnouncementBanner.objects.filter(is_active=True).first()
    logos = list(PartnerLogo.objects.filter(is_active=True).values('id', 'name', 'logo_image_url', 'website_url', 'order'))
    features = list(LandingFeature.objects.filter(is_active=True).values(
        'id', 'title', 'tagline', 'description', 'badge', 'icon_class', 'gradient_color', 'action_url', 'order'
    ))
    
    raw_usecases = LandingUseCase.objects.filter(is_active=True).order_by('order', 'id')
    usecases = []
    for u in raw_usecases:
        usecases.append({
            'id': u.id,
            'tab_title': u.tab_title,
            'audience_key': u.audience_key or u.tab_title.lower(),
            'icon_class': u.icon_class or 'fa-solid fa-graduation-cap',
            'headline': u.headline,
            'description': u.description,
            'bullet_points': [b.strip() for b in u.bullet_points.split('\n') if b.strip()] if u.bullet_points else [],
            'cta_text': u.cta_text,
            'cta_url': u.cta_url,
            'order': u.order,
            'cards': u.get_cards_list(),
        })

    testimonials = list(Testimonial.objects.filter(is_active=True).values(
        'id', 'name', 'role_designation', 'avatar_initials', 'quote_assamese', 'quote_english', 'rating', 'order'
    ))
    
    # Homepage FAQs (strictly filtered by show_on_homepage=True and is_active=True)
    homepage_faqs = list(LandingFAQ.objects.filter(is_active=True, show_on_homepage=True).order_by('order', 'id').values(
        'id', 'question', 'answer', 'category', 'order'
    ))
    # All FAQs (for dedicated full FAQ page)
    all_faqs = list(LandingFAQ.objects.filter(is_active=True).order_by('order', 'id').values(
        'id', 'question', 'answer', 'category', 'order'
    ))

    raw_plans = LandingPricingPlan.objects.filter(is_active=True).order_by('order', 'id')
    pricing_plans = []
    for p in raw_plans:
        pricing_plans.append({
            'id': p.plan_slug or str(p.id),
            'name': p.name,
            'badge': p.badge,
            'icon_class': p.icon_class,
            'color_class': p.color_class,
            'desc': p.description,
            'monthlyPrice': p.monthly_price,
            'yearlyPrice': p.yearly_price,
            'monthlyWords': p.monthly_words,
            'cta': p.cta_text,
            'href': p.cta_url,
            'featured': p.is_featured,
            'features': [f.strip() for f in p.features_list.split('\n') if f.strip()] if p.features_list else [],
            'order': p.order,
        })

    seo = SiteSEOSetting.objects.first()
    faq_page_cfg = FAQPageConfig.objects.first()

    raw_articles = InsightArticle.objects.filter(is_published=True).order_by('order', '-published_at')[:4]
    articles = []
    category_labels_dict = dict(InsightArticle.CATEGORY_CHOICES)
    for art in raw_articles:
        cat_label = category_labels_dict.get(art.category, art.get_category_display() or art.category)
        link = art.external_link.strip() if art.external_link and art.external_link.strip().startswith('http') else f"/blog/{art.slug}/"
        articles.append({
            'id': art.id,
            'title': art.title,
            'slug': art.slug,
            'category': art.category,
            'category_label': cat_label,
            'excerpt': art.excerpt,
            'read_time': art.read_time,
            'cover_image_url': art.cover_image_url or '',
            'gradient_from': art.gradient_from or '#a855f7',
            'gradient_to': art.gradient_to or '#ec4899',
            'author_name': art.author_name or 'Axom AI Team',
            'published_at': art.published_at.strftime('%b %d, %Y') if art.published_at else '',
            'link': link,
        })

    # Header Data
    header_obj = HeaderSettings.objects.first()
    header_nav = list(HeaderNavItem.objects.filter(is_active=True).order_by('order', 'id').values('id', 'title', 'url', 'order'))
    header_mega = list(HeaderMegaMenuItem.objects.filter(is_active=True).order_by('order', 'id').values(
        'id', 'title', 'description', 'icon_class', 'color_class', 'url', 'order'
    ))

    # Footer Data
    footer_obj = FooterSettings.objects.first()
    footer_cols_qs = FooterColumn.objects.filter(is_active=True).prefetch_related('links').order_by('order', 'id')
    footer_columns = []
    for col in footer_cols_qs:
        footer_columns.append({
            'id': col.id,
            'title': col.title,
            'order': col.order,
            'links': list(col.links.filter(is_active=True).order_by('order', 'id').values('id', 'title', 'url', 'order', 'is_external'))
        })
    footer_socials = list(FooterSocialLink.objects.filter(is_active=True).order_by('order', 'id').values(
        'id', 'platform', 'icon_class', 'url', 'order'
    ))

    return JsonResponse({
        'header': {
            'logo_image_url': header_obj.logo_image_url if header_obj else '/axom-logo.png',
            'logo_alt_text': header_obj.logo_alt_text if header_obj else 'Axom AI — Smart. Assamese. AI For All.',
            'logo_width': (header_obj.logo_width if header_obj and header_obj.logo_width else '180px'),
            'logo_height': (header_obj.logo_height if header_obj and header_obj.logo_height else 'auto'),
            'logo_fit': (header_obj.logo_fit if header_obj and header_obj.logo_fit else 'contain'),
            'cta_signin_text': header_obj.cta_signin_text if header_obj else 'Sign in',
            'cta_signin_url': header_obj.cta_signin_url if header_obj else 'https://chat.aiaxom.co.in/',
            'cta_chat_text': header_obj.cta_chat_text if header_obj else 'Open Chat',
            'cta_chat_url': header_obj.cta_chat_url if header_obj else 'https://chat.aiaxom.co.in/',
            'nav_items': header_nav,
            'mega_menu_items': header_mega,
        },
        'footer': {
            'logo_image_url': footer_obj.logo_image_url if footer_obj else '/axom-logo.png',
            'logo_width': (footer_obj.logo_width if footer_obj and footer_obj.logo_width else '180px'),
            'logo_height': (footer_obj.logo_height if footer_obj and footer_obj.logo_height else 'auto'),
            'logo_fit': (footer_obj.logo_fit if footer_obj and footer_obj.logo_fit else 'contain'),
            'description': footer_obj.description if footer_obj else 'AI for a more inclusive future.\nBuilt in Assam, for the world.',
            'tagline': footer_obj.tagline if footer_obj else 'অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম • Smart. Assamese. AI for All.',
            'copyright_text': footer_obj.copyright_text if footer_obj else 'Axom AI. All rights reserved.',
            'columns': footer_columns,
            'social_links': footer_socials,
        },
        'hero': {
            'badge_text': hero.badge_text if hero else 'Made in Assam · For a Brighter Tomorrow',
            'badge_link': hero.badge_link if hero else '#tools',
            'main_heading_prefix': hero.main_heading_prefix if hero else 'The Power of AI',
            'main_heading_highlight': hero.main_heading_highlight if hero else 'Everyone',
            'subheading_assamese': hero.subheading_assamese if hero else 'অসমীয়াত কথা কওক · অসমীয়াতে উত্তৰ পাওক',
            'subheading_english': hero.subheading_english if hero else 'Chat, create, analyze, automate and build — all in one place.',
            'cta_primary_text': hero.cta_primary_text if hero else 'Start for Free',
            'cta_primary_url': hero.cta_primary_url if hero else 'https://chat.aiaxom.co.in/',
            'cta_secondary_text': hero.cta_secondary_text if hero else 'Watch Demo',
            'cta_secondary_url': hero.cta_secondary_url if hero else '#tools',
            'trust_badge_1': hero.trust_badge_1 if hero else 'No credit card required',
            'trust_badge_2': hero.trust_badge_2 if hero else 'Fast & secure',
            'logo_strip_headline': hero.logo_strip_headline if hero else 'Built with the best',
            'logo_strip_active': hero.logo_strip_active if hero else True,
        },
        'banner': {
            'badge_label': banner.badge_label if banner else 'NEW',
            'message': banner.message if banner else 'Axom AI 2.0 is live!',
            'action_text': banner.action_text if banner else 'Try Now →',
            'action_url': banner.action_url if banner else 'https://chat.aiaxom.co.in',
            'is_active': banner.is_active if banner else False,
        } if banner else None,
        'logos': logos,
        'explore': {
            'badge': hero.explore_badge if hero else 'Explore',
            'title_prefix': hero.explore_title_prefix if hero else 'A Complete AI Toolkit',
            'title_highlight': hero.explore_title_highlight if hero else 'for Modern Needs',
            'subheading': hero.explore_subheading if hero else 'Everything you need to be more productive.',
            'active': hero.explore_section_active if hero else True,
            'features': features,
        },
        'usecases_header': {
            'badge': hero.usecases_badge if hero else 'Use Cases',
            'title_prefix': hero.usecases_title_prefix if hero else 'Built for',
            'title_highlight': hero.usecases_title_highlight if hero else 'Real People, Real Impact',
            'subheading': hero.usecases_subheading if hero else "Whoever you are, wherever you're from — Axom AI adapts to your work.",
            'active': hero.usecases_section_active if hero else True,
            'tabs': usecases,
        },
        'testimonials_header': {
            'badge': hero.testimonials_badge if hero else 'Testimonials',
            'title_prefix': hero.testimonials_title_prefix if hero else 'Loved by Users',
            'title_highlight': hero.testimonials_title_highlight if hero else 'Across Assam',
            'subheading': hero.testimonials_subheading if hero else 'Real stories from students, creators and founders.',
            'active': hero.testimonials_section_active if hero else True,
            'items': testimonials,
        },
        'pricing_header': {
            'badge': hero.pricing_badge if hero else 'Pricing',
            'title_prefix': hero.pricing_title_prefix if hero else 'Simple,',
            'title_highlight': hero.pricing_title_highlight if hero else 'Transparent Pricing',
            'subheading': hero.pricing_subheading if hero else 'Choose a plan that fits your needs.',
            'yearly_discount_badge': hero.pricing_yearly_discount_badge if hero else 'Save 20%',
            'footer_note': hero.pricing_footer_note if hero else 'All prices in INR (includes GST).',
            'active': hero.pricing_section_active if hero else True,
            'plans': pricing_plans,
        },
        'insights_header': {
            'badge': hero.insights_badge if hero else 'Insights',
            'title_prefix': hero.insights_title_prefix if hero else 'Learn, Explore &',
            'title_highlight': hero.insights_title_highlight if hero else 'Stay Updated',
            'subheading': hero.insights_subheading if hero else 'Guides, tips and stories.',
            'view_all_text': hero.insights_view_all_text if hero else 'View all articles',
            'view_all_url': '/blog/',
            'active': hero.insights_section_active if hero else True,
            'articles': articles,
        },
        'faqs': homepage_faqs,
        'all_faqs': all_faqs,
        'faq_page': {
            'badge': faq_page_cfg.badge if faq_page_cfg else 'Frequently Asked Questions',
            'title_prefix': faq_page_cfg.title_prefix if faq_page_cfg else 'How Can We',
            'title_highlight': faq_page_cfg.title_highlight if faq_page_cfg else 'Help You Today?',
            'subheading': faq_page_cfg.subheading if faq_page_cfg else 'Find answers to common questions about Axom AI tools, language accuracy, billing, and models.',
            'search_placeholder': faq_page_cfg.search_placeholder if faq_page_cfg else "Search any question, e.g. 'Assamese accuracy', 'UPI payment', 'PDF upload'...",
            'meta_title': faq_page_cfg.meta_title if faq_page_cfg else 'Frequently Asked Questions (FAQ) | Axom AI — Assam\'s First AI Platform',
            'meta_description': faq_page_cfg.meta_description if faq_page_cfg else 'Find answers to common questions about Axom AI tools, Assamese language support, Gemini & FLUX models, pricing plans, security, and document analysis.',
            'support_box_title': faq_page_cfg.support_box_title if faq_page_cfg else 'Still have unanswered questions?',
            'support_box_desc': faq_page_cfg.support_box_desc if faq_page_cfg else "Can't find the answer you're looking for? Our support desk and developer community in Assam are ready to help.",
            'support_button_text': faq_page_cfg.support_button_text if faq_page_cfg else 'Email Support Team',
            'support_button_url': faq_page_cfg.support_button_url if faq_page_cfg else 'mailto:support@aiaxom.co.in',
            'chat_button_text': faq_page_cfg.chat_button_text if faq_page_cfg else 'Ask AI Assistant',
            'chat_button_url': faq_page_cfg.chat_button_url if faq_page_cfg else 'https://chat.aiaxom.co.in/',
        } if faq_page_cfg else None,
        'seo': {
            'meta_title': seo.meta_title if seo else "Axom AI — The Power of AI for Everyone",
            'meta_description': seo.meta_description if seo else "Axom AI is Assam's first indigenous AI platform.",
            'meta_keywords': seo.meta_keywords if seo else "Axom AI, Assam AI Assistant",
            'og_title': seo.og_title if seo else "Axom AI — Assam's Own AI Platform",
            'og_description': seo.og_description if seo else "Native Assamese intelligence, ChatGPT-grade reasoning.",
            'og_image_url': seo.og_image_url if seo else "https://aiaxom.co.in/static/dist/hero/assam.avif",
            'gtm_container_id': seo.gtm_container_id if seo else "GTM-K4N88ZBR",
            'footer_tagline': seo.footer_tagline if seo else "অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম",
        }
    })


@require_GET
def cms_articles_api(request):
    """API returning all published articles with category counts for Next.js blog listing."""
    all_published = InsightArticle.objects.filter(is_published=True).order_by('order', '-published_at')
    total_count = all_published.count()

    cat_counts_raw = all_published.values('category').annotate(count=Count('id'))
    cat_counts_map = {item['category']: item['count'] for item in cat_counts_raw}

    categories_list = []
    category_labels_dict = dict(InsightArticle.CATEGORY_CHOICES)
    for val, label in InsightArticle.CATEGORY_CHOICES:
        categories_list.append({
            'val': val,
            'label': label,
            'count': cat_counts_map.get(val, 0)
        })

    articles_data = []
    for art in all_published:
        cat_label = category_labels_dict.get(art.category, art.get_category_display() or art.category)
        link = art.external_link.strip() if art.external_link and art.external_link.strip().startswith('http') else f"/blog/{art.slug}/"
        articles_data.append({
            'id': art.id,
            'title': art.title,
            'slug': art.slug,
            'category': art.category,
            'category_label': cat_label,
            'excerpt': art.excerpt,
            'content_snippet': (art.content[:350] if art.content else ''),
            'read_time': art.read_time,
            'cover_image_url': art.cover_image_url or '',
            'gradient_from': art.gradient_from or '#a855f7',
            'gradient_to': art.gradient_to or '#ec4899',
            'author_name': art.author_name or 'Axom AI Team',
            'published_at': art.published_at.strftime('%b %d, %Y') if art.published_at else '',
            'link': link,
        })

    return JsonResponse({
        'articles': articles_data,
        'categories': categories_list,
        'total_count': total_count,
    })


@require_GET
def cms_article_detail_api(request, slug):
    """API returning single article with full content and related articles for Next.js article page."""
    article = InsightArticle.objects.filter(slug=slug, is_published=True).first()
    if not article and slug.isdigit():
        article = InsightArticle.objects.filter(id=int(slug), is_published=True).first()
    if not article:
        return JsonResponse({'error': 'Article not found'}, status=404)

    all_published = InsightArticle.objects.filter(is_published=True)
    related_qs = all_published.filter(category=article.category).exclude(id=article.id)[:4]
    if len(related_qs) < 4:
        extra = all_published.exclude(id=article.id).exclude(id__in=[r.id for r in related_qs])[:(4 - len(related_qs))]
        related_qs = list(related_qs) + list(extra)

    category_labels_dict = dict(InsightArticle.CATEGORY_CHOICES)
    related_data = []
    for r in related_qs:
        r_link = r.external_link.strip() if r.external_link and r.external_link.strip().startswith('http') else f"/blog/{r.slug}/"
        related_data.append({
            'id': r.id,
            'title': r.title,
            'slug': r.slug,
            'category': r.category,
            'category_label': category_labels_dict.get(r.category, r.get_category_display() or r.category),
            'excerpt': r.excerpt,
            'read_time': r.read_time,
            'author_name': r.author_name or 'Axom AI Team',
            'published_at': r.published_at.strftime('%b %d, %Y') if r.published_at else '',
            'link': r_link,
        })

    return JsonResponse({
        'article': {
            'id': article.id,
            'title': article.title,
            'slug': article.slug,
            'category': article.category,
            'category_label': category_labels_dict.get(article.category, article.get_category_display() or article.category),
            'excerpt': article.excerpt,
            'content': article.content,
            'read_time': article.read_time,
            'cover_image_url': article.cover_image_url or '',
            'gradient_from': article.gradient_from or '#a855f7',
            'gradient_to': article.gradient_to or '#ec4899',
            'author_name': article.author_name or 'Axom AI Team',
            'published_at': article.published_at.strftime('%b %d, %Y') if article.published_at else '',
            'created_at': article.created_at.isoformat() if article.created_at else '',
            'updated_at': article.updated_at.isoformat() if article.updated_at else '',
        },
        'related_articles': related_data,
    })


@require_GET
def cms_about_api(request):
    """API returning all dynamic content for About Us Page in structured JSON."""
    cfg = AboutPageConfig.objects.first()
    if not cfg:
        cfg = AboutPageConfig.objects.create()

    return JsonResponse({
        'badge_text': cfg.badge_text,
        'main_heading_prefix': cfg.main_heading_prefix,
        'main_heading_highlight': cfg.main_heading_highlight,
        'main_heading_suffix': cfg.main_heading_suffix,
        'subheading_english': cfg.subheading_english,
        'subheading_assamese': cfg.subheading_assamese,
        'stat_1_val': cfg.stat_1_val,
        'stat_1_label': cfg.stat_1_label,
        'stat_2_val': cfg.stat_2_val,
        'stat_2_label': cfg.stat_2_label,
        'stat_3_val': cfg.stat_3_val,
        'stat_3_label': cfg.stat_3_label,
        'stat_4_val': cfg.stat_4_val,
        'stat_4_label': cfg.stat_4_label,
        'cta_primary_text': cfg.cta_primary_text,
        'cta_primary_url': cfg.cta_primary_url,
        'entity_badge': cfg.entity_badge,
        'entity_title': cfg.entity_title,
        'entity_definition': cfg.entity_definition,
        'fact_entity_name': cfg.fact_entity_name,
        'fact_official_url': cfg.fact_official_url,
        'fact_headquarters': cfg.fact_headquarters,
        'fact_founder': cfg.fact_founder,
        'fact_languages': cfg.fact_languages,
        'fact_architecture': cfg.fact_architecture,
        'fact_coverage': cfg.fact_coverage,
        'why_badge': cfg.why_badge,
        'why_title': cfg.why_title,
        'why_subheading': cfg.why_subheading,
        'why_card_1_title': cfg.why_card_1_title,
        'why_card_1_desc': cfg.why_card_1_desc,
        'why_card_2_title': cfg.why_card_2_title,
        'why_card_2_desc': cfg.why_card_2_desc,
        'why_card_3_title': cfg.why_card_3_title,
        'why_card_3_desc': cfg.why_card_3_desc,
        'pillars_badge': cfg.pillars_badge,
        'pillars_title': cfg.pillars_title,
        'pillar_1_title': cfg.pillar_1_title,
        'pillar_1_desc': cfg.pillar_1_desc,
        'pillar_2_title': cfg.pillar_2_title,
        'pillar_2_desc': cfg.pillar_2_desc,
        'pillar_3_title': cfg.pillar_3_title,
        'pillar_3_desc': cfg.pillar_3_desc,
        'pillar_4_title': cfg.pillar_4_title,
        'pillar_4_desc': cfg.pillar_4_desc,
        'founder_badge': cfg.founder_badge,
        'founder_name': cfg.founder_name,
        'founder_title': cfg.founder_title,
        'founder_quote_title': cfg.founder_quote_title,
        'founder_quote': cfg.founder_quote,
        'founder_email': cfg.founder_email,
        'cta_badge': cfg.cta_badge,
        'cta_title': cfg.cta_title,
        'cta_desc': cfg.cta_desc,
        'cta_btn_text': cfg.cta_btn_text,
        'cta_btn_url': cfg.cta_btn_url,
        'meta_title': cfg.meta_title,
        'meta_description': cfg.meta_description,
        'meta_keywords': cfg.meta_keywords,
        'updated_at': cfg.updated_at.isoformat() if cfg.updated_at else '',
    })

