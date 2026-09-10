from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contentcms', '0008_add_insights_header_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='HeaderSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logo_image_url', models.CharField(default='/axom-logo.png', max_length=500)),
                ('logo_alt_text', models.CharField(default='Axom AI — Smart. Assamese. AI For All.', max_length=200)),
                ('cta_signin_text', models.CharField(default='Sign in', max_length=100)),
                ('cta_signin_url', models.CharField(default='https://chat.aiaxom.co.in/', max_length=300)),
                ('cta_chat_text', models.CharField(default='Open Chat', max_length=100)),
                ('cta_chat_url', models.CharField(default='https://chat.aiaxom.co.in/', max_length=300)),
                ('is_active', models.BooleanField(default=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Header Setting',
                'verbose_name_plural': 'Header Settings',
            },
        ),
        migrations.CreateModel(
            name='HeaderNavItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('url', models.CharField(max_length=300)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Header Nav Item',
                'verbose_name_plural': 'Header Nav Items',
                'ordering': ['order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='HeaderMegaMenuItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('description', models.CharField(blank=True, max_length=200)),
                ('icon_class', models.CharField(default='fa-solid fa-brain', max_length=100)),
                ('color_class', models.CharField(default='text-fuchsia-400', max_length=100)),
                ('url', models.CharField(default='https://chat.aiaxom.co.in/tools', max_length=300)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Header Mega Menu Item',
                'verbose_name_plural': 'Header Mega Menu Items',
                'ordering': ['order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='FooterSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logo_image_url', models.CharField(default='/axom-logo.png', max_length=500)),
                ('description', models.TextField(default='AI for a more inclusive future.\nBuilt in Assam, for the world.')),
                ('tagline', models.CharField(default='অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম • Smart. Assamese. AI for All.', max_length=300)),
                ('copyright_text', models.CharField(default='Axom AI. All rights reserved.', max_length=200)),
                ('is_active', models.BooleanField(default=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Footer Setting',
                'verbose_name_plural': 'Footer Settings',
            },
        ),
        migrations.CreateModel(
            name='FooterColumn',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Footer Column',
                'verbose_name_plural': 'Footer Columns',
                'ordering': ['order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='FooterColumnLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('url', models.CharField(max_length=300)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_external', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('column', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='links', to='contentcms.footercolumn')),
            ],
            options={
                'verbose_name': 'Footer Column Link',
                'verbose_name_plural': 'Footer Column Links',
                'ordering': ['order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='FooterSocialLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('platform', models.CharField(max_length=100)),
                ('icon_class', models.CharField(default='fa-brands fa-x-twitter', max_length=100)),
                ('url', models.CharField(default='https://x.com', max_length=300)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Footer Social Link',
                'verbose_name_plural': 'Footer Social Links',
                'ordering': ['order', 'id'],
            },
        ),
    ]
