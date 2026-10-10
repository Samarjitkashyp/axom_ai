from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0014_superadminloginattempt'),
    ]

    operations = [
        migrations.CreateModel(
            name='ContactMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ticket', models.CharField(blank=True, db_index=True, default='', max_length=16)),
                ('name', models.CharField(max_length=120)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, default='', max_length=30)),
                ('category', models.CharField(default='general', max_length=20)),
                ('subject', models.CharField(blank=True, default='', max_length=200)),
                ('message', models.TextField()),
                ('status', models.CharField(choices=[('new', 'New'), ('read', 'Read'), ('replied', 'Replied'), ('spam', 'Spam')], db_index=True, default='new', max_length=10)),
                ('ip', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, default='', max_length=200)),
                ('email_sent', models.BooleanField(default=False)),
                ('email_error', models.CharField(blank=True, default='', max_length=250)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
            ],
            options={
                'verbose_name': 'Contact Message',
                'ordering': ['-created_at'],
            },
        ),
    ]
