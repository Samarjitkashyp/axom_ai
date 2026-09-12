from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0002_subdomainpermission'),
    ]

    operations = [
        migrations.AddField(
            model_name='subdomainpermission',
            name='bot_access',
            field=models.BooleanField(default=False),
        ),
    ]
