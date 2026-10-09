from django.db import migrations


def add_tool(apps, schema_editor):
    AITool = apps.get_model('superadmin', 'AITool')
    AITool.objects.update_or_create(
        slug='imgcompress',
        defaults={
            'name': 'Image Compressor',
            'category': 'Optimize',
            'description': 'Make pictures smaller by quality or to a target size in KB. Works in your browser; nothing is uploaded.',
            'hint': 'JPG, PNG, WebP',
            'badge': '',
            'icon_class': 'fa-solid fa-image',
            'lucide_icon': 'ImageDown',
            'color': '#10b981',
            'color_class': 'text-emerald-400',
            'endpoint_type': '',
            'operation': '',
            'target': '',
            'param_type': '',
            'accept_types': '.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif',
            'is_multi_file': True,
            'handler_type': 'imgcompressor',
            'custom_url': '',
            'order': 14,
            'is_active': True,
            'is_featured': False,
        },
    )


def remove_tool(apps, schema_editor):
    AITool = apps.get_model('superadmin', 'AITool')
    AITool.objects.filter(slug='imgcompress').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0012_delete_canvatoken'),
    ]

    operations = [
        migrations.RunPython(add_tool, remove_tool),
    ]
