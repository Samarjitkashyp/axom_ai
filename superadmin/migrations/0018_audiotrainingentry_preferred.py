from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0017_subdomainpermission_admin_sections'),
    ]

    operations = [
        migrations.AddField(
            model_name='audiotrainingentry',
            name='preferred',
            field=models.BooleanField(default=False, help_text='Number words: the spelling the chat writes this number with (one per value)'),
        ),
    ]
