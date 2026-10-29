from django.db import migrations

def verify_existing_profiles(apps, schema_editor):
    UserProfile = apps.get_model('userpanel', 'UserProfile')
    # All existing users before this migration are marked verified
    UserProfile.objects.all().update(is_email_verified=True)

def reverse_verify(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('userpanel', '0005_userprofile_email_verification_sent_at_and_more'),
    ]

    operations = [
        migrations.RunPython(verify_existing_profiles, reverse_verify),
    ]

