import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

log = logging.getLogger(__name__)

def send_verification_email(user, token, request=None) -> bool:
    """
    Sends an industry-standard, beautifully branded email verification link to a newly registered developer.
    """
    if not user.email:
        log.warning("Cannot send verification email: user %s has no email address", user.username)
        return False

    # Base URL determination
    base_url = "https://user.aiaxom.co.in"
    if request:
        host = request.get_host().split(':')[0].lower()
        if host in ('user.aiaxom.local', 'localhost', '127.0.0.1'):
            port = request.get_port()
            port_str = f":{port}" if port and port not in ('80', '443') else ""
            scheme = "http" if request.is_secure() is False else "https"
            base_url = f"{scheme}://{host}{port_str}"

    verify_url = f"{base_url}/verify-email/{token}/"
    subject = "Verify your Axom AI Developer Account"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Axom AI <support@aiaxom.co.in>')

    text_content = f"""Hello {user.username},

Welcome to the Axom AI Developer Console!

Please verify your email address to activate your account and start generating API keys:
{verify_url}

This verification link is valid for 24 hours.

If you did not register for an Axom AI account, please ignore this email.

--
Axom AI Platform
Guwahati, Assam (India)
https://aiaxom.co.in
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Axom AI Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 560px; background: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
          
          <!-- Top Accent Gradient Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #10b981 100%);"></td>
          </tr>

          <!-- Header / Brand -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 6px 14px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #818cf8; text-transform: uppercase;">
                      ⚡ AXOM AI DEVELOPER CONSOLE
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 22px 0 0 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Verify Your Email Address
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 0 36px 24px 36px; font-size: 14px; line-height: 1.65; color: #94a3b8;">
              <p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 15px;">
                Hello <strong style="color: #ffffff;">{user.username}</strong>,
              </p>
              <p style="margin: 0 0 24px 0;">
                Thank you for joining <strong>Axom AI</strong>. To ensure complete quota isolation, prevent unauthorized API usage, and protect developer keys, please confirm your email address by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{verify_url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5); text-align: center; letter-spacing: 0.2px;">
                      Verify Email &amp; Open Console &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert Pill -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px;">
                <tr>
                  <td style="padding: 14px 18px; font-size: 12px; color: #cbd5e1;">
                    <strong style="color: #38bdf8;">&#9432; Security Notice:</strong> This verification link is valid for <strong>24 hours</strong> and can only be used once.
                  </td>
                </tr>
              </table>

              <!-- Direct URL Fallback -->
              <p style="margin: 24px 0 6px 0; font-size: 12px; color: #64748b;">
                Having trouble clicking the button? Copy and paste this URL directly into your browser:
              </p>
              <p style="margin: 0; font-size: 11px; word-break: break-all; background: #0b0f19; padding: 10px 14px; border-radius: 8px; border: 1px solid #1e293b;">
                <a href="{verify_url}" style="color: #818cf8; text-decoration: none;">{verify_url}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 36px;">
              <div style="border-top: 1px solid #1e293b; height: 1px;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;">
                If you did not create an account on the Axom AI Developer Platform, you can safely disregard this email.
              </p>
              <p style="margin: 0; color: #475569;">
                &copy; 2026 Axom AI Platform &bull; Guwahati, Assam (India) &bull; DPDP 2023 Aligned
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
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        log.info("Verification email sent successfully to %s (%s)", user.username, user.email)
        return True
    except Exception as e:
        log.exception("Failed to send verification email to %s: %s", user.email, e)
        return False
