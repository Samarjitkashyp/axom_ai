"""
SubdomainMiddleware — routes admin.aiaxom.co.in and user.aiaxom.co.in to
the /axomai-admin/ and /axomai-user/ apps automatically, so those subdomains
can be visited at "/" instead of a nested path.

Local development:
- Access at path prefixes directly: http://127.0.0.1:8000/axomai-admin/
  and /axomai-user/.
- Or add hosts-file entries:
     127.0.0.1 admin.aiaxom.local
     127.0.0.1 user.aiaxom.local
  and visit http://admin.aiaxom.local:8000/.

Production (Cloudflare + Nginx):
- Point admin.aiaxom.co.in and user.aiaxom.co.in at the origin.
- This middleware rewrites the incoming path so the same gunicorn serves
  both panels from "/" on their respective subdomains.
"""

from django.utils.deprecation import MiddlewareMixin

ADMIN_HOSTS = {'admin.aiaxom.co.in', 'admin.aiaxom.local'}
USER_HOSTS = {'user.aiaxom.co.in', 'user.aiaxom.local'}
CONTENT_HOSTS = {'content.aiaxom.co.in', 'content.aiaxom.local'}
CHAT_HOSTS = {'chat.aiaxom.co.in', 'chat.aiaxom.local'}
LANDING_HOSTS = {'aiaxom.co.in', 'www.aiaxom.co.in'}
RESTRICTED_HOST_GROUPS = {
    'admin': ADMIN_HOSTS,
    'content': CONTENT_HOSTS,
}

# App routes that must go to the chat app, never to the landing page.
# When someone hits aiaxom.co.in/tools (etc.) redirect to chat subdomain.
CHAT_APP_PREFIXES = (
    '/tools', '/upgrade', '/subscription',
)


class SubdomainMiddleware(MiddlewareMixin):
    def process_request(self, request):
        from django.http import HttpResponsePermanentRedirect

        host = request.get_host().split(':')[0].lower()
        path = request.path_info

        # Never rewrite static or media asset requests on any subdomain
        if path.startswith('/media/') or path.startswith('/static/'):
            return None

        # admin.aiaxom.co.in  →  /axomai-admin/*
        # /admin-panel and /api/ paths are served directly (no rewrite).
        if host in ADMIN_HOSTS and not path.startswith('/axomai-admin'):
            if path.startswith('/admin-panel') or path.startswith('/api/'):
                return None
            request.path_info = '/axomai-admin' + path
            request.path = request.path_info
            return None

        # user.aiaxom.co.in  →  /axomai-user/*
        if host in USER_HOSTS and not path.startswith('/axomai-user'):
            request.path_info = '/axomai-user' + path
            request.path = request.path_info
            return None

        # content.aiaxom.co.in  →  /axomai-content/*
        if host in CONTENT_HOSTS:
            if path.startswith('/blog'):
                return HttpResponsePermanentRedirect(f'https://aiaxom.co.in{path}')
            if not path.startswith('/axomai-content'):
                request.path_info = '/axomai-content' + path
                request.path = request.path_info
                return None

        # chat.aiaxom.co.in  →  existing app routes at /, no rewrite needed.
        if host in CHAT_HOSTS:
            return None

        # Bare domain (aiaxom.co.in / www) — landing site only.
        # App-flavoured paths get 301-redirected to the chat subdomain so
        # old links (/tools, /upgrade, /api/...) keep working.
        if host in LANDING_HOSTS:
            for pref in CHAT_APP_PREFIXES:
                if path == pref or path.startswith(pref + '/') or path.startswith(pref):
                    qs = ('?' + request.META['QUERY_STRING']) if request.META.get('QUERY_STRING') else ''
                    return HttpResponsePermanentRedirect(f'https://chat.aiaxom.co.in{path}{qs}')

        return None


class SubdomainPermissionMiddleware(MiddlewareMixin):
    """Deny access to restricted subdomains unless the user has the matching permission."""

    def process_view(self, request, view_func, view_args, view_kwargs):
        from django.http import HttpResponseForbidden

        host = request.get_host().split(':')[0].lower()
        path = request.path_info

        if path.startswith('/static/') or path.startswith('/media/'):
            return None

        perm_field = None
        if host in ADMIN_HOSTS:
            if path.startswith('/axomai-admin/login') or path == '/axomai-admin/login/':
                return None
            perm_field = 'admin_access'
        elif host in CONTENT_HOSTS:
            if path.startswith('/axomai-content/login') or path == '/axomai-content/login/':
                return None
            perm_field = 'content_access'

        if perm_field is None:
            return None

        user = request.user
        if not user.is_authenticated:
            return None

        if user.is_superuser:
            return None

        from superadmin.models import SubdomainPermission
        try:
            sp = SubdomainPermission.objects.get(user=user)
            if getattr(sp, perm_field, False):
                return None
        except SubdomainPermission.DoesNotExist:
            pass

        return HttpResponseForbidden(
            '<h2>Access Denied</h2>'
            '<p>You do not have permission to access this subdomain. '
            'Contact your administrator.</p>'
        )
