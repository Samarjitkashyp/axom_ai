from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='ModelProvider',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Display name, e.g. GPT-5-mini', max_length=64, unique=True)),
                ('model_id', models.CharField(help_text='API model ID, e.g. gpt-5-mini', max_length=128, unique=True)),
                ('tier', models.CharField(choices=[('free_mini', 'Free Mini/Nano (2.5M/day)'), ('free_large', 'Free Large (250K/day)'), ('paid', 'Paid (credit-based)')], default='free_mini', max_length=16)),
                ('daily_token_limit', models.PositiveIntegerField(default=2500000, help_text='Free tokens per day (0 = unlimited paid)')),
                ('priority', models.PositiveIntegerField(default=10, help_text='Lower = tried first')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['priority', 'name'],
            },
        ),
        migrations.CreateModel(
            name='DailyModelUsage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('input_tokens', models.PositiveBigIntegerField(default=0)),
                ('output_tokens', models.PositiveBigIntegerField(default=0)),
                ('request_count', models.PositiveIntegerField(default=0)),
                ('errors', models.PositiveIntegerField(default=0)),
                ('model_provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='daily_usage', to='model_router.modelprovider')),
            ],
            options={
                'ordering': ['-date'],
                'unique_together': {('model_provider', 'date')},
            },
        ),
    ]
