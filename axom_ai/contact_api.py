"""Public contact form: POST /api/contact/submit/

The message is saved first (so nothing is ever lost), then an e-mail notification goes to CONTACT_TO_EMAIL with the visitor's
address in Reply-To. If the mail cannot be sent the message stays in the database, flagged, and shows up in the admin panel
(Contact Messages) where the notification can be resent.
"""
import hashlib
import json
import logging
import re

import requests
from datetime import timedelta
from urllib.parse import urlparse

from django.conf import settings
from django.core.mail import EmailMessage
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from superadmin.models import CONTACT_CATEGORIES as CATEGORIES, ContactMessage
from .security import get_client_ip

log = logging.getLogger(__name__)

MAX_BODY_BYTES = 20 * 1024
PER_IP_PER_HOUR = 5
PER_EMAIL_PER_HOUR = 3
PER_DAY_TOTAL = 300
DUPLICATE_WINDOW = timedelta(minutes=10)
TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
EMAIL_RE = re.compile(r'^[^@\s<>"\'(),;:\\]+@[^@\s<>"\'(),;:\\]+\.[A-Za-z]{2,}$')
PHONE_RE = re.compile(r'^[0-9+()\-. ]{5,30}$')


def _one_line(value, limit):
    """Header-safe single line: no line breaks, no control characters, trimmed."""
    return re.sub(r'[\x00-\x1f\x7f]+', ' ', str(value or '')).strip()[:limit]


def _origin_ok(request):
    origin = request.META.get('HTTP_ORIGIN') or ''
    if not origin:
        return True
    host = (urlparse(origin).hostname or '').lower()
    return host == 'aiaxom.co.in' or host.endswith('.aiaxom.co.in') or (settings.DEBUG and host in ('localhost', '127.0.0.1'))


def _visitor_ip(request):
    """The visitor's address for the limits: the trusted X-Real-IP from nginx (see axom_ai.security.get_client_ip)."""
    return get_client_ip(request) or None


def verify_turnstile(token, ip):
    """True when Cloudflare says the Turnstile token is valid. Raises requests.RequestException if Cloudflare cannot be reached."""
    r = requests.post(TURNSTILE_VERIFY_URL, data={'secret': settings.TURNSTILE_SECRET_KEY, 'response': token, 'remoteip': ip or ''}, timeout=5)
    return bool(r.json().get('success'))


@csrf_exempt
def contact_config_api(request):
    """The public settings the contact form needs: the Turnstile site key (empty = no human check)."""
    if request.method != 'GET':
        return _fail('Only GET is allowed.', 405)
    resp = JsonResponse({'turnstile_site_key': settings.TURNSTILE_SITE_KEY if settings.TURNSTILE_SECRET_KEY else ''})
    resp['Cache-Control'] = 'no-store'
    return resp


def ticket_code(msg):
    return 'AXM-%06d' % (100000 + msg.id)


def send_contact_notification(msg):
    """E-mails the message to CONTACT_TO_EMAIL. Records the result on the row; returns True when it was sent."""
    to = (getattr(settings, 'CONTACT_TO_EMAIL', '') or '').strip()
    if not getattr(settings, 'EMAIL_HOST', '') or not to:
        msg.email_sent, msg.email_error = False, 'E-mail is not configured on the server (EMAIL_HOST / CONTACT_TO_EMAIL).'
        msg.save(update_fields=['email_sent', 'email_error'])
        return False
    label = CATEGORIES.get(msg.category, msg.category)
    subject = '[Axom AI Contact] %s - %s (%s)' % (label, _one_line(msg.subject or msg.name, 120), msg.ticket)
    body = (
        'New message from the contact form on aiaxom.co.in\n\n'
        'Ticket:   %s\nName:     %s\nEmail:    %s\nPhone:    %s\nCategory: %s\nSubject:  %s\nReceived: %s\n\n'
        'Message:\n%s\n\n'
        '--\nReply to this e-mail to answer the visitor (Reply-To is set to their address).\n'
        'Manage it in the admin panel: https://admin.aiaxom.co.in/axomai-admin/contact-messages/\n'
    ) % (msg.ticket, msg.name, msg.email, msg.phone or '-', label, msg.subject or '-', timezone.localtime(msg.created_at).strftime('%d %b %Y %H:%M %Z'), msg.message)
    try:
        EmailMessage(subject=subject, body=body, to=[to], reply_to=[msg.email] if EMAIL_RE.match(msg.email) else None).send(fail_silently=False)
    except Exception as e:      # the visitor's message is already saved; the admin panel shows the failure
        log.exception('Contact e-mail for %s could not be sent', msg.ticket)
        msg.email_sent, msg.email_error = False, ('%s: %s' % (type(e).__name__, e))[:250]
        msg.save(update_fields=['email_sent', 'email_error'])
        return False
    msg.email_sent, msg.email_error = True, ''
    msg.save(update_fields=['email_sent', 'email_error'])
    return True


def _fail(error, status=400):
    return JsonResponse({'success': False, 'error': error}, status=status)


@csrf_exempt
def contact_submit_api(request):
    if request.method != 'POST':
        return _fail('Only POST is allowed.', 405)
    if not _origin_ok(request):
        return _fail('This request is not allowed from this site.', 403)
    if len(request.body or b'') > MAX_BODY_BYTES:
        return _fail('Your message is too long.', 413)
    try:
        data = json.loads(request.body.decode('utf-8') or '{}')
        if not isinstance(data, dict):
            raise ValueError
    except Exception:
        return _fail('Invalid request.')

    # Bots fill the hidden "hp_trap" field. Pretend it worked, store nothing.
    if str(data.get('hp_trap') or '').strip():
        return JsonResponse({'success': True, 'ticket': 'AXM-100000'})

    name = _one_line(data.get('name'), 120)
    email = _one_line(data.get('email'), 254)
    phone = _one_line(data.get('phone'), 30)
    category = str(data.get('category') or 'general').strip()
    subject = _one_line(data.get('subject'), 200)
    message = str(data.get('message') or '').replace('\r\n', '\n').strip()

    if len(name) < 2:
        return _fail('Please provide your full name.')
    if not EMAIL_RE.match(email):
        return _fail('Please provide a valid email address so we can reply.')
    if phone and not PHONE_RE.match(phone):
        return _fail('Please check the phone number.')
    if category not in CATEGORIES:
        return _fail('Please choose a department.')
    if len(message) < 10:
        return _fail('Please include at least 10 characters describing your inquiry.')
    if len(message) > 5000:
        return _fail('Please keep the message under 5,000 characters.')

    ip = _visitor_ip(request)
    now = timezone.now()
    if ip and ContactMessage.objects.filter(ip=ip, created_at__gte=now - timedelta(hours=1)).count() >= PER_IP_PER_HOUR:
        return _fail('You have sent several messages already. Please try again in an hour or write to support@aiaxom.co.in.', 429)
    if ContactMessage.objects.filter(email__iexact=email, created_at__gte=now - timedelta(hours=1)).count() >= PER_EMAIL_PER_HOUR:
        return _fail('You have sent several messages already. Please try again in an hour or write to support@aiaxom.co.in.', 429)
    if ContactMessage.objects.filter(created_at__gte=now - timedelta(days=1)).count() >= PER_DAY_TOTAL:
        return _fail('Our contact desk is very busy right now. Please write to support@aiaxom.co.in.', 429)

    if settings.TURNSTILE_SECRET_KEY:
        token = str(data.get('cf_token') or '').strip()
        if not token or len(token) > 2048:
            return _fail('Please complete the verification and try again.')
        try:
            human = verify_turnstile(token, ip)
        except (requests.RequestException, ValueError):
            log.exception('Turnstile verification could not be reached')
            return _fail('The verification service is not reachable right now. Please try again in a minute or write to support@aiaxom.co.in.', 503)
        if not human:
            return _fail('The verification failed. Please try again.')

    # The same message sent twice in a row (double click, retry): answer with the first ticket, store nothing new.
    digest = hashlib.sha256((email.lower() + '\n' + message).encode('utf-8')).hexdigest()
    for prev in ContactMessage.objects.filter(email__iexact=email, created_at__gte=now - DUPLICATE_WINDOW)[:10]:
        if hashlib.sha256((prev.email.lower() + '\n' + prev.message).encode('utf-8')).hexdigest() == digest:
            return JsonResponse({'success': True, 'ticket': prev.ticket})

    msg = ContactMessage.objects.create(name=name, email=email, phone=phone, category=category, subject=subject, message=message,
                                        ip=ip, user_agent=_one_line(request.META.get('HTTP_USER_AGENT'), 200))
    msg.ticket = ticket_code(msg)
    msg.save(update_fields=['ticket'])
    send_contact_notification(msg)
    return JsonResponse({'success': True, 'ticket': msg.ticket})
