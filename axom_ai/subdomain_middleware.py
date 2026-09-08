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


class SubdomainMiddleware(MiddlewareMixin):
    def process_request(self, request):
        host = request.get_host().split(':')[0].lower()

        # Rewrite path so "/" on the subdomain maps to /axomai-admin/ (or -user/)
        if host in ADMIN_HOSTS and not request.path_info.startswith('/axomai-admin'):
            # Preserve nested paths: /users/ -> /axomai-admin/users/
            request.path_info = '/axomai-admin' + request.path_info
            request.path = request.path_info
        elif host in USER_HOSTS and not request.path_info.startswith('/axomai-user'):
            request.path_info = '/axomai-user' + request.path_info
            request.path = request.path_info

        return None
