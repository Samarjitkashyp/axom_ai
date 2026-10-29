import hashlib
from django.db import migrations

def populate_hashed_keys(apps, schema_editor):
    DeveloperApiKey = apps.get_model('developer_api', 'DeveloperApiKey')
    for key_obj in DeveloperApiKey.objects.all():
        if key_obj.key:
            if not key_obj.hashed_key:
                key_obj.hashed_key = hashlib.sha256(key_obj.key.encode('utf-8')).hexdigest()
            if not key_obj.key_prefix:
                key_obj.key_prefix = key_obj.key[:14] if len(key_obj.key) >= 14 else key_obj.key
            if not key_obj.key_suffix:
                key_obj.key_suffix = key_obj.key[-4:] if len(key_obj.key) >= 4 else ''
            key_obj.save(update_fields=['hashed_key', 'key_prefix', 'key_suffix'])

def reverse_populate(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('developer_api', '0003_developerapikey_allowed_ips_and_more'),
    ]

    operations = [
        migrations.RunPython(populate_hashed_keys, reverse_populate),
    ]

