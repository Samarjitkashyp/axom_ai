from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('contentcms', '0005_add_usecases_dynamic_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='siteheroconfig',
            name='testimonials_badge',
            field=models.CharField(default='Testimonials', max_length=100),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='testimonials_title_prefix',
            field=models.CharField(default='Loved by Users', max_length=200),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='testimonials_title_highlight',
            field=models.CharField(default='Across Assam', max_length=200),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='testimonials_subheading',
            field=models.TextField(default='Real feedback and stories from everyday users, students and businesses.'),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='testimonials_section_active',
            field=models.BooleanField(default=True),
        ),
    ]
