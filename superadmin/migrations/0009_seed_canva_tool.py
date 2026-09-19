from django.db import migrations, models


def seed_canva_tool(apps, schema_editor):
    AITool = apps.get_model('superadmin', 'AITool')
    AITool.objects.update_or_create(
        slug='canva',
        defaults={
            'name': 'Canva Designer',
            'category': 'Design',
            'description': 'Create presentations, social media posts, logos, posters and more with Canva.',
            'hint': 'Posters, Social, Presentations',
            'badge': 'AI Powered',
            'icon_class': 'fa-solid fa-palette',
            'lucide_icon': 'Palette',
            'color': '#7b2ff7',
            'color_class': 'text-purple-400',
            'endpoint_type': 'design',
            'operation': 'canva',
            'target': 'design',
            'param_type': 'prompt',
            'accept_types': '',
            'is_multi_file': False,
            'handler_type': 'canva',
            'custom_url': '/tools?tool=canva',
            'order': 35,
            'is_active': True,
            'is_featured': True,
        }
    )


def remove_canva_tool(apps, schema_editor):
    AITool = apps.get_model('superadmin', 'AITool')
    AITool.objects.filter(slug='canva').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0008_canvatoken'),
    ]

    operations = [
        migrations.AlterField(
            model_name='aitool',
            name='category',
            field=models.CharField(
                choices=[
                    ('Convert', 'Convert'),
                    ('Office', 'Office'),
                    ('Organize', 'Organize'),
                    ('Optimize', 'Optimize'),
                    ('Security', 'Security'),
                    ('OCR', 'OCR'),
                    ('AI Tools', 'AI Tools'),
                    ('Edit', 'Edit'),
                    ('Design', 'Design'),
                ],
                default='AI Tools',
                max_length=50,
            ),
        ),
        migrations.RunPython(seed_canva_tool, remove_canva_tool),
    ]
