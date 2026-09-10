from django.contrib import admin
from .models import (
    SiteHeroConfig,
    PartnerLogo,
    AnnouncementBanner,
    InsightArticle,
    LandingFeature,
    LandingUseCase,
    Testimonial,
    LandingFAQ,
    SiteSEOSetting,
    AboutPageConfig,
)


@admin.register(PartnerLogo)
class PartnerLogoAdmin(admin.ModelAdmin):
    list_display = ['name', 'logo_image_url', 'order', 'is_active']
    list_editable = ['order', 'is_active']


@admin.register(SiteHeroConfig)
class SiteHeroConfigAdmin(admin.ModelAdmin):
    list_display = ['main_heading_highlight', 'badge_text', 'is_active', 'updated_at']


@admin.register(AnnouncementBanner)
class AnnouncementBannerAdmin(admin.ModelAdmin):
    list_display = ['badge_label', 'message', 'is_active', 'created_at']


@admin.register(InsightArticle)
class InsightArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_published', 'order', 'published_at']
    list_filter = ['category', 'is_published']
    search_fields = ['title', 'excerpt', 'content']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(LandingFeature)
class LandingFeatureAdmin(admin.ModelAdmin):
    list_display = ['title', 'badge', 'order', 'is_active']
    list_editable = ['order', 'is_active']


@admin.register(LandingUseCase)
class LandingUseCaseAdmin(admin.ModelAdmin):
    list_display = ['tab_title', 'audience_key', 'order', 'is_active']
    list_editable = ['order', 'is_active']


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'role_designation', 'rating', 'order', 'is_active']
    list_editable = ['order', 'is_active']


@admin.register(LandingFAQ)
class LandingFAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    list_filter = ['category', 'is_active']


@admin.register(SiteSEOSetting)
class SiteSEOSettingAdmin(admin.ModelAdmin):
    list_display = ['meta_title', 'gtm_container_id', 'updated_at']


@admin.register(AboutPageConfig)
class AboutPageConfigAdmin(admin.ModelAdmin):
    list_display = ['main_heading_highlight', 'badge_text', 'updated_at']

