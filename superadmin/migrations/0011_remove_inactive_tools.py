from django.db import migrations

# Tools that were switched off in the admin panel and have now been removed from the code as well.
REMOVED_SLUGS = ['ocr', 'summarize', 'translatepdf', 'extract', 'unlock', 'wmremove', 'office2pdf', 'canva']


def delete_tools(apps, schema_editor):
    AITool = apps.get_model('superadmin', 'AITool')
    AITool.objects.filter(slug__in=REMOVED_SLUGS).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0010_usercustomquota_usertag'),
    ]

    operations = [
        migrations.RunPython(delete_tools, migrations.RunPython.noop),
    ]
