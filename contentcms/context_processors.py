from .models import HeaderSettings, FooterSettings

def global_header_footer(request):
    """
    Exposes HeaderSettings and FooterSettings globally to all Django templates
    so header.html and footer.html always display the brand logo and nav items
    configured in https://content.aiaxom.co.in/axomai-content/settings/header/
    """
    try:
        header = HeaderSettings.objects.first()
    except Exception:
        header = None

    try:
        footer = FooterSettings.objects.first()
    except Exception:
        footer = None

    return {
        'header': header,
        'footer': footer,
    }
