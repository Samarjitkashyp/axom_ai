import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="userpanel_profile")
    phone = models.CharField(max_length=20, blank=True, default="")
    avatar_url = models.CharField(max_length=500, blank=True, default="")
    language = models.CharField(max_length=10, default="as", choices=[("as", "Assamese (অসমীয়া)"), ("en", "English"), ("hi", "Hindi / Hinglish")])
    timezone = models.CharField(max_length=50, default="Asia/Kolkata")
    bio = models.TextField(blank=True, default="")
    notify_email = models.BooleanField(default=True)
    notify_product_updates = models.BooleanField(default=True)
    notify_inapp = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


class SupportTicket(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]
    CATEGORY_CHOICES = [
        ("general", "General Inquiry"),
        ("billing", "Billing & Payments"),
        ("technical", "Technical Issue / Bug"),
        ("feature", "Feature Request"),
    ]

    ticket_id = models.CharField(max_length=20, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="support_tickets")
    subject = models.CharField(max_length=200)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default="general")
    priority = models.CharField(max_length=16, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"[{self.ticket_id}] {self.subject} ({self.status})"

    @classmethod
    def generate_ticket_id(cls):
        return f"AX-{uuid.uuid4().hex[:6].upper()}"


class TicketReply(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="replies")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Reply on {self.ticket.ticket_id} by {self.user.username}"


class UsageRecord(models.Model):
    ACTION_CHOICES = [
        ("chat", "Chat Message"),
        ("image", "Image Generation"),
        ("search", "Web Search"),
        ("pdf", "PDF / Doc AI"),
        ("summarize", "Summarization"),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="usage_records")
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES, db_index=True)
    details = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.action_type} at {self.created_at:%Y-%m-%d %H:%M}"


class InAppNotification(models.Model):
    TYPE_CHOICES = [
        ("info", "Information"),
        ("success", "Success"),
        ("warning", "Warning"),
        ("error", "Alert"),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="inapp_notifications")
    title = models.CharField(max_length=150)
    message = models.TextField()
    notif_type = models.CharField(max_length=16, choices=TYPE_CHOICES, default="info")
    link = models.CharField(max_length=255, blank=True, default="")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notif for {self.user.username}: {self.title}"


class DeviceRegistration(models.Model):
    ip_address = models.GenericIPAddressField(db_index=True)
    device_id = models.CharField(max_length=128, db_index=True, blank=True, default="")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="device_registrations")
    user_agent = models.CharField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} registered from IP {self.ip_address} (device: {self.device_id[:8]})"

