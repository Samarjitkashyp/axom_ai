from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0016_audiotrainingentry'),
    ]

    operations = [
        migrations.AddField(
            model_name='subdomainpermission',
            name='admin_sections',
            field=models.JSONField(blank=True, default=list, help_text='Admin panel sections this user may open (superadmin/access.py)'),
        ),
    ]
