import os
import re
import uuid
import json
from datetime import datetime
from html.parser import HTMLParser
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import user_passes_test
from django.core.files.storage import default_storage
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import (
    SiteHeroConfig,
    PartnerLogo,
    AnnouncementBanner,
    InsightArticle,
    LandingFeature,
    LandingUseCase,
    Testimonial,
    LandingFAQ,
    FAQPageConfig,
    SiteSEOSetting,
    LandingPricingPlan,
    HeaderSettings,
    HeaderNavItem,
    HeaderMegaMenuItem,
    FooterSettings,
    FooterColumn,
    FooterColumnLink,
    FooterSocialLink,
    AboutPageConfig,
)


def _is_staff_or_admin(u):
    return u.is_authenticated and (u.is_staff or u.is_superuser)


content_admin_required = user_passes_test(_is_staff_or_admin, login_url='/axomai-content/login/')


def login_view(request):
    if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
        return redirect('contentcms:dashboard')

    error = None
    if request.method == 'POST':
        u = request.POST.get('username', '').strip()
        p = request.POST.get('password', '').strip()
        user = authenticate(request, username=u, password=p)
        if user and (user.is_staff or user.is_superuser):
            login(request, user)
            nxt = request.GET.get('next', '/axomai-content/')
            return redirect(nxt)
        error = 'Invalid credentials or non-staff account.'

    return render(request, 'contentcms/login.html', {'error': error})


def logout_view(request):
    logout(request)
    return redirect('contentcms:login')


@content_admin_required
def dashboard(request):
    hero = SiteHeroConfig.objects.filter(is_active=True).first()
    banner = AnnouncementBanner.objects.first()
    articles_count = InsightArticle.objects.count()
    published_articles = InsightArticle.objects.filter(is_published=True).count()
    features_count = LandingFeature.objects.filter(is_active=True).count()
    usecases_count = LandingUseCase.objects.filter(is_active=True).count()
    testimonials_count = Testimonial.objects.filter(is_active=True).count()
    faqs_count = LandingFAQ.objects.filter(is_active=True).count()
    recent_articles = InsightArticle.objects.all()[:5]
    seo = SiteSEOSetting.objects.first()

    context = {
        'active': 'dashboard',
        'hero': hero,
        'banner': banner,
        'articles_count': articles_count,
        'published_articles': published_articles,
        'features_count': features_count,
        'usecases_count': usecases_count,
        'testimonials_count': testimonials_count,
        'faqs_count': faqs_count,
        'recent_articles': recent_articles,
        'seo': seo,
    }
    return render(request, 'contentcms/dashboard.html', context)


@content_admin_required
def hero_editor(request):
    hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
    banner, _ = AnnouncementBanner.objects.get_or_create(id=1)
    logos = PartnerLogo.objects.all().order_by('order', 'id')
    return render(request, 'contentcms/hero_editor.html', {
        'active': 'hero',
        'hero': hero,
        'banner': banner,
        'logos': logos,
    })


@content_admin_required
@require_POST
def save_hero_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
        hero.badge_text = data.get('badge_text', hero.badge_text)
        hero.badge_link = data.get('badge_link', hero.badge_link)
        hero.main_heading_prefix = data.get('main_heading_prefix', hero.main_heading_prefix)
        hero.main_heading_highlight = data.get('main_heading_highlight', hero.main_heading_highlight)
        hero.subheading_assamese = data.get('subheading_assamese', hero.subheading_assamese)
        hero.subheading_english = data.get('subheading_english', hero.subheading_english)
        hero.cta_primary_text = data.get('cta_primary_text', hero.cta_primary_text)
        hero.cta_primary_url = data.get('cta_primary_url', hero.cta_primary_url)
        hero.cta_secondary_text = data.get('cta_secondary_text', hero.cta_secondary_text)
        hero.cta_secondary_url = data.get('cta_secondary_url', hero.cta_secondary_url)
        hero.trust_badge_1 = data.get('trust_badge_1', hero.trust_badge_1)
        hero.trust_badge_2 = data.get('trust_badge_2', hero.trust_badge_2)
        hero.trust_badge_3 = data.get('trust_badge_3', hero.trust_badge_3)
        hero.logo_strip_headline = data.get('logo_strip_headline', hero.logo_strip_headline)
        if 'logo_strip_active' in data:
            hero.logo_strip_active = bool(data.get('logo_strip_active'))
        hero.is_active = bool(data.get('is_active', True))
        hero.save()
        return JsonResponse({'success': True, 'message': 'Hero section updated successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


import os
import uuid
from django.core.files.storage import default_storage

@content_admin_required
@require_POST
def save_logo_api(request):
    try:
        if request.content_type and 'multipart/form-data' in request.content_type:
            logo_id = request.POST.get('id')
            name = request.POST.get('name', '').strip()
            order = int(request.POST.get('order', 0))
            is_active = request.POST.get('is_active') in ('true', 'True', '1', True, 'on')
            remove_logo = request.POST.get('remove_logo') in ('true', 'True', '1', True, 'on')
            uploaded_file = request.FILES.get('logo_file')
        else:
            data = json.loads(request.body.decode('utf-8'))
            logo_id = data.get('id')
            name = data.get('name', '').strip()
            order = int(data.get('order', 0))
            is_active = bool(data.get('is_active', True))
            remove_logo = bool(data.get('remove_logo', False))
            uploaded_file = None

        if not name:
            return JsonResponse({'success': False, 'error': 'Partner / brand name is required.'}, status=400)

        if logo_id:
            logo = get_object_or_404(PartnerLogo, id=logo_id)
        else:
            logo = PartnerLogo()

        logo.name = name
        logo.order = order
        logo.is_active = is_active

        if uploaded_file:
            ext = os.path.splitext(uploaded_file.name)[1].lower()
            if not ext:
                ext = '.png'
            safe_name = f"partner_logos/{uuid.uuid4().hex[:12]}{ext}"
            saved_path = default_storage.save(safe_name, uploaded_file)
            logo.logo_image_url = f"/media/{saved_path}"
        elif remove_logo:
            logo.logo_image_url = None

        logo.save()
        return JsonResponse({
            'success': True,
            'message': 'Partner / Tech logo saved successfully!',
            'id': logo.id,
            'logo_image_url': logo.logo_image_url or ''
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_logo_api(request, logo_id):
    try:
        logo = get_object_or_404(PartnerLogo, id=logo_id)
        logo.delete()
        return JsonResponse({'success': True, 'message': 'Logo removed.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_banner_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        banner, _ = AnnouncementBanner.objects.get_or_create(id=1)
        banner.badge_label = data.get('badge_label', banner.badge_label)
        banner.message = data.get('message', banner.message)
        banner.action_text = data.get('action_text', banner.action_text)
        banner.action_url = data.get('action_url', banner.action_url)
        banner.is_active = bool(data.get('is_active', banner.is_active))
        banner.save()
        return JsonResponse({'success': True, 'message': 'Announcement banner updated!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
def articles_page(request):
    hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
    q = request.GET.get('q', '').strip()
    cat = request.GET.get('cat', '')
    status = request.GET.get('status', '')

    qs = InsightArticle.objects.all()
    if q:
        qs = qs.filter(title__icontains=q)
    if cat:
        qs = qs.filter(category=cat)
    if status == 'published':
        qs = qs.filter(is_published=True)
    elif status == 'draft':
        qs = qs.filter(is_published=False)

    return render(request, 'contentcms/articles.html', {
        'active': 'articles',
        'hero': hero,
        'articles': qs,
        'q': q,
        'cat': cat,
        'status': status,
        'categories': InsightArticle.CATEGORY_CHOICES,
    })


@content_admin_required
@require_POST
def save_insights_header_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
        hero.insights_badge = data.get('insights_badge', hero.insights_badge).strip()
        hero.insights_title_prefix = data.get('insights_title_prefix', hero.insights_title_prefix).strip()
        hero.insights_title_highlight = data.get('insights_title_highlight', hero.insights_title_highlight).strip()
        hero.insights_subheading = data.get('insights_subheading', hero.insights_subheading).strip()
        hero.insights_view_all_text = data.get('insights_view_all_text', hero.insights_view_all_text).strip()
        hero.insights_view_all_url = data.get('insights_view_all_url', hero.insights_view_all_url).strip()
        if 'insights_section_active' in data:
            hero.insights_section_active = bool(data.get('insights_section_active'))
        hero.save()
        return JsonResponse({'success': True, 'message': 'Insights header settings updated successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ---------------------------------------------------------
# Security / HTML Sanitization for Rich Text Articles
# ---------------------------------------------------------
ALLOWED_TAGS = {
    'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
    'span', 'div', 'blockquote', 'pre', 'code',
    'ul', 'ol', 'li',
    'a', 'img',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'hr', 'figure', 'figcaption', 'section', 'article', 'mark', 'small'
}

ALLOWED_ATTRS = {
    'a': {'href', 'title', 'target', 'rel', 'class', 'style', 'id'},
    'img': {'src', 'alt', 'title', 'width', 'height', 'style', 'class', 'id', 'loading'},
    'table': {'class', 'style', 'border', 'cellpadding', 'cellspacing', 'id'},
    'th': {'colspan', 'rowspan', 'style', 'class', 'scope'},
    'td': {'colspan', 'rowspan', 'style', 'class'},
    'span': {'style', 'class'},
    'div': {'style', 'class'},
    'p': {'style', 'class'},
    'h1': {'style', 'class', 'id'},
    'h2': {'style', 'class', 'id'},
    'h3': {'style', 'class', 'id'},
    'h4': {'style', 'class', 'id'},
    'h5': {'style', 'class', 'id'},
    'h6': {'style', 'class', 'id'},
    'blockquote': {'style', 'class'},
    'pre': {'style', 'class'},
    'code': {'style', 'class'},
    'ul': {'style', 'class'},
    'ol': {'style', 'class'},
    'li': {'style', 'class'},
    'hr': {'style', 'class'},
    'figure': {'style', 'class'},
    'figcaption': {'style', 'class'},
}

def is_safe_url(url, allow_data_image=False):
    if not url:
        return False
    url = url.strip()
    if url.startswith(('http://', 'https://', 'mailto:', 'tel:', '/', '#')):
        return True
    if allow_data_image and url.startswith('data:image/'):
        return True
    return False

class SafeHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.result = []
        self.skip_depth = 0
        self.disallowed_tags_with_content = {'script', 'style', 'iframe', 'object', 'embed', 'applet', 'noscript', 'form'}

    def handle_starttag(self, tag, attrs):
        tag_lower = tag.lower()
        if tag_lower in self.disallowed_tags_with_content:
            self.skip_depth += 1
            return
        if self.skip_depth > 0:
            return
        if tag_lower in ALLOWED_TAGS:
            allowed_tag_attrs = ALLOWED_ATTRS.get(tag_lower, {'class', 'style', 'id'})
            clean_attrs = []
            for name, val in attrs:
                name_lower = name.lower()
                if name_lower.startswith('on'):
                    continue
                if name_lower not in allowed_tag_attrs and name_lower not in {'class', 'style', 'id'}:
                    continue
                if val is None:
                    clean_attrs.append(name)
                    continue
                val_clean = str(val).strip()
                if 'javascript:' in val_clean.lower() or 'expression(' in val_clean.lower():
                    continue
                if name_lower == 'href':
                    if not is_safe_url(val_clean):
                        continue
                elif name_lower == 'src':
                    if not is_safe_url(val_clean, allow_data_image=True):
                        continue
                escaped_val = val_clean.replace('"', '&quot;')
                clean_attrs.append(f'{name}="{escaped_val}"')
            
            if tag_lower == 'a':
                has_blank = any('target="_blank"' in ca for ca in clean_attrs)
                has_rel = any(ca.startswith('rel=') for ca in clean_attrs)
                if has_blank and not has_rel:
                    clean_attrs.append('rel="noopener noreferrer"')

            attr_str = (' ' + ' '.join(clean_attrs)) if clean_attrs else ''
            if tag_lower in {'br', 'hr', 'img'}:
                self.result.append(f'<{tag_lower}{attr_str} />')
            else:
                self.result.append(f'<{tag_lower}{attr_str}>')

    def handle_endtag(self, tag):
        tag_lower = tag.lower()
        if tag_lower in self.disallowed_tags_with_content:
            if self.skip_depth > 0:
                self.skip_depth -= 1
            return
        if self.skip_depth > 0:
            return
        if tag_lower in ALLOWED_TAGS and tag_lower not in {'br', 'hr', 'img'}:
            self.result.append(f'</{tag_lower}>')

    def handle_data(self, data):
        if self.skip_depth == 0:
            self.result.append(data)

    def handle_entityref(self, name):
        if self.skip_depth == 0:
            self.result.append(f'&{name};')

    def handle_charref(self, name):
        if self.skip_depth == 0:
            self.result.append(f'&#{name};')

def sanitize_html(content):
    if not content or not isinstance(content, str):
        return ''
    parser = SafeHTMLParser()
    try:
        parser.feed(content)
        parser.close()
        return ''.join(parser.result)
    except Exception:
        clean = re.sub(r'<(script|style|iframe|object|embed)[^>]*>.*?</\1>', '', content, flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r'on\w+\s*=\s*["\'][^"\']*["\']', '', clean, flags=re.IGNORECASE)
        return clean


@content_admin_required
def article_edit_page(request, article_id=None):
    article = None
    if article_id:
        article = get_object_or_404(InsightArticle, id=article_id)

    return render(request, 'contentcms/article_edit.html', {
        'active': 'articles',
        'article': article,
        'categories': InsightArticle.CATEGORY_CHOICES,
    })


@content_admin_required
@require_POST
def upload_article_image_api(request):
    """
    Handles image uploads directly from TinyMCE rich text editor.
    """
    try:
        uploaded_file = request.FILES.get('upload') or request.FILES.get('file') or request.FILES.get('image')
        if not uploaded_file:
            return JsonResponse({'error': 'No image file uploaded.'}, status=400)

        ext = os.path.splitext(uploaded_file.name)[1].lower()
        allowed_exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
        if ext not in allowed_exts:
            return JsonResponse({'error': f'Unsupported file type {ext}. Use JPG, PNG, WEBP, GIF, or SVG.'}, status=400)

        # Max file size 15MB
        if uploaded_file.size > 15 * 1024 * 1024:
            return JsonResponse({'error': 'Image size exceeds 15MB limit.'}, status=400)

        clean_orig = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', uploaded_file.name)
        safe_name = f"article_images/{uuid.uuid4().hex[:12]}_{clean_orig}"
        saved_path = default_storage.save(safe_name, uploaded_file)
        full_url = f"/media/{saved_path}"

        # Return CKEditor (url, uploaded) and TinyMCE (location) standard keys
        return JsonResponse({
            'url': full_url,
            'location': full_url,
            'uploaded': 1,
            'fileName': clean_orig,
            'success': True
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_article_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        art_id = data.get('id')
        if art_id:
            article = get_object_or_404(InsightArticle, id=art_id)
        else:
            article = InsightArticle()

        article.title = data.get('title', '').strip()
        if not article.title:
            return JsonResponse({'success': False, 'error': 'Title is required'}, status=400)

        article.category = data.get('category', 'product_update')
        article.excerpt = data.get('excerpt', '').strip()

        user_slug = data.get('slug', '').strip()
        if user_slug:
            base_slug = slugify(user_slug) or 'article'
            unique_slug = base_slug
            counter = 1
            while InsightArticle.objects.filter(slug=unique_slug).exclude(pk=article.pk).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            article.slug = unique_slug
        
        # Proper sanitization of rich HTML content
        raw_content = data.get('content', '')
        article.content = sanitize_html(raw_content)

        article.read_time = data.get('read_time', '4 min read').strip()
        article.cover_image_url = data.get('cover_image_url', '').strip() or None
        article.gradient_from = data.get('gradient_from', '#a855f7').strip()
        article.gradient_to = data.get('gradient_to', '#ec4899').strip()
        article.author_name = data.get('author_name', 'Axom AI Team').strip()
        article.external_link = data.get('external_link', '').strip()
        article.is_published = bool(data.get('is_published', True))
        article.order = int(data.get('order', 0))

        if data.get('published_at'):
            try:
                article.published_at = datetime.strptime(data['published_at'], '%Y-%m-%d').date()
            except Exception:
                pass

        article.save()
        return JsonResponse({'success': True, 'id': article.id, 'message': 'Article saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_article_api(request, article_id):
    try:
        article = get_object_or_404(InsightArticle, id=article_id)
        article.delete()
        return JsonResponse({'success': True, 'message': 'Article deleted successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def toggle_article_status_api(request, article_id):
    try:
        article = get_object_or_404(InsightArticle, id=article_id)
        article.is_published = not article.is_published
        article.save()
        return JsonResponse({'success': True, 'is_published': article.is_published})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
def features_page(request):
    hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
    features = LandingFeature.objects.all().order_by('order', 'id')
    return render(request, 'contentcms/features.html', {
        'active': 'explore',
        'hero': hero,
        'features': features,
    })


@content_admin_required
@require_POST
def save_explore_header_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
        hero.explore_badge = data.get('explore_badge', hero.explore_badge).strip()
        hero.explore_title_prefix = data.get('explore_title_prefix', hero.explore_title_prefix).strip()
        hero.explore_title_highlight = data.get('explore_title_highlight', hero.explore_title_highlight).strip()
        hero.explore_subheading = data.get('explore_subheading', hero.explore_subheading).strip()
        if 'explore_section_active' in data:
            hero.explore_section_active = bool(data.get('explore_section_active'))
        hero.save()
        return JsonResponse({'success': True, 'message': 'Explore header updated successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_feature_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        fid = data.get('id')
        feature = get_object_or_404(LandingFeature, id=fid) if fid else LandingFeature()
        feature.title = data.get('title', '').strip()
        feature.tagline = data.get('tagline', '').strip()
        feature.description = data.get('description', '').strip()
        feature.badge = data.get('badge', '').strip()
        feature.icon_class = data.get('icon_class', 'fa-solid fa-wand-magic-sparkles').strip()
        feature.gradient_color = data.get('gradient_color', 'from-purple-500 to-indigo-500').strip()
        feature.action_url = data.get('action_url', 'https://chat.aiaxom.co.in/tools').strip()
        feature.order = int(data.get('order', 0))
        if 'is_active' in data:
            feature.is_active = bool(data.get('is_active'))

        if not feature.title:
            return JsonResponse({'success': False, 'error': 'Title is required'}, status=400)

        feature.save()
        return JsonResponse({'success': True, 'message': 'Feature card saved!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_feature_api(request, feature_id):
    try:
        feature = get_object_or_404(LandingFeature, id=feature_id)
        feature.delete()
        return JsonResponse({'success': True, 'message': 'Feature deleted.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
def usecases_page(request):
    hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
    usecases = LandingUseCase.objects.all().order_by('order', 'id')
    return render(request, 'contentcms/usecases.html', {
        'active': 'usecases',
        'hero': hero,
        'usecases': usecases,
    })


@content_admin_required
@require_POST
def save_usecases_header_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
        hero.usecases_badge = data.get('usecases_badge', hero.usecases_badge).strip()
        hero.usecases_title_prefix = data.get('usecases_title_prefix', hero.usecases_title_prefix).strip()
        hero.usecases_title_highlight = data.get('usecases_title_highlight', hero.usecases_title_highlight).strip()
        hero.usecases_subheading = data.get('usecases_subheading', hero.usecases_subheading).strip()
        if 'usecases_section_active' in data:
            hero.usecases_section_active = bool(data.get('usecases_section_active'))
        hero.save()
        return JsonResponse({'success': True, 'message': 'Use Cases section header saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_usecase_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        uid = data.get('id')
        usecase = get_object_or_404(LandingUseCase, id=uid) if uid else LandingUseCase()
        
        tab_title = data.get('tab_title', '').strip()
        if not tab_title:
            return JsonResponse({'success': False, 'error': 'Tab title is required'}, status=400)
            
        usecase.tab_title = tab_title
        usecase.audience_key = data.get('audience_key', slugify(tab_title))
        usecase.icon_class = data.get('icon_class', 'fa-solid fa-graduation-cap').strip()
        
        # Card 1
        usecase.card_1_title = data.get('card_1_title', '').strip()
        usecase.card_1_desc = data.get('card_1_desc', '').strip()
        usecase.card_1_icon = data.get('card_1_icon', 'fa-solid fa-graduation-cap').strip()
        usecase.card_1_color = data.get('card_1_color', 'text-fuchsia-400').strip()

        # Card 2
        usecase.card_2_title = data.get('card_2_title', '').strip()
        usecase.card_2_desc = data.get('card_2_desc', '').strip()
        usecase.card_2_icon = data.get('card_2_icon', 'fa-solid fa-file-pdf').strip()
        usecase.card_2_color = data.get('card_2_color', 'text-purple-400').strip()

        # Card 3
        usecase.card_3_title = data.get('card_3_title', '').strip()
        usecase.card_3_desc = data.get('card_3_desc', '').strip()
        usecase.card_3_icon = data.get('card_3_icon', 'fa-solid fa-pen-nib').strip()
        usecase.card_3_color = data.get('card_3_color', 'text-pink-400').strip()

        usecase.order = int(data.get('order', 0))
        if 'is_active' in data:
            usecase.is_active = bool(data.get('is_active'))
            
        usecase.save()
        return JsonResponse({'success': True, 'message': 'Audience tab saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_usecase_api(request, usecase_id):
    try:
        usecase = get_object_or_404(LandingUseCase, id=usecase_id)
        usecase.delete()
        return JsonResponse({'success': True, 'message': 'Audience tab deleted.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
def testimonials_page(request):
    hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
    testimonials = Testimonial.objects.all().order_by('order', 'id')
    return render(request, 'contentcms/testimonials.html', {
        'active': 'testimonials',
        'hero': hero,
        'testimonials': testimonials,
    })


@content_admin_required
@require_POST
def save_testimonials_header_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
        hero.testimonials_badge = data.get('testimonials_badge', hero.testimonials_badge).strip()
        hero.testimonials_title_prefix = data.get('testimonials_title_prefix', hero.testimonials_title_prefix).strip()
        hero.testimonials_title_highlight = data.get('testimonials_title_highlight', hero.testimonials_title_highlight).strip()
        hero.testimonials_subheading = data.get('testimonials_subheading', hero.testimonials_subheading).strip()
        if 'testimonials_section_active' in data:
            hero.testimonials_section_active = bool(data.get('testimonials_section_active'))
        hero.save()
        return JsonResponse({'success': True, 'message': 'Testimonials header updated successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


def testimonials_faqs_page(request):
    return testimonials_page(request)


@content_admin_required
@require_POST
def save_testimonial_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        tid = data.get('id')
        t = get_object_or_404(Testimonial, id=tid) if tid else Testimonial()
        t.name = data.get('name', '').strip()
        t.role_designation = data.get('role_designation', '').strip()
        t.avatar_initials = data.get('avatar_initials', 'AK').strip()
        t.quote_assamese = data.get('quote_assamese', '').strip()
        t.quote_english = data.get('quote_english', '').strip()
        t.rating = int(data.get('rating', 5))
        t.order = int(data.get('order', 0))
        t.is_active = bool(data.get('is_active', True))
        t.save()
        return JsonResponse({'success': True, 'message': 'Testimonial saved!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_testimonial_api(request, testimonial_id):
    try:
        t = get_object_or_404(Testimonial, id=testimonial_id)
        t.delete()
        return JsonResponse({'success': True, 'message': 'Testimonial deleted.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_faq_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        fid = data.get('id')
        faq = get_object_or_404(LandingFAQ, id=fid) if fid else LandingFAQ()
        faq.question = data.get('question', '').strip()
        faq.answer = data.get('answer', '').strip()
        faq.category = data.get('category', 'general')
        faq.order = int(data.get('order', 0))
        faq.is_active = bool(data.get('is_active', True))
        faq.save()
        return JsonResponse({'success': True, 'message': 'FAQ saved!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_faq_api(request, faq_id):
    try:
        faq = get_object_or_404(LandingFAQ, id=faq_id)
        faq.delete()
        return JsonResponse({'success': True, 'message': 'FAQ deleted.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
def pricing_page(request):
    hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
    plans = LandingPricingPlan.objects.all().order_by('order', 'id')
    return render(request, 'contentcms/pricing.html', {
        'active': 'pricing',
        'hero': hero,
        'plans': plans,
    })


@content_admin_required
@require_POST
def save_pricing_header_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        hero, _ = SiteHeroConfig.objects.get_or_create(id=1)
        hero.pricing_badge = data.get('pricing_badge', hero.pricing_badge).strip()
        hero.pricing_title_prefix = data.get('pricing_title_prefix', hero.pricing_title_prefix).strip()
        hero.pricing_title_highlight = data.get('pricing_title_highlight', hero.pricing_title_highlight).strip()
        hero.pricing_subheading = data.get('pricing_subheading', hero.pricing_subheading).strip()
        hero.pricing_yearly_discount_badge = data.get('pricing_yearly_discount_badge', hero.pricing_yearly_discount_badge).strip()
        hero.pricing_footer_note = data.get('pricing_footer_note', hero.pricing_footer_note).strip()
        if 'pricing_section_active' in data:
            hero.pricing_section_active = bool(data.get('pricing_section_active'))
        hero.save()
        return JsonResponse({'success': True, 'message': 'Pricing header updated successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_pricing_plan_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        pid = data.get('id')
        plan = get_object_or_404(LandingPricingPlan, id=pid) if pid else LandingPricingPlan()
        
        name = data.get('name', '').strip()
        if not name:
            return JsonResponse({'success': False, 'error': 'Plan name is required'}, status=400)
            
        plan.name = name
        plan.plan_slug = data.get('plan_slug', name.lower().replace(' ', '-')).strip()
        plan.badge = data.get('badge', '').strip()
        plan.icon_class = data.get('icon_class', 'fa-solid fa-sparkles').strip()
        plan.color_class = data.get('color_class', 'text-gray-400').strip()
        plan.description = data.get('description', '').strip()
        plan.monthly_price = int(data.get('monthly_price', 0))
        plan.yearly_price = int(data.get('yearly_price', 0))
        plan.monthly_words = data.get('monthly_words', '5,000 words').strip()
        plan.cta_text = data.get('cta_text', 'Get Started Free').strip()
        plan.cta_url = data.get('cta_url', 'https://chat.aiaxom.co.in').strip()
        plan.is_featured = bool(data.get('is_featured', False))
        plan.features_list = data.get('features_list', '').strip()
        plan.order = int(data.get('order', 0))
        plan.is_active = bool(data.get('is_active', True))
        plan.save()
        return JsonResponse({'success': True, 'message': 'Pricing plan saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_pricing_plan_api(request, plan_id):
    try:
        plan = get_object_or_404(LandingPricingPlan, id=plan_id)
        plan.delete()
        return JsonResponse({'success': True, 'message': 'Pricing plan deleted successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def toggle_pricing_plan_api(request, plan_id):
    try:
        plan = get_object_or_404(LandingPricingPlan, id=plan_id)
        plan.is_active = not plan.is_active
        plan.save()
        status_text = "Active (Visible on frontend)" if plan.is_active else "Inactive (Hidden from frontend)"
        return JsonResponse({
            'success': True,
            'is_active': plan.is_active,
            'message': f"Plan '{plan.name}' is now {status_text}."
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
def seo_page(request):
    seo, _ = SiteSEOSetting.objects.get_or_create(id=1)
    return render(request, 'contentcms/seo.html', {
        'active': 'seo',
        'seo': seo,
    })


@content_admin_required
@require_POST
def save_seo_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        seo, _ = SiteSEOSetting.objects.get_or_create(id=1)
        seo.meta_title = data.get('meta_title', seo.meta_title).strip()
        seo.meta_description = data.get('meta_description', seo.meta_description).strip()
        seo.meta_keywords = data.get('meta_keywords', seo.meta_keywords).strip()
        seo.og_title = data.get('og_title', seo.og_title).strip()
        seo.og_description = data.get('og_description', seo.og_description).strip()
        seo.og_image_url = data.get('og_image_url', seo.og_image_url).strip()
        seo.gtm_container_id = data.get('gtm_container_id', seo.gtm_container_id).strip()
        seo.footer_tagline = data.get('footer_tagline', seo.footer_tagline).strip()
        seo.save()
        return JsonResponse({'success': True, 'message': 'SEO settings updated!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ─────────────────────────────────────────────────────────────
# HEADER & NAVBAR SETTINGS
# ─────────────────────────────────────────────────────────────

@content_admin_required
def header_settings_page(request):
    header, _ = HeaderSettings.objects.get_or_create(id=1)
    nav_items = HeaderNavItem.objects.all().order_by('order', 'id')
    mega_items = HeaderMegaMenuItem.objects.all().order_by('order', 'id')
    return render(request, 'contentcms/header_settings.html', {
        'active': 'header_settings',
        'header': header,
        'nav_items': nav_items,
        'mega_items': mega_items,
    })


@content_admin_required
@require_POST
def save_header_settings_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        header, _ = HeaderSettings.objects.get_or_create(id=1)
        if 'logo_image_url' in data:
            header.logo_image_url = data.get('logo_image_url', '').strip()
        if 'logo_alt_text' in data:
            header.logo_alt_text = data.get('logo_alt_text', '').strip()
        if 'logo_width' in data:
            header.logo_width = data.get('logo_width', '180px').strip()
        if 'logo_height' in data:
            header.logo_height = data.get('logo_height', 'auto').strip()
        if 'logo_fit' in data:
            header.logo_fit = data.get('logo_fit', 'contain').strip()
        if 'cta_signin_text' in data:
            header.cta_signin_text = data.get('cta_signin_text', '').strip()
        if 'cta_signin_url' in data:
            header.cta_signin_url = data.get('cta_signin_url', '').strip()
        if 'cta_chat_text' in data:
            header.cta_chat_text = data.get('cta_chat_text', '').strip()
        if 'cta_chat_url' in data:
            header.cta_chat_url = data.get('cta_chat_url', '').strip()
        header.save()
        return JsonResponse({'success': True, 'message': 'Header settings updated successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def upload_brand_logo_api(request):
    try:
        f = request.FILES.get('logo') or request.FILES.get('file') or request.FILES.get('image')
        if not f:
            return JsonResponse({'success': False, 'error': 'No file uploaded.'}, status=400)
        ext = os.path.splitext(f.name)[1].lower()
        if ext not in ['.png', '.jpg', '.jpeg', '.webp', '.svg']:
            return JsonResponse({'success': False, 'error': f'Unsupported file type {ext}.'}, status=400)
        
        filename = f"logo_{uuid.uuid4().hex[:8]}{ext}"
        save_dir = os.path.join(settings.MEDIA_ROOT, 'brand')
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, filename)
        
        with open(file_path, 'wb+') as destination:
            for chunk in f.chunks():
                destination.write(chunk)
                
        logo_url = f"{settings.MEDIA_URL}brand/{filename}"
        return JsonResponse({'success': True, 'logo_url': logo_url, 'message': 'Logo uploaded successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_header_nav_item_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        item_id = data.get('id')
        item = get_object_or_404(HeaderNavItem, id=item_id) if item_id else HeaderNavItem()
        title = data.get('title', '').strip()
        url = data.get('url', '').strip()
        if not title or not url:
            return JsonResponse({'success': False, 'error': 'Title and URL are required.'}, status=400)
        item.title = title
        item.url = url
        item.order = int(data.get('order', 0))
        if 'is_active' in data:
            item.is_active = bool(data.get('is_active'))
        item.save()
        return JsonResponse({'success': True, 'message': 'Navigation item saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_header_nav_item_api(request, item_id):
    try:
        item = get_object_or_404(HeaderNavItem, id=item_id)
        item.delete()
        return JsonResponse({'success': True, 'message': 'Navigation item deleted successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def toggle_header_nav_item_api(request, item_id):
    try:
        item = get_object_or_404(HeaderNavItem, id=item_id)
        item.is_active = not item.is_active
        item.save()
        status_text = "Active (Visible)" if item.is_active else "Inactive (Hidden)"
        return JsonResponse({'success': True, 'is_active': item.is_active, 'message': f"Item '{item.title}' is now {status_text}."})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_mega_menu_item_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        item_id = data.get('id')
        item = get_object_or_404(HeaderMegaMenuItem, id=item_id) if item_id else HeaderMegaMenuItem()
        title = data.get('title', '').strip()
        if not title:
            return JsonResponse({'success': False, 'error': 'Title is required.'}, status=400)
        item.title = title
        item.description = data.get('description', '').strip()
        item.icon_class = data.get('icon_class', 'fa-solid fa-brain').strip()
        item.color_class = data.get('color_class', 'text-fuchsia-400').strip()
        item.url = data.get('url', 'https://chat.aiaxom.co.in/tools').strip()
        item.order = int(data.get('order', 0))
        if 'is_active' in data:
            item.is_active = bool(data.get('is_active'))
        item.save()
        return JsonResponse({'success': True, 'message': 'Mega menu tool saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_mega_menu_item_api(request, item_id):
    try:
        item = get_object_or_404(HeaderMegaMenuItem, id=item_id)
        item.delete()
        return JsonResponse({'success': True, 'message': 'Mega menu tool deleted successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def toggle_mega_menu_item_api(request, item_id):
    try:
        item = get_object_or_404(HeaderMegaMenuItem, id=item_id)
        item.is_active = not item.is_active
        item.save()
        status_text = "Active (Visible)" if item.is_active else "Inactive (Hidden)"
        return JsonResponse({'success': True, 'is_active': item.is_active, 'message': f"Tool '{item.title}' is now {status_text}."})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ─────────────────────────────────────────────────────────────
# FOOTER & SOCIAL SETTINGS
# ─────────────────────────────────────────────────────────────

@content_admin_required
def footer_settings_page(request):
    footer, _ = FooterSettings.objects.get_or_create(id=1)
    columns = FooterColumn.objects.all().prefetch_related('links').order_by('order', 'id')
    socials = FooterSocialLink.objects.all().order_by('order', 'id')
    return render(request, 'contentcms/footer_settings.html', {
        'active': 'footer_settings',
        'footer': footer,
        'columns': columns,
        'socials': socials,
    })


@content_admin_required
@require_POST
def save_footer_settings_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        footer, _ = FooterSettings.objects.get_or_create(id=1)
        if 'logo_image_url' in data:
            footer.logo_image_url = data.get('logo_image_url', '').strip()
        if 'logo_width' in data:
            footer.logo_width = data.get('logo_width', '180px').strip()
        if 'logo_height' in data:
            footer.logo_height = data.get('logo_height', 'auto').strip()
        if 'logo_fit' in data:
            footer.logo_fit = data.get('logo_fit', 'contain').strip()
        if 'description' in data:
            footer.description = data.get('description', '').strip()
        if 'tagline' in data:
            footer.tagline = data.get('tagline', '').strip()
        if 'copyright_text' in data:
            footer.copyright_text = data.get('copyright_text', '').strip()
        footer.save()
        return JsonResponse({'success': True, 'message': 'Footer settings updated successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_footer_column_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        col_id = data.get('id')
        col = get_object_or_404(FooterColumn, id=col_id) if col_id else FooterColumn()
        title = data.get('title', '').strip()
        if not title:
            return JsonResponse({'success': False, 'error': 'Column title is required.'}, status=400)
        col.title = title
        col.order = int(data.get('order', 0))
        if 'is_active' in data:
            col.is_active = bool(data.get('is_active'))
        col.save()
        return JsonResponse({'success': True, 'message': 'Footer column saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_footer_column_api(request, column_id):
    try:
        col = get_object_or_404(FooterColumn, id=column_id)
        col.delete()
        return JsonResponse({'success': True, 'message': 'Footer column deleted successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_footer_link_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        link_id = data.get('id')
        link = get_object_or_404(FooterColumnLink, id=link_id) if link_id else FooterColumnLink()
        column_id = data.get('column_id')
        if not column_id and not link_id:
            return JsonResponse({'success': False, 'error': 'Column ID is required.'}, status=400)
        if column_id:
            link.column = get_object_or_404(FooterColumn, id=column_id)
        title = data.get('title', '').strip()
        url = data.get('url', '').strip()
        if not title or not url:
            return JsonResponse({'success': False, 'error': 'Title and URL are required.'}, status=400)
        link.title = title
        link.url = url
        link.is_external = bool(data.get('is_external', False))
        link.order = int(data.get('order', 0))
        if 'is_active' in data:
            link.is_active = bool(data.get('is_active'))
        link.save()
        return JsonResponse({'success': True, 'message': 'Footer link saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_footer_link_api(request, link_id):
    try:
        link = get_object_or_404(FooterColumnLink, id=link_id)
        link.delete()
        return JsonResponse({'success': True, 'message': 'Footer link deleted successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def toggle_footer_link_api(request, link_id):
    try:
        link = get_object_or_404(FooterColumnLink, id=link_id)
        link.is_active = not link.is_active
        link.save()
        status_text = "Active (Visible)" if link.is_active else "Inactive (Hidden)"
        return JsonResponse({'success': True, 'is_active': link.is_active, 'message': f"Link '{link.title}' is now {status_text}."})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_footer_social_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        social_id = data.get('id')
        soc = get_object_or_404(FooterSocialLink, id=social_id) if social_id else FooterSocialLink()
        platform = data.get('platform', '').strip()
        url = data.get('url', '').strip()
        if not platform or not url:
            return JsonResponse({'success': False, 'error': 'Platform and URL are required.'}, status=400)
        soc.platform = platform
        soc.icon_class = data.get('icon_class', 'fa-brands fa-x-twitter').strip()
        soc.url = url
        soc.order = int(data.get('order', 0))
        if 'is_active' in data:
            soc.is_active = bool(data.get('is_active'))
        soc.save()
        return JsonResponse({'success': True, 'message': 'Social link saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def delete_footer_social_api(request, social_id):
    try:
        soc = get_object_or_404(FooterSocialLink, id=social_id)
        soc.delete()
        return JsonResponse({'success': True, 'message': 'Social link deleted successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def toggle_footer_social_api(request, social_id):
    try:
        soc = get_object_or_404(FooterSocialLink, id=social_id)
        soc.is_active = not soc.is_active
        soc.save()
        status_text = "Active (Visible)" if soc.is_active else "Inactive (Hidden)"
        return JsonResponse({'success': True, 'is_active': soc.is_active, 'message': f"Social link '{soc.platform}' is now {status_text}."})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ─────────────────────────────────────────────────────────────
# STANDALONE PAGES: FAQ PAGE MANAGER
# ─────────────────────────────────────────────────────────────

def _ensure_default_faqs():
    """Seed high-quality default FAQs for all 16 questions if missing."""
    default_items = [
        {
            "question": "What is Axom AI and who is it built for?",
            "answer": "Axom AI is Assam's premier artificial intelligence platform designed specifically for students, educators, writers, freelancers, businesses, and developers in Northeast India. It provides native Assamese chat, AI writing, PDF document analysis, FLUX image generation, and coding assistance tailored for regional workflows.",
            "category": "general",
            "order": 1,
            "show_on_homepage": True,
        },
        {
            "question": "How do I start using Axom AI?",
            "answer": "You can start completely free! Simply click 'Open Chat' or 'Sign in' at the top right of the website, create your account with your email or Google login, and immediately begin chatting with AI or using our 12+ creative tools.",
            "category": "general",
            "order": 2,
            "show_on_homepage": True,
        },
        {
            "question": "Do I need any technical or programming knowledge to use Axom AI?",
            "answer": "Not at all. Axom AI is designed with an intuitive, modern interface. You can type in natural English, Assamese (অসমীয়া), or Romanized Assamese (e.g. 'Mur eta essay likhi diya') and the AI will understand and respond naturally.",
            "category": "general",
            "order": 3,
            "show_on_homepage": False,
        },
        {
            "question": "Which AI models power Axom AI?",
            "answer": "Axom AI leverages world-class state-of-the-art models including Gemini 2.5 Pro / Flash for reasoning and web search, FLUX and Pollinations for high-definition image generation, Claude 3.5 Sonnet for advanced code writing, and fine-tuned IndicTrans2 models for high-accuracy Assamese translations.",
            "category": "features",
            "order": 4,
            "show_on_homepage": True,
        },
        {
            "question": "What types of documents can I upload and summarize?",
            "answer": "You can upload PDF files, Microsoft Word (.docx), Excel spreadsheets (.xlsx, .csv), plain text, and images. Axom AI extracts the text, answers questions based on your document, and generates executive summaries or translations.",
            "category": "features",
            "order": 5,
            "show_on_homepage": False,
        },
        {
            "question": "How does live Web Search work in Axom AI?",
            "answer": "When you ask time-sensitive questions or regional inquiries (such as current news, exam schedules, government schemes in Assam, or local events), Axom AI performs real-time web retrieval via Tavily Search and synthesizes up-to-date answers with cited sources.",
            "category": "features",
            "order": 6,
            "show_on_homepage": False,
        },
        {
            "question": "Can I generate AI art and images with Axom AI?",
            "answer": "Yes! Our Image Generator tool lets you create photorealistic portraits, cinematic landscapes, Assamese cultural art, logos, and marketing creatives using top text-to-image models including FLUX.1 and Gemini Imagen.",
            "category": "features",
            "order": 7,
            "show_on_homepage": False,
        },
        {
            "question": "How accurate is Axom AI in Assamese (অসমীয়া)?",
            "answer": "Axom AI uses dedicated regional fine-tuning and Indic language benchmarks to deliver natural, grammatically sound Assamese text without robotic or literal translation errors. It understands idioms, regional proverbs, and local Assam context.",
            "category": "features",
            "order": 8,
            "show_on_homepage": True,
        },
        {
            "question": "Can I write in English and get responses in Assamese (or vice-versa)?",
            "answer": "Absolutely! You can prompt in English and ask the AI to answer in Assamese, or paste Assamese text and receive English summaries. You can also mix languages freely in the same conversation.",
            "category": "features",
            "order": 9,
            "show_on_homepage": False,
        },
        {
            "question": "How does the monthly word quota and free tier work?",
            "answer": "Every free and paid plan includes a generous monthly word limit. Each prompt and AI response counts toward your quota. Your quota automatically resets on the 1st day of every calendar month, and you can track your live balance in your user dashboard.",
            "category": "pricing",
            "order": 10,
            "show_on_homepage": True,
        },
        {
            "question": "What payment methods do you accept?",
            "answer": "We accept all major Indian payment methods via Razorpay, including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay), Net Banking across 50+ banks, and popular digital wallets.",
            "category": "pricing",
            "order": 11,
            "show_on_homepage": True,
        },
        {
            "question": "Can I upgrade, downgrade, or cancel my subscription anytime?",
            "answer": "Yes, there are no lock-ins. You can upgrade or cancel your plan at any time from your Account Settings. If you cancel, your premium benefits remain active until the end of your current billing cycle.",
            "category": "pricing",
            "order": 12,
            "show_on_homepage": False,
        },
        {
            "question": "Is my personal data and document content kept confidential?",
            "answer": "Yes, user privacy is our highest priority. All communication is encrypted via 256-bit SSL/TLS in transit and encrypted at rest. We do not sell your personal data or use your private documents to train public third-party models.",
            "category": "privacy",
            "order": 13,
            "show_on_homepage": True,
        },
        {
            "question": "Can I delete my chat history and uploaded files?",
            "answer": "Yes. You can delete individual chats, clear your full history, or purge uploaded documents anytime directly from the chat interface and dashboard.",
            "category": "privacy",
            "order": 14,
            "show_on_homepage": False,
        },
        {
            "question": "How can I contact customer support if I face an issue?",
            "answer": "You can reach our support team via email at support@aiaxom.co.in or samarjitkashyp@gmail.com. Paid plan users also enjoy priority WhatsApp support and dedicated account management.",
            "category": "general",
            "order": 15,
            "show_on_homepage": False,
        },
        {
            "question": "What should I do if I forget my password or cannot log in?",
            "answer": "Click 'Sign in' and select 'Forgot Password' on the login page. Enter your registered email address to receive an instant password reset link. If you signed up via Google, simply click 'Continue with Google'.",
            "category": "general",
            "order": 16,
            "show_on_homepage": False,
        },
    ]
    for item in default_items:
        # Check if question already exists
        if not LandingFAQ.objects.filter(question__iexact=item["question"]).exists():
            LandingFAQ.objects.create(
                question=item["question"],
                answer=item["answer"],
                category=item["category"],
                order=item["order"],
                show_on_homepage=item.get("show_on_homepage", False),
                is_active=True,
            )


@content_admin_required
def faq_manager_page(request):
    _ensure_default_faqs()
    config = FAQPageConfig.objects.first()
    if not config:
        config = FAQPageConfig.objects.create()
    faqs = LandingFAQ.objects.all().order_by('order', 'id')
    return render(request, 'contentcms/faq_manager.html', {
        'active': 'pages_faq',
        'config': config,
        'faqs': faqs,
    })


@content_admin_required
@require_POST
def save_faq_page_config_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        config = FAQPageConfig.objects.first()
        if not config:
            config = FAQPageConfig()
        config.badge = data.get('badge', 'Help Center & FAQs').strip()
        config.title_prefix = data.get('title_prefix', 'Frequently Asked').strip()
        config.title_highlight = data.get('title_highlight', 'Questions').strip()
        config.subheading = data.get('subheading', '').strip()
        config.search_placeholder = data.get('search_placeholder', '').strip()
        config.meta_title = data.get('meta_title', 'FAQs & Help Center — Axom AI').strip()
        config.support_box_title = data.get('support_box_title', 'Still have questions?').strip()
        config.support_box_desc = data.get('support_box_desc', '').strip()
        config.support_button_text = data.get('support_button_text', 'Contact Support').strip()
        config.support_button_url = data.get('support_button_url', 'https://user.aiaxom.co.in/support/').strip()
        config.chat_button_text = data.get('chat_button_text', 'Ask Axom AI').strip()
        config.chat_button_url = data.get('chat_button_url', 'https://chat.aiaxom.co.in').strip()
        config.save()
        return JsonResponse({'success': True, 'message': 'FAQ Page configuration saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def save_faq_item_api(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        faq_id = data.get('id')
        faq = get_object_or_404(LandingFAQ, id=faq_id) if faq_id else LandingFAQ()
        question = data.get('question', '').strip()
        answer = data.get('answer', '').strip()
        if not question or not answer:
            return JsonResponse({'success': False, 'error': 'Question and answer are required.'}, status=400)
        faq.question = question
        faq.answer = answer
        faq.category = data.get('category', 'general')
        faq.order = int(data.get('order', 0))
        if 'show_on_homepage' in data:
            faq.show_on_homepage = bool(data.get('show_on_homepage'))
        if 'is_active' in data:
            faq.is_active = bool(data.get('is_active'))
        faq.save()
        return JsonResponse({'success': True, 'message': 'FAQ question saved successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# Aliases for backwards compatibility
save_faq_api = save_faq_item_api


@content_admin_required
@require_POST
def delete_faq_item_api(request, faq_id):
    try:
        faq = get_object_or_404(LandingFAQ, id=faq_id)
        faq.delete()
        return JsonResponse({'success': True, 'message': 'FAQ question deleted successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


delete_faq_api = delete_faq_item_api


@content_admin_required
@require_POST
def toggle_faq_homepage_api(request, faq_id):
    try:
        faq = get_object_or_404(LandingFAQ, id=faq_id)
        faq.show_on_homepage = not faq.show_on_homepage
        faq.save()
        status_text = "Shown on Homepage" if faq.show_on_homepage else "Hidden from Homepage"
        return JsonResponse({'success': True, 'show_on_homepage': faq.show_on_homepage, 'message': f"Question is now {status_text}."})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
@require_POST
def toggle_faq_status_api(request, faq_id):
    try:
        faq = get_object_or_404(LandingFAQ, id=faq_id)
        faq.is_active = not faq.is_active
        faq.save()
        status_text = "Active (Visible)" if faq.is_active else "Inactive (Hidden)"
        return JsonResponse({'success': True, 'is_active': faq.is_active, 'message': f"Question is now {status_text}."})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@content_admin_required
def about_editor(request):
    """Dynamic About Us Page Editor for Content CMS."""
    config = AboutPageConfig.objects.first()
    if not config:
        config = AboutPageConfig.objects.create()
    return render(request, 'contentcms/about_editor.html', {
        'active': 'pages_about',
        'config': config,
    })


@content_admin_required
@require_POST
def save_about_page_api(request):
    """AJAX API to save all dynamic fields for About Us Page."""
    try:
        data = json.loads(request.body.decode('utf-8'))
        config = AboutPageConfig.objects.first()
        if not config:
            config = AboutPageConfig.objects.create()

        # Hero Section
        if 'badge_text' in data:
            config.badge_text = data.get('badge_text', '').strip()
        if 'main_heading_prefix' in data:
            config.main_heading_prefix = data.get('main_heading_prefix', '').strip()
        if 'main_heading_highlight' in data:
            config.main_heading_highlight = data.get('main_heading_highlight', '').strip()
        if 'main_heading_suffix' in data:
            config.main_heading_suffix = data.get('main_heading_suffix', '').strip()
        if 'subheading_english' in data:
            config.subheading_english = data.get('subheading_english', '').strip()
        if 'subheading_assamese' in data:
            config.subheading_assamese = data.get('subheading_assamese', '').strip()

        # Key Metrics / Stats
        if 'stat_1_val' in data:
            config.stat_1_val = data.get('stat_1_val', '').strip()
        if 'stat_1_label' in data:
            config.stat_1_label = data.get('stat_1_label', '').strip()
        if 'stat_2_val' in data:
            config.stat_2_val = data.get('stat_2_val', '').strip()
        if 'stat_2_label' in data:
            config.stat_2_label = data.get('stat_2_label', '').strip()
        if 'stat_3_val' in data:
            config.stat_3_val = data.get('stat_3_val', '').strip()
        if 'stat_3_label' in data:
            config.stat_3_label = data.get('stat_3_label', '').strip()
        if 'stat_4_val' in data:
            config.stat_4_val = data.get('stat_4_val', '').strip()
        if 'stat_4_label' in data:
            config.stat_4_label = data.get('stat_4_label', '').strip()

        # CTA
        if 'cta_primary_text' in data:
            config.cta_primary_text = data.get('cta_primary_text', '').strip()
        if 'cta_primary_url' in data:
            config.cta_primary_url = data.get('cta_primary_url', '').strip()

        # GEO Entity Factsheet
        if 'entity_badge' in data:
            config.entity_badge = data.get('entity_badge', '').strip()
        if 'entity_title' in data:
            config.entity_title = data.get('entity_title', '').strip()
        if 'entity_definition' in data:
            config.entity_definition = data.get('entity_definition', '').strip()
        if 'fact_entity_name' in data:
            config.fact_entity_name = data.get('fact_entity_name', '').strip()
        if 'fact_official_url' in data:
            config.fact_official_url = data.get('fact_official_url', '').strip()
        if 'fact_headquarters' in data:
            config.fact_headquarters = data.get('fact_headquarters', '').strip()
        if 'fact_founder' in data:
            config.fact_founder = data.get('fact_founder', '').strip()
        if 'fact_languages' in data:
            config.fact_languages = data.get('fact_languages', '').strip()
        if 'fact_architecture' in data:
            config.fact_architecture = data.get('fact_architecture', '').strip()
        if 'fact_coverage' in data:
            config.fact_coverage = data.get('fact_coverage', '').strip()

        # Why Assam Needs AI
        if 'why_badge' in data:
            config.why_badge = data.get('why_badge', '').strip()
        if 'why_title' in data:
            config.why_title = data.get('why_title', '').strip()
        if 'why_subheading' in data:
            config.why_subheading = data.get('why_subheading', '').strip()
        if 'why_card_1_title' in data:
            config.why_card_1_title = data.get('why_card_1_title', '').strip()
        if 'why_card_1_desc' in data:
            config.why_card_1_desc = data.get('why_card_1_desc', '').strip()
        if 'why_card_2_title' in data:
            config.why_card_2_title = data.get('why_card_2_title', '').strip()
        if 'why_card_2_desc' in data:
            config.why_card_2_desc = data.get('why_card_2_desc', '').strip()
        if 'why_card_3_title' in data:
            config.why_card_3_title = data.get('why_card_3_title', '').strip()
        if 'why_card_3_desc' in data:
            config.why_card_3_desc = data.get('why_card_3_desc', '').strip()

        # Four Technological Pillars
        if 'pillars_badge' in data:
            config.pillars_badge = data.get('pillars_badge', '').strip()
        if 'pillars_title' in data:
            config.pillars_title = data.get('pillars_title', '').strip()
        if 'pillar_1_title' in data:
            config.pillar_1_title = data.get('pillar_1_title', '').strip()
        if 'pillar_1_desc' in data:
            config.pillar_1_desc = data.get('pillar_1_desc', '').strip()
        if 'pillar_2_title' in data:
            config.pillar_2_title = data.get('pillar_2_title', '').strip()
        if 'pillar_2_desc' in data:
            config.pillar_2_desc = data.get('pillar_2_desc', '').strip()
        if 'pillar_3_title' in data:
            config.pillar_3_title = data.get('pillar_3_title', '').strip()
        if 'pillar_3_desc' in data:
            config.pillar_3_desc = data.get('pillar_3_desc', '').strip()
        if 'pillar_4_title' in data:
            config.pillar_4_title = data.get('pillar_4_title', '').strip()
        if 'pillar_4_desc' in data:
            config.pillar_4_desc = data.get('pillar_4_desc', '').strip()

        # Founder Section
        if 'founder_badge' in data:
            config.founder_badge = data.get('founder_badge', '').strip()
        if 'founder_name' in data:
            config.founder_name = data.get('founder_name', '').strip()
        if 'founder_title' in data:
            config.founder_title = data.get('founder_title', '').strip()
        if 'founder_quote_title' in data:
            config.founder_quote_title = data.get('founder_quote_title', '').strip()
        if 'founder_quote' in data:
            config.founder_quote = data.get('founder_quote', '').strip()
        if 'founder_email' in data:
            config.founder_email = data.get('founder_email', '').strip()

        # Bottom CTA Section
        if 'cta_badge' in data:
            config.cta_badge = data.get('cta_badge', '').strip()
        if 'cta_title' in data:
            config.cta_title = data.get('cta_title', '').strip()
        if 'cta_desc' in data:
            config.cta_desc = data.get('cta_desc', '').strip()
        if 'cta_btn_text' in data:
            config.cta_btn_text = data.get('cta_btn_text', '').strip()
        if 'cta_btn_url' in data:
            config.cta_btn_url = data.get('cta_btn_url', '').strip()

        # SEO & Meta
        if 'meta_title' in data:
            config.meta_title = data.get('meta_title', '').strip()
        if 'meta_description' in data:
            config.meta_description = data.get('meta_description', '').strip()
        if 'meta_keywords' in data:
            config.meta_keywords = data.get('meta_keywords', '').strip()

        config.save()
        return JsonResponse({'success': True, 'message': 'About Us Page settings updated successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


def get_landing_content_payload():
    """Helper to return all CMS data in a clean dictionary for views.home_view."""
    _ensure_default_faqs()
    hero = SiteHeroConfig.objects.filter(is_active=True).first()
    banner = AnnouncementBanner.objects.filter(is_active=True).first()
    logos = list(PartnerLogo.objects.filter(is_active=True).values(
        'id', 'name', 'logo_image_url', 'website_url', 'order'
    ))
    raw_articles = InsightArticle.objects.filter(is_published=True).order_by('order', '-published_at')
    articles = []
    for art in raw_articles:
        link = art.external_link.strip() if art.external_link and art.external_link.strip().startswith('http') else f"/blog/{art.slug}/"
        articles.append({
            'id': art.id,
            'title': art.title,
            'slug': art.slug,
            'category': art.get_category_display() or art.category,
            'excerpt': art.excerpt,
            'content': art.content,
            'read_time': art.read_time,
            'cover_image_url': art.cover_image_url or '',
            'gradient_from': art.gradient_from,
            'gradient_to': art.gradient_to,
            'author_name': art.author_name,
            'external_link': link,
            'link': link,
            'published_at': art.published_at.strftime('%b %d, %Y') if art.published_at else '',
        })
    features = list(LandingFeature.objects.filter(is_active=True).values(
        'id', 'title', 'tagline', 'description', 'badge', 'icon_class', 'gradient_color', 'action_url'
    ))
    raw_usecases = LandingUseCase.objects.filter(is_active=True).order_by('order', 'id')
    usecases = []
    for u in raw_usecases:
        usecases.append({
            'id': u.id,
            'tab_title': u.tab_title,
            'audience_key': u.audience_key or u.tab_title.lower(),
            'icon_class': u.icon_class or 'fa-solid fa-graduation-cap',
            'order': u.order,
            'cards': [
                {
                    'title': u.card_1_title,
                    'desc': u.card_1_desc,
                    'icon': u.card_1_icon,
                    'color': u.card_1_color or 'text-fuchsia-400',
                },
                {
                    'title': u.card_2_title,
                    'desc': u.card_2_desc,
                    'icon': u.card_2_icon,
                    'color': u.card_2_color or 'text-purple-400',
                },
                {
                    'title': u.card_3_title,
                    'desc': u.card_3_desc,
                    'icon': u.card_3_icon,
                    'color': u.card_3_color or 'text-pink-400',
                },
            ]
        })

    testimonials = list(Testimonial.objects.filter(is_active=True).values(
        'id', 'name', 'role_designation', 'avatar_initials', 'quote_assamese', 'quote_english', 'rating'
    ))
    
    # Homepage FAQs (filtered by show_on_homepage and is_active)
    home_faqs = list(LandingFAQ.objects.filter(is_active=True, show_on_homepage=True).order_by('order', 'id').values(
        'id', 'question', 'answer', 'category'
    ))
    if not home_faqs:
        home_faqs = list(LandingFAQ.objects.filter(is_active=True).order_by('order', 'id').values(
            'id', 'question', 'answer', 'category'
        ))
    raw_plans = LandingPricingPlan.objects.filter(is_active=True).order_by('order', 'id')
    pricing_plans = []
    for p in raw_plans:
        pricing_plans.append({
            'id': p.id,
            'name': p.name,
            'plan_slug': p.plan_slug,
            'badge': p.badge,
            'icon_class': p.icon_class or 'fa-solid fa-sparkles',
            'color_class': p.color_class or 'text-gray-400',
            'desc': p.description,
            'monthlyPrice': p.monthly_price,
            'yearlyPrice': p.yearly_price,
            'monthlyWords': p.monthly_words,
            'cta': p.cta_text,
            'href': p.cta_url,
            'featured': p.is_featured,
            'features': p.get_features(),
            'order': p.order,
        })

    seo = SiteSEOSetting.objects.first()

    return {
        'hero': hero,
        'banner': banner,
        'logos': logos,
        'logo_strip_headline': hero.logo_strip_headline if hero else 'Built with the best',
        'logo_strip_active': hero.logo_strip_active if hero else True,
        'explore': {
            'badge': hero.explore_badge if hero else 'Explore',
            'title_prefix': hero.explore_title_prefix if hero else 'A Complete AI Toolkit',
            'title_highlight': hero.explore_title_highlight if hero else 'for Modern Needs',
            'subheading': hero.explore_subheading if hero else 'Everything you need to be more productive, creative and informed — in one powerful platform.',
            'active': hero.explore_section_active if hero else True,
        },
        'usecases_header': {
            'badge': hero.usecases_badge if hero else 'Use Cases',
            'title_prefix': hero.usecases_title_prefix if hero else 'Built for',
            'title_highlight': hero.usecases_title_highlight if hero else 'Real People, Real Impact',
            'subheading': hero.usecases_subheading if hero else "Whoever you are, wherever you're from — Axom AI adapts to your work.",
            'active': hero.usecases_section_active if hero else True,
        },
        'testimonials_header': {
            'badge': hero.testimonials_badge if hero else 'Testimonials',
            'title_prefix': hero.testimonials_title_prefix if hero else 'Loved by Users',
            'title_highlight': hero.testimonials_title_highlight if hero else 'Across Assam',
            'subheading': hero.testimonials_subheading if hero else 'Real feedback and stories from everyday users, students and businesses.',
            'active': hero.testimonials_section_active if hero else True,
        },
        'pricing_header': {
            'badge': hero.pricing_badge if hero else 'Pricing',
            'title_prefix': hero.pricing_title_prefix if hero else 'Simple,',
            'title_highlight': hero.pricing_title_highlight if hero else 'Transparent Pricing',
            'subheading': hero.pricing_subheading if hero else 'Choose a plan that fits your needs. Upgrade or cancel anytime.',
            'yearly_discount_badge': hero.pricing_yearly_discount_badge if hero else 'Save 20%',
            'footer_note': hero.pricing_footer_note if hero else 'All prices in INR (includes GST). Secure Razorpay checkout — UPI · Cards · Netbanking · Wallets.',
            'active': hero.pricing_section_active if hero else True,
        },
        'insights_header': {
            'badge': hero.insights_badge if hero else 'Insights',
            'title_prefix': hero.insights_title_prefix if hero else 'Learn, Explore &',
            'title_highlight': hero.insights_title_highlight if hero else 'Stay Updated',
            'subheading': hero.insights_subheading if hero else 'Guides, tips and stories from the Axom AI team and community.',
            'view_all_text': hero.insights_view_all_text if hero else 'View all articles',
            'view_all_url': hero.insights_view_all_url if (hero and hero.insights_view_all_url and hero.insights_view_all_url != '#') else '/blog/',
            'active': hero.insights_section_active if hero else True,
        },
        'articles': articles,
        'features': features,
        'usecases': usecases,
        'testimonials': testimonials,
        'pricing_plans': pricing_plans,
        'faqs': home_faqs,
        'seo': seo,
    }
