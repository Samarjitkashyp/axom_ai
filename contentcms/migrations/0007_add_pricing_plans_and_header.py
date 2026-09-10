from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('contentcms', '0006_add_testimonials_section_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='siteheroconfig',
            name='pricing_badge',
            field=models.CharField(default='Pricing', max_length=100),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='pricing_title_prefix',
            field=models.CharField(default='Simple,', max_length=200),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='pricing_title_highlight',
            field=models.CharField(default='Transparent Pricing', max_length=200),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='pricing_subheading',
            field=models.TextField(default='Choose a plan that fits your needs. Upgrade or cancel anytime.'),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='pricing_yearly_discount_badge',
            field=models.CharField(default='Save 20%', max_length=100),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='pricing_footer_note',
            field=models.TextField(default='All prices in INR (includes GST). Secure Razorpay checkout — UPI · Cards · Netbanking · Wallets.'),
        ),
        migrations.AddField(
            model_name='siteheroconfig',
            name='pricing_section_active',
            field=models.BooleanField(default=True),
        ),
        migrations.CreateModel(
            name='LandingPricingPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='Free', max_length=100)),
                ('plan_slug', models.CharField(default='free', max_length=50)),
                ('badge', models.CharField(blank=True, default='Starter AI', max_length=100)),
                ('icon_class', models.CharField(default='fa-solid fa-sparkles', max_length=80)),
                ('color_class', models.CharField(default='text-gray-400', max_length=80)),
                ('description', models.TextField(default='Ideal for casual queries, students & basic Assamese chat.')),
                ('monthly_price', models.IntegerField(default=0)),
                ('yearly_price', models.IntegerField(default=0)),
                ('monthly_words', models.CharField(default='5,000 words', max_length=100)),
                ('cta_text', models.CharField(default='Get Started Free', max_length=100)),
                ('cta_url', models.CharField(default='https://chat.aiaxom.co.in', max_length=255)),
                ('is_featured', models.BooleanField(default=False)),
                ('features_list', models.TextField(default='5,000 words per month\nStandard Assamese generation\nLlama 3 8B (Fast Basic AI)\nBasic document conversions (5/day)\nWeb chat history (30 days)\nCommunity support', help_text='One bullet per line')),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Pricing Plan',
                'verbose_name_plural': 'Pricing Plans',
                'ordering': ['order', 'id'],
            },
        ),
    ]
