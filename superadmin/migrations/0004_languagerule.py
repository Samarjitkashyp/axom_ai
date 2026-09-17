from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0003_subdomainpermission_bot_access'),
    ]

    operations = [
        migrations.CreateModel(
            name='LanguageRule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(
                    choices=[
                        ('keep_english', 'Keep in English (do not translate)'),
                        ('grammar', 'Assamese Grammar Rule'),
                        ('vocabulary', 'Vocabulary Correction (wrong → right)'),
                        ('example', 'Example Correction'),
                    ],
                    db_index=True, max_length=20,
                )),
                ('title', models.CharField(help_text='Short label for this rule', max_length=120)),
                ('content', models.TextField(
                    help_text='For keep_english: comma-separated words/phrases. '
                              'For grammar/vocabulary/example: the rule text.'
                )),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('priority', models.IntegerField(default=0, help_text='Higher = injected first')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-priority', '-updated_at'],
            },
        ),
    ]
