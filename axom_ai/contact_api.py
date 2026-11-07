"""Public contact form: POST /api/contact/submit/

The message is saved first (so nothing is ever lost), then an e-mail notification goes to CONTACT_TO_EMAIL with the visitor's
address in Reply-To. If the mail cannot be sent the message stays in the database, flagged, and shows up in the admin panel
(Contact Messages) where the notification can be resent.
"""
import hashlib
import html
import json
import logging
import re

import requests
from datetime import timedelta
from urllib.parse import urlparse

from django.conf import settings
from django.core.mail import EmailMessage, EmailMultiAlternatives
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
    msg.sent, msg.email_error = True, ''
    msg.save(update_fields=['email_sent', 'email_error'])
    return True


def send_visitor_confirmation(msg):
    """Sends a professional, beautifully styled confirmation email to the visitor who submitted the form."""
    if not getattr(settings, 'EMAIL_HOST', ''):
        log.info('EMAIL_HOST not configured; skipping visitor confirmation for %s', msg.ticket)
        return False
    if not EMAIL_RE.match(msg.email or ''):
        return False

    label = CATEGORIES.get(msg.category, msg.category)
    subject = f"Inquiry Received [Ticket #{msg.ticket}]: {_one_line(msg.subject or label, 80)} — Axom AI"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Axom AI Support <support@aiaxom.co.in>')
    support_email = (getattr(settings, 'CONTACT_TO_EMAIL', '') or 'support@aiaxom.co.in').strip()

    name_escaped = html.escape(msg.name or 'Valued User')
    ticket_escaped = html.escape(msg.ticket or '')
    category_escaped = html.escape(label)
    subject_escaped = html.escape(msg.subject or 'General Inquiry')
    submitted_time = timezone.localtime(msg.created_at).strftime('%d %B %Y, %I:%M %p %Z')
    message_escaped = html.escape(msg.message or '')

    text_content = f"""Hello {msg.name},

Thank you for reaching out to Axom AI. This automated confirmation receipt verifies that our engineering and support desk in Guwahati, Assam has successfully received your message under Ticket #{msg.ticket}.

INQUIRY SUMMARY:
--------------------------------------------------
Ticket ID:       #{msg.ticket}
Department:      {label}
Subject:         {msg.subject or 'General Inquiry'}
Submitted At:    {submitted_time}
Contact Email:   {msg.email}
Phone/WhatsApp:  {msg.phone or 'Not provided'}

YOUR MESSAGE:
--------------------------------------------------
{msg.message}

WHAT TO EXPECT NEXT:
--------------------------------------------------
Our regional support team in Guwahati reviews inquiries in the order received:
• Standard Response SLA: Within 4 to 12 business hours.
• Operating Hours: Monday through Saturday, 9:00 AM – 7:00 PM IST.
• Automated cloud APIs and generative models operate 24/7/365.

NEED INSTANT ASSISTANCE?
You can converse with our AI models directly in English or Assamese anytime at:
https://chat.aiaxom.co.in

If you need to provide additional context, attachments, or screenshots, simply reply directly to this email.

Warm regards,

Samarjit Kashyap
Founder & Lead AI Architect, Axom AI
Guwahati, Kamrup Metropolitan, Assam, India (PIN 781001)
Website: https://aiaxom.co.in
Support Desk: {support_email}

--
Confidentiality & Data Privacy: Axom AI is committed to 100% Indian Data Sovereignty and strictly complies with the Digital Personal Data Protection (DPDP) Act 2023. User data is never sold or used for public AI training.
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Received - Ticket #{ticket_escaped}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1220; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1220; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65);">
          
          <!-- Top Accent Gradient Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);"></td>
          </tr>

          <!-- Header / Brand -->
          <tr>
            <td style="padding: 36px 32px 20px 32px; text-align: center;">
              <!-- Brand Badge -->
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin: 0 auto 18px auto;">
                <tr>
                  <td style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; padding: 6px 16px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #34d399; text-transform: uppercase;">
                      ⚡ AXOM AI &bull; OFFICIAL HELP DESK
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Main Title -->
              <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; line-height: 1.25;">
                We've Received Your Message
              </h1>
              
              <!-- Ticket Pill -->
              <div style="display: inline-block; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 5px 14px; font-size: 12px; font-weight: 700; color: #38bdf8; font-family: monospace;">
                TICKET #{ticket_escaped}
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 0 32px 24px 32px; font-size: 14px; line-height: 1.65; color: #94a3b8;">
              <p style="margin: 0 0 16px 0; color: #e2e8f0; font-size: 15px;">
                Hello <strong style="color: #ffffff;">{name_escaped}</strong>,
              </p>
              <p style="margin: 0 0 20px 0;">
                Thank you for reaching out to <strong>Axom AI</strong>. This automated confirmation receipt verifies that your inquiry has been logged with our central engineering and customer desk in Guwahati, Assam.
              </p>

              <!-- Ticket Factsheet Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background: #111c2e; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #10b981; text-transform: uppercase; margin-bottom: 12px;">
                      📋 Ticket Overview
                    </div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; width: 35%;">Ticket Reference:</td>
                        <td style="padding: 6px 0; color: #f1f5f9; font-weight: 700; font-family: monospace;">#{ticket_escaped}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Department:</td>
                        <td style="padding: 6px 0; color: #f1f5f9; font-weight: 600;">{category_escaped}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Subject:</td>
                        <td style="padding: 6px 0; color: #f1f5f9; font-weight: 600;">{subject_escaped}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b;">Submission Time:</td>
                        <td style="padding: 6px 0; color: #cbd5e1;">{submitted_time}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Quote -->
              <div style="margin: 20px 0;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">
                  Your Message Summary
                </div>
                <div style="background: #090e17; border-left: 3px solid #10b981; border-radius: 0 10px 10px 0; padding: 14px 16px; font-size: 13px; color: #cbd5e1; font-style: italic; white-space: pre-wrap; line-height: 1.6; max-height: 240px; overflow-y: auto;">{message_escaped}</div>
              </div>

              <!-- Service SLA Banner -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0 20px 0; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px;">
                <tr>
                  <td style="padding: 16px 20px; font-size: 12.5px; color: #cbd5e1; line-height: 1.6;">
                    <div style="font-weight: 800; color: #34d399; margin-bottom: 4px; font-size: 13px;">
                      ⏱️ Guaranteed Response SLA
                    </div>
                    Our engineering desk in Guwahati handles tickets in the order received. Standard response time is within <strong style="color: #ffffff;">4 to 12 business hours</strong> (<span style="color: #94a3b8;">Monday–Saturday, 9:00 AM – 7:00 PM IST</span>).
                  </td>
                </tr>
              </table>

              <!-- What to do next note -->
              <p style="margin: 18px 0; font-size: 12.5px; color: #94a3b8;">
                <strong>Need to add more information?</strong> You can simply <span style="color: #38bdf8; font-weight: 600;">reply directly to this email</span> with any screenshots, documents, or context &mdash; our team will automatically receive it on ticket #{ticket_escaped}.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 26px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="https://chat.aiaxom.co.in/" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #0d9488 100%); color: #ffffff; font-size: 13.5px; font-weight: 800; text-decoration: none; padding: 13px 32px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); text-align: center; letter-spacing: 0.2px;">
                      Open Axom AI Web App &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Founder Desk Signature -->
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #1e293b;">
                <p style="margin: 0 0 4px 0; color: #ffffff; font-weight: 700; font-size: 13.5px;">
                  Samarjit Kashyap
                </p>
                <p style="margin: 0; color: #64748b; font-size: 12px;">
                  Founder &amp; Lead AI Architect, Axom AI<br>
                  Guwahati, Kamrup Metropolitan, Assam, India (PIN 781001)
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px 28px 32px; background: #090e17; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 6px 0; color: #94a3b8;">
                Axom AI &bull; Assam's Premier Sovereign Artificial Intelligence Platform &bull; DPDP Act 2023 Compliant
              </p>
              <p style="margin: 0 0 6px 0;">
                Official Support: <a href="mailto:{support_email}" style="color: #10b981; text-decoration: none;">{support_email}</a> &bull; Web: <a href="https://aiaxom.co.in" style="color: #38bdf8; text-decoration: none;">aiaxom.co.in</a>
              </p>
              <p style="margin: 0; color: #475569;">
                &copy; 2026 Axom AI Technologies. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    try:
        msg_obj = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[msg.email],
            reply_to=[support_email]
        )
        msg_obj.attach_alternative(html_content, "text/html")
        msg_obj.send(fail_silently=False)
        log.info('Confirmation email sent to visitor %s for ticket %s', msg.email, msg.ticket)
        return True
    except Exception as e:
        log.exception('Could not send confirmation email to visitor %s for %s: %s', msg.email, msg.ticket, e)
        return False


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
    try:
        send_visitor_confirmation(msg)
    except Exception as e:
        log.exception('Could not send visitor confirmation email for %s: %s', msg.ticket, e)
    return JsonResponse({'success': True, 'ticket': msg.ticket})
