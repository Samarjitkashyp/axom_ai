from .models import HeaderSettings, FooterSettings
from .converter_defaults import CONVERTER_TOOLS_METADATA

def global_header_footer(request):
    """
    Exposes HeaderSettings, FooterSettings, and the full dynamic 31-tools list
    globally to all Django templates so the CMS sidebar and nav links are fully dynamic.
    """
    try:
        header = HeaderSettings.objects.first()
    except Exception:
        header = None

    try:
        footer = FooterSettings.objects.first()
    except Exception:
        footer = None

    # Group tools by category for structured display in the CMS sidebar
    grouped_tools = {}
    for slug, meta in CONVERTER_TOOLS_METADATA.items():
        cat = meta.get('cat', 'General Tools')
        if cat not in grouped_tools:
            grouped_tools[cat] = []
        meta_copy = dict(meta)
        meta_copy['slug'] = slug
        grouped_tools[cat].append(meta_copy)

    return {
        'header': header,
        'footer': footer,
        'all_cms_tools': [dict(slug=s, **m) for s, m in CONVERTER_TOOLS_METADATA.items()],
        'grouped_cms_tools': grouped_tools,
        'cms_tools_count': len(CONVERTER_TOOLS_METADATA),
    }
