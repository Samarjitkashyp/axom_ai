from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0011_remove_inactive_tools'),
    ]

    operations = [
        migrations.DeleteModel(
            name='CanvaToken',
        ),
    ]
