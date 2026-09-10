from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contentcms', '0009_add_header_footer_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='headersettings',
            name='logo_width',
            field=models.CharField(default='180px', help_text='Width in px (e.g. 180px or 180)', max_length=50),
        ),
        migrations.AddField(
            model_name='headersettings',
            name='logo_height',
            field=models.CharField(default='auto', help_text='Height in px or auto', max_length=50),
        ),
        migrations.AddField(
            model_name='headersettings',
            name='logo_fit',
            field=models.CharField(choices=[('contain', 'Contain'), ('cover', 'Cover'), ('fill', 'Fill'), ('scale-down', 'Scale Down')], default='contain', max_length=50),
        ),
        migrations.AddField(
            model_name='footersettings',
            name='logo_width',
            field=models.CharField(default='180px', help_text='Width in px', max_length=50),
        ),
        migrations.AddField(
            model_name='footersettings',
            name='logo_height',
            field=models.CharField(default='auto', help_text='Height in px or auto', max_length=50),
        ),
        migrations.AddField(
            model_name='footersettings',
            name='logo_fit',
            field=models.CharField(choices=[('contain', 'Contain'), ('cover', 'Cover'), ('fill', 'Fill'), ('scale-down', 'Scale Down')], default='contain', max_length=50),
        ),
    ]
