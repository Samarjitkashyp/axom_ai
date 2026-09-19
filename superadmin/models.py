from django.db import models
from django.conf import settings
from django.utils import timezone


class SystemSetting(models.Model):
    """Key-value dynamic system configuration for feature flags and settings."""
    key = models.CharField(max_length=64, unique=True, db_index=True)
    value = models.TextField(blank=True, default="")
    description = models.CharField(max_length=255, blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {self.value[:30]}"

    @classmethod
    def get_setting(cls, key: str, default: str = "") -> str:
        try:
            obj = cls.objects.filter(key=key).first()
            return obj.value if obj else default
        except Exception:
            return default

    @classmethod
    def set_setting(cls, key: str, value: str, description: str = ""):
        cls.objects.update_or_create(
            key=key,
            defaults={"value": str(value), "description": description or key}
        )

    @classmethod
    def is_enabled(cls, key: str, default: bool = True) -> bool:
        val = cls.get_setting(key, str(default)).strip().lower()
        return val in ("true", "1", "yes", "on")


class CouponCode(models.Model):
    """Discount and promotional coupon codes."""
    code = models.CharField(max_length=32, unique=True, db_index=True)
    discount_percent = models.PositiveIntegerField(default=10)
    max_uses = models.PositiveIntegerField(default=100)
    uses_count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self) -> bool:
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        if self.uses_count >= self.max_uses:
            return False
        return True

    def __str__(self):
        return f"{self.code} ({self.discount_percent}% off)"


class CustomPlanOverride(models.Model):
    """Custom pricing and quota override per plan."""
    plan_key = models.CharField(max_length=32, unique=True, db_index=True)
    name = models.CharField(max_length=64)
    price_in_rupees = models.DecimalField(max_digits=10, decimal_places=2, default=199.00)
    duration_days = models.PositiveIntegerField(default=30)
    images_per_day = models.IntegerField(default=5, help_text="-1 for unlimited")
    searches_per_day = models.IntegerField(default=10, help_text="-1 for unlimited")
    chat_per_day = models.IntegerField(default=-1, help_text="-1 for unlimited")
    pdf_tools_access = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (₹{self.price_in_rupees})"


class SubdomainPermission(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subdomain_perm',
    )
    admin_access = models.BooleanField(default=False)
    content_access = models.BooleanField(default=False)
    bot_access = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        flags = []
        if self.admin_access:
            flags.append('admin')
        if self.content_access:
            flags.append('content')
        if self.bot_access:
            flags.append('bot')
        return f"{self.user.username}: {', '.join(flags) or 'chat-only'}"


class LanguageRule(models.Model):
    """Dynamic language rules for Axom AI's Assamese response generation."""
    CATEGORY_CHOICES = [
        ('keep_english', 'Keep in English (do not translate)'),
        ('grammar', 'Assamese Grammar Rule'),
        ('vocabulary', 'Vocabulary Correction (wrong → right)'),
        ('example', 'Example Correction'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    title = models.CharField(max_length=120, help_text="Short label for this rule")
    content = models.TextField(
        help_text="For keep_english: comma-separated words/phrases. "
                  "For grammar/vocabulary/example: the rule text."
    )
    is_active = models.BooleanField(default=True, db_index=True)
    priority = models.IntegerField(default=0, help_text="Higher = injected first")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-updated_at']

    def __str__(self):
        return f"[{self.get_category_display()}] {self.title}"

    @classmethod
    def build_prompt_block(cls):
        """Build a prompt-ready text block from all active rules."""
        rules = cls.objects.filter(is_active=True).order_by('-priority', '-updated_at')
        if not rules.exists():
            return ""

        keep_english_words = []
        grammar_rules = []
        vocab_rules = []
        example_rules = []

        for r in rules:
            if r.category == 'keep_english':
                keep_english_words.extend(
                    w.strip() for w in r.content.split(',') if w.strip()
                )
            elif r.category == 'grammar':
                grammar_rules.append(r.content.strip())
            elif r.category == 'vocabulary':
                vocab_rules.append(r.content.strip())
            elif r.category == 'example':
                example_rules.append(r.content.strip())

        parts = []
        parts.append("\n\nADMIN-DEFINED LANGUAGE RULES (MUST FOLLOW):\n")

        if keep_english_words:
            parts.append(
                "KEEP IN ENGLISH (Roman script, never transliterate to Assamese script): "
                + ", ".join(keep_english_words) + ".\n"
                "This includes: person names, place names, brand names, technical terms, "
                "acronyms, and any word listed above. Write them in original English/Roman "
                "script within the Assamese sentence.\n"
            )

        if grammar_rules:
            parts.append("ASSAMESE GRAMMAR RULES:\n")
            for gr in grammar_rules:
                parts.append(f"- {gr}\n")

        if vocab_rules:
            parts.append("VOCABULARY CORRECTIONS (use right, never wrong):\n")
            for vr in vocab_rules:
                parts.append(f"- {vr}\n")

        if example_rules:
            parts.append("EXAMPLE CORRECTIONS (learn from these):\n")
            for er in example_rules:
                parts.append(f"- {er}\n")

        return "".join(parts)


class AuditLog(models.Model):
    """Audit log of Superadmin actions for security & compliance."""
    admin_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admin_audit_logs"
    )
    action = models.CharField(max_length=64)
    target = models.CharField(max_length=255, blank=True, default="")
    details = models.TextField(blank=True, default="")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {self.action} on {self.target}"


class AITool(models.Model):
    """Dynamic tool registry for Axom AI document, AI, and productivity tools."""
    CATEGORY_CHOICES = [
        ('Convert', 'Convert'),
        ('Office', 'Office'),
        ('Organize', 'Organize'),
        ('Optimize', 'Optimize'),
        ('Security', 'Security'),
        ('OCR', 'OCR'),
        ('AI Tools', 'AI Tools'),
        ('Edit', 'Edit'),
    ]

    slug = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='AI Tools')
    description = models.TextField(blank=True, default="")
    hint = models.CharField(max_length=150, blank=True, default="")
    badge = models.CharField(max_length=50, blank=True, default="")
    icon_class = models.CharField(max_length=100, blank=True, default="fa-solid fa-sparkles")
    lucide_icon = models.CharField(max_length=100, blank=True, default="Sparkles")
    color = models.CharField(max_length=50, blank=True, default="#ec4899")
    color_class = models.CharField(max_length=50, blank=True, default="text-fuchsia-400")

    # Execution & routing properties
    endpoint_type = models.CharField(max_length=50, blank=True, default="")  # 'convert', 'pdf', 'ai'
    operation = models.CharField(max_length=50, blank=True, default="")      # 'merge', 'split', 'watermark', 'ocr', etc.
    target = models.CharField(max_length=50, blank=True, default="")         # 'pdf', 'docx', 'jpg', 'png'
    param_type = models.CharField(max_length=50, blank=True, default="")     # 'pages', 'password', 'question', 'angle', 'lang'
    accept_types = models.CharField(max_length=255, blank=True, default="")  # '.pdf', '.docx,.doc', etc.
    is_multi_file = models.BooleanField(default=False)
    handler_type = models.CharField(max_length=50, blank=True, default="")   # 'editor', 'compressor', etc.
    custom_url = models.CharField(max_length=255, blank=True, default="")   # e.g. '/tools/word-to-pdf'

    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.name} ({self.category}) [{'Active' if self.is_active else 'Inactive'}]"


class CanvaToken(models.Model):
    """OAuth2 tokens for Canva Connect API, stored per user."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='canva_token'
    )
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, default='')
    token_type = models.CharField(max_length=50, default='Bearer')
    expires_at = models.DateTimeField()
    scope = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Canva Token'

    def __str__(self):
        return f"Canva token for {self.user.username}"

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at
