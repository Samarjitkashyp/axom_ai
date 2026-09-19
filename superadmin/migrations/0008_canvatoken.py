from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('superadmin', '0007_seed_aitools'),
    ]

    operations = [
        migrations.CreateModel(
            name='CanvaToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('access_token', models.TextField()),
                ('refresh_token', models.TextField(blank=True, default='')),
                ('token_type', models.CharField(default='Bearer', max_length=50)),
                ('expires_at', models.DateTimeField()),
                ('scope', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='canva_token', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Canva Token',
            },
        ),
    ]
