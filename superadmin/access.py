"""Who may open which part of the admin panel besides the superusers.

A superuser can open everything. Any other user can open only the sections a superuser ticked for them (Users page, "Admin panel sections").
The sections are kept on the user's SubdomainPermission row; a section is added here to make it available to tick.
"""

SECTIONS = {
    'audio_training': {'label': 'Audio Training', 'url': '/axomai-admin/audio-training/'},
    'language_rules': {'label': 'Language Rules', 'url': '/axomai-admin/language-rules/'},
}


def user_sections(user):
    """The section keys this user may open (a superuser: all of them)."""
    if not getattr(user, 'is_authenticated', False) or not user.is_active:
        return set()
    if user.is_superuser:
        return set(SECTIONS)
    try:
        sp = user.subdomain_perm
    except Exception:                                   # no permission row: nothing
        return set()
    if not sp.admin_access:                             # the subdomain gate (SubdomainPermissionMiddleware) needs it too
        return set()
    return {s for s in (sp.admin_sections or []) if s in SECTIONS}


def can_open(user, section):
    return section in user_sections(user)


def first_url(user):
    """Where a person with limited access lands after login (the first section, in the order of SECTIONS), or None."""
    allowed = user_sections(user)
    for key, info in SECTIONS.items():
        if key in allowed:
            return info['url']
    return None


def clean_sections(values):
    """Only known section keys, in the order of SECTIONS, no repeats."""
    wanted = {v for v in (values or []) if isinstance(v, str)}
    return [k for k in SECTIONS if k in wanted]
