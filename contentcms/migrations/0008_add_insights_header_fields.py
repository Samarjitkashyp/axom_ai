from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contentcms', '0007_add_pricing_plans_and_header'),
    ]

    operations = [
        migrations.AddField(
            model_name='siteheroconfig',
            name='insights_badge',
            field=models.CharField(default='Insights', max_length=100),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='insights_title_prefix',
            field=models.CharField(default='Learn, Explore &', max_length=200),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='insights_title_highlight',
            field=models.CharField(default='Stay Updated', max_length=200),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='insights_subheading',
            field=models.TextField(default='Guides, tips and stories from the Axom AI team and community.'),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='insights_view_all_text',
            field=models.CharField(default='View all articles', max_length=100),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='insights_view_all_url',
            field=models.CharField(default='#', max_length=300),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='insights_section_active',
            field=models.BooleanField(default=True),
        ),
    ]
